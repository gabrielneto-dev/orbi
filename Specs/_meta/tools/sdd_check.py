#!/usr/bin/env python3
"""Check Specs/ for structural errors and spec/plan/tasks/verification drift.

Usage:
    python3 Specs/_meta/tools/sdd_check.py

Standard library only. Reuses the frontmatter parser and secret patterns of
Context/_meta/tools/context_check.py. Exit code 1 when errors are found.
"""

import importlib.util
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

SPECS_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = SPECS_ROOT.parent
CONTEXT_TOOL = REPO_ROOT / "Context" / "_meta" / "tools" / "context_check.py"
CONTEXT_CATALOG = REPO_ROOT / "Context" / "_meta" / "catalog.jsonl"
SPEC_CONTAINERS = (SPECS_ROOT / "features", SPECS_ROOT / "archive")

SPEC_STATUSES = {"draft", "specified", "planned", "in_progress", "verifying", "done", "blocked", "cancelled", "superseded"}
PLANNED_OR_LATER = {"planned", "in_progress", "verifying", "done"}
VERIFYING_OR_LATER = {"verifying", "done"}
LEVELS = {"lightweight", "full", "critical"}
PRIORITIES = {"low", "medium", "high", "critical"}
TASK_STATUSES = {"pending", "ready", "in_progress", "blocked", "completed", "cancelled"}
CLOSED_TASK_STATUSES = {"completed", "cancelled"}
RESULTS = {"PASS", "FAIL", "BLOCKED", "NOT_RUN", "NOT_APPLICABLE"}
ACCEPTED_RESULTS = {"PASS", "NOT_APPLICABLE"}
REQUIRED_FIELDS = ("id", "title", "status", "level", "priority", "created_at", "updated_at")

SPEC_ID_RE = re.compile(r"^SPEC-\d{4}$")
SPEC_REF_RE = re.compile(r"\bSPEC-\d{4}(?:-T\d{3})?\b")
REQ_RE = re.compile(r"^\s*[-*]\s*\*\*(REQ-\d{3})\*\*", re.M)
REMOVED_REQ_RE = re.compile(r"~~(REQ-\d{3})~~")
AC_RE = re.compile(r"^\s*[-*]\s*\*\*(AC-\d{3})\*\*\s*(?:\(([^)]*)\))?", re.M)
TASK_RE = re.compile(r"^- \[([ xX])\] (\S+) — (.+)$")
TASK_FIELD_RE = re.compile(r"^\s+([A-Za-z][A-Za-z ]*):\s*(.*)$")
VERIFICATION_ROW_RE = re.compile(r"^\|\s*(V-\d{3})\s*\|(.*)\|\s*$")
INDEX_ROW_RE = re.compile(r"^\|\s*(SPEC-\d{4})\s*\|([^|]*)\|\s*([^|]*?)\s*\|")
NEXT_ID_RE = re.compile(r"^Next ID:\s*(SPEC-\d{4})", re.M)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.S)


def load_context_tool():
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("context_check", CONTEXT_TOOL)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ctx = load_context_tool()


@dataclass(frozen=True)
class Task:
    task_id: str
    checked: bool
    fields: dict


@dataclass
class Report:
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def read_content(path: Path) -> str:
    """File text without HTML comments, so template hints and examples are not parsed."""
    return HTML_COMMENT_RE.sub("", read(path))


def parse_tasks(text: str) -> list[Task]:
    tasks, current = [], None
    for line in text.splitlines():
        header = TASK_RE.match(line)
        if header:
            current = Task(header.group(2), header.group(1) != " ", {})
            tasks.append(current)
            continue
        field_match = TASK_FIELD_RE.match(line)
        if current and field_match:
            current.fields[field_match.group(1).strip().lower()] = field_match.group(2).strip()
        elif line.strip() and not line.startswith(" "):
            current = None
    return tasks


def parse_verification(text: str) -> list[tuple[str, set[str], str]]:
    rows = []
    for line in text.splitlines():
        match = VERIFICATION_ROW_RE.match(line)
        if match:
            cells = [cell.strip() for cell in match.group(2).split("|")]
            covers = set(re.findall(r"(?:AC|REQ)-\d{3}", cells[0])) if cells else set()
            rows.append((match.group(1), covers, cells[2] if len(cells) > 2 else ""))
    return rows


def split_refs(value: str) -> list[str]:
    return [ref.strip() for ref in re.split(r"[,\s]+", value or "") if ref.strip() and ref.strip().lower() not in ("none", "—", "-")]


