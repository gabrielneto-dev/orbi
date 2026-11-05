---
id: SPEC-0001
title: Plataforma SaaS de gestão para empresas de controle de pragas (MVP) — plano técnico
updated_at: 2026-11-05
---

# Plan: Plataforma SaaS de gestão para empresas de controle de pragas (MVP)

Aplica `CTX-DEC-20261105-tech-stack` aos requisitos da `spec.md` (REQ-001..064, AC-001..046).

## Current architecture

Greenfield. O repositório (verificado em 2026-11-05) contém apenas `README.md`, `AGENTS.md`, `CLAUDE.md`,
`Context/` e `Specs/`. Não há código, `package.json`, banco, CI nem infraestrutura. Nada a preservar
além das pastas de documentação.

## Approach

**Uma spec, entregue em fases incrementais** (resolve A-09). O modelo de dados é compartilhado e as regras
cruzam módulos (OS ↔ estoque ↔ dispositivos ↔ contratos); dividir em várias specs agora só multiplicaria
documentos para um desenvolvedor solo. Cada fase termina com software executável e ACs verificados.
Se `tasks.md` passar de ~120 tarefas ou uma fase precisar ser replanejada isoladamente, a fase vira spec
própria com `dependencies: [SPEC-0001]`.

Ordem guiada por dependência de dados (o estoque vem antes da OS porque a conclusão da OS baixa estoque e
exige lotes; os locais de estoque vêm antes dos dispositivos porque `em_estoque` aponta para um local):

| Fase | Entrega | Requisitos | ACs principais |
|---|---|---|---|
| **F0 — Fundação** | Scaffold, Docker dev, CI, banco + RLS, autenticação, empresas, usuários/perfis, matriz de permissões, auditoria, formatação pt-BR, controle de concorrência, armazenamento de arquivos | REQ-001..004, 049, 051, 054, 061..064 | AC-001..004, 033, 036..039 |
| **F1 — Cadastros** | Configurações da empresa, clientes, locais, áreas, catálogo, busca/filtros | REQ-005..013, 045, 047 | AC-005..007, 030 (parcial) |
| **F2 — Estoque** | Almoxarifado, veículos, lotes, movimentações, transferências, extrato, alertas | REQ-038..042, 056, 057 | AC-026..028, 043, 044 |
| **F3 — Propostas** | Propostas, versões, numeração, motor de PDF, expiração | REQ-014..019, 043, 044 | AC-008..011, 029 |
| **F4 — Contratos** | Modelos de contrato, periodicidade, ativação com geração de OS, suspensão/cancelamento, renovação | REQ-020..024, 058 | AC-012..015, 040 |
| **F5 — OS e campo** | Agenda, telas do técnico (360 px), execução por etapas, fotos, assinatura, conclusão, baixa de estoque, comprovante | REQ-025..032, 048, 052 | AC-016..021, 031, 034, 041 |
| **F6 — Dispositivos e plantas** | Ciclo de vida do dispositivo, inspeção, plantas com marcações, inventário PDF, alerta de retirada | REQ-033..037, 055 | AC-022..025, 042 |
| **F7 — Painel, LGPD e operação** | Painel por perfil, exportação/anonimização, retenção, backup + restauração, teste de carga, endurecimento para produção | REQ-046, 050, 053, 059, 060 | AC-015, 028, 032, 035, 045, 046 |

Pendências da spec e quando precisam estar resolvidas:

- **OQ-06 (modelos de PDF):** F3/F4 começam com um layout padrão; o layout final entra quando os modelos chegarem (tarefa própria, não bloqueia o resto da fase).
- **A-04 (conteúdo do comprovante):** validado por um responsável técnico **antes de F5 ir para produção**.
- **A-10 (capacidade):** confirmada antes do teste de carga em F7.
- **OQ-10 / OQ-11:** não afetam o MVP; o modelo de dados não impede evoluir (ver `Compatibility strategy`).

## Affected components and files

Tudo é novo. Estrutura alvo na raiz do repositório (as pastas `Context/` e `Specs/` permanecem):

