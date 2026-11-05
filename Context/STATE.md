# Project State

Last updated: 2026-11-05
Latest checkpoint: `checkpoints/CP-20261105-0921-spec-0001-planning.md` (`CTX-CP-20261105-0921-spec-0001-planning`)

## Current objective

Implementar o MVP do orbi — plataforma SaaS multiempresa para dedetizadoras — seguindo a `SPEC-0001`, a partir da fase F0 (Fundação).

## Working

- Sistema de contexto: `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `Context/` e validador `_meta/tools/context_check.py`.
- SDD em `Specs/`: `SPEC-0001` em `planned` (spec, plan, 89 tarefas, verificação planejada). Detalhe: `Specs/STATE.md`.
- `core/` descreve produto, objetivos, restrições e glossário do domínio.

## In progress

- Nenhum código ainda. Próxima tarefa: `SPEC-0001-T001` (scaffold Next.js).
- O trabalho de definição e planejamento (2026-11-05) está sem commit na branch git `claude/orbi-pest-control-spec-186f40`.

## Blockers

- Nenhum para começar a implementação.
- Layout final dos PDFs aguarda os modelos de proposta/contrato do usuário (SPEC-0001 OQ-06).

## Active decisions

- `CTX-DEC-20261104-adopt-context-engineering` — Context/ como memória; AGENTS.md como contrato.
- `CTX-DEC-20261105-adopt-spec-driven-development` — SDD adaptativo em `Specs/`.
- `CTX-DEC-20261105-product-scope-saas-pest-control` — SaaS multiempresa para dedetizadoras; MVP sem financeiro e sem offline.
- `CTX-DEC-20261105-tech-stack` — monólito TypeScript (Next.js + PostgreSQL com RLS) em Docker numa VPS.

## Open critical questions

- Nenhuma question aberta em `Context/`. Perguntas locais da SPEC-0001: OQ-06, OQ-10, OQ-11.
- Hipótese a validar antes de produção: `CTX-ASM-20261105-regulatory-certificate-content` (conteúdo do comprovante, via responsável técnico).

## Next likely steps

1. Commitar o trabalho da sessão de 2026-11-05 (quando o usuário pedir).
2. `implementar spec SPEC-0001` começando por `SPEC-0001-T001`.
3. Ao concluir `SPEC-0001-T002`, registrar comandos de build/test/lint em `AGENTS.md`.
4. Criar branches de contexto de domínio quando a implementação produzir conhecimento específico (`README.md` §18).