def check_tasks(spec_id: str, tasks: list[Task], reqs: set[str], report: Report, where: str) -> None:
    ids = [task.task_id for task in tasks]
    for task in tasks:
        tag = f"{where}: {task.task_id}"
        if not re.fullmatch(rf"{spec_id}-T\d{{3}}", task.task_id):
            report.errors.append(f"{tag}: task id must match {spec_id}-TNNN")
        if ids.count(task.task_id) > 1:
            report.errors.append(f"{tag}: duplicate task id")
        status = task.fields.get("status", "")
        if status not in TASK_STATUSES:
            report.errors.append(f"{tag}: invalid status '{status}'")
        if task.checked != (status == "completed"):
            report.errors.append(f"{tag}: checkbox does not match status '{status}'")
        if status == "completed" and not task.fields.get("evidence"):
            report.errors.append(f"{tag}: completed without Evidence")
        report.errors += [f"{tag}: unknown requirement {ref}" for ref in split_refs(task.fields.get("requirements", "")) if ref not in reqs]
        report.errors += [f"{tag}: depends on unknown task {ref}" for ref in split_refs(task.fields.get("depends on", "")) if ref not in ids]


def check_spec(folder: Path, all_spec_ids: set[str], context_ids: set[str], report: Report) -> tuple[dict, list[Task]]:
    spec_text = read_content(folder / "spec.md")
    meta = ctx.parse_frontmatter(spec_text) or {}
    where = str(folder.relative_to(SPECS_ROOT))
    spec_id = meta.get("id") or "?"
    report.errors += [f"{where}/spec.md: missing '{name}'" for name in REQUIRED_FIELDS if not meta.get(name)]
    if not folder.name.startswith(f"{spec_id}--"):
        report.errors.append(f"{where}: folder name must start with '{spec_id}--'")
    status = meta.get("status")
    for name, allowed in (("status", SPEC_STATUSES), ("level", LEVELS), ("priority", PRIORITIES)):
        if meta.get(name) and meta[name] not in allowed:
            report.errors.append(f"{where}/spec.md: invalid {name} '{meta[name]}'")
    for name in ("dependencies", "supersedes", "superseded_by"):
        report.errors += [f"{where}/spec.md: {name} -> unknown {ref}" for ref in ctx.as_list(meta.get(name)) if ref not in all_spec_ids]
    report.errors += [f"{where}/spec.md: context_refs -> unknown {ref}" for ref in ctx.as_list(meta.get("context_refs")) if ref not in context_ids]
    if status == "superseded" and not meta.get("superseded_by"):
        report.errors.append(f"{where}/spec.md: superseded without superseded_by")

    reqs = set(REQ_RE.findall(spec_text))
    removed = set(REMOVED_REQ_RE.findall(spec_text))
    acs = AC_RE.findall(spec_text)
    if not acs and status not in ("draft", "cancelled", "superseded"):
        report.errors.append(f"{where}/spec.md: no acceptance criteria (AC-NNN)")
    for ac_id, covered in acs:
        refs = split_refs(covered)
        if not refs or any(ref not in reqs | removed for ref in refs):
            report.errors.append(f"{where}/spec.md: {ac_id} must reference existing REQ-NNN")

    tasks_file = folder / "tasks.md" if (folder / "tasks.md").exists() else folder / "spec.md"
    tasks = parse_tasks(read_content(tasks_file))
    check_tasks(spec_id, tasks, reqs | removed, report, f"{where}/{tasks_file.name}")
    if status in PLANNED_OR_LATER:
        if not tasks:
            report.errors.append(f"{where}: status '{status}' but no tasks")
        covered_reqs = {ref for task in tasks for ref in split_refs(task.fields.get("requirements", ""))}
        report.warnings += [f"{where}: {req} has no task" for req in sorted(reqs - covered_reqs)]

    verification_file = folder / "verification.md" if (folder / "verification.md").exists() else folder / "spec.md"
    rows = parse_verification(read_content(verification_file))
    for check_id, _, result in rows:
        if result not in RESULTS:
            report.errors.append(f"{where}/{verification_file.name}: {check_id} invalid result '{result}'")
    if status in VERIFYING_OR_LATER:
        for ac_id, _ in acs:
            results = {result for _, covers, result in rows if ac_id in covers}
            if not results:
                (report.errors if status == "done" else report.warnings).append(f"{where}: {ac_id} has no verification")
            elif status == "done" and not results <= ACCEPTED_RESULTS:
                report.errors.append(f"{where}: done but {ac_id} has results {sorted(results)}")
    if status == "done":
        report.errors += [f"{where}: done but {task.task_id} is '{task.fields.get('status')}'" for task in tasks if task.fields.get("status") not in CLOSED_TASK_STATUSES]
    return meta, tasks


