# Specs — Protocolo de Spec-Driven Development (SDD)

`Specs/` guarda **especificações, planos, tarefas e evidências de verificação** do projeto **orbi**.
É a camada operacional de desenvolvimento; a memória geral de conhecimento continua em `Context/`.

> A sessão é descartável. Especificações, tarefas e evidências pertencem ao repositório
> e devem permitir que um agente novo continue o trabalho sem o histórico da conversa.

---

## 1. Fontes de verdade

| Componente | Responsabilidade |
|---|---|
| `AGENTS.md` | Instruções operacionais permanentes (bloco `SPEC-DRIVEN` resume este protocolo) |
| `CLAUDE.md` | Adaptador do Claude Code (`@AGENTS.md`) |
| `Context/` | Conhecimento, decisões duráveis, pesquisas, perguntas, histórico |
| `Specs/` | Especificação, planejamento, tarefas, verificação e estado operacional do SDD |
| Código-fonte | Estado real da implementação (evidência do que existe, não prova de que os requisitos foram atendidos) |
| Sessão | Memória de trabalho temporária |

Regras de não duplicação:

- Decisões arquiteturais duráveis → `Context/` (registro `DEC`). A spec/plano apenas **referencia** o ID (`context_refs`).
- Perguntas de produto/domínio que afetam várias specs → `Context/` (`QUE`). Perguntas locais a uma spec → seção `Open Questions` da spec.
- Estado detalhado do SDD → `Specs/STATE.md`. `Context/STATE.md` só aponta para ele.

## 2. Estrutura

```text
Specs/
├── README.md            # este protocolo
├── INDEX.md             # registro de todas as specs + próximo ID livre
├── STATE.md             # estado operacional atual do SDD (compacto)
├── _meta/
│   ├── config.yaml      # política do SDD
│   ├── templates/       # spec.md, plan.md, tasks.md, verification.md, spec-lightweight.md
│   └── tools/sdd_check.py  # verificação de consistência / divergências
├── features/
│   └── SPEC-0001--<slug>/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── verification.md
│       └── [artefatos opcionais]
└── archive/             # specs canceladas/substituídas fora do conjunto ativo
```

`features/` e `archive/` são criados quando a primeira spec for criada/arquivada.

## 3. Identificação e metadados

- Spec: `SPEC-NNNN` (4 dígitos). Pasta: `features/SPEC-NNNN--<slug-kebab-case>/`.
- Próximo ID livre: linha `Next ID` em `INDEX.md`. Após alocar, incremente. **IDs nunca são reutilizados**, nem de specs canceladas.
- Requisito: `REQ-NNN`; critério de aceitação: `AC-NNN`; verificação: `V-NNN` — numerados **dentro** da spec. Referência externa: `SPEC-0001/REQ-002`.
- Tarefa: `SPEC-NNNN-TNNN` (ex.: `SPEC-0001-T003`).
- Frontmatter YAML em `spec.md` (e `id` igual nos demais documentos):

```yaml
---
id: SPEC-0001
title: <título>
status: draft            # ver §4
level: full              # lightweight | full | critical
priority: medium         # low | medium | high | critical
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
dependencies: []         # outras SPEC-NNNN
context_refs: []         # IDs CTX-... de Context/
supersedes: null
superseded_by: null
---
```

Mesmo formato simples de YAML de `Context/` (escalares, listas inline ou em bloco).

## 4. Estados

**Spec** (`status`):

```text
draft → specified → planned → in_progress → verifying → done
                       ↘ blocked ↙          (qualquer fase)
cancelled | superseded                       (terminais; preserve o histórico)
```

| Status | Significa |
|---|---|
| `draft` | Spec sendo escrita; requisitos ainda instáveis |
| `specified` | Requisitos e ACs definidos; perguntas críticas resolvidas ou registradas como hipótese |
| `planned` | `plan.md` e `tasks.md` prontos |
| `in_progress` | Implementação em andamento |
| `verifying` | Tarefas resolvidas; verificação de ACs em curso |
| `done` | Critérios de conclusão (§12) atendidos |
| `blocked` | Impedimento registrado em `STATE.md` e na tarefa |
| `cancelled` / `superseded` | Encerrada; `superseded_by` aponta a sucessora |

**Tarefa** (`Status:`): `pending`, `ready`, `in_progress`, `blocked`, `completed`, `cancelled`.
`ready` = dependências concluídas. Checkbox `[x]` somente quando `completed`.

