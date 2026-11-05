# AGENTS.md — orbi

Shared operating contract for every AI agent working in this repository
(Claude Code, Codex, or any agent with file access).

- **How to work** lives here.
- **What the project knows** lives in `Context/`.
- **What is being built** (specs, plans, tasks, verification) lives in `Specs/`.
- Keep this file small and stable. No transient state, no detailed knowledge.

<!-- CONTEXT-ENGINEERING:START -->

# Project Context System

This project uses `Context/` as its persistent project memory and knowledge system.
A new session has zero conversational memory: the files are the memory (**SESSION ≠ MEMORY**).

## Context discovery

For every non-trivial task:

1. Read `Context/MAP.md`.
2. Read `Context/STATE.md`.
3. Determine which context branches are relevant.
4. Read only the corresponding branch `_index.md` files.
5. Retrieve atomic records only when required (search by ID, `type:`, `status:`, tags, title, keywords — e.g. `rg "status: open" Context/`).
6. Follow `related`, `depends_on`, `source_ids`, `supersedes`, and `superseded_by` only when they materially affect the current task (default depth: 1 hop).
7. Do not recursively load the entire `Context/` directory.

Use progressive context loading: L0 (`MAP`, `STATE`) → L1 (branch `_index.md`) → L2 (atomic records) → L3 (`sources/`, evidence) only when needed.

Never treat a record with `status: superseded | deprecated | archived` as current without checking its successor.

## Sources of truth

- `AGENTS.md` — permanent operational instructions.
- `Context/README.md` — manual of the context system (schema, protocols, audit).
- `Context/MAP.md` — context routing and navigation.
- `Context/STATE.md` — current project state.
- `Context/core/**` — stable project fundamentals.
- `Context/branches/**` — domain-specific knowledge.
- `Context/global/**` — cross-cutting decisions, questions, assumptions, risks and plans.
- `Context/checkpoints/**` — distilled session/milestone checkpoints.
- `Context/sources/**` — provenance and evidence.
- `Context/_meta/**` — context configuration, taxonomy, catalog and maintenance metadata.

Markdown records are canonical. `Context/_meta/catalog.jsonl` is a derived index.

## Context write policy

Context reading is automatic for non-trivial work.

Context persistence is controlled.

Do not write documentation for every conversation message.

Run the Context Save Protocol when the user expresses an intent equivalent to:

- `salvar contexto`
- `salve o contexto`
- `save context`
- `persistir contexto`
- `atualizar contexto`
- `atualizar memória do projeto`
- `criar checkpoint`
- `checkpoint da sessão`

When triggered, follow `Context/README.md` (section "Context Save Protocol").

Other semantic intents (`carregar contexto`, `buscar contexto <assunto>`, `status do contexto`, `auditar contexto`) are documented in `Context/README.md`.

Do not copy the conversation verbatim.

Persist distilled, durable knowledge.

Never record an assumption as a fact, research as a decision, or an idea as an approved plan.

## Safety

Never persist secrets, passwords, access tokens, API keys, private keys, session cookies or credential values inside `Context/`.

References to environment-variable names or secret-manager locations are allowed.

## Maintenance

If a durable, project-wide operating rule is discovered, evaluate whether it belongs in `AGENTS.md`.

Do not put transient state or detailed knowledge in `AGENTS.md`.

After changing records, run `python3 Context/_meta/tools/context_check.py --rebuild-catalog` to validate IDs/relations, scan for secrets and regenerate the catalog.

<!-- CONTEXT-ENGINEERING:END -->

<!-- SPEC-DRIVEN:START -->

# Spec-Driven Development

Development follows the adaptive SDD protocol in `Specs/README.md` (the detailed rules live there, not here).

