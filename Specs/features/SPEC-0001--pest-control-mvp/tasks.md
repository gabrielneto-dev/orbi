---
id: SPEC-0001
title: Plataforma SaaS de gestão para empresas de controle de pragas (MVP) — tarefas
updated_at: 2026-11-05
---

# Tasks: Plataforma SaaS de gestão para empresas de controle de pragas (MVP)

<!--
Formato lido por sdd_check.py. Status: pending | ready | in_progress | blocked | completed | cancelled
[x] somente com Status: completed e Evidence preenchida.
Fases conforme plan.md (F0–F7). Cada fase fecha com uma tarefa de testes que atualiza verification.md.
Tarefas marcadas [HUMANO] exigem ação ou aprovação do usuário (plan.md › Actions requiring human approval).
-->

Legenda: tarefas sem requisito (`Requirements: none`) são de suporte; o motivo está em `Done when`.

## F0 — Fundação

- [x] SPEC-0001-T001 — Criar o projeto Next.js (App Router) com TypeScript estrito, pnpm, Node 24 LTS, Tailwind e shadcn/ui, na estrutura de pastas do plan.md
  Status: completed
  Requirements: none
  Depends on: none
  Done when: suporte (base de todo o código) — `pnpm install`, `pnpm build` e `pnpm dev` funcionam e a página inicial abre; pastas `src/app`, `src/server`, `src/lib`, `tests/` existem
  Evidence: 2026-11-05 — Node 24.22.1 (winget) + pnpm 12.16.1; scaffold `create-next-app@16.4.5` (Next 16.4.5, React 19.3.0, Tailwind 4.3.4, TypeScript 5.9.3 com `strict` + `noUncheckedIndexedAccess`), `shadcn@4.23.0 init --base radix` + `button`. `pnpm install` OK; `pnpm build` exit 0 (TypeScript OK, `/` estático); `pnpm dev` → `GET / 200`, página "orbi" com Button shadcn conferida no navegador. Pastas `src/{app,server,lib,components}` e `tests/{unit,integration,e2e,load}` criadas. Notas: `cacheComponents` e `partialPrefetching` vêm ligados no template do Next 16.4 (mantidos); shadcn usa o pacote `cn` (oficial do shadcn) no lugar de clsx + tailwind-merge; `.gitignore` já ignora `.env*` (exceto `.env.example`), adiantando parte da T003. Sem teste automatizado (ferramentas chegam na T002).

