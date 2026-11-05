# Project State

Last updated: 2026-11-05
Latest checkpoint: `checkpoints/CP-20261105-1434-f0-foundation-t001-t008.md` (`CTX-CP-20261105-1434-f0-foundation-t001-t008`)

## Current objective

Implementar o MVP do orbi — plataforma SaaS multiempresa para dedetizadoras — seguindo a `SPEC-0001`; agora na fase F0 (Fundação).

## Working

- Sistema de contexto (`AGENTS.md`, `CLAUDE.md`, `Context/`, `context_check.py`) e SDD (`Specs/`, `sdd_check.py`).
- Código na `main` (T001–T003, T005–T008): app Next.js; ferramentas de qualidade; PostgreSQL 17 + MinIO no Docker; papéis do banco e migrações 0000–0004; isolamento por RLS com `withTenant()` e varredura automática; formatos pt-BR; login com Better Auth.
- Testes: unitários 43, integração 40 (PostgreSQL real), E2E 4 — todos verdes em 2026-11-05.
- Branches de contexto: `backend` (banco, RLS, autenticação) e `infra` (ambiente local, dependências).

## In progress

- Fase F0 da SPEC-0001: 7 de 18 tarefas concluídas. Próxima: `SPEC-0001-T009` (`RequestContext` + `action()`/`handler()`). Detalhe em `Specs/STATE.md`.
- Nenhuma tela além da página inicial; as telas começam na T017.

## Blockers

- Nenhum para seguir a F0.
- Layout final dos PDFs aguarda os modelos de proposta/contrato do usuário (SPEC-0001 OQ-06; T045/T056).

## Active decisions

- `CTX-DEC-20261104-adopt-context-engineering` — Context/ como memória; AGENTS.md como contrato.
- `CTX-DEC-20261105-adopt-spec-driven-development` — SDD adaptativo em `Specs/`.
- `CTX-DEC-20261105-product-scope-saas-pest-control` — SaaS multiempresa para dedetizadoras; MVP sem financeiro e sem offline.
- `CTX-DEC-20261105-tech-stack` — monólito TypeScript (Next.js + PostgreSQL com RLS) em Docker numa VPS.
- `CTX-DEC-20261105-auth-db-role` (backend) — papel `orbi_auth` para login/sessão; sessão expira após 8 h sem uso.

## Open critical questions

- Nenhuma question aberta em `Context/`. Perguntas locais da SPEC-0001: OQ-06, OQ-10, OQ-11.
- Hipótese a validar antes de produção: `CTX-ASM-20261105-regulatory-certificate-content`.
- Risco aberto: `CTX-RSK-20261105-login-rate-limit-bypass` (tratar na T017 e na T083).

## Next likely steps

1. `SPEC-0001-T009`, depois T010/T011 (caminho crítico da F0).
2. T004 (CI): combinar com o usuário o critério "push na `main`" em vez de "PR de teste".
3. Usuário envia os modelos de proposta e contrato (OQ-06).
