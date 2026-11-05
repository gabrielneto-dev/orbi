---
id: CTX-QUE-20261104-project-type-and-stack
type: question
title: Que tipo de projeto é o orbi e com quais tecnologias/ferramentas será feito?
branch: global
tags: [domain, tech-stack]
status: answered
created_at: 2026-11-04
updated_at: 2026-11-05
depends_on: [CTX-QUE-20261104-project-purpose-and-scope]
resolved_by: CTX-DEC-20261105-tech-stack
---

# Question: tipo de projeto e stack

## Question

O orbi é software, pesquisa, produto, negócio, automação, pessoal ou outro? Se for software: linguagens, frameworks, gerenciador de pacotes, infraestrutura?

## Why this matters

Define as branches de contexto (ex.: `backend`/`frontend` vs. `literature`/`methodology`), regras operacionais de `AGENTS.md` (comandos de build/teste/lint) e restrições técnicas.

## What depends on the answer

- Branches e tags de domínio em `_meta/taxonomy.yaml`
- Possíveis regras operacionais novas em `AGENTS.md` (ex.: "usar pnpm", "rodar testes antes de commit")
- `core/constraints.md`

## Known options

Nenhuma evidência: não há manifests, código ou configuração no repositório.

## How to resolve

Responder após `CTX-QUE-20261104-project-purpose-and-scope`, ou detectar a partir dos primeiros arquivos de projeto adicionados.

## Answer

2026-11-05: software — plataforma web SaaS para dedetizadoras (`SPEC-0001`). Stack decidida em `CTX-DEC-20261105-tech-stack`: monólito TypeScript (Next.js + PostgreSQL) em Docker numa VPS.