```text
package.json, pnpm-lock.yaml, tsconfig.json, next.config.ts, drizzle.config.ts, .env.example
src/
├── app/                       # Next.js App Router
│   ├── (auth)/login/          # login
│   ├── (escritorio)/…         # telas de escritório (desktop): clientes, catálogo, propostas, contratos, OS, estoque, painel, config
│   ├── (campo)/campo/…        # telas do técnico, mobile-first (REQ-027, REQ-048)
│   ├── (plataforma)/admin/…   # admin_plataforma (REQ-062)
│   └── api/                   # route handlers: upload/download de arquivos, PDFs, health
├── server/
│   ├── db/                    # schema Drizzle, cliente, withTenant() (RLS), migrações auxiliares
│   ├── auth/                  # Better Auth (encapsulado: o resto do código só usa getSession())
│   ├── authz/                 # matriz BR-01 + serializadores por perfil (oculta valores do técnico)
│   ├── context.ts             # RequestContext {user, tenantId, roles} + action()/handler() wrappers
│   ├── modules/<módulo>/      # service.ts (regras), repo.ts (consultas), schemas.ts (Zod), dto.ts
│   │                          #   tenants, users, audit, settings, clients, catalog, stock,
│   │                          #   proposals, contracts, work-orders, devices, plans, dashboard, privacy
│   ├── numbering/             # numeração sequencial (REQ-043)
│   ├── storage/               # cliente S3, chaves por tenant, validação de upload
│   ├── pdf/                   # templates HTML + renderer Chromium
│   └── jobs/                  # filas pg-boss (PDF, expiração de propostas)
├── worker.ts                  # processo separado: pg-boss + Chromium + poppler
├── components/                # shadcn/ui + componentes do domínio
└── lib/                       # format (pt-BR, R$, datas tz), validação CPF/CNPJ, utilitários puros
drizzle/                       # migrações SQL geradas + SQL manual de RLS/grants
scripts/                       # seed dev, seed de carga, criar admin_plataforma (CLI), backup/restore
tests/{unit,integration,e2e,load}/
docker/{Dockerfile, compose.dev.yml, compose.prod.yml, Caddyfile, backup/}
.github/workflows/ci.yml
```

`AGENTS.md` recebe os comandos de build/test/lint ao final do scaffold (F0).

## Data model and flows

### Convenções

- Chaves `uuid` (v7, ordenáveis). Toda tabela de dados de empresa tem `tenant_id uuid not null` e índices começando por `tenant_id`.
- Valores monetários em `numeric(12,2)`; quantidades de estoque em `numeric(14,3)` na unidade do item.
- Datas/horas em `timestamptz`; datas de agenda (`target_date`) em `date` interpretadas em `America/Sao_Paulo`.
- Entidades editáveis têm `version int` para controle otimista (REQ-054).
- Nada é apagado fisicamente em documentos (REQ-044): `status` + `cancel_reason`.

### Tabelas por módulo (colunas principais)

- **Plataforma/acesso:** `tenants(id, name, cnpj, status active|suspended)`; tabelas do Better Auth (`user`, `session`, `account`, `verification`) com `user.tenant_id` (nulo só para `admin_plataforma`), `user.roles text[]`, `user.active`; `audit_log(id, tenant_id null, actor_id, entity, entity_id, action, before jsonb, after jsonb, at)`.
- **Configuração:** `company_settings(tenant_id pk, razao_social, cnpj, endereco, telefone, logo_file_id, rt_nome, rt_registro, ciatox_telefone, alert_days_contract, alert_days_lot)`; `company_licenses(id, tenant_id, tipo sanitaria|ambiental, numero, validade)`; `doc_sequences(tenant_id, doc_type, year, last_value, pk(tenant_id, doc_type, year))`.
- **Clientes:** `clients(id, tenant_id, kind pf|pj, name, trade_name, document, active, anonymized_at)` com índice único parcial `(tenant_id, document) where active`; `client_contacts`; `sites(id, tenant_id, client_id, endereço…, property_type, access_notes, contact_name, contact_phone)`; `areas(id, tenant_id, site_id, name, field_created_by, field_created_os_id)`; `floor_plans(id, tenant_id, site_id, name, file_id, image_width, image_height, revision, active)`.
- **Catálogo:** `pests`; `services(…, warranty_days, reference_price, active)`; `service_pests`; `products(id, tenant_id, kind chemical|material, name, manufacturer, active_ingredient, chemical_group, concentration, registration_number, antidote, unit, min_stock, active)` com `check` exigindo campos regulatórios quando `kind = chemical`; `device_types(id, tenant_id, name, unit_controlled bool)`.
- **Estoque:** `stock_locations(id, tenant_id, kind warehouse|vehicle, plate, description, responsible_user_id, active)` com índice único parcial "um veículo ativo por técnico" (REQ-056, AC-044) e "um almoxarifado por tenant"; `lots(id, tenant_id, product_id, code, expires_at)`; `stock_movements(id, tenant_id, type entrada|transferencia|saida_os|ajuste|perda, product_id, lot_id, location_id, qty_signed, transfer_id, work_order_id, reason, user_id, at)` — **somente INSERT** (sem grant de UPDATE/DELETE para o papel da aplicação, AC-027); `stock_balances(tenant_id, location_id, product_id, lot_id, qty)` atualizado na mesma transação de cada movimentação (saldo pode ser negativo, BR-07).
- **Propostas:** `proposals(id, tenant_id, number, client_id, current_version)`; `proposal_versions(id, tenant_id, proposal_id, version, status, valid_until, conditions, notes, subtotal, discount, total, refusal_reason, sent_at, decided_at)`; `proposal_version_sites`; `proposal_items(id, version_id, service_id, site_id, quantity, recurrence jsonb, unit_price, discount)`. Versão `enviada` ou posterior é imutável.
- **Contratos:** `contract_templates(id, tenant_id, name, body, revision)`; `contracts(id, tenant_id, number, status, client_id, proposal_id, amendment_of_id, renewal_of_id, start_date, end_date, total_value, payment_terms, clauses_rendered, template_revision)`; `contract_sites`; `contract_services(id, contract_id, service_id, site_id, recurrence jsonb, calls_limit)`.
- **OS:** `work_orders(id, tenant_id, number, status, client_id, site_id, contract_id, contract_service_id, proposal_id, warranty_of_id, target_date, scheduled_at, primary_tech_id, vehicle_location_id, instructions, started_at, finished_at, no_product_reason, signer_name, signature_file_id, signature_absence_reason, version)`; `work_order_services`, `work_order_techs`, `work_order_areas`, `work_order_reschedules(old_at, new_at, reason, user_id)`, `work_order_findings(pest_id, area_id, infestation_level)`, `work_order_applications(product_id, lot_id, area_id, qty, dilution)`, `work_order_photos(file_id)`.
- **Dispositivos:** `devices(id, tenant_id, code, device_type_id, status, stock_location_id, site_id, area_id, floor_plan_id, pos_x, pos_y, installed_at, installed_os_id)` com `unique(tenant_id, code)` e `check` de coerência status × colunas (instalado ⇒ site/área preenchidos; em_estoque ⇒ local de estoque); `device_events(id, tenant_id, device_id, type install|move|replace|remove|inspect|lost_confirmed|damaged, work_order_id, payload jsonb, user_id, at)` — histórico imutável; posições anteriores de planta ficam no `payload` (AC-042).
- **Arquivos e documentos:** `files(id, tenant_id, storage_key, mime, size, sha256, kind photo|signature|floor_plan|logo|pdf, locked, created_by)`; `generated_documents(id, tenant_id, doc_type, entity_id, entity_version, number, file_id, generated_at)`.

### Fluxos principais

