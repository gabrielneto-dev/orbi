---
id: CTX-DEC-20261105-auth-db-role
type: decision
title: Papel PostgreSQL orbi_auth exclusivo do módulo de autenticação; sessão expira após 8 h sem uso
branch: global
tags: [tech-stack]
status: active
confidence: high
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-DEC-20261105-tech-stack]
depends_on: [CTX-DEC-20261105-tech-stack]
supersedes: null
superseded_by: null
revisit_at: null
---

# Decision: papel `orbi_auth` para o login e inatividade padrão de 8 horas

## Context

Na SPEC-0001 (T006), toda tabela com `tenant_id` tem RLS forçado e só mostra linhas da empresa definida na transação (`withTenant()`). O plano põe `tenant_id` na tabela de usuários do Better Auth (T008). O login (busca pelo e-mail) e a validação da sessão a cada requisição acontecem **antes** de se saber a empresa do usuário.

## Problem

Com RLS forçado e o papel da aplicação (`orbi_app`), a busca do usuário no login retornaria zero linhas: ninguém conseguiria entrar.

## Options considered

1. **Papel `orbi_auth` exclusivo do módulo de autenticação (escolhida).**
2. Usar o papel `orbi_platform` no login: menos peças, mas mistura login com administração das empresas.
3. Deixar a tabela de usuários sem RLS (exceção na varredura): mais simples, porém a aplicação veria usuários de outras empresas se uma consulta esquecesse o filtro.

## Decision

- Quarto papel PostgreSQL `orbi_auth` (mesmos atributos dos outros: sem SUPERUSER/BYPASSRLS), criado pelo bootstrap, conexão `DATABASE_URL_AUTH`. Só `src/server/auth` (Better Auth) o usa.
- `users`: política padrão `tenant_isolation` (vale para `orbi_app`) + política `auth_access` só para `orbi_auth`. `orbi_app` tem apenas SELECT, restrito à empresa.
- `sessions`, `accounts` (hash de senha), `verifications`, `rate_limits`: privilégios só para `orbi_auth`, RLS forçado com política só para ele.
- Inatividade padrão da sessão: **8 horas**, ajustável por `SESSION_IDLE_TIMEOUT_MINUTES`.

Decidido pelo usuário em 2026-11-05 (resposta às duas perguntas da T008).

## Rationale

- Mantém o RLS forçado em toda tabela com `tenant_id`, inclusive usuários, sem exceção na varredura.
- O acesso amplo fica num papel usado só por uma biblioteca encapsulada, que consulta por e-mail ou token.
- 8 horas cobre um turno de trabalho de escritório e de campo.

## Consequences

- Mais uma variável de ambiente (`DATABASE_URL_AUTH`) em desenvolvimento, CI e produção; o bootstrap cria/corrige o papel.
- Gravação de usuários (criar, desativar, perfis) passa pelo módulo de autenticação (`createUserWithPassword()` e futuras funções), não por `orbi_app`.
- A varredura de RLS aceita políticas permissivas extras só quando não valem para PUBLIC nem para `orbi_app`.

## Risks

- Um bug no módulo de autenticação poderia ler usuários de outras empresas → código pequeno, isolado por regra de lint e coberto por testes de integração.

## Related records

- `CTX-DEC-20261105-tech-stack` — Better Auth e isolamento por RLS.
- SPEC-0001 T008 (`Specs/features/SPEC-0001--pest-control-mvp/tasks.md`) e `plan.md` › Security and privacy.
