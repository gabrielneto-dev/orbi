# Context — Manual da memória do projeto

`Context/` é a memória operacional persistente do projeto **orbi**.
Qualquer agente (Claude Code, Codex, outros) que tenha apenas os arquivos deve conseguir
entender o projeto, recuperar o contexto necessário e continuar o trabalho.

> **SESSION ≠ MEMORY.** A sessão é descartável; o conhecimento do projeto fica aqui.

- `AGENTS.md` (raiz) = **como** os agentes trabalham.
- `Context/` = **o que** o projeto sabe, decidiu, descobriu, tentou e planeja.

---

## 1. Estrutura

```text
Context/
├── README.md          # este manual
├── MAP.md             # L0 — roteador: pergunta → branch → índice → registro
├── STATE.md           # L0 — estado atual (presente, não histórico)
├── _meta/
│   ├── config.yaml    # configuração do sistema de contexto
│   ├── taxonomy.yaml  # tags canônicas, status, confiança, branches
│   ├── catalog.jsonl  # índice DERIVADO (uma linha por registro)
│   ├── changelog.md   # mudanças estruturais da memória
│   ├── templates/     # modelos de registro
│   └── tools/context_check.py  # validação + rebuild do catálogo
├── core/              # fundamentos estáveis: overview, goals, constraints, glossary
├── branches/<branch>/ # conhecimento por domínio (L1 _index.md + L2 registros)
├── global/            # decisões, perguntas, assumptions, planos, riscos transversais
├── checkpoints/       # fotografias de continuidade de sessão/marco
├── sources/           # L3 — proveniência e evidências
├── future/            # ideias e possibilidades NÃO aprovadas
└── archive/           # material histórico fora do conjunto ativo
```

Diretórios vazios podem não existir ainda — crie-os sob demanda seguindo esta estrutura.

Uma branch contém, conforme necessário:
`_index.md`, `facts/`, `research/`, `decisions/`, `assumptions/`, `questions/`, `plans/`, `risks/`, `experiments/`, `notes/`.

## 2. Fontes de verdade

| O quê | Onde |
|---|---|
| Regras operacionais | `AGENTS.md` |
| Roteamento | `MAP.md` |
| Estado atual | `STATE.md` |
| Fundamentos | `core/*.md` |
| Conhecimento de domínio | `branches/<branch>/**` |
| Conhecimento transversal | `global/**` |
| Continuidade de sessões | `checkpoints/*.md` |
| Evidência | `sources/**` |
| Especificações, planos, tarefas, verificação e estado do desenvolvimento | `Specs/` (protocolo em `Specs/README.md`) |

Os arquivos Markdown são canônicos. `_meta/catalog.jsonl` é derivado: se divergir, **reconstrua o catálogo**.

## 3. Níveis de contexto

| Nível | Conteúdo | Quando carregar |
|---|---|---|
| L0 | `MAP.md`, `STATE.md` | Sempre, em tarefas não triviais |
| L1 | `branches/<branch>/_index.md` | Só das branches relevantes |
| L2 | registros atômicos | Só os necessários para a tarefa |
| L3 | `sources/`, datasets, resultados brutos | Só para evidência/validação |

## 4. Tipos de registro

| Código | Tipo | Significado |
|---|---|---|
| FCT | fact | Considerado verdadeiro no escopo atual |
| ASM | assumption | Hipótese usada sem confirmação completa |
| QUE | question | Pergunta aberta (elemento de primeira classe) |
| RES | research | Investigação: fontes, achados, limitações |
| DEC | decision | Escolha tomada, com contexto e motivo |
| PLN | plan | Trabalho planejado (`candidate`/`planned`/`in-progress`/`completed`/`cancelled`) |
| RSK | risk | Risco: causa, impacto, probabilidade, mitigação |
| EXP | experiment | Hipótese, setup, resultado, interpretação |
| NTE | note | Conhecimento útil que não cabe nos tipos acima |
| SRC | source | Proveniência de informação externa |
| SUM | summary | Sínteses estáveis (ex.: arquivos de `core/`) |
| CP | checkpoint | Fotografia de continuidade |