- [x] SPEC-0001-T002 — Configurar ESLint, Prettier, typecheck, Vitest e Playwright com scripts `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, e registrar os comandos em `AGENTS.md`
  Status: completed
  Requirements: none
  Depends on: SPEC-0001-T001
  Done when: suporte (ferramentas de verificação) — os cinco scripts rodam com um teste de exemplo cada; `AGENTS.md` lista os comandos
  Evidence: 2026-11-05 — `pnpm lint` (ESLint 10.14 + eslint-config-next 16.4.5 + eslint-config-prettier, `--max-warnings=0`) exit 0; `pnpm format:check` (Prettier 3.9 + plugin Tailwind) exit 0; `pnpm typecheck` (`next typegen && tsc --noEmit`) exit 0; `pnpm test` (Vitest 5.1, projeto `unit`) 2/2 em `tests/unit/utils.test.ts`; `pnpm test:integration` (projeto `integration`) 1/1 em `tests/integration/home-page.test.tsx`; `pnpm test:e2e` (Playwright 1.64, projetos `desktop` e `mobile-360`) 4/4 com `next dev` e 4/4 com `CI=1` (build de produção). Lint conferido com arquivo temporário de violações (hooks, `any`, `<img>`, `key`, `<a>`): 8 problemas detectados. `AGENTS.md` › "Commands" lista os comandos. Notas: ESLint 10 escolhido porque o 9 está descontinuado; os plugins react/jsx-a11y/import declaram peer `eslint ≤ 9` (aviso do pnpm), mas as regras rodam — voltar para `eslint@^9` se algo quebrar. `agentRules: false` no `next.config.ts` impede o `next dev` de reescrever o `AGENTS.md`. Prettier com `endOfLine: auto` (git `core.autocrlf=true` no Windows). Integração ainda sem PostgreSQL (entra na T005/T006).

- [ ] SPEC-0001-T003 — Criar `docker/compose.dev.yml` (PostgreSQL 17, MinIO), `.env.example` só com nomes de variáveis e entradas `.env*` no `.gitignore`
  Status: ready
  Requirements: none
  Depends on: SPEC-0001-T001
  Done when: suporte (ambiente local) — `docker compose -f docker/compose.dev.yml up` sobe banco e MinIO; nenhum valor de segredo versionado
  Evidence:

- [ ] SPEC-0001-T004 — Criar CI no GitHub Actions: lint, typecheck, unidade, integração (serviço PostgreSQL), E2E e `pnpm audit`
  Status: pending
  Requirements: none
  Depends on: SPEC-0001-T002, SPEC-0001-T003
  Done when: suporte (verificação contínua) — um PR de teste executa todos os jobs com sucesso
  Evidence:

- [ ] SPEC-0001-T005 — Configurar Drizzle, migrações e os papéis PostgreSQL `orbi_owner`, `orbi_app` (sem BYPASSRLS) e `orbi_platform`, com script `db:migrate`
  Status: pending
  Requirements: REQ-061
  Depends on: SPEC-0001-T003
  Done when: migração inicial aplica num banco vazio; `orbi_app` não é dono de tabelas nem tem BYPASSRLS (verificado por consulta em teste)
  Evidence:

- [ ] SPEC-0001-T006 — Criar tabela `tenants`, helper `withTenant()` (`set_config('app.tenant_id', …, true)`), política RLS padrão e teste que falha se alguma tabela com `tenant_id` não tiver RLS habilitado e forçado
  Status: pending
  Requirements: REQ-061, REQ-064
  Depends on: SPEC-0001-T005
  Done when: teste de integração cria dados em duas empresas numa tabela de exemplo e prova que cada uma só vê os seus; sem tenant definido, zero linhas; o teste de varredura passa
  Evidence:

- [ ] SPEC-0001-T007 — Implementar `src/lib`: formatação pt-BR (DD/MM/AAAA, R$, vírgula decimal), fuso America/Sao_Paulo e validação de CPF/CNPJ
  Status: ready
  Requirements: REQ-051, REQ-005
  Depends on: SPEC-0001-T002
  Done when: testes unitários cobrem formatos, virada de dia no fuso e CPF/CNPJ válidos/inválidos
  Evidence:

- [ ] SPEC-0001-T008 — Integrar Better Auth em `src/server/auth` (e-mail/senha, scrypt, cookies seguros, expiração por inatividade, rate limit de login) com `user.tenant_id`, `user.roles` e `user.active`
  Status: pending
  Requirements: REQ-001, REQ-049
  Depends on: SPEC-0001-T005
  Done when: login/logout funcionam; senha só armazenada como hash; sessão expira após o tempo configurado (teste); só `src/server/auth` importa a biblioteca
  Evidence:

- [ ] SPEC-0001-T009 — Implementar `RequestContext` e os wrappers `action()`/`handler()`: sessão, bloqueio de usuário inativo e empresa suspensa, `withTenant`, e o resultado padronizado (401/403/404/409/422)
  Status: pending
  Requirements: REQ-001, REQ-003, REQ-049, REQ-063
  Depends on: SPEC-0001-T006, SPEC-0001-T008
  Done when: testes de integração: sem sessão → 401; usuário inativo → negado; empresa suspensa → negado; erro de validação → 422
  Evidence:

- [ ] SPEC-0001-T010 — Criar regra de lint que proíbe Server Action ou route handler fora de `action()`/`handler()`
  Status: pending
  Requirements: REQ-049
  Depends on: SPEC-0001-T009
  Done when: lint falha num arquivo de exemplo sem wrapper e passa com wrapper; regra ativa no CI
  Evidence:

- [ ] SPEC-0001-T011 — Implementar a matriz BR-01 em `src/server/authz/policy.ts` e serializadores por perfil (valores monetários removidos para `tecnico`)
  Status: pending
  Requirements: REQ-002
  Depends on: SPEC-0001-T009
  Done when: testes unitários percorrem cada linha da BR-01 para cada perfil; serializador do técnico não contém campos monetários
  Evidence:

- [ ] SPEC-0001-T012 — Criar `audit_log` e helper que grava auditoria (antes/depois) na mesma transação da alteração, com consulta por entidade
  Status: pending
  Requirements: REQ-004
  Depends on: SPEC-0001-T006
  Done when: teste mostra que rollback da alteração também desfaz a auditoria e que a consulta por entidade retorna usuário, data e valores
  Evidence:

- [ ] SPEC-0001-T013 — Implementar controle otimista de concorrência (`version` + atualização condicional → 409) e o aviso de conflito na UI
  Status: pending
  Requirements: REQ-054
  Depends on: SPEC-0001-T009
  Done when: teste de integração com duas gravações concorrentes da mesma versão: a segunda recebe CONFLICT e nada é sobrescrito
  Evidence:

- [ ] SPEC-0001-T014 — Implementar armazenamento S3: `POST /api/files` (tipo por assinatura de bytes, limite 15 MB), `GET /api/files/:id` com URL pré-assinada de 5 min, chaves `t/<tenant_id>/…` e `files.locked`
  Status: pending
  Requirements: REQ-052, REQ-061
  Depends on: SPEC-0001-T009
  Done when: testes: upload válido grava no MinIO; arquivo de outra empresa → 404; tipo falso recusado; arquivo `locked` não pode ser substituído
  Evidence:

- [ ] SPEC-0001-T015 — Implementar o módulo plataforma: CLI `create-platform-admin`, telas do `admin_plataforma` para criar/suspender/reativar empresas e criar o primeiro gestor, com papel `orbi_platform` e auditoria da plataforma
  Status: pending
  Requirements: REQ-062, REQ-063
  Depends on: SPEC-0001-T011, SPEC-0001-T012
  Done when: admin cria empresa + gestor, suspende e reativa; admin não consegue ler dados operacionais (teste com `orbi_platform`); nenhuma senha padrão em seed
  Evidence:

- [ ] SPEC-0001-T016 — Implementar a gestão de usuários pelo gestor: criar, editar, desativar, reativar e atribuir perfis
  Status: pending
  Requirements: REQ-002, REQ-003
  Depends on: SPEC-0001-T011, SPEC-0001-T012
  Done when: gestor gerencia usuários da própria empresa; perfis não-gestor recebem 403; desativação preserva o histórico
  Evidence:

- [ ] SPEC-0001-T017 — Criar tela de login, shell do escritório (desktop) e shell de campo (mobile-first) com redirecionamentos por perfil
  Status: pending
  Requirements: REQ-001, REQ-048
  Depends on: SPEC-0001-T009
  Done when: visitante é redirecionado ao login; técnico cai no shell de campo; shell de campo sem rolagem horizontal em 360 px (Playwright)
  Evidence:

- [ ] SPEC-0001-T018 — Testes de fechamento da F0 e registro em `verification.md`
  Status: pending
  Requirements: REQ-001, REQ-002, REQ-003, REQ-004, REQ-051, REQ-054, REQ-061, REQ-062, REQ-063, REQ-064
  Depends on: SPEC-0001-T010, SPEC-0001-T013, SPEC-0001-T014, SPEC-0001-T015, SPEC-0001-T016, SPEC-0001-T017
  Done when: AC-001, AC-003, AC-004, AC-033, AC-036, AC-038 verdes no CI; AC-002 e AC-037/039 verdes para as entidades existentes; linhas V correspondentes atualizadas
  Evidence:

## F1 — Cadastros

- [ ] SPEC-0001-T019 — Implementar configurações da empresa: dados cadastrais, logotipo, licenças sanitária/ambiental com validade, responsável técnico, telefone do CIATox e prazos de alerta
  Status: pending
  Requirements: REQ-045
  Depends on: SPEC-0001-T014, SPEC-0001-T016
  Done when: gestor edita e os dados ficam disponíveis por serviço para os PDFs; outros perfis só leem conforme BR-01
  Evidence:

- [ ] SPEC-0001-T020 — Implementar clientes PF/PJ com contatos, validação de CPF/CNPJ e unicidade por empresa entre clientes ativos
  Status: pending
  Requirements: REQ-005, REQ-064
  Depends on: SPEC-0001-T007, SPEC-0001-T012, SPEC-0001-T013
  Done when: CRUD com auditoria; documento duplicado na mesma empresa recusado; o mesmo documento em outra empresa aceito
  Evidence:

- [ ] SPEC-0001-T021 — Implementar locais de atendimento do cliente (endereço, tipo de imóvel, acesso, contato no local)
  Status: pending
  Requirements: REQ-006
  Depends on: SPEC-0001-T020
  Done when: cliente com vários locais criado e editado pela UI e pelo serviço, com auditoria
  Evidence:

- [ ] SPEC-0001-T022 — Implementar áreas por local, incluindo os campos de criação em campo (`field_created_by`, `field_created_os_id`) no serviço
  Status: pending
  Requirements: REQ-007
  Depends on: SPEC-0001-T021
  Done when: áreas criadas pelo escritório; serviço aceita criação "em campo" com usuário e OS (UI de campo em T064)
  Evidence:

- [ ] SPEC-0001-T023 — Implementar pragas-alvo e tipos de dispositivo, com a lista padrão copiada na criação da empresa (A-12)
  Status: pending
  Requirements: REQ-010, REQ-013
  Depends on: SPEC-0001-T015
  Done when: nova empresa nasce com a lista padrão editável; alterar a lista de uma empresa não afeta outra
  Evidence:

- [ ] SPEC-0001-T024 — Implementar o catálogo de serviços (descrição, pragas-alvo, duração, preço de referência, garantia em dias, ativo/inativo)
  Status: pending
  Requirements: REQ-009
  Depends on: SPEC-0001-T023
  Done when: CRUD pelo gestor; serviços inativos não aparecem nas listas de seleção
  Evidence:

- [ ] SPEC-0001-T025 — Implementar produtos químicos (campos regulatórios obrigatórios por `check`) e materiais, com unidade e estoque mínimo
  Status: pending
  Requirements: REQ-011, REQ-012
  Depends on: SPEC-0001-T023
  Done when: químico sem registro ou princípio ativo recusado no serviço e no banco; produtos inativos não aparecem para seleção
  Evidence:

- [ ] SPEC-0001-T026 — Criar o componente de lista paginada com busca (pg_trgm) e filtros e aplicá-lo a clientes
  Status: pending
  Requirements: REQ-047
  Depends on: SPEC-0001-T020
  Done when: busca por nome/documento e filtro por status em clientes, com índices iniciados por `tenant_id`
  Evidence:

- [ ] SPEC-0001-T027 — Testes de fechamento da F1 e registro em `verification.md`
  Status: pending
  Requirements: REQ-005, REQ-007, REQ-009, REQ-011, REQ-012, REQ-013, REQ-045, REQ-064
  Depends on: SPEC-0001-T019, SPEC-0001-T021, SPEC-0001-T022, SPEC-0001-T024, SPEC-0001-T025, SPEC-0001-T026
  Done when: AC-005 e AC-007 verdes; suíte de isolamento cobre as tabelas novas (AC-037/039 parcial); linhas V atualizadas
  Evidence:

## F2 — Estoque

- [ ] SPEC-0001-T028 — Implementar locais de estoque: almoxarifado criado com a empresa, CRUD de veículos, um veículo ativo por técnico e bloqueio de inativar veículo com saldo
  Status: pending
  Requirements: REQ-056
  Depends on: SPEC-0001-T016
  Done when: índice único parcial impede dois veículos ativos para o mesmo técnico; inativação com saldo recusada
  Evidence:

- [ ] SPEC-0001-T029 — Implementar o razão `stock_movements` somente-INSERT e os saldos materializados `stock_balances` atualizados na mesma transação, com script que recalcula saldos a partir do razão
  Status: pending
  Requirements: REQ-038, REQ-039
  Depends on: SPEC-0001-T028
  Done when: `orbi_app` não tem UPDATE/DELETE no razão (teste); saldo recalculado bate com o materializado; saldo negativo permitido
  Evidence:

- [ ] SPEC-0001-T030 — Implementar lotes e entrada de estoque (lote, validade, nota/fornecedor opcional, local de destino)
  Status: pending
  Requirements: REQ-038, REQ-039
  Depends on: SPEC-0001-T025, SPEC-0001-T029
  Done when: entrada cria lote quando necessário e atualiza o saldo do local escolhido
  Evidence:

- [ ] SPEC-0001-T031 — Implementar transferência atômica de itens com lote entre almoxarifado e veículos
  Status: pending
  Requirements: REQ-057
  Depends on: SPEC-0001-T030
  Done when: as duas pontas compartilham `transfer_id`; falha simulada no meio não altera nenhum saldo
  Evidence:

- [ ] SPEC-0001-T032 — Implementar ajuste de inventário e perda/descarte com motivo (somente gestor)
  Status: pending
  Requirements: REQ-039
  Depends on: SPEC-0001-T029
  Done when: movimentação com motivo e usuário; outros perfis recebem 403
  Evidence:

- [ ] SPEC-0001-T033 — Implementar extrato por item filtrável por local e as telas de saldo consolidado e por local
  Status: pending
  Requirements: REQ-038, REQ-042
  Depends on: SPEC-0001-T030
  Done when: extrato mostra data, tipo, quantidade, lote, origem/destino, usuário e OS; consolidado = soma dos locais
  Evidence:

- [ ] SPEC-0001-T034 — Implementar o serviço de alertas de estoque (mínimo consolidado, lotes vencendo em N dias, saldos negativos)
  Status: pending
  Requirements: REQ-041
  Depends on: SPEC-0001-T033, SPEC-0001-T019
  Done when: testes com dados de cada tipo de alerta retornam exatamente os itens esperados
  Evidence:

- [ ] SPEC-0001-T035 — Implementar o serviço de seleção de lotes aplicáveis (exclui lote vencido e produto inativo; filtra pelo local de estoque)
  Status: pending
  Requirements: REQ-040
  Depends on: SPEC-0001-T030
  Done when: lote vencido e produto inativo não retornam e são recusados se enviados diretamente
  Evidence:

- [ ] SPEC-0001-T036 — Testes de fechamento da F2 e registro em `verification.md`
  Status: pending
  Requirements: REQ-038, REQ-039, REQ-040, REQ-041, REQ-042, REQ-056, REQ-057
  Depends on: SPEC-0001-T031, SPEC-0001-T032, SPEC-0001-T034, SPEC-0001-T035
  Done when: AC-027, AC-043, AC-044 verdes; AC-026 e AC-028 verdes no nível de serviço; isolamento cobre as tabelas de estoque; linhas V atualizadas
  Evidence:

## F3 — Propostas

- [ ] SPEC-0001-T037 — Implementar numeração sequencial por empresa, tipo e ano (`doc_sequences`)
  Status: pending
  Requirements: REQ-043
  Depends on: SPEC-0001-T006
  Done when: 50 criações concorrentes geram números únicos e contínuos; rollback não consome número; empresas diferentes têm sequências independentes
  Evidence:

- [ ] SPEC-0001-T038 — Criar o processo `worker.ts` com pg-boss e a imagem do worker com Chromium e poppler
  Status: pending
  Requirements: REQ-017
  Depends on: SPEC-0001-T003, SPEC-0001-T005
  Done when: worker sobe no compose dev, processa um job de teste e reporta saúde
  Evidence:

- [ ] SPEC-0001-T039 — Implementar o motor de PDF: templates HTML, Chromium sem JS e sem rede, fila com concorrência 2, gravação no S3 e `generated_documents`
  Status: pending
  Requirements: REQ-017, REQ-049
  Depends on: SPEC-0001-T038, SPEC-0001-T014
  Done when: PDF de teste gerado e baixável; template que tenta carregar URL externa não faz requisição (teste)
  Evidence:

- [ ] SPEC-0001-T040 — Implementar proposta em rascunho: cliente, locais, itens (serviço, quantidade, periodicidade, valor, desconto), condições, validade e totais
  Status: pending
  Requirements: REQ-014
  Depends on: SPEC-0001-T021, SPEC-0001-T024, SPEC-0001-T037, SPEC-0001-T013
  Done when: comercial/gestor criam e editam; totais calculados no servidor; técnico recebe 403
  Evidence:

- [ ] SPEC-0001-T041 — Implementar o ciclo de vida da proposta: enviar, aprovar (BR-02), recusar com motivo e cancelar com motivo
  Status: pending
  Requirements: REQ-015, REQ-044
  Depends on: SPEC-0001-T040
  Done when: transições inválidas recusadas; cancelada continua consultável; auditoria registra cada transição
  Evidence:

- [ ] SPEC-0001-T042 — Implementar versionamento: editar proposta enviada cria nova versão; versões anteriores somente leitura
  Status: pending
  Requirements: REQ-016
  Depends on: SPEC-0001-T041
  Done when: versão anterior imutável (serviço e banco); mesma numeração com versão incrementada
  Evidence:

- [ ] SPEC-0001-T043 — Implementar a expiração de propostas: job diário 00:05 (America/Sao_Paulo) e checagem de validade na aprovação
  Status: pending
  Requirements: REQ-018
  Depends on: SPEC-0001-T041, SPEC-0001-T038
  Done when: proposta vencida vira `expirada` pelo job; aprovação de vencida é recusada mesmo sem o job ter rodado
  Evidence:

- [ ] SPEC-0001-T044 — Gerar o PDF da proposta com layout padrão (dados da empresa, cliente, itens, valores, condições, validade)
  Status: pending
  Requirements: REQ-017
  Depends on: SPEC-0001-T039, SPEC-0001-T042, SPEC-0001-T019
  Done when: PDF por versão com todos os campos; texto extraído confere com a tela
  Evidence:

- [ ] SPEC-0001-T045 — Ajustar o layout do PDF da proposta ao modelo da empresa
  Status: blocked
  Requirements: REQ-017
  Depends on: SPEC-0001-T044
  Done when: PDF segue o modelo enviado pelo usuário e é aprovado por ele. Bloqueio: aguardando os modelos (OQ-06)
  Evidence:

- [ ] SPEC-0001-T046 — Testes de fechamento da F3 e registro em `verification.md`
  Status: pending
  Requirements: REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-043, REQ-044
  Depends on: SPEC-0001-T043, SPEC-0001-T044
  Done when: AC-008, AC-009, AC-010, AC-029 verdes; isolamento cobre propostas; linhas V atualizadas
  Evidence:

## F4 — Contratos

- [ ] SPEC-0001-T047 — Implementar `expandRecurrence` (intervalo em dias/semanas/meses/anos, preferência de dia, número fixo, sob demanda)
  Status: pending
  Requirements: REQ-058
  Depends on: SPEC-0001-T007
  Done when: testes unitários: mensal/trimestral em 12 meses = 12 + 4 datas; a cada 15 dias; dia 31 → último dia do mês; sob demanda → nenhuma data
  Evidence:

- [ ] SPEC-0001-T048 — Implementar modelos de contrato: CRUD pelo gestor, variáveis Mustache, sanitização de HTML e revisões
  Status: pending
  Requirements: REQ-020, REQ-023
  Depends on: SPEC-0001-T019
  Done when: `<script>`, atributos `on*` e URLs externas são removidos; variável desconhecida é sinalizada ao salvar
  Evidence:

- [ ] SPEC-0001-T049 — Criar o esquema base de OS (`work_orders` com status, cliente, local, data-alvo, vínculo de contrato) usado pela ativação de contratos
  Status: pending
  Requirements: REQ-025
  Depends on: SPEC-0001-T021, SPEC-0001-T037
  Done when: migração aplicada com RLS; OS `prevista` pode ser criada pelo serviço com número sequencial
  Evidence:

- [ ] SPEC-0001-T050 — Implementar contrato em rascunho, manual ou a partir de proposta aprovada (herda cliente, locais, itens, valores), com serviços e periodicidade
  Status: pending
  Requirements: REQ-019, REQ-020
  Depends on: SPEC-0001-T041, SPEC-0001-T047, SPEC-0001-T048
  Done when: contrato gerado de proposta aprovada referencia a proposta e contém os itens; proposta não aprovada é recusada
  Evidence:

- [ ] SPEC-0001-T051 — Implementar prévia de datas e ativação (BR-03) gerando todas as OS `prevista` na mesma transação
  Status: pending
  Requirements: REQ-022, REQ-058
  Depends on: SPEC-0001-T049, SPEC-0001-T050
  Done when: OS geradas = prévia; contrato incompleto não ativa; cláusulas e valores ficam imutáveis
  Evidence:

- [ ] SPEC-0001-T052 — Implementar suspensão, reativação, cancelamento e encerramento (cancela previstas futuras, avisa sobre agendadas) e aditivo como nova versão vinculada
  Status: pending
  Requirements: REQ-021, REQ-022, REQ-044
  Depends on: SPEC-0001-T051
  Done when: transições conforme REQ-021; OS concluídas intactas; aditivo não altera o contrato original; comercial e gestor podem cancelar (BR-01)
  Evidence:

- [ ] SPEC-0001-T053 — Gerar o PDF do contrato a partir do modelo (layout padrão)
  Status: pending
  Requirements: REQ-023
  Depends on: SPEC-0001-T039, SPEC-0001-T051
  Done when: nenhuma `{{variável}}` sobra no PDF; dados conferem com o contrato
  Evidence:

- [ ] SPEC-0001-T054 — Implementar a lista de contratos a vencer em N dias e a renovação como novo contrato vinculado
  Status: pending
  Requirements: REQ-024
  Depends on: SPEC-0001-T051
  Done when: serviço retorna contratos dentro de N dias; renovação cria contrato `rascunho` com `renewal_of_id`
  Evidence:

- [ ] SPEC-0001-T055 — Implementar serviços sob demanda: criar OS a partir do contrato respeitando o limite de chamados
  Status: pending
  Requirements: REQ-058, REQ-025
  Depends on: SPEC-0001-T051
  Done when: OS sob demanda criada vinculada ao serviço do contrato; limite excedido é recusado
  Evidence:

- [ ] SPEC-0001-T056 — Ajustar o layout do modelo/PDF de contrato ao modelo da empresa
  Status: blocked
  Requirements: REQ-023
  Depends on: SPEC-0001-T053
  Done when: modelo padrão importado do arquivo do usuário e aprovado por ele. Bloqueio: aguardando os modelos (OQ-06)
  Evidence:

- [ ] SPEC-0001-T057 — Testes de fechamento da F4 e registro em `verification.md`
  Status: pending
  Requirements: REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-058
  Depends on: SPEC-0001-T052, SPEC-0001-T053, SPEC-0001-T054, SPEC-0001-T055
  Done when: AC-011, AC-012, AC-013, AC-014, AC-040 verdes; AC-015 verde no nível de serviço; isolamento cobre contratos e OS; linhas V atualizadas
  Evidence:

## F5 — Ordens de serviço e campo

- [ ] SPEC-0001-T058 — Implementar criação de OS manual e a partir de proposta aprovada (OS avulsas), com serviços, áreas, pragas, técnicos, veículo padrão e instruções
  Status: pending
  Requirements: REQ-019, REQ-025
  Depends on: SPEC-0001-T049, SPEC-0001-T041, SPEC-0001-T028
  Done when: secretária/comercial/gestor criam OS; veículo padrão = veículo ativo do técnico principal
  Evidence:

- [ ] SPEC-0001-T059 — Implementar o ciclo de vida da OS: agendar, reagendar com histórico e motivo, cancelar com motivo, retorno em garantia (BR-06) e correção do gestor auditada
  Status: pending
  Requirements: REQ-026, REQ-025
  Depends on: SPEC-0001-T058
  Done when: transições inválidas recusadas; reagendamento grava data anterior e motivo; OS concluída só muda por correção do gestor
  Evidence:

- [ ] SPEC-0001-T060 — Implementar a agenda por dia/semana e por técnico, com reatribuição, reagendamento e aviso de técnico desativado
  Status: pending
  Requirements: REQ-032
  Depends on: SPEC-0001-T059
  Done when: agenda mostra as OS do período por técnico; reatribuir e reagendar funcionam pela agenda
  Evidence:

- [ ] SPEC-0001-T061 — Aplicar lista com busca e filtros a OS, propostas e contratos (cliente, status, período, técnico, número)
  Status: pending
  Requirements: REQ-047
  Depends on: SPEC-0001-T026, SPEC-0001-T059
  Done when: cada filtro retorna exatamente os registros esperados em teste com dados variados
  Evidence:

- [ ] SPEC-0001-T062 — Implementar no campo a lista de OS do técnico (só as atribuídas) e o detalhe com endereço, contato, instruções e dispositivos/plantas do local
  Status: pending
  Requirements: REQ-027, REQ-048
  Depends on: SPEC-0001-T017, SPEC-0001-T059
  Done when: técnico não vê OS de outro (tela e API); tela sem rolagem horizontal em 360 px; sem valores monetários
  Evidence:

- [ ] SPEC-0001-T063 — Implementar a execução por etapas: início/fim, áreas tratadas, achados de pragas com nível de infestação e criação de área em campo
  Status: pending
  Requirements: REQ-028, REQ-007, REQ-048
  Depends on: SPEC-0001-T062, SPEC-0001-T022
  Done when: cada etapa grava sozinha (recarregar a página não perde o que foi salvo); área criada em campo fica marcada com técnico e OS
  Evidence:

- [ ] SPEC-0001-T064 — Implementar o registro de aplicações (produto, lote válido do local da OS, quantidade, diluição, área) ou a marcação "sem aplicação de produto" com justificativa
  Status: pending
  Requirements: REQ-028, REQ-040
  Depends on: SPEC-0001-T063, SPEC-0001-T035
  Done when: só lotes válidos aparecem; lote vencido enviado pela API é recusado
  Evidence:

- [ ] SPEC-0001-T065 — Implementar fotos (redimensionadas no celular para ≤ 1920 px) e assinatura em tela com nome, ou justificativa de ausência
  Status: pending
  Requirements: REQ-028, REQ-029, REQ-052
  Depends on: SPEC-0001-T063, SPEC-0001-T014
  Done when: fotos e assinatura anexadas à OS pelo celular (Playwright mobile)
  Evidence:

- [ ] SPEC-0001-T066 — Implementar a conclusão da OS: validações de REQ-029 no servidor e, numa transação, status, `saida_os` do local de estoque da OS (BR-07), bloqueio de anexos, auditoria e enfileiramento do comprovante
  Status: pending
  Requirements: REQ-029, REQ-030, REQ-052
  Depends on: SPEC-0001-T064, SPEC-0001-T065, SPEC-0001-T029
  Done when: conclusão incompleta lista o que falta; concluída baixa o estoque do veículo (ou do almoxarifado sem veículo); saldo insuficiente gera saldo negativo + alerta; anexos ficam `locked`
  Evidence:

- [ ] SPEC-0001-T067 — Gerar o comprovante de execução em PDF com todos os campos de REQ-031, uma única vez e imutável
  Status: pending
  Requirements: REQ-031
  Depends on: SPEC-0001-T066, SPEC-0001-T039, SPEC-0001-T019
  Done when: texto extraído do PDF contém cada campo de REQ-031; nova geração não substitui o arquivo
  Evidence:

- [ ] SPEC-0001-T068 — [HUMANO] Validar o conteúdo do comprovante de execução com um responsável técnico (A-04)
  Status: pending
  Requirements: REQ-031
  Depends on: SPEC-0001-T067
  Done when: o usuário confirma por escrito que um RT revisou um comprovante de exemplo; ajustes pedidos viram tarefas; resultado registrado em `verification.md`
  Evidence:

- [ ] SPEC-0001-T069 — Testes de fechamento da F5 e registro em `verification.md`
  Status: pending
  Requirements: REQ-025, REQ-026, REQ-027, REQ-028, REQ-029, REQ-030, REQ-031, REQ-032, REQ-047, REQ-048, REQ-052
  Depends on: SPEC-0001-T060, SPEC-0001-T061, SPEC-0001-T067
  Done when: AC-016, AC-017, AC-018, AC-020, AC-021, AC-026, AC-030, AC-031, AC-034, AC-041 verdes (E2E mobile incluso); linhas V atualizadas
  Evidence:

## F6 — Dispositivos de monitoramento e plantas

- [ ] SPEC-0001-T070 — Implementar dispositivos com código único por empresa, ciclo de vida (`check` de coerência status × local) e transferência de dispositivos `em_estoque` entre locais
  Status: pending
  Requirements: REQ-033, REQ-057
  Depends on: SPEC-0001-T028, SPEC-0001-T031, SPEC-0001-T023
  Done when: códigos repetidos na mesma empresa recusados; transferência move o dispositivo de local; `device_events` registra tudo
  Evidence:

- [ ] SPEC-0001-T071 — Implementar na OS as ações instalar, substituir, reposicionar e retirar dispositivos
  Status: pending
  Requirements: REQ-034, REQ-033
  Depends on: SPEC-0001-T070, SPEC-0001-T063
  Done when: cada ação fica vinculada à OS; dispositivo instalado não pode ser instalado em outro local
  Evidence:

- [ ] SPEC-0001-T072 — Implementar a inspeção por dispositivo, a confirmação de "perdido" pelo gestor e a exigência de inspeção ou justificativa na conclusão da OS
  Status: pending
  Requirements: REQ-035, REQ-029
  Depends on: SPEC-0001-T071, SPEC-0001-T066
  Done when: conclusão com dispositivo ativo não inspecionado e sem justificativa é bloqueada; "não encontrado" confirmado vira `perdido`
  Evidence:

- [ ] SPEC-0001-T073 — Implementar plantas do local: upload PNG/JPG ou PDF de 1 página (convertido no worker), revisões, marcação de posição no campo e no escritório e legenda
  Status: pending
  Requirements: REQ-055
  Depends on: SPEC-0001-T071, SPEC-0001-T038
  Done when: marcações em coordenadas normalizadas; reposicionar atualiza a marcação e guarda a anterior na auditoria; nova revisão exige reposicionar
  Evidence:

- [ ] SPEC-0001-T074 — Implementar o inventário por local em tela e PDF (lista por área + planta com marcações)
  Status: pending
  Requirements: REQ-036
  Depends on: SPEC-0001-T073, SPEC-0001-T039
  Done when: tela e PDF mostram os mesmos dispositivos, agrupados por área, com última inspeção e situação
  Evidence:

- [ ] SPEC-0001-T075 — Implementar o alerta de dispositivos instalados ao encerrar/cancelar contrato e a OS de retirada pré-preenchida
  Status: pending
  Requirements: REQ-037
  Depends on: SPEC-0001-T071, SPEC-0001-T052
  Done when: encerramento lista os dispositivos instalados nos locais do contrato e cria a OS de retirada com eles
  Evidence:

- [ ] SPEC-0001-T076 — Completar a ficha do cliente por local: propostas, contratos, OS, comprovantes, plantas e dispositivos instalados
  Status: pending
  Requirements: REQ-008
  Depends on: SPEC-0001-T074, SPEC-0001-T067
  Done when: cada local mostra suas seções separadamente, conforme perfil (sem valores para técnico)
  Evidence:

- [ ] SPEC-0001-T077 — Testes de fechamento da F6 e registro em `verification.md`
  Status: pending
  Requirements: REQ-008, REQ-033, REQ-034, REQ-035, REQ-036, REQ-037, REQ-055
  Depends on: SPEC-0001-T072, SPEC-0001-T074, SPEC-0001-T075, SPEC-0001-T076
  Done when: AC-006, AC-019, AC-022, AC-023, AC-024, AC-025, AC-042 verdes; isolamento cobre dispositivos e plantas; linhas V atualizadas
  Evidence:

## F7 — Painel, LGPD e operação

- [ ] SPEC-0001-T078 — Implementar o painel por perfil: OS do dia e atrasadas, propostas aguardando/a expirar, contratos a vencer, alertas de estoque, ocorrências de dispositivos e licenças a vencer
  Status: pending
  Requirements: REQ-046, REQ-024, REQ-041
  Depends on: SPEC-0001-T034, SPEC-0001-T054, SPEC-0001-T072
  Done when: cada bloco mostra exatamente os registros esperados em teste; blocos respeitam BR-01
  Evidence:

- [ ] SPEC-0001-T079 — Implementar LGPD: exportação JSON dos dados de um titular, anonimização de cliente e redação de PII nos logs
  Status: pending
  Requirements: REQ-050
  Depends on: SPEC-0001-T076
  Done when: exportação contém os dados do titular; anonimização substitui PII; logs não exibem CPF/CNPJ/telefone/e-mail (teste)
  Evidence:

- [ ] SPEC-0001-T080 — Garantir a retenção de 5 anos: anonimização e encerramentos não removem OS, aplicações, movimentações nem PDFs emitidos
  Status: pending
  Requirements: REQ-060, REQ-050
  Depends on: SPEC-0001-T079
  Done when: teste com OS antiga de cliente anonimizado mantém comprovante e aplicações; nenhuma rota de exclusão física existe para esses dados
  Evidence:

- [ ] SPEC-0001-T081 — Criar `compose.prod.yml`, Caddyfile (HTTPS + HSTS), imagens `app`/`worker` com tag por commit, serviço `migrate` one-off e `/api/health`
  Status: pending
  Requirements: REQ-049
  Depends on: SPEC-0001-T039
  Done when: stack sobe localmente em modo produção; health verifica app, banco e fila; Postgres sem porta exposta
  Evidence:

- [ ] SPEC-0001-T082 — Criar o serviço de backup (`pg_dump` diário + `rclone` dos anexos para bucket separado, retenção 30 diários/12 mensais, alerta de falha) e `docker/backup/RESTORE.md`
  Status: pending
  Requirements: REQ-053
  Depends on: SPEC-0001-T081
  Done when: backup executado localmente gera dump e cópia dos anexos; procedimento de restauração documentado passo a passo
  Evidence:

- [ ] SPEC-0001-T083 — [HUMANO] Contratar e provisionar VPS, domínio/DNS, bucket de anexos, bucket de backup e conta de registry; o usuário configura os segredos nos ambientes
  Status: pending
  Requirements: none
  Depends on: SPEC-0001-T081
  Done when: suporte (infraestrutura, exige aprovação e ação do usuário) — o usuário confirma que a VPS (4 vCPU/8 GB) e os serviços existem; nenhum segredo passa pelo agente nem pelo repositório
  Evidence:

- [ ] SPEC-0001-T084 — Implantar homologação na VPS e ensaiar a restauração do backup
  Status: pending
  Requirements: REQ-053
  Depends on: SPEC-0001-T082, SPEC-0001-T083
  Done when: homologação acessível por HTTPS; restauração do último backup confere dados e anexos com a origem (AC-035)
  Evidence:

- [ ] SPEC-0001-T085 — Criar o seed de carga (100 empresas; uma com 200 usuários e 120.000 OS), o script k6 e ajustar índices até cumprir as metas
  Status: pending
  Requirements: REQ-059
  Depends on: SPEC-0001-T084, SPEC-0001-T078
  Done when: k6 em homologação: p95 < 2 s nas listagens filtradas e telas do técnico, < 10 s nos PDFs (AC-045); números de A-10 confirmados pelo usuário antes do teste
  Evidence:

- [ ] SPEC-0001-T086 — Configurar observabilidade: logs pino com rotação, Sentry opcional, monitor externo de disponibilidade, alertas de disco e de backup
  Status: pending
  Requirements: none
  Depends on: SPEC-0001-T084
  Done when: suporte (operação, plan.md › Deployment and observability) — queda simulada do app dispara alerta; falha simulada de backup dispara alerta
  Evidence:

- [ ] SPEC-0001-T087 — Endurecer a segurança: CSP, cabeçalhos, revisão de `pnpm audit`, varredura de segredos no CI e conferência dos critérios de segurança do plan.md
  Status: pending
  Requirements: REQ-049, REQ-061
  Depends on: SPEC-0001-T084
  Done when: cada item de `Security and integrity criteria` tem evidência registrada em `verification.md`
  Evidence:

- [ ] SPEC-0001-T088 — Testes de fechamento da F7 e registro em `verification.md`
  Status: pending
  Requirements: REQ-046, REQ-050, REQ-053, REQ-059, REQ-060
  Depends on: SPEC-0001-T078, SPEC-0001-T080, SPEC-0001-T084, SPEC-0001-T085
  Done when: AC-015, AC-028, AC-032, AC-035, AC-045, AC-046 verdes; suíte completa de isolamento (AC-037, AC-039) e de autorização (AC-002) verde sobre todas as entidades; linhas V atualizadas
  Evidence:

- [ ] SPEC-0001-T089 — [HUMANO] Gate de go-live: rodar `validar spec SPEC-0001`, apresentar os critérios de segurança e obter aprovação para o primeiro deploy em produção e entrada de dados reais
  Status: pending
  Requirements: none
  Depends on: SPEC-0001-T068, SPEC-0001-T086, SPEC-0001-T087, SPEC-0001-T088
  Done when: suporte (aprovação humana obrigatória, plan.md › Actions requiring human approval) — `sdd_check.py` sem erros, todos os ACs com PASS ou NOT_APPLICABLE justificado, e aprovação explícita do usuário registrada
  Evidence:
