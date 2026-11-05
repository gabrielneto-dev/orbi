---
id: CTX-DEC-20261104-adopt-context-engineering
type: decision
title: Adotar Context/ como memória persistente e AGENTS.md como contrato dos agentes
branch: global
tags: [context-engineering, agents, documentation]
status: active
confidence: high
created_at: 2026-11-04
updated_at: 2026-11-04
related: [CTX-ASM-20261104-context-language-pt-br, CTX-CP-20261104-2351-context-bootstrap]
---

# Decision: adotar o sistema de contexto

## Context

O usuário executou o bootstrap "Context Engineering — Universal Project Bootstrap" logo após o primeiro commit do repositório (só `README.md`).

## Problem

Sessões de agentes de IA perdem toda a memória conversacional. Sem memória em arquivos, cada sessão redescobre o projeto, repete investigações e pode contradizer decisões anteriores.

## Options considered

1. Nenhuma memória estruturada (só README) — simples, mas sem continuidade.
2. Um único arquivo de notas — fácil de começar, degrada em documento gigante e não pesquisável.
3. Sistema atômico em `Context/` com roteamento progressivo (MAP/STATE → branch → registro → fonte) — escolhido.

## Decision

- `AGENTS.md` (raiz) é a fonte canônica de **como** os agentes trabalham; bloco gerenciado `CONTEXT-ENGINEERING`.
- `CLAUDE.md` importa `@AGENTS.md` e contém só regras específicas do Claude Code.
- `Context/` guarda **o que** o projeto sabe, em registros atômicos com frontmatter YAML e IDs estáveis.
- Leitura automática em tarefas não triviais; escrita só sob gatilho (`salvar contexto`).
- Validador stdlib `Context/_meta/tools/context_check.py` para IDs, relações, taxonomia, segredos e catálogo.

## Rationale

Carregamento progressivo maximiza contexto relevante com mínima leitura; atomicidade e IDs estáveis permitem busca e relações; separar AGENTS de Context evita que o contrato vire wiki; `AGENTS.md` é lido por vários agentes, mantendo portabilidade.

## Consequences

- Cada `salvar contexto` exige disciplina: checkpoint, STATE, índices e catálogo atualizados.
- Branches de domínio só serão criadas quando o propósito do projeto for conhecido.

## Risks

- Deterioração por falta de manutenção (STATE histórico demais, catálogo divergente). Mitigação: `auditar contexto` + validador.

## Related records

- `CTX-ASM-20261104-context-language-pt-br`
- `CTX-CP-20261104-2351-context-bootstrap`