Separação epistemológica: hipótese ≠ fato; pesquisa ≠ decisão; ideia futura ≠ plano aprovado.

## 5. Schema de metadados (YAML frontmatter)

```yaml
---
id: CTX-DEC-20261104-use-postgresql   # obrigatório, estável, único
type: decision                         # obrigatório
title: Uso do PostgreSQL               # obrigatório
branch: backend                        # obrigatório (`global` ou `core` para transversais)
tags: [database, postgresql]           # obrigatório, de taxonomy.yaml
status: active                         # obrigatório, de taxonomy.yaml
created_at: 2026-11-04                 # obrigatório
updated_at: 2026-11-04                 # obrigatório
confidence: high                       # opcional: low | medium | high | verified
source_ids: []                         # opcional
related: []                            # opcional
depends_on: []                         # opcional
supersedes: null                       # opcional
superseded_by: null                    # opcional
resolved_by: null                      # opcional (questions)
valid_from: null                       # opcional (conhecimento temporal)
valid_until: null
revisit_at: null
---
```

O parser de `context_check.py` aceita: escalares, listas inline (`[a, b]`) e listas em bloco (`- a`). Mantenha o frontmatter nesse formato simples.

## 6. Nomenclatura

- Arquivo: `<TYPE>-<YYYYMMDD>-<slug-kebab-case>.md` (ex.: `DEC-20261104-use-postgresql.md`).
- ID: `CTX-<TYPE>-<YYYYMMDD>-<slug>` (ex.: `CTX-DEC-20261104-use-postgresql`).
- Checkpoint: arquivo `CP-YYYYMMDD-HHMM-<slug>.md`, ID `CTX-CP-YYYYMMDD-HHMM-<slug>`.
- IDs são estáveis mesmo se o arquivo for movido. Relações usam IDs, não paths.
- Evite nomes genéricos (`novo.md`, `notes2.md`, `final-final.md`).

## 7. Tags

- `kebab-case`, sempre de `_meta/taxonomy.yaml`.
- Antes de criar uma tag: procure equivalente, reutilize a canônica, evite sinônimos (`postgres`/`pg`/`postgresql` → uma só).
- Nova tag necessária → adicione em `taxonomy.yaml` no mesmo commit.

## 8. Protocolo de recuperação

**A — Entender a solicitação:** objetivo, entidades, branches e tags prováveis, tipo de conhecimento, restrições, temporalidade.

**B — Carregar L0:** `MAP.md` + `STATE.md`. Não leia a pasta inteira.

**C — Selecionar branches:** leia apenas `branches/<branch>/_index.md` das relevantes.

**D — Recuperação direcionada** (exemplos; use o mecanismo disponível):

```bash
rg -l "tags:.*authentication" Context/
rg -l "type: decision" Context/branches/backend/
rg -l "status: open" Context/
rg "CTX-DEC-20261104" Context/
grep '"status":"open"' Context/_meta/catalog.jsonl
```

**E — Expansão por relações:** leia o registro; confira `related`, `depends_on`, `source_ids`, `supersedes`/`superseded_by`; siga só o necessário (1 hop por padrão).

**Priorização:** correspondência direta → branch → tags → status ativo → relações explícitas → mais recente → maior confiança → melhor fonte → validade temporal.
Registros `superseded`/`deprecated`/`archived` nunca são estado atual sem verificar o sucessor.

**Context budget:** `MAP` e `STATE` pequenos; `_index.md` = resumo + rotas; detalhe nos registros; evidência em `sources/`. Índice grande demais → compacte e mova detalhe para registros. Registro com assuntos independentes → divida e relacione.

## 9. Política de escrita