1. **Requisição autenticada:** `action()/handler()` → `getSession()` → monta `RequestContext` (rejeita usuário inativo ou empresa suspensa, REQ-003/063) → `authorize(ctx, ação, recurso)` (BR-01) → `service` → `withTenant(ctx.tenantId, tx => …)` abre transação e executa `select set_config('app.tenant_id', $1, true)` → consultas sob RLS → auditoria gravada na mesma transação (REQ-004) → DTO serializado por perfil.
2. **Numeração (REQ-043):** dentro da transação do documento, `insert … on conflict do update set last_value = last_value + 1 returning last_value` em `doc_sequences`. Rollback não consome número; número confirmado nunca volta.
3. **Ativação de contrato (REQ-022, REQ-058):** `expandRecurrence(rule, start, end)` (função pura) gera as datas; a prévia usa a mesma função; a ativação cria todas as OS `prevista` na mesma transação (máx. ~365 por serviço/ano, viável de forma síncrona). Suspensão/cancelamento cancela as `prevista` futuras e avisa sobre as `agendada` (Edge Cases).
4. **Execução da OS (REQ-028..030, 048):** cada etapa (início, áreas/achados, aplicações, dispositivos, fotos, assinatura) é uma gravação independente. A conclusão valida REQ-029 no servidor e, numa única transação: muda o status, insere `saida_os` por aplicação no local de estoque da OS (REQ-030), marca anexos como `locked`, gera auditoria e enfileira o PDF do comprovante.
5. **Transferência (REQ-057):** uma transação insere as duas movimentações com o mesmo `transfer_id` e atualiza os dois saldos (atomicidade, AC-043).
6. **PDF:** job `pdf.render` no worker → monta HTML a partir do template + dados congelados → Chromium (JS desabilitado, rede bloqueada exceto `data:`) → envia ao S3 → `generated_documents`. Comprovante é gerado uma única vez e imutável; propostas e contratos são gerados por versão.
7. **Planta (REQ-055):** upload de PNG/JPG (validado por assinatura de bytes) ou PDF de 1 página convertido para PNG no worker (`pdftoppm`); marcações com coordenadas normalizadas (0–1), independentes da resolução; trocar a imagem cria nova `revision` e zera as posições (os dispositivos ficam "sem posição" até reposicionar).
8. **Expiração de propostas (REQ-018):** job diário 00:05 (America/Sao_Paulo) marca `expirada`; a aprovação também checa a validade (BR-02), então a regra não depende do job.

## Contracts (API / interfaces)

- **Sem API pública no MVP.** Mutações da UI por Server Actions; arquivos, PDFs e `/api/health` por route handlers. Ambos passam obrigatoriamente pelos wrappers `action()`/`handler()` (sem eles, o lint customizado falha — ver `Security and integrity criteria`).
- **Resultado padronizado:** `{ ok: true, data } | { ok: false, code, message, fields? }` com `code ∈ UNAUTHENTICATED (401) | FORBIDDEN (403) | NOT_FOUND (404) | CONFLICT (409) | VALIDATION (422)`. Recurso de outra empresa responde `NOT_FOUND` (não revela existência, AC-037).
- **Entrada:** todo payload validado por schema Zod do módulo; os mesmos schemas alimentam os formulários.
- **Arquivos:** upload `POST /api/files` (multipart, limite 15 MB, MIME validado por bytes); download `GET /api/files/:id` verifica tenant/perfil e redireciona para URL pré-assinada de 5 minutos. Chaves no bucket: `t/<tenant_id>/<kind>/<uuid>`.
- **Templates de contrato:** variáveis `{{cliente.nome}}`, `{{contrato.vigencia}}`… com motor sem lógica (Mustache); HTML do gestor sanitizado (sem `<script>`, eventos `on*`, URLs externas).
- **Recorrência (REQ-058):** `recurrence = { kind: "interval", every: n, unit: "day"|"week"|"month"|"year", weekday?, monthday?, first_date } | { kind: "fixed_count", count } | { kind: "on_demand", calls_limit? }`.

## Security and privacy

- **Isolamento (REQ-061):** RLS `ENABLE` + `FORCE` em toda tabela com `tenant_id`, política `tenant_id = current_setting('app.tenant_id')::uuid`. Papéis PostgreSQL: `orbi_owner` (dono das tabelas, só migrações), `orbi_app` (aplicação, sem `BYPASSRLS`), `orbi_platform` (somente `tenants`, criação do primeiro gestor e `audit_log` da plataforma), `orbi_auth` (só `src/server/auth`: lê usuários e sessões de todas as empresas, pois login e validação de sessão acontecem antes de se saber a empresa; `orbi_app` só lê usuários da própria empresa e não acessa sessões nem hashes de senha). Sem `app.tenant_id` definido, as consultas retornam zero linhas.
  Changed 2026-11-05 (T008): acrescentado o papel `orbi_auth` — `CTX-DEC-20261105-auth-db-role`.
