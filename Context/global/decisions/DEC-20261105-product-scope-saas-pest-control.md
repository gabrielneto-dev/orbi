---
id: CTX-DEC-20261105-product-scope-saas-pest-control
type: decision
title: orbi é uma plataforma SaaS multiempresa para dedetizadoras; MVP sem financeiro e sem offline
branch: global
tags: [scope, domain, goals, product]
status: active
confidence: high
created_at: 2026-11-05
updated_at: 2026-11-05
related: [CTX-QUE-20261104-project-purpose-and-scope, CTX-DEC-20261105-tech-stack, CTX-ASM-20261105-regulatory-certificate-content]
depends_on: []
supersedes: null
superseded_by: null
revisit_at: null
---

# Decision: escopo de produto do orbi

## Context

Em 2026-11-05 o usuário definiu o orbi como "um sistema de controle de pragas" que gera ordens de serviço,
propostas comerciais e contratos, controla estoque de forma simples e mantém cadastro de serviços. As
respostas às perguntas de escopo da `SPEC-0001` fixaram as escolhas abaixo.

## Problem

Sem um escopo de produto explícito, cada spec e cada decisão técnica teriam de redescobrir quem usa o
sistema, se ele é interno ou vendido, e o que fica de fora da primeira versão.

## Options considered

1. Sistema interno de uma única dedetizadora — hipótese inicial, **revogada** pelo usuário.
2. **SaaS multiempresa** (cada dedetizadora assinante com dados isolados) — escolhida pelo usuário ("Várias empresas (SaaS)").
3. Uma empresa agora, preparada para SaaS depois — não escolhida.

## Decision

- **Produto:** plataforma web SaaS multiempresa para empresas de controle de vetores e pragas urbanas, de pequeno a grande porte.
- **Usuários de cada empresa:** secretária, comercial, técnico de campo (operador que vai à rua), gestor geral e financeiro. A equipe do orbi administra as empresas (`admin_plataforma`), sem acesso aos dados operacionais.
- **MVP inclui:** clientes/locais/áreas, catálogo (serviços, pragas, produtos, dispositivos), propostas, contratos com periodicidade configurável, ordens de serviço com execução em campo, dispositivos de monitoramento (ratoeiras, porta-iscas) com inventário por cliente e planta com marcações, estoque simples em almoxarifado + veículos, PDFs e painel.
- **Fora do MVP (decisão do usuário):** módulo financeiro (cobrança, boletos, NFS-e); funcionamento offline (técnicos raramente ficam sem sinal).
- **Fora do MVP (consequência):** cobrança das assinaturas do SaaS e cadastro self-service de empresas (ativação manual pela equipe do orbi).
- **Retenção:** registros de execução e aplicação guardados por no mínimo 5 anos.

Requisitos detalhados: `Specs/features/SPEC-0001--pest-control-mvp/spec.md`.

## Rationale

- O usuário quer atender dedetizadoras de todos os portes, o que implica vender para várias empresas.
- O financeiro foi adiado pelo usuário para reduzir o primeiro escopo.
- O usuário confirmou que a falta de sinal em campo é rara, então o custo do offline não se justifica agora.

## Consequences

- Isolamento de dados por empresa é requisito crítico em toda a plataforma (`CTX-DEC-20261105-tech-stack` usa `tenant_id` + RLS).
- Unicidades e numerações são por empresa; a mesma pessoa em duas empresas usa dois logins no MVP.
- O produto lida com obrigações sanitárias brasileiras (comprovante de execução, responsável técnico), ver `CTX-ASM-20261105-regulatory-certificate-content`.

## Risks

- Modelo de contratação e cobrança do SaaS ainda indefinido (`SPEC-0001` OQ-10).
- Escopo grande para um desenvolvedor solo; mitigado pela entrega em fases do `plan.md`.

## Related records

- `CTX-QUE-20261104-project-purpose-and-scope` — respondida por esta decisão.
- `CTX-DEC-20261105-tech-stack` — stack que implementa este escopo.
