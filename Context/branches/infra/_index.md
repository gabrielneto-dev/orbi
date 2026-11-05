---
id: CTX-SUM-20261105-infra-index
type: summary
title: Índice da branch infra
branch: infra
tags: [dev-environment, docker, dependencies]
status: active
created_at: 2026-11-05
updated_at: 2026-11-05
---

# Branch: infra

## Purpose

Ambiente de desenvolvimento, serviços locais, dependências e (futuramente) CI, deploy na VPS e backup.

## Scope

Pertence: `docker/`, `.env.example`, ferramentas da máquina, política de dependências, CI (T004) e deploy (T083 em diante). Não pertence: código do servidor e convenções de banco (branch `backend`); comandos do projeto (estão em `AGENTS.md` › "Commands").

## Current state

Ambiente local funcionando no Windows com Docker Desktop. Ainda não há CI nem ambiente de produção.

## Core concepts

- Serviços locais via `pnpm services:up` (PostgreSQL 17 na 5433, MinIO Chainguard).
- Dependências passam pela política `minimumReleaseAge` do pnpm, sem exceções.

## Active decisions

- Stack e hospedagem: `CTX-DEC-20261105-tech-stack` (global).

## Open questions

Nenhuma.

## Risks

- `CTX-RSK-20261105-login-rate-limit-bypass` (branch `backend`) exige configurar `X-Forwarded-For` no Caddy na T083.

## Key records

- `CTX-FCT-20261105-local-dev-environment` — portas, imagens, `.env`, fins de linha, Python dos validadores.
- `CTX-NTE-20261105-pnpm-minimum-release-age` — versão recém-publicada recusada: usar a anterior.

## Related branches

- `backend`

## Routes

- Subir o ambiente / erro do compose / porta do banco → `CTX-FCT-20261105-local-dev-environment`
- Rodar `context_check.py` ou `sdd_check.py` nesta máquina → `CTX-FCT-20261105-local-dev-environment`
- `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` ou `minimumReleaseAgeExclude` no diff → `CTX-NTE-20261105-pnpm-minimum-release-age`