- **Autenticação (REQ-001, 049):** Better Auth com e-mail/senha; hash scrypt (adaptativo, padrão da biblioteca); cookies `Secure`, `HttpOnly`, `SameSite=Lax`; expiração por inatividade configurável (`SESSION_IDLE_TIMEOUT_MINUTES`, padrão 8 h — `CTX-DEC-20261105-auth-db-role`); rate limit de login (5 tentativas/min por IP, contadores no banco). E-mail de login é único na plataforma (consequência de A-11).
- **Autorização (BR-01):** matriz declarativa em `server/authz/policy.ts`, única fonte para servidor e UI; a UI só esconde, quem bloqueia é o servidor. Valores monetários removidos no serializador para `tecnico` (AC-031). Técnico só acessa OS/clientes das OS atribuídas a ele.
- **admin_plataforma (REQ-062):** criado só por CLI (`scripts/create-platform-admin.ts`), nunca por seed com senha padrão; sem acesso a dados operacionais (usa `orbi_platform`).
- **Arquivos:** bucket privado; URL pré-assinada curta; anexos `locked` não podem ser substituídos (REQ-052); validação de tipo/tamanho; nomes nunca derivados do usuário.
- **PDF/Chromium:** sem execução de JS, sem acesso à rede (previne SSRF a partir de templates editados pelo gestor), processo no worker com limite de memória.
- **Web:** HTTPS só via Caddy com HSTS; CSP restritiva; proteção CSRF/origem das Server Actions; cabeçalhos de segurança.
- **LGPD (REQ-050, 060):** PII só nos perfis da BR-01; logs com redação de CPF/CNPJ/telefone/e-mail (pino `redact`); exportação JSON por titular; anonimização substitui PII em `clients`, `client_contacts`, `sites` e nome do assinante, mas mantém OS, aplicações e PDFs já emitidos por ≥ 5 anos (os PDFs congelam o conteúdo exigido).
- **Segredos:** apenas variáveis de ambiente (`DATABASE_URL`, `DATABASE_URL_OWNER`, `DATABASE_URL_PLATFORM`, `DATABASE_URL_AUTH`, `DATABASE_URL_ADMIN` só para bootstrap/testes, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `BACKUP_S3_BUCKET`, `SENTRY_DSN`). `.env.example` só com nomes; `.env*` no `.gitignore`.
- **Dependências:** `pnpm audit` no CI e atualização automática (Dependabot).

## Compatibility and migrations

- Sistema novo: não há dados nem clientes a migrar.
- Migrações Drizzle versionadas em `drizzle/`; SQL de RLS, grants e `check` em migrações manuais revisadas.
- Antes do primeiro cliente real, o schema pode mudar livremente. Depois do go-live valem as regras de `Compatibility strategy`.

## Testing strategy

| Camada | Ferramenta | Cobre |
|---|---|---|
| Unidade | Vitest | `expandRecurrence` (AC-012, AC-040, dia 31), CPF/CNPJ (AC-005), matriz BR-01 e serializadores (AC-002, AC-031), regras de conclusão (AC-018, AC-019), formatadores pt-BR (AC-033), numeração |
| Integração | Vitest + PostgreSQL real (compose de teste), papel `orbi_app` | **Suíte de isolamento**: percorre `information_schema` e falha se alguma tabela com `tenant_id` não tiver RLS forçado; para cada entidade cria dados em A e B e confirma que A não lê/edita B nem por ID (AC-037, AC-039). Também: tenants (AC-038), usuários (AC-003), auditoria (AC-004), concorrência (AC-036), propostas (AC-008..011, AC-029), contratos (AC-012..015, AC-040), estoque (AC-020, AC-026, AC-027, AC-043, AC-044), dispositivos (AC-022..025, AC-042), LGPD e retenção (AC-032, AC-046) |
| PDF | Vitest + extração de texto do PDF gerado | AC-008, AC-014, AC-021, AC-024 (campos presentes, nenhuma `{{variável}}` sobrando) |
| E2E | Playwright (Chromium; projeto mobile 360×740) | AC-001, AC-016, AC-017, AC-030, AC-034, AC-041, fluxo completo do cenário 4 da spec, painel (AC-015, AC-028) |
| Carga | k6 + `scripts/seed-load.ts` (100 empresas, uma com 200 usuários e 120.000 OS) | AC-045 |
| Manual documentado | Procedimento em `docker/backup/RESTORE.md` | AC-035 |

