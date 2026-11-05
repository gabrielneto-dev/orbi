---
id: SPEC-0001
title: Plataforma SaaS de gestão para empresas de controle de pragas (MVP) — verificação
updated_at: 2026-11-05
---

# Verification: Plataforma SaaS de gestão para empresas de controle de pragas (MVP)

<!-- Result: PASS | FAIL | BLOCKED | NOT_RUN | NOT_APPLICABLE. Nunca PASS sem execução. -->

Checks planejados: um por AC, com o método definido em `plan.md` › Testing strategy e a tarefa que o executa.
Nada foi executado ainda: todo resultado é `NOT_RUN`. Os comandos exatos são preenchidos quando o teste existir.

| Check | Covers | Method | Result | Date | Notes |
|---|---|---|---|---|---|
| V-001 | AC-001, REQ-001, REQ-049 | E2E Playwright: rotas sem sessão → login; API → 401 | NOT_RUN | — | T018 |
| V-002 | AC-002, REQ-002, REQ-049 | Integração: endpoints proibidos por perfil → 403 (todas as entidades em T088) | NOT_RUN | — | T018, T088 |
| V-003 | AC-003, REQ-003 | Integração: login de usuário desativado negado; histórico preservado | NOT_RUN | — | T018 |
| V-004 | AC-004, REQ-004 | Integração: auditoria de reagendamento de OS | NOT_RUN | — | T018 (helper), T069 (OS) |
| V-005 | AC-005, REQ-005 | Unidade (CPF/CNPJ) + integração (unicidade por empresa) | NOT_RUN | — | T027. Parte unitária executada em 2026-11-05 (T007): `pnpm test` › `tests/unit/documents.test.ts` passou (dígitos verificadores, CNPJ alfanumérico). Integração (unicidade, mensagem de recusa) pendente |
| V-006 | AC-006, REQ-006, REQ-007, REQ-008 | E2E: ficha do cliente com 2 locais | NOT_RUN | — | T077 |
| V-007 | AC-007, REQ-009, REQ-010, REQ-011, REQ-012, REQ-013 | Integração: produto químico incompleto recusado; inativos fora das seleções | NOT_RUN | — | T027 |
| V-008 | AC-008, REQ-014, REQ-017 | PDF: texto extraído da proposta confere com a tela | NOT_RUN | — | T046 |
| V-009 | AC-009, REQ-015, REQ-016 | Integração: edição de enviada cria versão 2; v1 imutável | NOT_RUN | — | T046 |
| V-010 | AC-010, REQ-018 | Integração: aprovação de proposta vencida recusada | NOT_RUN | — | T046 |
| V-011 | AC-011, REQ-019 | Integração: contrato herda dados da proposta aprovada | NOT_RUN | — | T057 |
| V-012 | AC-012, REQ-020, REQ-021, REQ-022 | Unidade (recorrência) + integração: 16 OS previstas em 12 meses | NOT_RUN | — | T057 |
| V-013 | AC-013, REQ-022 | Integração: cancelamento cancela previstas futuras, preserva concluídas | NOT_RUN | — | T057 |
| V-014 | AC-014, REQ-023 | PDF: contrato sem variáveis não preenchidas | NOT_RUN | — | T057 |
| V-015 | AC-015, REQ-024 | Integração (serviço) + E2E (painel): contrato a vencer e renovação | NOT_RUN | — | T057, T088 |
| V-016 | AC-016, REQ-025, REQ-026, REQ-032 | E2E: reagendamento pela agenda | NOT_RUN | — | T069 |
| V-017 | AC-017, REQ-027, REQ-048 | E2E mobile 360 px: lista do técnico | NOT_RUN | — | T069 |
| V-018 | AC-018, REQ-028, REQ-029 | Unidade (regras de conclusão) + integração | NOT_RUN | — | T069 |
| V-019 | AC-019, REQ-029, REQ-035 | Integração: conclusão bloqueada por dispositivo não inspecionado | NOT_RUN | — | T077 |
| V-020 | AC-020, REQ-030, REQ-039 | Integração: baixa no veículo; saldo negativo + alerta | NOT_RUN | — | T069 |
| V-021 | AC-021, REQ-031, REQ-045 | PDF: comprovante contém todos os campos de REQ-031 | NOT_RUN | — | T069; conteúdo validado por RT em T068 |
| V-022 | AC-022, REQ-033, REQ-034 | Integração: instalação de D-0001 e recusa em outro local | NOT_RUN | — | T077 |
| V-023 | AC-023, REQ-035 | Integração: "não encontrado" confirmado → perdido | NOT_RUN | — | T077 |
| V-024 | AC-024, REQ-036 | PDF: inventário com lista por área + planta | NOT_RUN | — | T077 |
| V-025 | AC-025, REQ-037 | Integração: alerta de dispositivos e OS de retirada | NOT_RUN | — | T077 |
| V-026 | AC-026, REQ-038, REQ-040 | Integração (serviço) + E2E (campo): lote vencido indisponível | NOT_RUN | — | T036, T069 |
| V-027 | AC-027, REQ-039, REQ-042 | Integração: razão sem UPDATE/DELETE; ajuste no extrato | NOT_RUN | — | T036 |
| V-028 | AC-028, REQ-041, REQ-046 | Integração (alertas) + E2E (painel) | NOT_RUN | — | T036, T088 |
| V-029 | AC-029, REQ-043, REQ-044 | Integração: numeração após cancelamento | NOT_RUN | — | T046 |
| V-030 | AC-030, REQ-047 | E2E: filtro de OS por técnico e período | NOT_RUN | — | T069 |
| V-031 | AC-031, REQ-002 | Unidade (serializadores) + E2E: técnico sem valores; secretária só leitura | NOT_RUN | — | T069 |
| V-032 | AC-032, REQ-050 | Integração: anonimização preserva documentos retidos | NOT_RUN | — | T088 |
| V-033 | AC-033, REQ-051 | Unidade: formatadores pt-BR; amostragem de telas/PDFs | NOT_RUN | — | T018. Parte unitária executada em 2026-11-05 (T007): `pnpm test` › `tests/unit/{format,timezone}.test.ts` passou, também com `TZ` UTC/Tóquio/Los Angeles. Amostragem de telas e PDFs pendente |
| V-034 | AC-034, REQ-052 | Integração + E2E: anexos de OS concluída imutáveis | NOT_RUN | — | T069 |
| V-035 | AC-035, REQ-053 | Manual documentado: restauração em homologação (`docker/backup/RESTORE.md`) | NOT_RUN | — | T084 |
| V-036 | AC-036, REQ-054 | Integração: gravações concorrentes → CONFLICT | NOT_RUN | — | T018 |
| V-037 | AC-037, REQ-061, REQ-049 | Suíte de isolamento: varredura de RLS + acesso cruzado por ID em todas as entidades | NOT_RUN | — | parcial em T018–T077, completa em T088. Base executada em 2026-11-05 (T006): `tests/integration/tenant-isolation.test.ts` — varredura de RLS passa (e detecta tabela sem RLS/FORCE/política) e uma tabela de exemplo prova isolamento por ID entre duas empresas sob `orbi_app`. Nenhuma entidade de M2–M9 existe ainda |
| V-038 | AC-038, REQ-062, REQ-063 | Integração: criar/suspender/reativar empresa; admin sem dados operacionais | NOT_RUN | — | T018 |
| V-039 | AC-039, REQ-064 | Integração: mesmo CNPJ, código e numeração em empresas distintas | NOT_RUN | — | T027, T046, T077 |
| V-040 | AC-040, REQ-058, REQ-022 | Unidade (recorrência) + integração: prévia = OS geradas; sob demanda sem OS | NOT_RUN | — | T057 |
| V-041 | AC-041, REQ-007 | E2E mobile: área criada em campo | NOT_RUN | — | T069 |
| V-042 | AC-042, REQ-055, REQ-034 | Integração + E2E: reposicionar na planta e auditoria da posição anterior | NOT_RUN | — | T077 |
| V-043 | AC-043, REQ-056, REQ-057 | Integração: transferência atômica com falha simulada | NOT_RUN | — | T036 |
| V-044 | AC-044, REQ-056 | Integração: segundo veículo ativo para o mesmo técnico recusado | NOT_RUN | — | T036 |
| V-045 | AC-045, REQ-059 | k6 em homologação com seed de carga | NOT_RUN | — | T085 |
| V-046 | AC-046, REQ-060 | Integração: OS de 4 anos e 11 meses de cliente anonimizado disponível | NOT_RUN | — | T088 |

## Known limitations

- Nenhum check executado: não há código ainda (2026-11-05).
- V-021 prova a presença dos campos, não a conformidade regulatória; esta depende da validação do RT (T068, A-04).
- V-045 depende da confirmação dos números de capacidade (A-10).

## Remaining risks

- Ver `plan.md` › Risk analysis. Os riscos críticos (isolamento entre empresas e autorização) são cobertos por V-002 e V-037, que só fecham quando todas as entidades existirem (T088).