def load_context_ids() -> set[str]:
    lines = read(CONTEXT_CATALOG).splitlines()
    return {json.loads(line)["id"] for line in lines if line.strip()}


def check_index_and_state(specs: dict[str, dict], tasks: dict[str, Task], report: Report) -> None:
    index_text = read_content(SPECS_ROOT / "INDEX.md")
    index_rows = {match.group(1): match.group(3) for match in map(INDEX_ROW_RE.match, index_text.splitlines()) if match}
    for spec_id, meta in specs.items():
        if spec_id not in index_rows:
            report.errors.append(f"INDEX.md: missing {spec_id}")
        elif index_rows[spec_id] != meta.get("status"):
            report.errors.append(f"INDEX.md: {spec_id} status '{index_rows[spec_id]}' != spec '{meta.get('status')}'")
    report.errors += [f"INDEX.md: {spec_id} has no spec folder" for spec_id in index_rows if spec_id not in specs]
    next_id = NEXT_ID_RE.search(index_text)
    if not next_id:
        report.errors.append("INDEX.md: missing 'Next ID: SPEC-NNNN'")
    elif any(spec_id >= next_id.group(1) for spec_id in set(specs) | set(index_rows)):
        report.errors.append(f"INDEX.md: Next ID {next_id.group(1)} is already used")

    state_text = read_content(SPECS_ROOT / "STATE.md")
    for ref in sorted(set(SPEC_REF_RE.findall(state_text))):
        if ref not in specs and ref not in tasks:
            report.errors.append(f"STATE.md: references unknown {ref}")
    current = state_text.split("## Current / next task", 1)[-1].split("\n## ", 1)[0] if "## Current / next task" in state_text else ""
    for ref in set(SPEC_REF_RE.findall(current)):
        if ref in tasks and tasks[ref].fields.get("status") in CLOSED_TASK_STATUSES:
            report.errors.append(f"STATE.md: current task {ref} is already {tasks[ref].fields.get('status')}")


def scan_secrets(report: Report) -> None:
    for path in sorted(SPECS_ROOT.rglob("*")):
        if not path.is_file() or path.suffix not in (".md", ".yaml", ".yml", ".json", ".txt"):
            continue
        for lineno, line in enumerate(read(path).splitlines(), 1):
            if any(pattern.search(line) for pattern in ctx.SECRET_PATTERNS):
                report.errors.append(f"{path.relative_to(SPECS_ROOT)}:{lineno}: possible secret (value not shown)")


def main() -> int:
    report = Report()
    folders = sorted(path for container in SPEC_CONTAINERS if container.is_dir() for path in container.iterdir() if path.is_dir())
    folder_ids = [(ctx.parse_frontmatter(read(folder / "spec.md")) or {}).get("id") for folder in folders]
    all_spec_ids = {spec_id for spec_id in folder_ids if spec_id}
    for folder, spec_id in zip(folders, folder_ids):
        if not spec_id or not SPEC_ID_RE.match(spec_id):
            report.errors.append(f"{folder.relative_to(SPECS_ROOT)}: spec.md missing or id not SPEC-NNNN")
        elif folder_ids.count(spec_id) > 1:
            report.errors.append(f"{folder.relative_to(SPECS_ROOT)}: duplicate spec id {spec_id}")

    context_ids = load_context_ids()
    specs, tasks = {}, {}
    for folder, spec_id in zip(folders, folder_ids):
        if spec_id and SPEC_ID_RE.match(spec_id):
            meta, spec_tasks = check_spec(folder, all_spec_ids, context_ids, report)
            specs[spec_id] = meta
            tasks.update({task.task_id: task for task in spec_tasks})

    check_index_and_state(specs, tasks, report)
    scan_secrets(report)

    for warning in report.warnings:
        print(f"WARN  {warning}")
    for error in report.errors:
        print(f"ERROR {error}")
    print(f"{len(specs)} spec(s), {len(tasks)} task(s) checked: {len(report.errors)} error(s), {len(report.warnings)} warning(s).")
    return 1 if report.errors else 0


if __name__ == "__main__":
    sys.exit(main())