```text
READ  = automático em tarefas não triviais
WRITE = controlado (gatilho do usuário)
```

Gatilhos (reconheça a intenção, não a string exata): `salvar contexto`, `salve o contexto`, `save context`, `persistir contexto`, `atualizar contexto`, `atualizar memória do projeto`, `criar checkpoint`, `checkpoint da sessão`.

Fora de um gatilho, só escreva em `Context/` quando o próprio pedido do usuário for sobre o contexto (ex.: "registre esta decisão").

Exceção do SDD: uma decisão durável tomada no planejamento de uma spec é registrada como `DEC` aqui e referenciada em `context_refs` da spec (`Specs/README.md` §9.1). A persistência automática do SDD grava apenas em `Specs/`; ela não autoriza outras escritas em `Context/`.

## 10. Context Save Protocol (`salvar contexto`)

Não é um resumo da conversa. É uma reconstrução semântica da sessão.

### 10.1 Pipeline

```text
SESSION
 → INSPECT PROJECT CHANGES   (git status / git diff / git log — evidência > lembrança)
 → INSPECT SDD STATE         (Specs/STATE.md, INDEX.md — referenciar no checkpoint, não copiar specs)
 → ANALYZE                   (objetivo, tarefas, problemas, causas, tentativas, falhas,
                              soluções, decisões e motivos, arquivos, testes, resultados,
                              fatos, assumptions, perguntas abertas/respondidas, riscos,
                              pendências, próximos passos, obsolescências, regras novas)
 → DISTILL                   (causa, consequência, decisão, evidência, solução, aprendizado)
 → CLASSIFY                  (tipo + branch + tags)
 → DEDUPLICATE               (procure assunto, tags, títulos, IDs; prefira ATUALIZAR)
 → RELATE                    (related, depends_on, source_ids, supersession)
 → UPDATE/CREATE ATOMIC RECORDS
 → CREATE CHECKPOINT         (checkpoints/CP-YYYYMMDD-HHMM-<slug>.md)
 → UPDATE STATE              (só presente; aponte o checkpoint mais recente)
 → UPDATE BRANCH INDEXES
 → UPDATE MAP IF NECESSARY
 → UPDATE CATALOG            (python3 Context/_meta/tools/context_check.py --rebuild-catalog)
 → UPDATE CHANGELOG IF STRUCTURAL
 → EVALUATE AGENTS.md RULES
 → VALIDATE                  (o script não deve reportar erros)
```

### 10.2 Filtro de persistência

> Um agente numa sessão nova precisaria saber disso para continuar, evitar retrabalho ou decidir melhor?

Não → descarte. Sim → classifique e persista.
Nunca salve: cumprimentos, brainstorm descartado, tentativas triviais, raciocínio redundante, texto literal da sessão.

### 10.3 Conhecimento negativo

Registre abordagens que falharam quando alguém poderia repeti-las: abordagem, condição, resultado, causa conhecida, quando tentar de novo.

```md
## Problem
A conexão falhava porque Z estava desabilitado.
## Investigation
X e Y foram investigados, mas não eram a causa.
## Validated solution
Habilitar Z resolveu.
## Avoid
Não repetir X/Y sem nova evidência.
```

### 10.4 Regras operacionais descobertas

> Isso é uma instrução durável sobre COMO futuros agentes devem trabalhar?

Sim → proponha/atualize `AGENTS.md` (fora do bloco gerenciado, ou dentro se for sobre o sistema de contexto).
Não (arquitetura, estado, decisão, pesquisa, fato, hipótese, plano) → fica em `Context/`.

## 11. Checkpoints

- Um por `salvar contexto` significativo, em `checkpoints/`, usando `_meta/templates/checkpoint.md`.
- É fotografia de continuidade; **não** substitui registros atômicos — conhecimento durável vai para o tipo correto.
- `STATE.md` sempre aponta para o checkpoint mais recente.

