# SDD State

Last updated: 2026-11-05
Last verified by: `python3 Specs/_meta/tools/sdd_check.py` — 0 errors, 0 warnings (2026-11-05, após a T007)

## Active spec

`SPEC-0001` — Plataforma SaaS de gestão para empresas de controle de pragas (MVP) · `features/SPEC-0001--pest-control-mvp/` · level `critical` · priority `high`.

## Phase

`in_progress` — fase F0 (Fundação). Concluídas: `SPEC-0001-T001` (scaffold Next.js), `SPEC-0001-T002` (lint, formatação, typecheck, Vitest, Playwright) e `SPEC-0001-T007` (`src/lib`: pt-BR, fuso, CPF/CNPJ). Comandos do projeto em `AGENTS.md` › "Commands".

## Current / next task

`SPEC-0001-T003` — Docker dev (PostgreSQL 17 + MinIO), `ready`. **Bloqueio prático:** o Docker não está instalado nesta máquina; T004, T005 e o resto da F0 dependem dela.
Sem Docker, também `ready`: `SPEC-0001-T047` (`expandRecurrence`, fase F4, só depende da T007).

## Recently completed

- 2026-11-05: `SPEC-0001-T007` — `src/lib/{timezone,format,documents}.ts` + 36 testes unitários; CNPJ alfanumérico aceito; parte unitária de V-005 e V-033 executada.
- 2026-11-05: `SPEC-0001-T002` — scripts `lint`, `format`/`format:check`, `typecheck`, `test`, `test:integration`, `test:e2e` com um teste de exemplo cada, todos exit 0; Chromium do Playwright instalado; `agentRules: false` no `next.config.ts`.
- 2026-11-05: `SPEC-0001-T001` — scaffold (`pnpm install`, `pnpm build` e `pnpm dev` OK; página inicial conferida no navegador). Node 24.22.1 instalado via winget; pnpm 12.16.1 global.
- 2026-11-05: `iniciar spec` → SPEC-0001 criada; OQ-01..09 respondidas; aprovada → `specified`.
- 2026-11-05: stack aprovada → `CTX-DEC-20261105-tech-stack`.
- 2026-11-05: `plan.md`, `tasks.md` (T001–T089) e `verification.md` criados → `planned`.

## Blockers

- `SPEC-0001-T045` e `SPEC-0001-T056` (`blocked`): layout final dos PDFs de proposta e contrato aguarda os modelos do usuário (OQ-06). Não bloqueiam as demais tarefas.
- Tarefas [HUMANO] dependem do usuário: `SPEC-0001-T068` (validação do comprovante por RT, A-04), `SPEC-0001-T083` (contratar VPS/domínio/buckets), `SPEC-0001-T089` (aprovação do go-live).
- Ambiente local: Docker não instalado — necessário para `SPEC-0001-T003` em diante.

## Last verification

2026-11-05, após a T007: `pnpm lint`, `pnpm format:check`, `pnpm typecheck` exit 0; `pnpm test` 38/38 (também com `TZ` UTC, Tóquio e Los Angeles); `pnpm test:integration` 1/1. `pnpm test:e2e` 4/4 na T002 (não afetado pela T007). Nenhum AC completo verificado: V-005 e V-033 têm só a parte unitária executada (anotado em `verification.md`). `sdd_check.py`: 1 spec, 89 tarefas, 0 errors, 0 warnings.

## Relevant files

- `Specs/features/SPEC-0001--pest-control-mvp/spec.md`
- `Specs/features/SPEC-0001--pest-control-mvp/plan.md`
- `Specs/features/SPEC-0001--pest-control-mvp/tasks.md`
- `Specs/features/SPEC-0001--pest-control-mvp/verification.md`
- Código: `package.json`, `next.config.ts`, `tsconfig.json`, `components.json`, `src/app/`, `src/components/ui/`
- Ferramentas: `eslint.config.mjs`, `.prettierrc.json`, `vitest.config.mts`, `playwright.config.ts`, `tests/`

## Next recommended action

1. Instalar o Docker (Docker Desktop com WSL 2) para liberar a `SPEC-0001-T003` e o resto da F0; enquanto isso, `SPEC-0001-T047` pode ser adiantada.
2. Usuário envia os modelos de proposta e contrato (OQ-06) para desbloquear T045/T056.
3. Pedir `salvar contexto` para atualizar `Context/STATE.md` (ainda diz "nenhum código").

## Context to load

`Context/MAP.md`, `Context/STATE.md`, `CTX-DEC-20261105-tech-stack`, a `spec.md`, o `plan.md` e só as tarefas da fase atual em `tasks.md`.
