#!/usr/bin/env python3
"""Validate Context/ records and (optionally) rebuild the derived catalog.

Usage:
    python3 Context/_meta/tools/context_check.py                    # validate only
    python3 Context/_meta/tools/context_check.py --rebuild-catalog  # validate + rewrite catalog.jsonl

Standard library only. Exit code 1 when errors are found.
"""

import argparse
import json
import re
import sys
from collections.abc import Iterator
from pathlib import Path

CONTEXT_ROOT = Path(__file__).resolve().parents[2]
META = CONTEXT_ROOT / "_meta"
CATALOG = META / "catalog.jsonl"
TAXONOMY = META / "taxonomy.yaml"
EXCLUDED_DIRS = {META / "templates"}
FIXED_NAME_DIRS = {CONTEXT_ROOT / "core"}  # core/overview.md etc. keep fixed names
FIXED_NAMES = {"_index.md"}

REQUIRED_FIELDS = ("id", "type", "title", "branch", "tags", "status", "created_at", "updated_at")
RELATION_FIELDS = ("related", "depends_on", "source_ids", "supersedes", "superseded_by", "resolved_by")
CATALOG_FIELDS = ("id", "type", "title", "branch", "tags", "status", "updated_at")

SECRET_PATTERNS = (
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"xox[abprs]-[A-Za-z0-9-]{10,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"(?i)(password|passwd|secret|token|api[_-]?key)\w*\s*[:=]\s*['\"]?(?!null\b|false\b|true\b)[^\s'\"#<>]{8,}"),
)


def parse_scalar(raw: str) -> str | list[str] | None:
    value = raw.strip()
    if value in ("", "null", "~"):
        return None
    if value.startswith("[") and value.endswith("]"):
        return [item.strip().strip("'\"") for item in value[1:-1].split(",") if item.strip()]
    return value.strip("'\"")


def parse_frontmatter(text: str) -> dict | None:
    """Parse the simple YAML subset used by records: scalars, inline lists, block lists."""
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---", 4)
    if end == -1:
        return None
    data, current_key = {}, None
    for line in text[4:end].splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith(("  - ", "- ")) and current_key:
            data[current_key] = [*(data[current_key] or []), parse_scalar(line.split("- ", 1)[1])]
            continue
        key, _, raw = line.partition(":")
        current_key = key.strip()
        data[current_key] = parse_scalar(raw.split(" #")[0])
    return data


def load_taxonomy() -> dict:
    """Collect valid tags, statuses, branches, confidence levels and type codes."""
    sections = {"canonical_tags": set(), "statuses": set(), "branches": set(), "confidence": set(), "types": {}}
    section = None
    for line in TAXONOMY.read_text(encoding="utf-8").splitlines():
        stripped = line.split("#")[0].rstrip()
        if not stripped.strip():
            continue
        if not line.startswith(" "):
            section = stripped.rstrip(":").split(":")[0]
            continue
        if section not in sections:
            continue
        item = stripped.strip()
        if section == "types":
            code, _, name = item.partition(":")
            sections["types"][name.strip()] = code.strip()
        elif item.startswith("- "):
            sections[section].add(item[2:].strip())
        elif section == "canonical_tags" and item.endswith(":"):
            sections[section].add(item[:-1])
    return sections


def iter_records() -> Iterator[tuple[Path, dict]]:
    for path in sorted(CONTEXT_ROOT.rglob("*.md")):
        if any(excluded in path.parents for excluded in EXCLUDED_DIRS):
            continue
        meta = parse_frontmatter(path.read_text(encoding="utf-8"))
        if meta and meta.get("id"):
            yield path, meta


def as_list(value: str | list[str] | None) -> list[str]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def validate_record(rel: str, meta: dict, taxonomy: dict) -> list[str]:
    errors = [f"{rel}: missing required field '{field}'" for field in REQUIRED_FIELDS if meta.get(field) in (None, "")]
    type_code = taxonomy["types"].get(meta.get("type"))
    if type_code is None:
        errors.append(f"{rel}: unknown type '{meta.get('type')}'")
    else:
        if not str(meta.get("id", "")).startswith(f"CTX-{type_code}-"):
            errors.append(f"{rel}: id '{meta.get('id')}' does not match type code {type_code}")
        path = CONTEXT_ROOT / rel
        has_fixed_name = path.name in FIXED_NAMES or path.parent in FIXED_NAME_DIRS
        if not has_fixed_name and not path.name.startswith(f"{type_code}-"):
            errors.append(f"{rel}: filename does not start with '{type_code}-'")
    if meta.get("status") not in taxonomy["statuses"]:
        errors.append(f"{rel}: invalid status '{meta.get('status')}'")
    if meta.get("branch") not in taxonomy["branches"]:
        errors.append(f"{rel}: branch '{meta.get('branch')}' not declared in taxonomy.yaml")
    if meta.get("confidence") and meta["confidence"] not in taxonomy["confidence"]:
        errors.append(f"{rel}: invalid confidence '{meta['confidence']}'")
    errors += [f"{rel}: tag '{tag}' not in taxonomy.yaml" for tag in as_list(meta.get("tags")) if tag not in taxonomy["canonical_tags"]]
    return errors


def scan_secrets() -> list[str]:
    hits = []
    for path in sorted(CONTEXT_ROOT.rglob("*")):
        if not path.is_file() or path.suffix not in (".md", ".yaml", ".yml", ".jsonl", ".json", ".txt"):
            continue
        for lineno, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            if any(pattern.search(line) for pattern in SECRET_PATTERNS):
                hits.append(f"{path.relative_to(CONTEXT_ROOT)}:{lineno}: possible secret (value not shown)")
    return hits


def build_catalog(records: list[tuple[Path, dict]]) -> str:
    lines = []
    for path, meta in records:
        entry = {field: meta.get(field) for field in CATALOG_FIELDS}
        entry["tags"] = as_list(entry["tags"])
        entry["path"] = str(path.relative_to(CONTEXT_ROOT))
        lines.append(json.dumps(entry, ensure_ascii=False, separators=(",", ":")))
    return "\n".join(lines) + ("\n" if lines else "")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--rebuild-catalog", action="store_true", help="rewrite _meta/catalog.jsonl")
    args = parser.parse_args()

    taxonomy = load_taxonomy()
    records = list(iter_records())
    errors, seen = [], {}

    for path, meta in records:
        rel = str(path.relative_to(CONTEXT_ROOT))
        errors += validate_record(rel, meta, taxonomy)
        if meta["id"] in seen:
            errors.append(f"{rel}: duplicate id '{meta['id']}' (also in {seen[meta['id']]})")
        seen.setdefault(meta["id"], rel)

    for path, meta in records:
        rel = str(path.relative_to(CONTEXT_ROOT))
        for field in RELATION_FIELDS:
            errors += [f"{rel}: {field} -> unknown id '{ref}'" for ref in as_list(meta.get(field)) if ref not in seen]

    errors += scan_secrets()

    catalog = build_catalog(records)
    if args.rebuild_catalog:
        CATALOG.write_text(catalog, encoding="utf-8")
    elif not CATALOG.exists() or CATALOG.read_text(encoding="utf-8") != catalog:
        errors.append("_meta/catalog.jsonl is out of date (run with --rebuild-catalog)")

    for error in errors:
        print(f"ERROR {error}")
    print(f"{len(records)} records checked, {len(errors)} error(s){', catalog rebuilt' if args.rebuild_catalog else ''}.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