**Verificação** (`Result`): `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN`, `NOT_APPLICABLE`.

## 5. Ciclo SDD

```text
REQUEST → DISCOVER CONTEXT → CLASSIFY COMPLEXITY → SPECIFY → PLAN
        → DECOMPOSE TASKS → IMPLEMENT → VERIFY → RECONCILE → PERSIST STATE
```

Cada fase produz um resultado observável em arquivo. Implementação iniciada ≠ implementação concluída.

## 6. Classificação de complexidade

Classifique pelo **impacto real**, não pelo número de linhas.

| Nível | Exemplos | Artefatos | Comportamento |
|---|---|---|---|
| **0 — trivial** | typo, mensagem, config isolada sem consequência | nenhum | Consulte o contexto necessário, execute, verifique proporcionalmente. Persista só se houver impacto durável. |
| **1 — lightweight** | bug pequeno, endpoint simples, ajuste isolado de UI | `spec.md` único (template `spec-lightweight.md`: objetivo, comportamento, ACs, passos, tarefas, verificação) | Objetivo + ACs + passos essenciais → implementar → verificar → estado mínimo. |
| **2 — full** | feature nova, integração externa, mudança de banco, refatoração significativa, vários módulos | `spec.md`, `plan.md`, `tasks.md`, `verification.md` | Ciclo completo, implementação incremental, evidências, persistência a cada tarefa. |
| **3 — critical** | authn/authz, financeiro, migração destrutiva, segurança/privacidade, produção, transformação arquitetural ampla | full + seções críticas do `plan.md` | Além do full: análise de riscos, compatibilidade, rollback, critérios de segurança/integridade, verificação de efeitos colaterais, **aprovação humana** antes de ações destrutivas, irreversíveis ou sensíveis. |

Na dúvida entre dois níveis, escolha o maior. Registre o nível em `level:`.

## 7. Fases

### 7.1 Specify (`spec.md`)

Responde: problema, objetivo, quem usa/depende, comportamentos, regras, entradas/saídas, erros, restrições, fora de escopo, como provar correção.

- Requisitos com ID (`REQ-001`); ACs objetivos e testáveis (`AC-001`, preferir Given/When/Then), cada AC cita os REQ que cobre.
- Não invente requisitos como confirmados; separe fatos, hipóteses (`Assumptions`) e decisões (`Context References`).
- Ambiguidade de baixo risco → hipótese explícita e reversível. Decisão crítica sem informação → **pergunte ao usuário antes de implementar a parte afetada**.
- Não adicione funcionalidades silenciosamente. Não altere requisitos aprovados para fazer teste passar.
- A spec descreve comportamento, independente da implementação.

### 7.2 Plan (`plan.md`)

- Analise a arquitetura real antes de propor mudanças; preserve-a salvo justificativa e autorização compatível com o escopo.
- Aborde o que for aplicável: tecnologias existentes, componentes/arquivos afetados, dados, contratos, integrações, segurança, performance, compatibilidade, migrações, testes, deploy, observabilidade, rollback, riscos.
- Documente trade-offs. Decisão durável → registro `DEC` em `Context/` + referência em `context_refs`.

### 7.3 Tasks (`tasks.md`)

Formato obrigatório (o verificador lê este formato):

```md
- [ ] SPEC-0001-T001 — Criar schema de usuário
  Status: pending
  Requirements: REQ-001
  Depends on: none
  Done when: migration aplica e reverte em banco local
  Evidence: <preenchido ao concluir: comando, resultado, data, V-NNN>
```

- Tarefas pequenas, com resultado verificável, granulares o bastante para retomar após reset.
- Toda tarefa referencia requisitos (ou `none` para tarefas de suporte, justificando em `Done when`).
- Nunca marque `completed` sem `Evidence:` proporcional.

### 7.4 Implement

1. Recupere spec ativa, plano e dependências da tarefa.
2. Inspecione o código existente; escolha o menor conjunto coerente de mudanças.
3. Implemente respeitando o comportamento especificado (use testes para guiar quando houver).
4. Rode testes/verificações adequados; revise efeitos colaterais.
5. Atualize a tarefa com o resultado observado e **persista (§9) antes da próxima etapa significativa**.

