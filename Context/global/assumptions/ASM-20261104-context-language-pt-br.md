---
id: CTX-ASM-20261104-context-language-pt-br
type: assumption
title: Conteúdo de Context/ escrito em português (pt-BR)
branch: global
tags: [language, documentation]
status: active
confidence: medium
created_at: 2026-11-04
updated_at: 2026-11-04
related: [CTX-DEC-20261104-adopt-context-engineering]
---

# Assumption: idioma do contexto

## Assumption

Registros de `Context/` são escritos em pt-BR. Identificadores (IDs, tags, campos de frontmatter, nomes de arquivo) e `AGENTS.md`/`CLAUDE.md` ficam em inglês para portabilidade entre agentes.

## Why we currently assume this

O usuário escreveu o prompt de bootstrap em português.

## What depends on it

Consistência de escrita em novos registros; `_meta/config.yaml` (`content_language`).

## How to validate

Confirmar com o usuário quando for conveniente.

## Consequence if false

Novos registros passam a usar o idioma escolhido; os existentes podem ser mantidos ou traduzidos (sem mudar IDs).
