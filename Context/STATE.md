# Project State

Last updated: 2026-11-05
Latest checkpoint: `checkpoints/CP-20261104-2351-context-bootstrap.md` (`CTX-CP-20261104-2351-context-bootstrap`)

## Current objective

Definir o que é o projeto orbi. O sistema de contexto já está instalado.

## Working

- Sistema de contexto: `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `Context/` e validador `_meta/tools/context_check.py`.
- SDD instalado em `Specs/` (`CTX-DEC-20261105-adopt-spec-driven-development`). Estado do desenvolvimento: `Specs/STATE.md` (nenhuma spec ainda).

## In progress

- Nada. O repositório só tem `README.md` (`# orbi`); não há código nem documentação de domínio.

## Blockers

- Propósito, escopo, tipo e stack do projeto desconhecidos: impede criar branches e preencher `core/`.

## Active decisions

- `CTX-DEC-20261104-adopt-context-engineering` — Context/ como memória; AGENTS.md como contrato.
- `CTX-DEC-20261105-adopt-spec-driven-development` — SDD adaptativo em `Specs/`.

## Open critical questions

- `CTX-QUE-20261104-project-purpose-and-scope` — o que é o orbi, para quem, qual escopo?
- `CTX-QUE-20261104-project-type-and-stack` — tipo de projeto e tecnologias.

## Next likely steps

1. Responder as duas questions acima com o usuário.
2. Atualizar `core/overview.md` e `core/goals.md`; criar as primeiras branches (`Context/README.md` §18).
3. Primeira funcionalidade pedida → `iniciar spec` (`Specs/README.md`).
4. Registrar comandos de build/test/lint em `AGENTS.md` quando a stack existir.
