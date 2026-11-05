---
id: CTX-SUM-20261105-backend-index
type: summary
title: Índice da branch backend
branch: backend
tags: [database, multi-tenancy, authentication, security]
status: active
created_at: 2026-11-05
updated_at: 2026-11-05
---

# Branch: backend

## Purpose

Conhecimento do lado servidor do orbi: banco PostgreSQL, isolamento entre empresas (RLS), papéis do banco e autenticação.

## Scope

Pertence: `src/server/**`, `drizzle/`, `scripts/db-*.mts` e suas convenções. Não pertence: requisitos e tarefas (ficam em `Specs/`), ambiente local e deploy (ficam na branch `infra`), stack geral (`CTX-DEC-20261105-tech-stack`, em `global/`).

## Current state

Fundação implementada até a T008 da SPEC-0001: papéis, migrações 0000–0004, tabela `tenants`, `withTenant()`, política RLS padrão com varredura automática e login com Better Auth. Ainda não existem `RequestContext`, wrappers `action()`/`handler()` (T009), auditoria (T012) nem tabelas de domínio.

## Core concepts

- 4 papéis PostgreSQL (`orbi_owner`, `orbi_app`, `orbi_platform`, `orbi_auth`), nenhum com BYPASSRLS.
- `withTenant()` + `enable_tenant_rls()`: toda tabela com `tenant_id` tem RLS forçado; sem empresa definida, zero linhas.
- Better Auth só dentro de `src/server/auth`.

## Active decisions

- `CTX-DEC-20261105-auth-db-role` — papel `orbi_auth` para login/sessão; inatividade padrão de 8 h.

## Open questions

Nenhuma.

## Risks

- `CTX-RSK-20261105-login-rate-limit-bypass` — rate limit de login contornado por Server Action ou anulado pelo proxy (T017, T083).

## Key records

- `CTX-FCT-20261105-tenant-isolation-model` — papéis, RLS padrão, `withTenant`, varredura, como criar tabela de empresa.
- `CTX-FCT-20261105-auth-module` — API, tabelas, sessão, cookies e rate limit do módulo de autenticação.

## Related branches

- `infra` — ambiente local, Docker, dependências.

## Routes

- Como criar uma tabela com `tenant_id` / por que a consulta volta vazia → `CTX-FCT-20261105-tenant-isolation-model`
- Quem conecta com qual papel / variáveis `DATABASE_URL*` → `CTX-FCT-20261105-tenant-isolation-model`, `CTX-DEC-20261105-auth-db-role`
- Login, sessão, cookies, criação de usuário → `CTX-FCT-20261105-auth-module`
- Tela de login e deploy (cuidados com rate limit) → `CTX-RSK-20261105-login-rate-limit-bypass`
