---
id: CTX-SUM-20261104-constraints
type: summary
title: Restrições duráveis do projeto
branch: core
tags: [constraints]
status: active
confidence: medium
created_at: 2026-11-04
updated_at: 2026-11-04
related: [CTX-DEC-20261104-adopt-context-engineering]
---

# Constraints

## Conhecidas

- **Segurança do contexto:** nenhum segredo/credencial pode ser persistido em `Context/` (apenas nomes de variáveis ou localização em secret manager).
- **Escrita controlada:** `Context/` só é atualizado sob gatilho explícito do usuário (`salvar contexto` e equivalentes).
- **Portabilidade de agentes:** instruções compartilhadas vivem em `AGENTS.md`; arquivos de ferramentas (ex.: `CLAUDE.md`) são adaptadores.

## Desconhecidas

Técnicas, financeiras, temporais, legais, operacionais, de compatibilidade e de infraestrutura: ainda não informadas.
