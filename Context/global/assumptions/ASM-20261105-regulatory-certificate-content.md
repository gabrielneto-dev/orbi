---
id: CTX-ASM-20261105-regulatory-certificate-content
type: assumption
title: Conteúdo do comprovante de execução segue a regulamentação da ANVISA (RDC 52/2009 → RDC 622/2022), ainda não validado
branch: global
tags: [domain, regulatory]
status: active
confidence: low
created_at: 2026-11-05
updated_at: 2026-11-05
related: [CTX-DEC-20261105-product-scope-saas-pest-control]
valid_from: 2026-11-05
revisit_at: 2027-05-05
---

# Assumption: conteúdo regulatório do comprovante de execução

## Assumption

Empresas brasileiras de controle de vetores e pragas urbanas são reguladas pela ANVISA (RDC nº 52/2009,
substituída pela RDC nº 622/2022) e por normas estaduais/municipais. O comprovante de execução de serviço
deve trazer, no mínimo: identificação da empresa com licenças sanitária e ambiental e validades, responsável
técnico e registro profissional, cliente e endereço, data, pragas-alvo, produtos usados (nome, grupo químico,
princípio ativo, concentração de uso, quantidade), orientações ao cliente, telefone do Centro de Informação
e Assistência Toxicológica e prazo de garantia.

## Basis

Conhecimento geral do agente sobre a regulamentação; **nenhuma fonte foi consultada nem registrada** em `sources/`.

## Why it matters

Define `SPEC-0001/REQ-031` e os dados obrigatórios do cadastro de produtos químicos (`REQ-011`). Um comprovante
incompleto expõe as empresas assinantes a autuação sanitária.

## How to validate

Revisão de um comprovante de exemplo por um responsável técnico (tarefa `SPEC-0001-T068`) e leitura da norma
vigente e da legislação local das primeiras empresas assinantes. Ao validar, registrar a fonte em `sources/` e
promover para `fact` ou corrigir.

## Temporal note

Legislação muda; reavaliar em `revisit_at` ou antes de cada nova empresa em outro estado.
