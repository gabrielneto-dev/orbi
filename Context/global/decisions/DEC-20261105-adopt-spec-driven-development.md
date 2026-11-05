---
id: CTX-DEC-20261105-adopt-spec-driven-development
type: decision
title: Adotar Spec-Driven Development adaptativo em Specs/
branch: global
tags: [spec-driven-development, agents, documentation]
status: active
confidence: high
created_at: 2026-11-05
updated_at: 2026-11-05
related: [CTX-DEC-20261104-adopt-context-engineering]
depends_on: [CTX-DEC-20261104-adopt-context-engineering]
---

# Decision: adotar SDD adaptativo

## Context

Com o sistema de contexto instalado (`CTX-DEC-20261104-adopt-context-engineering`), o usuário pediu um protocolo permanente de desenvolvimento orientado a especificações, que sobreviva à perda do histórico de conversa. O repositório ainda não tem código nem funcionalidades.

## Problem

`Context/` guarda conhecimento, mas não o progresso operacional de uma implementação (requisitos, tarefas, evidências). Sem isso, um agente novo não sabe qual tarefa está em andamento nem o que já foi verificado, e pode declarar como pronto código não validado.

## Options considered

1. Registrar specs e tarefas dentro de `Context/` (branches/plans): mistura memória de conhecimento com estado operacional que muda a cada tarefa, e conflita com a política de escrita controlada.
2. SDD rígido (spec + plan + tasks + verification para toda mudança): rastreável, mas burocrático para correções triviais.
3. **`Specs/` separado, adaptativo por nível de complexidade, com persistência operacional automática e referências por ID para `Context/`.** Escolhida.

## Decision

- `Specs/` contém o protocolo (`README.md`), `INDEX.md` (registro + `Next ID`), `STATE.md` (estado operacional), templates e `sdd_check.py`.
- Níveis: trivial (sem spec), lightweight (`spec.md` único), full (spec/plan/tasks/verification), critical (full + riscos/rollback/aprovação humana).
- IDs estáveis: `SPEC-NNNN`, `SPEC-NNNN-TNNN`, `REQ-NNN`, `AC-NNN`, `V-NNN`; nunca reutilizados.
- A persistência automática grava apenas em `Specs/`. `Context/` mantém a escrita controlada, com uma exceção explícita: decisão durável do planejamento → `DEC` em `Context/`.
- Commits e pushes nunca são automáticos.
- `AGENTS.md` ganha o bloco `SPEC-DRIVEN` (curto); o detalhe fica em `Specs/README.md`.

## Rationale

Separar o estado operacional (muda a cada tarefa) do conhecimento durável mantém `Context/` enxuto e permite gravar progresso automaticamente sem violar a escrita controlada. A profundidade adaptativa evita burocracia em mudanças pequenas. O verificador torna detectáveis divergências como tarefa concluída sem evidência ou spec `done` com AC não verificado.

## Consequences

- Toda tarefa não trivial passa por classificação; mudanças full/critical exigem spec e plano antes do código.
- `Specs/STATE.md` precisa ser atualizado a cada transição; `Context/STATE.md` só aponta para ele.
- O verificador valida estrutura e rastreabilidade, não a correção do código: a reconciliação com código e testes continua sendo responsabilidade do agente.

## Risks

- Overhead de manutenção se os níveis forem superestimados. Mitigação: classificar pelo impacto real.
- Deriva entre documentos e código. Mitigação: protocolo de retomada com reconciliação + `auditar sdd`.

## Related records

- `CTX-DEC-20261104-adopt-context-engineering`