## 12. Supersession e arquivo

Não delete informação importante que deixou de valer.

- Antigo: `status: superseded`, `superseded_by: CTX-...`
- Novo: `supersedes: CTX-...`
- Pergunta respondida: `status: answered`, `resolved_by: CTX-...`, resposta e evidência no corpo. Não delete.
- `archive/`: material sem valor ativo, mas com valor histórico (mantenha o ID).

## 13. Conflitos

Não escolha silenciosamente. Compare data, status, escopo, origem, confiança, decisões posteriores e validade.
Se a ambiguidade persistir, crie/atualize uma `question` e registre o conflito nos dois registros (`related`).

## 14. Fontes e temporalidade

- Informação externa relevante (docs, site, paper, API, reunião, benchmark, usuário, dataset) → `sources/SRC-...md` com data e origem; referencie via `source_ids`.
- Não converta informação temporal (preços, versões, APIs, métricas, legislação) em fato absoluto: use `valid_from`, `valid_until`, `revisit_at`.

## 15. Segurança

Nunca persista valores de senha, token, API key, private key, cookie, segredo, credencial ou recovery code.

- Permitido: "A integração usa a variável `OPENAI_API_KEY`."
- Proibido: o valor da variável.

Ao encontrar um segredo em `Context/`: não replique, remova/mascare, registre apenas a referência segura e avise o usuário (pode exigir rotação).
`context_check.py` faz uma varredura heurística de padrões comuns de segredo.

## 16. Comandos semânticos

| Intenção | Ação |
|---|---|
| `salvar contexto` | Context Save Protocol completo + checkpoint (§10) |
| `carregar contexto` | Ler `MAP`, `STATE` e `_index.md` das branches relevantes antes de continuar |
| `buscar contexto <assunto>` | Buscar por tags, títulos, conteúdo, IDs e relações; retornar primeiro os mais relevantes |
| `status do contexto` | Resumir estado, último checkpoint, branches, perguntas críticas, bloqueios |
| `auditar contexto` | Auditoria estrutural (§17) |

São intenções, não um parser formal.

## 17. Auditoria

Execute `python3 Context/_meta/tools/context_check.py` e, manualmente, verifique:

- IDs duplicados ou referenciados inexistentes *(script)*
- campos obrigatórios ausentes, tags fora da taxonomia, status inválidos *(script)*
- segredos acidentais *(script, heurístico)*
- catálogo divergente *(script; corrija com `--rebuild-catalog`)*
- tags sinônimas; registros contraditórios
- questions respondidas ainda `open`; `superseded` apresentado como ativo
- links quebrados; branches redundantes ou grandes demais; documentos grandes demais
- registros sem origem quando necessária
- `MAP` desatualizado; `STATE` com histórico demais
- instruções duplicadas entre `AGENTS.md` e `CLAUDE.md`

Corrija preservando o histórico. Mudanças estruturais → `_meta/changelog.md`.

## 18. Como adicionar uma branch

Uma branch é uma área relativamente independente de conhecimento. Não crie branches artificiais.

1. Escolha um nome `kebab-case` que reflita o domínio real.
2. Crie `branches/<branch>/_index.md` a partir de `_meta/templates/branch-index.md`.
3. Registre a branch em `_meta/taxonomy.yaml` (`branches:`) e adicione rotas em `MAP.md`.
4. Crie subpastas (`decisions/`, `questions/`, ...) somente quando houver registros.
5. Mova para a branch os registros de `global/` que pertencem só a ela (mantendo os IDs).
6. Registre a criação em `_meta/changelog.md`.

## 19. Reconstruir o catálogo

```bash
python3 Context/_meta/tools/context_check.py --rebuild-catalog
```

Lê o frontmatter de todos os `*.md` com `id:` (exceto `_meta/templates/`), valida e reescreve `_meta/catalog.jsonl`. Usa apenas a biblioteca padrão do Python 3.
