# SDD State

Last updated: 2026-11-05
Last verified by: `python3 Specs/_meta/tools/sdd_check.py` — 0 errors, 0 warnings (2026-11-05)

## Active spec

`SPEC-0001` — Plataforma SaaS de gestão para empresas de controle de pragas (MVP) · `features/SPEC-0001--pest-control-mvp/` · level `critical` · priority `high`.

## Phase

`planned` — `spec.md` (REQ-001..064, AC-001..046), `plan.md` (fases F0–F7), `tasks.md` (89 tarefas) e `verification.md` (V-001..046, todos `NOT_RUN`). Nenhum código escrito.

## Current / next task

`SPEC-0001-T001` — criar o projeto Next.js com TypeScript estrito, pnpm, Node 24, Tailwind e shadcn/ui (`ready`, sem dependências). Fase F0 — Fundação.

## Recently completed

- 2026-11-05: `iniciar spec` → SPEC-0001 criada; OQ-01..09 respondidas (SaaS multiempresa, estoque por veículo, plantas, periodicidade configurável, retenção 5 anos); aprovada → `specified`.
- 2026-11-05: stack aprovada → `CTX-DEC-20261105-tech-stack`.
- 2026-11-05: `plan.md` criado (8 fases, RLS por tenant, riscos, rollback, ações com aprovação humana).
- 2026-11-05: `tasks.md` (T001–T089) e `verification.md` criados → `planned`.

## Blockers

- `SPEC-0001-T045` e `SPEC-0001-T056` (`blocked`): layout final dos PDFs de proposta e contrato aguarda os modelos do usuário (OQ-06). Não bloqueiam as demais tarefas.
- Tarefas [HUMANO] dependem do usuário: `SPEC-0001-T068` (validação do comprovante por RT, A-04), `SPEC-0001-T083` (contratar VPS/domínio/buckets), `SPEC-0001-T089` (aprovação do go-live).

## Last verification

`sdd_check.py` em 2026-11-05 (após criar `tasks.md` e `verification.md`): 1 spec, 89 tarefas, 0 errors, 0 warnings (todo REQ tem tarefa). Nenhum teste de produto executado.

## Relevant files

- `Specs/features/SPEC-0001--pest-control-mvp/spec.md`
- `Specs/features/SPEC-0001--pest-control-mvp/plan.md`
- `Specs/features/SPEC-0001--pest-control-mvp/tasks.md`
- `Specs/features/SPEC-0001--pest-control-mvp/verification.md`

## Next recommended action

1. `implementar spec SPEC-0001` → começar por `SPEC-0001-T001` (scaffold), seguindo a F0.
2. Usuário envia os modelos de proposta e contrato (OQ-06) para desbloquear T045/T056.
3. (Opcional) Responder OQ-10 e OQ-11.
4. Pedir `salvar contexto` para registrar o propósito do orbi em `Context/`.

## Context to load

`Context/MAP.md`, `Context/STATE.md`, `CTX-DEC-20261105-tech-stack`, a `spec.md`, o `plan.md` e só as tarefas da fase atual em `tasks.md`.