Sem features futuras não aprovadas, sem refatorações não relacionadas. Impedimento → `Status: blocked` + motivo, nunca "concluído". Migrações destrutivas, produção e ações irreversíveis exigem autorização explícita.

### 7.5 Verify (`verification.md`)

Compare **SPEC ↕ IMPLEMENTAÇÃO ↕ RESULTADOS DE TESTE**. Tabela obrigatória:

```md
| Check | Covers | Method | Result | Date | Notes |
|---|---|---|---|---|---|
| V-001 | AC-001, REQ-001 | `npm test -- user.spec.ts` | PASS | 2026-11-05 | 12 testes |
```

- Registre requisito/AC coberto, comando ou procedimento, resultado observado, data, limitações.
- Não registre `PASS` para o que não foi executado (`NOT_RUN`).
- Requisito não atendido → crie ou reabra tarefas.

### 7.6 Reconcile

Antes de declarar uma fase concluída, rode o verificador (§11) e corrija ou registre divergências.

## 8. Mudanças de escopo

1. Localize a spec afetada em `INDEX.md` (não crie spec duplicada para a mesma funcionalidade).
2. Compare comportamento atual × pedido; analise impacto em REQs, tarefas e testes.
3. Atualize a spec mantendo rastreabilidade: requisito alterado → nota `Changed YYYY-MM-DD: <antes> → <depois> (motivo)`; requisito removido → `~~REQ-004~~ removed YYYY-MM-DD (motivo)`; IDs nunca são reutilizados.
4. Ajuste plano, tarefas (cancele em vez de apagar) e verificação; reabra o status da spec se necessário.
5. Spec inteiramente substituída → `status: superseded`, `superseded_by`, e `supersedes` na nova.

Nunca altere silenciosamente o significado de requisitos já aceitos.

## 9. Persistência automática do SDD (SDD Operational Persistence)

Automática e **limitada a `Specs/`**. Grave os arquivos no momento do evento — não prometa atualizar depois.

| Evento | Atualize |
|---|---|
| Spec criada/alterada | `spec.md`, `INDEX.md`, `STATE.md` |
| Plano criado/alterado | `plan.md`, status da spec, `STATE.md` |
| Tarefas criadas/reorganizadas | `tasks.md`, `STATE.md` |
| Tarefa muda de estado | `tasks.md`, `STATE.md` |
| Tarefa concluída | verifique → `tasks.md` (`Evidence`) → `verification.md` (se cobre AC) → `STATE.md` → `INDEX.md` se mudou status → próxima tarefa elegível |
| Bloqueio relevante | tarefa `blocked` + motivo, `STATE.md` (Blockers) |
| Fase concluída / verificação muda o estado | status da spec, `INDEX.md`, `STATE.md` |
| Antes de trocar de spec significativa | `STATE.md` da spec atual coerente |

Atualize somente os documentos necessários. Atualize `updated_at` do frontmatter.

**Commits e pushes não fazem parte da persistência automática** — só com instrução do usuário ou política explícita do projeto.

### 9.1 Relação com `salvar contexto`

- A persistência do SDD **não** autoriza criar memórias gerais, decisões ou pesquisas em `Context/` fora das regras de `Context/README.md`.
  Exceção já prevista: decisão durável tomada no planejamento é registrada como `DEC` em `Context/` (é parte do plano aprovado).
- Quando o usuário pedir `salvar contexto`: siga `Context/README.md` §10 e inclua no checkpoint o estado do SDD **por referência** (spec ativa, fase, próxima tarefa, último resultado de verificação) — não copie specs.

## 10. Protocolo de nova sessão (`retomar desenvolvimento`)

`NEW SESSION = ZERO CONVERSATIONAL MEMORY`. Para tarefas não triviais:

1. `AGENTS.md` (já carregado).
2. `Context/MAP.md` + `Context/STATE.md`.
3. `Specs/INDEX.md` + `Specs/STATE.md`.
4. Identifique a spec relevante; leia `spec.md`.
5. Leia `plan.md` e somente as tarefas necessárias de `tasks.md`.
6. Carregue só as branches/registros de `Context/` citados em `context_refs` ou necessários.
7. Inspecione código, `git status`/`git log`/`git diff` e testes relevantes.
8. **Reconcilie** documentação × realidade (§10.1).
9. Identifique a próxima tarefa válida (`ready`, ou `pending` com dependências `completed`).

Não carregue todas as specs.

### 10.1 Reconciliação

