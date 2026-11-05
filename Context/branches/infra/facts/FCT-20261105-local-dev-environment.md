---
id: CTX-FCT-20261105-local-dev-environment
type: fact
title: Ambiente de desenvolvimento local (Windows + Docker Desktop, PostgreSQL 5433, MinIO Chainguard)
branch: infra
tags: [dev-environment, docker]
status: active
confidence: verified
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-DEC-20261105-tech-stack, CTX-NTE-20261105-pnpm-minimum-release-age]
depends_on: []
supersedes: null
superseded_by: null
valid_from: 2026-11-05
valid_until: null
revisit_at: 2027-05-05
---

# Ambiente de desenvolvimento local

## Fact

- **Máquina atual:** Windows 11, Docker Desktop 4.98 (WSL 2), Node 24.22 (instalado via winget) e pnpm 12.16 global. Os comandos estão em `AGENTS.md` › "Commands".
- **Serviços** (`docker/compose.dev.yml`): PostgreSQL 17 em `127.0.0.1:5433` (a 5432 já está ocupada por um PostgreSQL nativo da máquina), MinIO na API `9000` e no console `9001`, bucket `orbi-dev`. `docker compose` só lê o `.env` da raiz com `--env-file .env`; sem ele, o compose falha de propósito (`${VAR:?}`) em vez de subir com senha vazia. Os scripts `pnpm services:up` e `services:down` já passam o arquivo.
- **MinIO:** a MinIO deixou de publicar imagens comunitárias (sem acesso no Docker Hub e no quay.io). O projeto usa `cgr.dev/chainguard/minio` e `cgr.dev/chainguard/minio-client`, que no plano gratuito só têm a tag `latest`.
- **Instalação do zero:** `.env` copiado do `.env.example` e preenchido → `pnpm services:up` → `pnpm db:bootstrap` → `pnpm db:migrate`. Desde a T008, o `.env` também precisa de `DATABASE_URL_AUTH`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. Um `.env` antigo precisa dessas variáveis e de um novo `pnpm db:bootstrap`.
- **Worktrees:** cada git worktree tem o próprio `.env`, que não é versionado. Hoje o checkout principal (`orbi/`) não tem `.env`.
- **Fins de linha:** git com `core.autocrlf=true` e Prettier com `endOfLine: auto`. Os avisos "LF will be replaced by CRLF" no `git add` são esperados.
- **`next.config.ts` com `agentRules: false`:** impede o `next dev` de reescrever o `AGENTS.md`.
- **ESLint 10:** os plugins react, jsx-a11y e import declaram peer `eslint ≤ 9` e o pnpm avisa, mas as regras rodam. Volte para o ESLint 9 só se algo quebrar.
- **Python:** nesta máquina, `python3` é o atalho da Microsoft Store. Os validadores (`context_check.py`, `sdd_check.py`) rodam com o Python do Salt: `"C:/Program Files/Salt Project/Salt/Scripts/python.exe" -I`, com `PYTHONIOENCODING=utf-8` (sem isso a saída quebra nos acentos).

## Evidence

Evidências das tarefas T001, T002, T003, T005 e T008 em `Specs/features/SPEC-0001--pest-control-mvp/tasks.md` (2026-11-05).

## Validity

Específico da máquina de desenvolvimento atual e das versões citadas; revisar ao trocar de máquina ou atualizar o Docker Desktop.