CI (GitHub Actions) em todo PR: lint, typecheck, unidade, integração (serviço PostgreSQL), E2E. Carga e restauração rodam antes do go-live e a cada mudança relevante de infraestrutura. Evidências vão para `verification.md`.

## Deployment and observability

- **Ambientes:** `dev` (local, `compose.dev.yml`: PostgreSQL + MinIO), `homologacao` e `producao` na VPS como projetos Compose separados (banco, bucket e segredos distintos). Homologação recebe todo deploy antes da produção e é onde se testa a restauração.
- **Imagens:** `app` (Next.js `standalone`) e `worker` (mesmo código + Chromium + poppler), tag imutável por commit (`ghcr.io/…:<sha>`).
- **Compose de produção:** `caddy` → `app`; `worker`; `postgres` (volume persistente, sem porta exposta); `migrate` (one-off, roda antes do `app` com `orbi_owner`); `backup` (cron).
- **Backup (REQ-053):** `pg_dump` diário compactado + `rclone sync` dos anexos para um bucket separado; retenção de 30 diários e 12 mensais; restauração testada em homologação antes do go-live e trimestralmente.
- **VPS inicial:** 4 vCPU / 8 GB RAM / 160 GB SSD (rever após o teste de carga); atualizações de segurança automáticas (`unattended-upgrades`); firewall só com 22/80/443; SSH por chave.
- **Observabilidade:** logs JSON (pino) com rotação do Docker; `/api/health` (app + banco + fila); monitor externo de disponibilidade; Sentry opcional via `SENTRY_DSN`; alerta de disco e de falha de backup.

## Trade-offs

| Escolha | Ganho | Custo aceito |
|---|---|---|
| Uma spec em fases (vs. spec por módulo) | Um modelo de dados coerente, menos documentos | `tasks.md` grande; mitigado por agrupamento por fase |
| Schema compartilhado + RLS (vs. schema/banco por empresa) | Uma migração para todos, simples de operar | Toda conexão precisa definir o tenant; erro de configuração é crítico → suíte de isolamento obrigatória |
| Geração síncrona das OS na ativação | Prévia = resultado (AC-040), atomicidade | Ativação de contratos muito longos mais lenta (aceitável: centenas de linhas) |
| Saldos materializados + razão imutável | Leitura rápida do saldo (REQ-059) | Duas gravações por movimentação, sempre na mesma transação |
| Upload passando pela aplicação | Checagem de tenant centralizada | Mais carga no `app`; fotos redimensionadas no celular antes do envio (≤ 1920 px) |
| Chromium para PDF | Fidelidade aos modelos (OQ-06) | Memória do worker; fila com concorrência 2 |
| VPS única | Custo baixo, controle total | Ponto único de falha; depende do backup externo |

## Risks and dependencies

- **Dependências externas a contratar:** VPS, domínio/DNS, bucket S3 (anexos) e bucket de backup, conta GitHub (CI e registry), Sentry (opcional).
- **Dependências do usuário:** modelos de proposta/contrato (OQ-06); validação do comprovante por responsável técnico (A-04); confirmação de capacidade (A-10).
- Riscos detalhados em `Risk analysis`.

## Durable decisions

- `CTX-DEC-20261105-tech-stack` — stack e isolamento por `tenant_id` + RLS (já registrado e em `context_refs`).
- `CTX-DEC-20261105-auth-db-role` — papel `orbi_auth` para login/sessão e inatividade padrão de 8 h (decidido na T008, em `context_refs`).
- Decisões deste plano que são locais à SPEC-0001 (não viram `DEC`): entrega em fases F0–F7, saldos materializados, geração síncrona de OS, upload via aplicação.

