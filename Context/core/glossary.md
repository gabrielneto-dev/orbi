---
id: CTX-SUM-20261104-glossary
type: summary
title: Glossário do projeto
branch: core
tags: [glossary, context-engineering, domain]
status: active
created_at: 2026-11-04
updated_at: 2026-11-05
---

# Glossary

## Domínio

- **orbi** — plataforma SaaS de gestão para empresas de controle de pragas (`CTX-SUM-20261104-overview`).
- **Dedetizadora / empresa assinante / tenant** — empresa de controle de vetores e pragas urbanas que usa o orbi; seus dados são isolados das demais.
- **admin_plataforma** — perfil da equipe do orbi que administra empresas, sem acesso aos dados operacionais delas.
- **Perfis da empresa** — `secretaria`, `comercial`, `tecnico` (operador de campo), `gestor` (gestor geral), `financeiro`.
- **Cliente** — pessoa física ou jurídica atendida pela dedetizadora.
- **Local de atendimento** — endereço de um cliente onde o serviço é feito; um cliente pode ter vários.
- **Área** — parte nomeada de um local (cozinha, depósito, área externa); pode ser criada pelo técnico em campo.
- **Planta / croqui** — imagem do local onde se marca a posição de cada dispositivo.
- **Serviço** — tipo de trabalho do catálogo (desinsetização, desratização, descupinização, limpeza de reservatório), com prazo de garantia.
- **Praga-alvo** — praga que o serviço combate (baratas, ratos, cupins…).
- **Produto químico** — produto aplicado, com princípio ativo, grupo químico, concentração e registro no órgão competente.
- **Lote** — partida de um produto com data de validade; lote vencido não pode ser aplicado.
- **Proposta comercial** — orçamento com itens, valores e validade; tem versões; aprovada vira contrato ou OS avulsa.
- **Contrato** — acordo de serviços recorrentes com vigência e periodicidade; ao entrar em vigor gera as OS previstas.
- **Periodicidade** — regra de repetição de um serviço do contrato: a cada N dias/semanas/meses/anos, número fixo de visitas, ou sob demanda.
- **OS (ordem de serviço)** — visita/execução de serviço num local, atribuída a um técnico; ciclo `prevista → agendada → em_execucao → concluida`.
- **Comprovante de execução** — PDF emitido na conclusão da OS com os dados regulatórios do serviço.
- **Dispositivo de monitoramento** — equipamento deixado no cliente (porta-isca, ratoeira, armadilha luminosa, placa adesiva), com código individual; inspecionado a cada visita.
- **Inventário do local** — lista (e planta) dos dispositivos atualmente instalados num local.
- **Almoxarifado / veículo** — locais de estoque; o veículo é o estoque que o técnico leva a campo.
- **RT (responsável técnico)** — profissional habilitado responsável pelos serviços da dedetizadora.
- **CIATox** — Centro de Informação e Assistência Toxicológica, cujo telefone consta do comprovante.
- **Retorno em garantia** — nova OS dentro do prazo de garantia de um serviço já executado.

## Sistema de contexto

- **Branch (de contexto)** — área relativamente independente de conhecimento em `Context/branches/`. Não confundir com branch git.
- **Registro atômico** — arquivo Markdown com frontmatter que trata de um único assunto (fact, decision, question...).
- **L0/L1/L2/L3** — níveis de carregamento: orientação global → índice de branch → registros → evidências.
- **Checkpoint** — fotografia compacta de continuidade criada a cada `salvar contexto`.
- **Supersession** — substituição de um registro por outro, preservando ambos (`supersedes`/`superseded_by`).
- **SDD / Spec** — Spec-Driven Development; specs `SPEC-NNNN` em `Specs/` (protocolo em `Specs/README.md`).
- **Catálogo** — `_meta/catalog.jsonl`, índice derivado e reconstruível dos registros.
