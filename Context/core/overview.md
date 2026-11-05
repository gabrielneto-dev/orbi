---
id: CTX-SUM-20261104-overview
type: summary
title: Visão geral do projeto orbi
branch: core
tags: [overview, scope, product]
status: active
confidence: high
created_at: 2026-11-04
updated_at: 2026-11-05
related: [CTX-DEC-20261105-product-scope-saas-pest-control, CTX-DEC-20261105-tech-stack]
---

# Visão geral

## O que é

**orbi** é uma plataforma web **SaaS multiempresa** para empresas de controle de vetores e pragas urbanas
(dedetizadoras). Cada empresa assinante usa o sistema com seus próprios dados, isolados das demais.
Decisão: `CTX-DEC-20261105-product-scope-saas-pest-control` (2026-11-05).

## Para quem

- **Empresas assinantes**, de pequeno a grande porte. Perfis: secretária, comercial, técnico de campo, gestor geral e financeiro.
- **Equipe do orbi** (`admin_plataforma`): cria, suspende e reativa empresas; não acessa os dados operacionais delas.

## O que faz (MVP)

Ciclo do atendimento, do orçamento à execução em campo:

1. Clientes, locais de atendimento, áreas e plantas.
2. Catálogo: serviços, pragas-alvo, produtos químicos/materiais, tipos de dispositivo.
3. Propostas comerciais (versões, PDF) → contratos com periodicidade configurável → ordens de serviço.
4. Execução da OS pelo técnico no celular: produtos e lotes aplicados, fotos, assinatura, comprovante de execução.
5. Dispositivos de monitoramento (ratoeiras, porta-iscas, armadilhas) por local/área e na planta, com inventário do que está instalado em cada cliente.
6. Estoque simples: almoxarifado + veículos, baixa automática pela OS.
7. Painel com alertas (OS, propostas, contratos, estoque, licenças).

Fora do MVP: financeiro, offline, cobrança das assinaturas. Detalhe em `core/goals.md`.

## Onde está cada coisa

- Requisitos, plano e tarefas: `Specs/features/SPEC-0001--pest-control-mvp/` (`Specs/STATE.md` diz a fase atual).
- Stack: `CTX-DEC-20261105-tech-stack` (monólito Next.js + PostgreSQL em Docker numa VPS).
- Termos do domínio: `core/glossary.md`.

## Linha de base do repositório (2026-11-05)

- Ainda **não há código**: só `README.md`, `AGENTS.md`, `CLAUDE.md`, `Context/` e `Specs/`.
- O primeiro código nasce na tarefa `SPEC-0001-T001` (scaffold).

## Componentes principais

Planejados, não implementados: aplicação Next.js (telas de escritório, telas de campo, área da plataforma),
worker (filas, PDFs), PostgreSQL com RLS por empresa, armazenamento S3. Ver `plan.md` da SPEC-0001.
