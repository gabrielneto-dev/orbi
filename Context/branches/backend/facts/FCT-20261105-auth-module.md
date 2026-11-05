---
id: CTX-FCT-20261105-auth-module
type: fact
title: Módulo de autenticação (Better Auth encapsulado em src/server/auth)
branch: backend
tags: [authentication, security]
status: active
confidence: verified
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-DEC-20261105-auth-db-role, CTX-FCT-20261105-tenant-isolation-model, CTX-RSK-20261105-login-rate-limit-bypass]
depends_on: [CTX-DEC-20261105-auth-db-role]
supersedes: null
superseded_by: null
valid_from: 2026-11-05
valid_until: null
revisit_at: null
---

# Módulo de autenticação

## Fact

- **Versão fixada:** better-auth `1.7.17` (versão exata no `package.json`). Só `src/server/auth/**` importa `better-auth` ou `@better-auth/*`; o ESLint (`no-restricted-imports` em `eslint.config.mjs`) barra o resto.
- **API pública** (`@/server/auth`): `getSession(headers?)` (sem argumento, lê `next/headers`), `createUserWithPassword(input)`, `authRouteHandlers` (montados em `src/app/api/auth/[...all]/route.ts`) e `createAuthModule(options)` para testes e scripts.
- **Tabelas** (`src/server/db/schema/auth.ts`): `users`, `sessions`, `accounts`, `verifications`, `rate_limits`. As chaves do schema Drizzle seguem os nomes de campo do Better Auth e as colunas ficam em snake_case. IDs vêm do banco (`generateId: false` → `uuid_generate_v7()`).
- **Usuários:** `tenant_id` nulo só para `admin_plataforma` (validado em `createUserWithPassword`); `roles text[]` com os perfis do BR-01 (`secretaria`, `comercial`, `tecnico`, `gestor`, `financeiro`) mais `admin_plataforma`; `active`; e-mail único na plataforma, gravado em minúsculas. Sem cadastro público (`disableSignUp`). Usuário é desativado, nunca apagado (`orbi_auth` não tem DELETE em `users`).
- **Sessão:** inatividade em `SESSION_IDLE_TIMEOUT_MINUTES` (padrão 480, entre 5 min e 7 dias). `expiresIn` = inatividade e `updateAge` = min(15 min, 1/4). Sem cache de sessão em cookie: logout, desativação e expiração valem na próxima requisição.
- **Cookies:** HttpOnly, SameSite=Lax, Secure com `BETTER_AUTH_URL` https ou `NODE_ENV=production`; nesse caso o nome ganha o prefixo `__Secure-`.
- **Login de usuário inativo:** o hook `session.create.before` recusa com 403 e `code: USER_INACTIVE`.
- **Rate limit:** 5 tentativas/min por IP em `/sign-in/email`, com contadores na tabela `rate_limits` (sobrevivem a reinícios).
- **Telemetria** do Better Auth desligada.

## Scope

Empresa suspensa ainda **não** bloqueia o login; isso fica para o `RequestContext` (T009), que lê `tenants.status` dentro de `withTenant`. Gravações de usuários (criar, desativar, perfis) passam por este módulo, não por `orbi_app`.

## Evidence

`tests/integration/auth.test.ts` 17/17 e `tests/unit/auth-config.test.ts` 5/5 (2026-11-05); smoke da rota real `/api/auth` no `next dev`. Detalhe na evidência da T008.

## Validity

Revisar ao atualizar o Better Auth: os campos esperados e o comportamento de rate limit, hooks e cookies podem mudar entre versões.