Não presuma que o documento está atualizado, nem que código existente atende aos ACs.
Analise alterações e evidências; determine o que foi efetivamente concluído; corrija estados operacionais incorretos (preservando histórico); informe ao usuário ambiguidades que não puder resolver com segurança.

### 10.2 Perguntas que o agente deve conseguir responder

Qual spec estava em desenvolvimento? Qual versão vigente? Qual fase? Tarefas concluídas? Em andamento? Bloqueios? Testes executados e resultado? Próxima ação? Que contexto adicional carregar?

## 11. Controle de divergências (`auditar sdd`)

```bash
python3 Specs/_meta/tools/sdd_check.py
```

Verificações automáticas (ERROR bloqueia `done`; WARN deve ser tratado ou registrado):

- IDs de spec duplicados, pasta ≠ `id`, spec ausente do `INDEX.md`, `Next ID` já usado
- Status/nível/prioridade inválidos; `dependencies`, `supersedes`, `superseded_by` inexistentes
- `context_refs` que não existem em `Context/_meta/catalog.jsonl`
- Tarefa com ID fora do padrão, duplicada, status inválido, checkbox incoerente com status
- Tarefa referenciando REQ ou tarefa inexistente; tarefa `completed` sem `Evidence`
- REQ sem tarefa (spec `planned` em diante); AC sem REQ válido
- AC sem verificação (spec `verifying`/`done`); spec `done` com tarefas abertas ou verificação `FAIL`/`BLOCKED`/`NOT_RUN`
- `STATE.md` citando spec/tarefa inexistente, ou tarefa ativa já concluída
- Padrões de segredo em `Specs/`

Verificações manuais (o script não vê): código implementado sem spec/tarefa; mudança arquitetural sem `DEC` em `Context/`; implementação divergente do escopo aprovado.

Divergências devem ser corrigidas ou registradas explicitamente (na tarefa, `STATE.md` ou `Open Questions`). Não altere requisitos para justificar o código.

## 12. Critérios de conclusão de uma spec

`status: done` somente quando:

1. Requisitos aplicáveis suficientemente definidos.
2. Tarefas do escopo `completed` ou `cancelled` (com motivo).
3. Implementação consistente com o comportamento especificado.
4. Todos os ACs verificados (`PASS` ou `NOT_APPLICABLE` justificado).
5. Resultados registrados em `verification.md`.
6. Riscos e limitações remanescentes documentados.
7. `INDEX.md` e `STATE.md` atualizados.
8. `sdd_check.py` sem erros; nenhuma divergência crítica sem tratamento.

Se algum critério não puder ser atendido, mantenha o status compatível com a realidade e informe a limitação.

## 13. Comandos semânticos

Intenções em linguagem natural (sem parser):

| Intenção | Ação |
|---|---|
| `iniciar spec <assunto>` | Procure spec equivalente em `INDEX.md`; se não houver, aloque `Next ID`, crie a pasta a partir dos templates, classifique o nível, escreva `spec.md`, atualize `INDEX`/`STATE` |
| `planejar spec <id>` | Escreva/revise `plan.md` com base na spec e na arquitetura real |
| `gerar tarefas <id>` | Decomponha o plano em `tasks.md` |
| `implementar spec <id>` | Execute a próxima tarefa elegível (§7.4) persistindo a cada transição |
| `validar spec <id>` | Verifique ACs, preencha `verification.md`, rode `sdd_check.py`, ajuste status |
| `status sdd` | Resuma `STATE.md` + `INDEX.md`: specs ativas, fase, progresso, bloqueios, próximos passos |
| `retomar desenvolvimento` | Protocolo §10 |
| `auditar sdd` | §11 completo + correções |
| `salvar contexto` | Protocolo de `Context/README.md`, incluindo o estado do SDD por referência |

## 14. Segurança

Nunca registre credenciais, tokens ou chaves em `Specs/` (apenas nomes de variáveis). Nunca execute operações destrutivas ou em produção só porque existe uma tarefa planejada. Não apresente suposições como fatos.

## 15. Manutenção e idempotência

Reinstalações/auditorias seguem `INSPECT → REUSE → MERGE → UPDATE → VALIDATE`: não duplicar blocos em `AGENTS.md`, não recriar specs com novos IDs, não apagar tarefas, não resetar estado. Mudanças estruturais neste protocolo → registre em `Context/_meta/changelog.md`.
