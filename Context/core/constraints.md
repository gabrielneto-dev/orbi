---
id: CTX-SUM-20261104-constraints
type: summary
title: Restrições duráveis do projeto
branch: core
tags: [constraints]
status: active
confidence: medium
created_at: 2026-11-04
updated_at: 2026-11-05
related: [CTX-DEC-20261104-adopt-context-engineering, CTX-DEC-20261105-product-scope-saas-pest-control, CTX-DEC-20261105-tech-stack, CTX-ASM-20261105-regulatory-certificate-content]
---

# Constraints

## Conhecidas

- **Isolamento entre empresas:** nenhum dado de uma empresa assinante pode ser visto ou alterado por outra, por nenhum caminho (tela, API, arquivo, PDF). É o requisito de maior risco do produto.
- **Privacidade (LGPD):** o sistema guarda dados pessoais de clientes (CPF, telefone, endereço, assinatura). Hipótese: a empresa assinante é controladora e o orbi é operador (SPEC-0001, A-13).
- **Retenção:** OS, comprovantes, registros de aplicação e movimentações de estoque ficam guardados por no mínimo 5 anos (decisão do usuário).
- **Regulatório:** comprovante de execução e cadastro de produtos seguem a regulamentação sanitária brasileira; conteúdo ainda não validado (`CTX-ASM-20261105-regulatory-certificate-content`).
- **Operação online:** o técnico usa a web pelo celular com internet; sem offline no MVP.
- **Equipe:** um desenvolvedor com apoio de IA → monólito, poucas peças para manter.
- **Infraestrutura:** VPS própria com Docker (`CTX-DEC-20261105-tech-stack`); a VPS é ponto único de falha, mitigado por backup externo.
- **Idioma e formato:** interface pt-BR, R$, DD/MM/AAAA, fuso America/Sao_Paulo.
- **Aprovação humana:** contratar serviços pagos, deploy em produção, ações destrutivas e entrada de dados reais exigem aprovação explícita do usuário (`plan.md` da SPEC-0001).
- **Segurança do contexto:** nenhum segredo/credencial pode ser persistido em `Context/` ou `Specs/` (apenas nomes de variáveis).
- **Escrita controlada:** `Context/` só é atualizado sob gatilho explícito do usuário (`salvar contexto` e equivalentes), salvo a exceção de `DEC` do SDD.
- **Portabilidade de agentes:** instruções compartilhadas vivem em `AGENTS.md`; arquivos de ferramentas (ex.: `CLAUDE.md`) são adaptadores.

## Desconhecidas

- Orçamento mensal de infraestrutura.
- Prazo desejado para o MVP.
- Modelo comercial do SaaS (planos, preço, teste grátis) — SPEC-0001 OQ-10.
