# SDD State

Last updated: 2026-11-05
Last verified by: `python3 Specs/_meta/tools/sdd_check.py` — 0 errors, 0 warnings (2026-11-05, após a T002)

## Active spec

`SPEC-0001` — Plataforma SaaS de gestão para empresas de controle de pragas (MVP) · `features/SPEC-0001--pest-control-mvp/` · level `critical` · priority `high`.

## Phase

`in_progress` — fase F0 (Fundação). `SPEC-0001-T001` (scaffold Next.js) e `SPEC-0001-T002` (lint, formatação, typecheck, Vitest, Playwright) concluídas. Comandos do projeto em `AGENTS.md` › "Commands".

## Current / next task

`SPEC-0001-T007` — `src/lib`: formatação pt-BR, fuso America/Sao_Paulo, validação de CPF/CNPJ (`ready`, não precisa de Docker).
Também `ready`: `SPEC-0001-T003` (Docker dev: PostgreSQL 17 + MinIO). Requer instalar o Docker nesta máquina (ainda ausente); T004, T005 e o resto da F0 dependem dela.

## Recently completed

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

2026-11-05, após a T002: `pnpm lint`, `pnpm format:check`, `pnpm typecheck` exit 0; `pnpm test` 2/2; `pnpm test:integration` 1/1; `pnpm test:e2e` 4/4 (dev) e 4/4 (`CI=1`, build de produção). Testes são exemplos de suporte: nenhum AC verificado ainda (`verification.md` inalterado). `sdd_check.py`: 1 spec, 89 tarefas, 0 errors, 0 warnings.

## Relevant files

- `Specs/features/SPEC-0001--pest-control-mvp/spec.md`
- `Specs/features/SPEC-0001--pest-control-mvp/plan.md`
- `Specs/features/SPEC-0001--pest-control-mvp/tasks.md`
- `Specs/features/SPEC-0001--pest-control-mvp/verification.md`
- Código: `package.json`, `next.config.ts`, `tsconfig.json`, `components.json`, `src/app/`, `src/components/ui/`
- Ferramentas: `eslint.config.mjs`, `.prettierrc.json`, `vitest.config.mts`, `playwright.config.ts`, `tests/`

## Next recommended action

1. `SPEC-0001-T007` (utilitários pt-BR e CPF/CNPJ); em paralelo, instalar o Docker para liberar a `SPEC-0001-T003`.
2. Usuário envia os modelos de proposta e contrato (OQ-06) para desbloquear T045/T056.
3. Pedir `salvar contexto` para atualizar `Context/STATE.md` (ainda diz "nenhum código").

## Context to load

`Context/MAP.md`, `Context/STATE.md`, `CTX-DEC-20261105-tech-stack`, a `spec.md`, o `plan.md` e só as tarefas da fase atual em `tasks.md`.