## Risk analysis

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Vazamento de dados entre empresas | Média | Crítico | RLS forçado + papel sem `BYPASSRLS` + suíte de isolamento automática que cobre toda tabela nova + 404 para IDs de outra empresa |
| Endpoint sem autorização | Média | Alto | Wrappers obrigatórios `action()/handler()`, regra de lint que proíbe Server Action/route handler fora deles, testes 403 por perfil |
| Conteúdo regulatório do comprovante incorreto | Média | Alto | A-04 validado por RT antes de F5 em produção; campos configuráveis |
| Perda de dados (disco/VPS) | Baixa | Crítico | Backup diário externo, retenção, restauração testada |
| Divergência de estoque por falha parcial | Baixa | Médio | Movimentação + saldo na mesma transação; razão imutável permite recalcular saldos |
| Escopo grande para uma pessoa | Alta | Médio | Fases entregáveis; cada fase em produção (homologação) antes da próxima; corte de escopo explícito via §8 do SDD |
| Desempenho com 120k OS/empresa | Média | Médio | Índices por `tenant_id`, paginação, teste k6 em F7 antes do go-live |
| Template de contrato malicioso (SSRF/XSS) | Baixa | Alto | Mustache sem lógica, sanitização, Chromium sem rede/JS |
| Better Auth com mudança incompatível | Baixa | Médio | Versão fixada; acesso isolado em `server/auth/` |

## Compatibility strategy

- **Até o go-live:** schema livre; dados de homologação descartáveis.
- **Após o go-live:** migrações *expand → migrate → contract*: cada release é compatível com o schema da release anterior; remoção de colunas/tabelas só numa release posterior, depois de confirmar que nada as usa.
- Campos `recurrence` (jsonb) e perfis (`text[]`) permitem acrescentar tipos sem migração destrutiva. OQ-10 (planos/cobrança) e OQ-11 (login em várias empresas) entram como tabelas novas (`subscriptions`, `memberships`) sem alterar as existentes de forma incompatível.

## Rollback / recovery plan

1. **Antes de cada deploy em produção:** `pg_dump` sob demanda + registro da tag em execução.
2. **Falha da aplicação sem migração:** reimplantar a tag anterior (`docker compose up -d` com a tag antiga) — minutos.
3. **Falha com migração expand (aditiva):** reimplantar a tag anterior; a migração aditiva permanece (compatível).
4. **Migração contract ou corrupção de dados:** restaurar o dump pré-deploy em homologação, validar, e só então restaurar em produção (**exige aprovação humana**); perda máxima: dados desde o dump.
5. **Perda da VPS:** nova VPS → `compose.prod.yml` → restaurar último backup e anexos do bucket → apontar DNS. Procedimento em `docker/backup/RESTORE.md`, ensaiado em homologação (AC-035).

## Security and integrity criteria

Critérios de saída para colocar dados reais em produção (além dos ACs):

- Suíte de isolamento entre empresas e testes de autorização por perfil: 100% verdes.
- Nenhuma tabela com `tenant_id` sem RLS forçado (teste automático).
- Nenhum Server Action/route handler fora dos wrappers (lint).
- `pnpm audit` sem vulnerabilidades altas/críticas sem justificativa registrada.
- Nenhum segredo no repositório (`sdd_check`, `context_check` e varredura no CI).
- Restauração de backup ensaiada com sucesso (AC-035) e teste de carga aprovado (AC-045).
- HTTPS com HSTS e cabeçalhos de segurança verificados.
- A-04 validado por responsável técnico.

## Actions requiring human approval

- Contratar/provisionar VPS, domínio, buckets e serviços pagos; criar contas e chaves de acesso (o usuário cria e configura os segredos; o agente nunca os vê nem grava).
- Primeiro deploy em produção e cada deploy em produção que contenha migração *contract* (destrutiva).
- Qualquer restauração de backup em produção ou comando destrutivo no banco de produção.
- Criação do primeiro `admin_plataforma` e cadastro da primeira empresa real.
- Rotação de segredos e alteração de DNS.
- Liberação de dados reais de clientes (go-live) após os critérios acima.
- Commits e pushes (política do repositório).
