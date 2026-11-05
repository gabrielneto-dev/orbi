---
id: CTX-SUM-20261104-goals
type: summary
title: Objetivos, não objetivos e critérios de sucesso
branch: core
tags: [goals, scope]
status: active
confidence: high
created_at: 2026-11-04
updated_at: 2026-11-05
related: [CTX-DEC-20261105-product-scope-saas-pest-control]
---

# Goals

## Objetivos

- Permitir que uma dedetizadora conduza todo o atendimento num só sistema: proposta → contrato → OS → execução em campo → comprovante.
- Rastrear o que foi aplicado, onde, quando e por quem (produtos, lotes, áreas, técnico).
- Saber a qualquer momento quais dispositivos de monitoramento estão instalados em cada cliente, em que área e em que ponto da planta ("o que deixamos lá").
- Controlar o estoque de forma simples, no almoxarifado e nos veículos, sem travar o técnico em campo.
- Atender várias dedetizadoras de todos os portes com isolamento total de dados (SaaS).
- Objetivo operacional do repositório: memória de projeto recuperável entre sessões de agentes (`CTX-DEC-20261104-adopt-context-engineering`) e desenvolvimento guiado por specs (`CTX-DEC-20261105-adopt-spec-driven-development`).

## Não objetivos (MVP)

- Financeiro das empresas: faturamento, contas a receber/pagar, boletos, Pix, NFS-e.
- Cobrança das assinaturas do orbi, planos e cadastro self-service de empresas.
- Aplicativo nativo e modo offline.
- Envio automático por e-mail/WhatsApp, portal do cliente, roteirização/GPS, assinatura eletrônica qualificada.
- Relatórios analíticos avançados (tendências de captura, mapas de calor).

## Critérios de sucesso

- Todos os critérios de aceite da `SPEC-0001` (AC-001..046) verificados como PASS em `verification.md`.
- Critérios de segurança e integridade do `plan.md` atendidos antes de receber dados reais (isolamento entre empresas, autorização por perfil, backup restaurável).
- Metas de capacidade de `SPEC-0001/REQ-059` (hipótese a confirmar: 200 usuários e 10.000 OS/mês por empresa, 100 empresas).
