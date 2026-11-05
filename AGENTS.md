# AGENTS.md — orbi

Shared operating contract for every AI agent working in this repository
(Claude Code, Codex, or any agent with file access).

- **How to work** lives here.
- **What the project knows** lives in `Context/`.
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
