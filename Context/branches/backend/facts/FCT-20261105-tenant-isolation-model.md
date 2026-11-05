---
id: CTX-FCT-20261105-tenant-isolation-model
type: fact
title: Modelo de isolamento entre empresas no PostgreSQL (papéis, RLS padrão, withTenant, varredura)
branch: backend
tags: [database, multi-tenancy, security]
status: active
confidence: verified
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-DEC-20261105-tech-stack, CTX-DEC-20261105-auth-db-role]
depends_on: [CTX-DEC-20261105-tech-stack]
supersedes: null
superseded_by: null
valid_from: 2026-11-05
valid_until: null
revisit_at: null
---

# Modelo de isolamento entre empresas no PostgreSQL

## Fact

Implementado nas tarefas T005, T006 e T008 da SPEC-0001 e coberto por testes de integração.

- **Papéis** (`src/server/db/roles.ts`), todos sem SUPERUSER/BYPASSRLS, criados ou corrigidos por `pnpm db:bootstrap` (superusuário via `DATABASE_URL_ADMIN`, idempotente). Papéis ficam fora das migrações porque valem para o servidor inteiro.
  - `orbi_owner`: dono das tabelas; o único que roda `pnpm db:migrate`, que recusa outro papel.
  - `orbi_app`: a aplicação (`DATABASE_URL`, `getDb()`); nunca dono de objetos.
  - `orbi_platform`: admin_plataforma; hoje SELECT/INSERT/UPDATE em `tenants`, sem DELETE.
  - `orbi_auth`: só `src/server/auth` (`CTX-DEC-20261105-auth-db-role`).
- **Empresa da transação:** `withTenant(tenantId, tx => …)` (`src/server/db/tenant.ts`) valida o UUID, abre uma transação e roda `set_config('app.tenant_id', id, true)`, que vale só nessa transação. Toda consulta a dados de empresa passa por ela.
- **Política padrão** (`drizzle/0002_tenant_rls.sql`): `CALL public.enable_tenant_rls('public.<tabela>')` liga e força a RLS (ENABLE + FORCE) e cria a política `tenant_isolation`, para PUBLIC, com `tenant_id = public.current_tenant_id()` em USING e WITH CHECK.
- **`current_tenant_id()`** usa `nullif(current_setting('app.tenant_id', true), '')::uuid`. Depois de uma transação com `set_config(..., true)`, a conexão volta ao pool com o valor `''` em vez de "não definido"; sem o `NULLIF`, o cast para `uuid` daria erro. Sem empresa definida, as consultas retornam zero linhas, inclusive para o dono da tabela (FORCE).
- **`tenants`** não tem `tenant_id`: `orbi_app` só lê a própria empresa (`id = current_tenant_id()`).
- **Varredura** (`tests/integration/support/rls-scan.ts`, executada em `tenant-isolation.test.ts`): falha se uma relação com coluna `tenant_id` não tiver RLS habilitado e forçado e a política `tenant_isolation` exata, ou se houver outra política permissiva que valha para PUBLIC ou `orbi_app` (políticas permissivas se somam com OR). Também falha com view sem `security_invoker` ou view materializada com `tenant_id`. Políticas extras para outros papéis (ex.: `auth_access` para `orbi_auth`) são permitidas.

## Scope

Como criar tabela de dados de empresa: coluna `tenant_id uuid not null` com índice começando por ela; na migração (SQL manual, `pnpm exec drizzle-kit generate --custom`), `CALL public.enable_tenant_rls(...)` e `GRANT` explícito a `orbi_app`. Não há default privileges: tabela sem GRANT dá `42501`. Tabelas só de inserção (ex.: `stock_movements`) recebem só `INSERT, SELECT`.

## Evidence

`tests/integration/{db-roles,tenant-isolation,auth}.test.ts`, 40/40 em 2026-11-05 (base temporária migrada a cada execução). Detalhe nas evidências da T005/T006/T008 em `Specs/features/SPEC-0001--pest-control-mvp/tasks.md`.

## Validity

Vale enquanto o schema seguir as migrações `0000`–`0004`. Ao migrar para PostgreSQL 18, `uuid_generate_v7()` pode dar lugar ao `uuidv7()` nativo.