1. **Recover first.** For non-trivial work, after the Context discovery steps above, read `Specs/INDEX.md` and `Specs/STATE.md`, then only the relevant spec, its plan and the tasks you need. Reconcile the documented state against the code, `git` and tests before continuing.
2. **Reuse specs.** Look for an existing spec in `Specs/INDEX.md` before creating one. A scope change updates its spec, with traceability. Never reuse IDs.
3. **Classify complexity** by real impact: `trivial` (no spec) · `lightweight` (single `spec.md`) · `full` (spec + plan + tasks + verification) · `critical` (full + risk, rollback, and human approval for destructive, irreversible or sensitive actions).
4. **No significant implementation without enough requirements and a plan.** Ask the user before implementing behavior that depends on an unresolved critical question.
5. **Follow the tasks and acceptance criteria.** Do not add unapproved features or unrelated refactors. Do not change accepted requirements to make code or tests pass.
6. **Verify with evidence.** Record PASS / FAIL / BLOCKED / NOT_RUN / NOT_APPLICABLE as actually observed. Written code is not done code.
7. **Persist SDD progress automatically, as it happens.** On every spec, plan or task change, task completion, blocker, or phase transition, update the affected files in `Specs/` (always `Specs/STATE.md`). This covers `Specs/` only: writes to `Context/` still follow the Context write policy above (one exception: a durable decision made while planning is recorded as a `DEC` in `Context/` and referenced from the spec). Commits and pushes require explicit instruction.
8. **Check drift** with `python3 Specs/_meta/tools/sdd_check.py` before declaring a phase or spec done.
9. Semantic intents: `iniciar spec`, `planejar spec`, `gerar tarefas`, `implementar spec`, `validar spec`, `status sdd`, `retomar desenvolvimento`, `auditar sdd` (see `Specs/README.md` §13).
10. Never put secrets in `Specs/`.

<!-- SPEC-DRIVEN:END -->

# Commands

Toolchain: Node 24 LTS (`.node-version`) and pnpm (version pinned in `package.json` › `packageManager`). Run from the repository root.

| Purpose | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Lint (ESLint, zero warnings) | `pnpm lint` |
| Check / apply formatting (Prettier) | `pnpm format:check` / `pnpm format` |
| Typecheck | `pnpm typecheck` |
| Unit tests (Vitest, `tests/unit`, `src/**/*.test.ts`) | `pnpm test` |
| Integration tests (Vitest, `tests/integration`) | `pnpm test:integration` |
| E2E tests (Playwright, desktop + 360 px) | `pnpm test:e2e` (first time: `pnpm exec playwright install chromium`) |
| Start local PostgreSQL 17 (port 5433) + MinIO (9000/9001) and create the bucket | `pnpm services:up` |
| Stop local services (data kept in Docker volumes) | `pnpm services:down` |
| Create/repair DB roles and database (superuser, idempotent) | `pnpm db:bootstrap` |
| Apply migrations (as `orbi_owner`) | `pnpm db:migrate` |
| Generate a migration from the Drizzle schema | `pnpm db:generate` (custom SQL: `pnpm exec drizzle-kit generate --custom --name=<name>`) |

Local services need Docker Desktop running and a `.env` at the repository root, copied from `.env.example` and filled in (never commit `.env`). `docker compose` must receive `--env-file .env`; the `services:*` scripts already do that. Fresh setup: `pnpm services:up`, then `pnpm db:bootstrap`, then `pnpm db:migrate`. Integration tests need the same `.env` and the services running.

Before declaring a task done, run `pnpm lint`, `pnpm format:check`, `pnpm typecheck` and the test scripts it affects.

Next.js 16 differs from older versions in APIs and conventions: check the bundled docs in `node_modules/next/dist/docs/` before writing framework code, and heed deprecation notices.

# Git workflow

- All work lands directly on `main`: no feature branches, no pull requests (user decision, 2026-11-05).
- Commits and pushes still happen only when the user asks.
- If the agent runs in a separate git worktree while `main` is checked out elsewhere, commit there, push with `git push origin HEAD:main` (fast-forward only; never force-push), then fast-forward the `main` checkout with `git pull --ff-only`. If the push is not a fast-forward, stop and ask.
