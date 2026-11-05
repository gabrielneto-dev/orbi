---
id: CTX-DEC-20261105-tech-stack
type: decision
title: Stack do orbi — monólito TypeScript (Next.js + PostgreSQL) em Docker numa VPS
branch: global
tags: [tech-stack]
status: active
confidence: medium
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-QUE-20261104-project-type-and-stack, CTX-DEC-20261105-adopt-spec-driven-development]
depends_on: []
supersedes: null
superseded_by: null
revisit_at: null
---

# Decision: stack técnica do orbi

## Context

O orbi é uma plataforma web SaaS multiempresa para dedetizadoras (requisitos em `Specs/features/SPEC-0001--pest-control-mvp/spec.md`): telas responsivas para técnico de campo, isolamento de dados por empresa, geração de PDFs a partir de modelos da empresa, anexos (fotos, assinaturas, plantas), tarefas agendadas (OS de contrato, expiração de propostas, alertas) e meta de capacidade de até 200 usuários e 10.000 OS/mês por empresa.

Preferências do usuário (2026-11-05): experiência em **TypeScript/JavaScript**; hospedagem em **VPS própria**; desenvolvimento por **uma pessoa com apoio de IA**.

## Problem

Escolher tecnologias que um desenvolvedor solo consiga manter, que rodem bem numa VPS e que atendam isolamento multiempresa, PDFs fiéis a modelos e tarefas em segundo plano sem infraestrutura extra.

## Options considered

1. **Monólito Next.js + PostgreSQL (escolhida):** uma linguagem, um deploy, ecossistema maduro para UI responsiva.
2. Backend separado (NestJS/Fastify) + SPA React: fronteira mais explícita, mas dois projetos e dois deploys para uma pessoa só.
3. Remix/React Router full-stack: equivalente em capacidade; menor ecossistema de componentes/autenticação.
4. Python/Django ou PHP/Laravel: descartados por não serem o ecossistema de domínio do usuário.

## Decision

| Camada | Escolha |
|---|---|
| Runtime / pacotes | Node.js 24 LTS, pnpm, TypeScript estrito |
| Aplicação | Next.js (App Router) + React, monólito; lógica de domínio em camada de servidor própria, não nos componentes |
| UI | Tailwind CSS + shadcn/ui (Radix), mobile-first para o perfil técnico |
| Validação | Zod, compartilhado entre formulários e servidor |
| Banco | PostgreSQL 17+ |
| ORM / migrações | Drizzle ORM + drizzle-kit |
| Multiempresa | `tenant_id` em toda tabela de dados + Row-Level Security do PostgreSQL como segunda barreira |
| Autenticação | Better Auth (sessões, usuários, perfis) |
| Jobs agendados | pg-boss (fila sobre o próprio PostgreSQL, sem Redis) |
| PDF | Templates HTML renderizados em PDF por Playwright/Chromium |
| Arquivos | Armazenamento compatível com S3 (Cloudflare R2 ou Backblaze B2 em produção; MinIO apenas no desenvolvimento local) |
| Assinatura em tela | signature_pad |
| Deploy | Docker Compose na VPS, Caddy como proxy reverso com HTTPS automático |
| Backup | `pg_dump` diário + anexos copiados para armazenamento S3 externo, com teste de restauração |
| Testes | Vitest (unidade/integração com PostgreSQL real), Playwright (E2E, incluindo viewport de 360 px), k6 (carga) |
| Observabilidade | Logs estruturados com pino; Sentry opcional |

Versões exatas são fixadas no `package.json`/`docker-compose` durante a implementação, não aqui.

## Rationale

- Uma única linguagem e um único deploy reduzem o custo de manutenção para um desenvolvedor solo.
- PostgreSQL concentra dados, fila (pg-boss) e isolamento (RLS): menos serviços para operar na VPS.
- RLS protege contra o erro mais grave de um SaaS (vazamento entre empresas) mesmo se uma consulta esquecer o filtro de `tenant_id` (SPEC-0001/REQ-061).
- HTML → PDF via Chromium reproduz com fidelidade os modelos de proposta/contrato que o usuário vai enviar (SPEC-0001/OQ-06).
- API S3 mantém os anexos fora da VPS (durabilidade e backup externo) e permite trocar de provedor sem mudar código.

## Consequences

- O Next.js roda em modo `standalone` num contêiner; Playwright/Chromium e o worker do pg-boss podem rodar em contêiner separado para não pesar na aplicação.
- Toda conexão de banco da aplicação define o tenant da requisição antes de consultar (requisito para o RLS funcionar); migrações rodam com um papel separado.
- Comandos de build/test/lint passam a existir após o scaffold do projeto e devem ser registrados em `AGENTS.md` nesse momento.
- A VPS é ponto único de falha no MVP; a recuperação depende do backup externo e do procedimento de restauração (SPEC-0001/REQ-053).

## Risks

- **Server Actions/rotas do Next.js sem checagem de autorização** → mitigar com uma camada de serviço única que exige contexto (usuário, tenant, perfil) e testes de autorização por endpoint (SPEC-0001/AC-002, AC-037).
- **Chromium consome memória** na geração de PDFs em volume → fila de PDFs com concorrência limitada.
- **Better Auth é mais novo que alternativas consolidadas** → isolar o uso atrás de um módulo de autenticação próprio para permitir troca.
- **Operar a VPS sozinho** (atualizações, disco, certificados) → automação de atualizações de segurança e monitoramento de disponibilidade.

## Related records

- `CTX-QUE-20261104-project-type-and-stack` — respondida por esta decisão.
- `CTX-DEC-20261105-adopt-spec-driven-development` — o plano da SPEC-0001 detalha a aplicação desta decisão.
