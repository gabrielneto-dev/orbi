---
id: SPEC-0001
title: Plataforma SaaS de gestão para empresas de controle de pragas (MVP)
status: planned
level: critical
priority: high
created_at: 2026-11-05
updated_at: 2026-11-05
dependencies: []
context_refs: [CTX-QUE-20261104-project-purpose-and-scope, CTX-QUE-20261104-project-type-and-stack, CTX-DEC-20261105-tech-stack]
supersedes: null
superseded_by: null
---

# Specification: Plataforma SaaS de gestão para empresas de controle de pragas (MVP)

## Problem

Empresas de controle de vetores e pragas urbanas (dedetizadoras), de pequeno a grande porte, precisam
conduzir todo o ciclo do atendimento — do orçamento ao serviço executado em campo — com rastreabilidade
do que foi aplicado, onde e por quem. Sem um sistema único, propostas, contratos, ordens de serviço,
consumo de produtos e os dispositivos de monitoramento instalados nos clientes (ratoeiras, porta-iscas,
armadilhas) ficam dispersos, e a empresa não sabe com segurança o que deixou instalado em cada cliente,
o que gastou de estoque (no almoxarifado e nos veículos) e quais documentos de execução emitiu.

## Objective

Entregar o **orbi**, uma plataforma web **SaaS multiempresa**: cada dedetizadora assinante usa o sistema
com seus próprios dados, isolados das demais, para:

1. cadastrar clientes, locais de atendimento, suas áreas e plantas;
2. manter o catálogo de serviços, produtos e dispositivos de monitoramento;
3. emitir propostas comerciais e convertê-las em contratos ou ordens de serviço;
4. planejar e executar ordens de serviço em campo, registrando produtos aplicados e inspeção de dispositivos;
5. controlar o estoque de forma simples, no almoxarifado e em cada veículo, com baixa automática pelas OS;
6. saber, a qualquer momento, quais dispositivos estão instalados em cada cliente, em qual área e em que ponto da planta;
7. gerar os documentos (proposta, contrato, OS, comprovante de execução) em PDF.

## Scope

Módulos do MVP:

- **M0 — Plataforma:** empresas assinantes (tenants), isolamento de dados e administração da plataforma.
- **M1 — Acesso:** usuários, perfis (secretária, comercial, técnico de campo, gestor geral, financeiro) e permissões dentro de cada empresa.
- **M2 — Clientes:** pessoas físicas/jurídicas, contatos, locais de atendimento e áreas de cada local.
- **M3 — Catálogo:** serviços, pragas-alvo, produtos (químicos e materiais) e tipos de dispositivo.
- **M4 — Propostas comerciais:** criação, versionamento, PDF, aprovação/recusa e expiração.
- **M5 — Contratos:** geração a partir de proposta aprovada, vigência, periodicidade configurável e geração das OS previstas.
- **M6 — Ordens de serviço:** agendamento, execução em campo pelo técnico, conclusão e comprovante de execução.
- **M7 — Dispositivos de monitoramento:** instalação por local/área, posição na planta, inspeção a cada visita, retirada e inventário por cliente.
- **M8 — Estoque:** almoxarifado e veículos, entradas, transferências, saídas (consumo por OS), ajustes, lote/validade e estoque mínimo.
- **M9 — Documentos e painel:** PDFs, numeração sequencial e painel operacional com alertas.

## Out of Scope

- Módulo financeiro das empresas: faturamento, contas a receber/pagar, boletos, Pix, conciliação, emissão de NFS-e (decisão do usuário em 2026-11-05: "de início não").
- Cobrança das assinaturas do orbi, planos e limites de uso, cadastro self-service de novas empresas, domínio próprio/white-label (ver OQ-10).
- Acesso da equipe do orbi aos dados operacionais das empresas para suporte.
- Aplicativo nativo e funcionamento offline (OQ-02 respondida: técnicos raramente ficam sem sinal).
- Envio automático por e-mail/WhatsApp, portal do cliente, roteirização/GPS, assinatura eletrônica com validade jurídica (ICP-Brasil).
- Compras e cadastro de fornecedores além do registro na entrada de estoque.
- Relatórios analíticos avançados (tendência de capturas, mapas de calor) — candidatos para specs futuras.

## Functional Requirements

### M0 — Plataforma (multiempresa)

- **REQ-061** — Cada empresa assinante (tenant) tem seus dados totalmente isolados: todo registro (clientes, catálogo, propostas, contratos, OS, estoque, dispositivos, anexos, PDFs, auditoria) pertence a exatamente uma empresa, e um usuário de uma empresa nunca lê nem altera dados de outra, por nenhuma tela, API, URL de arquivo ou documento gerado.
- **REQ-062** — Um perfil `admin_plataforma` (equipe do orbi), separado dos perfis das empresas, cria, suspende e reativa empresas e cria o primeiro usuário `gestor` de cada uma. Esse perfil não acessa dados operacionais das empresas no MVP, e suas ações ficam na auditoria da plataforma.
- **REQ-063** — Empresa `suspensa` não permite login de seus usuários; seus dados são preservados integralmente e voltam a ficar acessíveis na reativação.
- **REQ-064** — Configurações (REQ-045), catálogo, modelos de contrato, numeração de documentos, códigos de dispositivo, veículos e regras de unicidade (CPF/CNPJ de clientes) são independentes por empresa: duas empresas podem ter o mesmo cliente, o mesmo código `D-0001` e a mesma numeração `PROP-2026-0001` sem conflito.

### M1 — Acesso

- **REQ-001** — O sistema exige autenticação por usuário individual; não há acesso anônimo a nenhum dado.
- **REQ-002** — Cada usuário pertence a uma empresa e tem um ou mais perfis entre: `secretaria`, `comercial`, `tecnico`, `gestor`, `financeiro`. As permissões por perfil seguem a matriz de `Business Rules` (BR-01) e são verificadas no servidor.
- **REQ-003** — O gestor cria, edita, desativa e reativa usuários da sua empresa e atribui perfis. Usuário desativado não consegue entrar, mas seu histórico (OS executadas, documentos emitidos) é preservado.
- **REQ-004** — O sistema registra trilha de auditoria (quem, quando, o quê, valor anterior/novo) para criação, alteração, cancelamento e mudança de status de clientes, propostas, contratos, OS, movimentações de estoque e dispositivos.

### M2 — Clientes

- **REQ-005** — Cadastro de cliente pessoa física (nome, CPF) ou jurídica (razão social, nome fantasia, CNPJ), com telefones, e-mails e contatos nomeados. CPF/CNPJ são validados (dígitos verificadores) e únicos entre os clientes ativos da mesma empresa.
  Changed 2026-11-05: "únicos entre clientes ativos" → "únicos entre os clientes ativos da mesma empresa" (modelo SaaS, REQ-064).
- **REQ-006** — Um cliente possui um ou mais **locais de atendimento** (endereço completo, tipo de imóvel, observações de acesso, contato no local).
- **REQ-007** — Cada local possui zero ou mais **áreas** nomeadas (ex.: cozinha, depósito, área externa) usadas para registrar onde serviços foram aplicados e onde dispositivos estão instalados. O técnico pode criar uma área nova durante a execução de uma OS do local; a área fica marcada como "criada em campo" com o usuário e a OS.
  Changed 2026-11-05: adicionada criação de área pelo técnico em campo (resposta OQ-01).
- **REQ-008** — A ficha do cliente mostra, por local: propostas, contratos, OS (histórico e próximas), comprovantes emitidos, plantas e dispositivos atualmente instalados.

### M3 — Catálogo

- **REQ-009** — Cadastro de **serviços** (ex.: desinsetização, desratização, descupinização, limpeza de reservatório de água), com descrição, pragas-alvo, duração estimada, preço de referência, prazo de garantia em dias e status ativo/inativo.
- **REQ-010** — Cadastro de **pragas-alvo** (ex.: baratas, ratos, cupins, formigas, mosquitos) reutilizáveis em serviços, propostas e OS.
- **REQ-011** — Cadastro de **produtos químicos** com: nome comercial, fabricante, princípio ativo, grupo químico, concentração, número de registro no órgão competente (MS/ANVISA), ação tóxica/antídoto, unidade de medida e estoque mínimo.
- **REQ-012** — Cadastro de **materiais e equipamentos** de consumo (ex.: iscas, placas adesivas, EPIs) com unidade de medida e estoque mínimo.
- **REQ-013** — Cadastro de **tipos de dispositivo de monitoramento** (ex.: porta-isca, ratoeira, armadilha luminosa, placa adesiva) e indicação de se o dispositivo é controlado por unidade (com código individual).

### M4 — Propostas comerciais

- **REQ-014** — O comercial (ou gestor) cria proposta para um cliente e um ou mais de seus locais, com itens (serviço, quantidade/área, periodicidade, valor unitário, desconto), condições comerciais, prazo de validade e observações.
- **REQ-015** — Ciclo de vida da proposta: `rascunho → enviada → aprovada | recusada | expirada`, e `cancelada` a partir de `rascunho` ou `enviada`. Recusa registra motivo.
- **REQ-016** — Alterar uma proposta já `enviada` cria nova **versão** (mesmo número, versão incrementada); versões anteriores ficam somente leitura e consultáveis.
- **REQ-017** — O sistema gera o PDF da proposta com dados da empresa, do cliente, itens, valores, condições e validade, seguindo o modelo de layout da empresa (OQ-06).
- **REQ-018** — Proposta `enviada` cuja validade passou é marcada como `expirada` e não pode ser aprovada; para retomá-la é preciso gerar nova versão com nova validade.
- **REQ-019** — Proposta `aprovada` pode originar um **contrato** (serviços recorrentes) ou uma ou mais **OS avulsas** (serviço pontual), herdando cliente, locais, itens e valores.

### M5 — Contratos

- **REQ-020** — Contrato contém: cliente, locais cobertos, serviços e a periodicidade de cada um (REQ-058), valor total e forma de pagamento (texto informativo), data de início, vigência, cláusulas a partir de um **modelo de contrato** editável pelo gestor, e referência à proposta de origem quando houver.
  Changed 2026-11-05: periodicidade "mensal, bimestral, trimestral" → regra configurável de REQ-058 (resposta OQ-04).
- **REQ-021** — Ciclo de vida do contrato: `rascunho → vigente → encerrado`, com `suspenso` (reversível para `vigente`) e `cancelado` (com motivo). Um contrato `vigente` não tem cláusulas/valores editáveis; mudanças exigem aditivo registrado (nova versão vinculada).
- **REQ-022** — Ao tornar-se `vigente`, o contrato gera as OS previstas para a vigência conforme a regra de periodicidade de cada serviço (REQ-058), com status `prevista` e data-alvo; serviços `sob demanda` não geram OS automaticamente. Suspensão/cancelamento cancela as OS previstas futuras ainda não executadas.
  Changed 2026-11-05: adicionada exceção para serviços sob demanda (resposta OQ-04).
- **REQ-023** — O sistema gera o PDF do contrato a partir do modelo, preenchendo as variáveis (dados das partes, serviços, periodicidade, valor, vigência).
- **REQ-024** — O painel lista contratos que vencem em até N dias (N configurável, padrão 30) para ação de renovação; renovar cria novo contrato vinculado ao anterior.
- **REQ-058** — Periodicidade configurável por serviço do contrato: (a) recorrente a cada N dias, semanas, meses ou anos, com preferência opcional de dia da semana ou dia do mês e data da primeira visita; (b) número fixo de visitas distribuídas na vigência; (c) `sob demanda`, em que as OS são criadas a partir do contrato quando o cliente chama, opcionalmente com limite de chamados na vigência. O sistema mostra a prévia das datas antes de ativar o contrato.

### M6 — Ordens de serviço

- **REQ-025** — OS pode ser criada manualmente (secretária, comercial, gestor), a partir de proposta aprovada ou gerada por contrato. Contém cliente, local, áreas, serviços, pragas-alvo, data/hora agendada, técnico(s) responsável(is), veículo (padrão: veículo do técnico principal) e instruções.
  Changed 2026-11-05: adicionado veículo da OS (resposta OQ-08).
- **REQ-026** — Ciclo de vida da OS: `prevista → agendada → em_execucao → concluida`, com `reagendada` (registra data anterior e motivo, volta a `agendada`) e `cancelada` (com motivo). OS `concluida` não é editável, exceto por correção do gestor registrada em auditoria.
- **REQ-027** — O técnico vê, em tela utilizável no celular, apenas as OS atribuídas a ele, ordenadas por data, com endereço, contato no local, instruções, dispositivos instalados no local e acesso às plantas do local.
- **REQ-028** — Na execução o técnico registra: início e fim (data/hora), áreas tratadas, pragas encontradas e nível de infestação, produtos aplicados (produto, lote, quantidade, diluição/concentração de uso, área), inspeção dos dispositivos do local (M7), fotos, observações e recomendações ao cliente.
- **REQ-029** — A conclusão da OS exige: início e fim registrados, ao menos um serviço executado, ao menos um produto aplicado **ou** a marcação explícita "sem aplicação de produto" com justificativa, inspeção de todos os dispositivos ativos do local **ou** justificativa por dispositivo não inspecionado, e assinatura do cliente/responsável no local (desenho na tela + nome) **ou** justificativa de ausência.
- **REQ-030** — A conclusão da OS gera automaticamente a saída de estoque dos produtos e materiais aplicados a partir do local de estoque da OS (o veículo da OS; sem veículo, o almoxarifado) e libera o **comprovante de execução de serviço** em PDF.
  Changed 2026-11-05: saída de "estoque único" → "local de estoque da OS (veículo ou almoxarifado)" (resposta OQ-08).
- **REQ-031** — O comprovante de execução contém, no mínimo: identificação da empresa (razão social, CNPJ, endereço, telefone, licença sanitária e ambiental com validade), responsável técnico e seu registro profissional, cliente e endereço do local, data da execução, pragas-alvo, serviços executados, para cada produto o nome, grupo químico, princípio ativo, concentração de uso e quantidade aplicada, orientações ao cliente, telefone do Centro de Informação e Assistência Toxicológica e prazo de garantia (ver A-04).
- **REQ-032** — A secretária e o gestor veem a agenda de OS por dia/semana e por técnico, e podem reatribuir técnico e reagendar.

### M7 — Dispositivos de monitoramento

- **REQ-033** — Um dispositivo controlado por unidade tem código único na empresa e ciclo: `em_estoque → instalado → retirado | perdido | danificado`, podendo voltar a `em_estoque` após retirada. `em_estoque` aponta para um local de estoque (almoxarifado ou veículo). `instalado` sempre aponta para cliente, local e área, com data de instalação e OS que o instalou.
  Changed 2026-11-05: `em_estoque` passa a indicar o local de estoque (resposta OQ-08); unicidade "na empresa" = por tenant (REQ-064).
- **REQ-034** — Durante a OS o técnico pode instalar, substituir, reposicionar (mudar de área ou de ponto na planta) e retirar dispositivos; cada ação fica vinculada à OS.
- **REQ-035** — Em cada inspeção o técnico registra por dispositivo: situação (ok, consumo de isca com percentual, captura com quantidade/espécie, danificado, não encontrado), ação tomada (nenhuma, reposição de isca, troca de placa, substituição) e observação. Dispositivo "não encontrado" passa a `perdido` após confirmação do gestor.
- **REQ-036** — Inventário por cliente/local: lista de todos os dispositivos atualmente instalados, agrupada por área, com data da última inspeção e situação, em tela e em PDF. Quando o local tem planta (REQ-055), o PDF inclui também a planta com as marcações.
  Changed 2026-11-05: "lista (croqui textual)" → lista por área **e** planta com marcações (resposta OQ-03).
- **REQ-037** — Ao encerrar ou cancelar um contrato, o sistema alerta se ainda há dispositivos instalados nos locais cobertos e permite gerar uma OS de retirada.
- **REQ-055** — Plantas do local: o gestor, a secretária ou o técnico (durante a OS) anexam uma ou mais plantas/croquis por local (imagem PNG/JPG ou PDF de uma página) e marcam sobre elas a posição de cada dispositivo instalado. Instalar, reposicionar ou retirar o dispositivo atualiza a marcação; a planta exibe legenda com código, tipo e área. Substituir a imagem da planta preserva a versão anterior e exige reposicionar as marcações.

### M8 — Estoque

- **REQ-038** — Saldo por item (produto químico ou material) **por local de estoque** e, para químicos, por lote com data de validade. Unidade única por item. O sistema mostra o saldo consolidado da empresa e o saldo de cada local.
  Changed 2026-11-05: saldo de "almoxarifado único" → "por local de estoque" (resposta OQ-08).
- **REQ-039** — Movimentações: `entrada` (quantidade, lote, validade, nota/fornecedor opcional, local de destino), `transferencia` (REQ-057), `saida_os` (automática pela OS), `ajuste` (inventário de um local, com motivo) e `perda/descarte` (com motivo). Toda movimentação é imutável; correções são feitas por nova movimentação.
  Changed 2026-11-05: adicionados `transferencia` e o local de estoque em cada movimentação (resposta OQ-08).
- **REQ-040** — O sistema impede registrar na OS a aplicação de lote vencido ou de produto inativo.
- **REQ-041** — O painel alerta itens com saldo consolidado abaixo do estoque mínimo, lotes vencendo em até N dias (padrão 30) e saldos negativos em qualquer local (ver BR-07).
- **REQ-042** — Extrato por item, filtrável por local de estoque, mostrando todas as movimentações com data, tipo, quantidade, lote, local de origem/destino, usuário e OS de origem.
- **REQ-056** — Locais de estoque: cada empresa tem um almoxarifado central e zero ou mais **veículos** (placa, descrição, técnico responsável, ativo/inativo). Um técnico tem no máximo um veículo ativo atribuído por vez.
- **REQ-057** — Transferência entre locais (almoxarifado → veículo, veículo → almoxarifado, veículo → veículo) de itens com quantidade e lote, e de dispositivos `em_estoque`. A transferência registra saída na origem e entrada no destino de forma atômica (ou ambas acontecem, ou nenhuma), com usuário e data.

### M9 — Documentos e painel

- **REQ-043** — Propostas, contratos, OS e comprovantes recebem numeração sequencial por empresa, tipo e ano (ex.: `PROP-2026-0001`), única e nunca reutilizada, inclusive quando o documento é cancelado.
  Changed 2026-11-05: numeração passa a ser por empresa (REQ-064).
- **REQ-044** — Documentos emitidos não são excluídos; apenas cancelados com motivo, permanecendo consultáveis.
- **REQ-045** — Dados da empresa (razão social, CNPJ, endereço, logotipo, licenças e validades, responsável técnico e registro, telefone do CIATox) são configuráveis pelo gestor de cada empresa e usados nos PDFs dela.
- **REQ-046** — Painel inicial por perfil com: OS do dia e atrasadas, propostas aguardando resposta e a expirar, contratos a vencer, alertas de estoque, dispositivos com ocorrência na última inspeção e licenças da empresa a vencer.
- **REQ-047** — Busca e filtros em listas de clientes, propostas, contratos e OS (por cliente, status, período, técnico, número do documento).

## Non-Functional Requirements

- **REQ-048** — Aplicação web responsiva: todas as telas do perfil `tecnico` são utilizáveis em celular com largura de 360 px sem rolagem horizontal; as demais telas são otimizadas para desktop e utilizáveis em tablet. Requer conexão à internet; o progresso da execução da OS é salvo por etapa.
  Changed 2026-11-05: confirmada operação online (resposta OQ-02).
- **REQ-049** — Segurança: senhas armazenadas apenas com hash adaptativo (ex.: Argon2/bcrypt), sessão expira após inatividade configurável, todo tráfego via HTTPS, e cada endpoint verifica autenticação, empresa (REQ-061) e autorização (BR-01) no servidor.
- **REQ-050** — Privacidade (LGPD): dados pessoais (CPF, telefone, e-mail, endereço, assinatura) acessíveis apenas a perfis que precisam deles; existe exportação dos dados de um titular e anonimização de cliente sem documentos ativos, preservando os dados exigidos pela retenção de REQ-060.
  Changed 2026-11-05: retenção definida em REQ-060 (resposta OQ-05).
- **REQ-051** — Interface, datas, números e moeda em pt-BR (DD/MM/AAAA, R$, vírgula decimal), fuso horário `America/Sao_Paulo`.
- **REQ-052** — Fotos, assinaturas e plantas anexadas são armazenadas de forma durável, associadas ao registro de origem; fotos e assinaturas não são editáveis após a conclusão da OS.
- **REQ-053** — Backup automático diário dos dados e anexos, com restauração testada antes de entrar em produção.
- **REQ-054** — Uso concorrente: duas pessoas editando o mesmo registro não sobrescrevem silenciosamente uma à outra (detecção de conflito na gravação).
- **REQ-059** — Capacidade: a plataforma atende empresas de todos os portes. Meta mínima (hipótese A-10): até 200 usuários e 10.000 OS/mês por empresa, e 100 empresas ativas, mantendo p95 abaixo de 2 s nas listagens filtradas e nas telas do técnico, e abaixo de 10 s na geração de PDF.
- **REQ-060** — Retenção: OS, comprovantes de execução, registros de aplicação de produtos e movimentações de estoque são mantidos por no mínimo 5 anos a partir da emissão/execução, mesmo após anonimização do cliente, encerramento de contrato ou suspensão da empresa.

## Business Rules

- **BR-01 — Matriz de permissões (validada pelo usuário em 2026-11-05, OQ-01):**

  | Ação | secretaria | comercial | tecnico | gestor | financeiro |
  |---|---|---|---|---|---|
  | Clientes, locais | criar/editar | criar/editar | ler (das suas OS) | tudo | ler |
  | Áreas e plantas do local | criar/editar | criar/editar | criar durante a OS | tudo | ler |
  | Catálogo (serviços, produtos, dispositivos) | ler | ler | ler | tudo | ler |
  | Propostas | ler | criar/editar/enviar | — | tudo | ler |
  | Contratos | ler | criar/editar, cancelar | — | tudo, ativar, cancelar | ler |
  | OS: criar/agendar/reatribuir | sim | sim | — | sim | ler |
  | OS: executar/concluir | — | — | só as atribuídas | sim | — |
  | Estoque: entrada/transferência | sim | — | ler (seu veículo) | tudo | ler |
  | Estoque: ajuste/perda | — | — | — | sim | ler |
  | Usuários, veículos, configurações, modelos de contrato | — | — | — | tudo | — |
  | Valores monetários | ler | sim | **não vê** | sim | ler |

  O perfil `admin_plataforma` (REQ-062) fica fora desta matriz: administra empresas, não seus dados.
  Changed 2026-11-05: secretária vê valores, técnico cria áreas, comercial cancela contrato, técnico continua sem ver valores; adicionadas linhas de plantas, transferências e veículos.

- **BR-02** — Proposta só é aprovada se estiver `enviada` e dentro da validade.
- **BR-03** — Um contrato só fica `vigente` com ao menos um local, um serviço com periodicidade (REQ-058), data de início e vigência definidas.
- **BR-04** — OS gerada por contrato pertence ao contrato; não pode ser movida para outro contrato.
- **BR-05** — Técnico só inicia OS no status `agendada` e atribuída a ele; apenas um técnico responsável principal por OS (auxiliares opcionais).
- **BR-06** — Garantia do serviço: data de execução + prazo de garantia do serviço; nova OS dentro da garantia pode ser marcada como "retorno em garantia" e vinculada à OS original.
- **BR-07** — A conclusão de OS em campo **não é bloqueada** por saldo insuficiente no local de estoque da OS; a saída é registrada, o saldo daquele local pode ficar negativo e gera alerta de divergência para o gestor regularizar (transferência ou ajuste).
- **BR-08** — Um dispositivo só pode estar instalado em um local/área por vez; código de dispositivo nunca é reutilizado dentro da empresa.
- **BR-09** — Cancelamentos (proposta, contrato, OS) exigem motivo e ficam na auditoria.
- **BR-10** — Nenhuma regra de negócio, busca, numeração, unicidade ou relatório considera dados de outra empresa (REQ-061, REQ-064).

## User Scenarios

1. **Nova empresa assinante:** a equipe do orbi cadastra a dedetizadora "Alfa" e o gestor dela; o gestor configura dados da empresa, licenças, responsável técnico, usuários, veículos e catálogo.
2. **Do orçamento ao contrato:** o comercial cadastra o restaurante "X", cria uma proposta com desratização a cada 15 dias e desinsetização trimestral, gera o PDF e marca como enviada. O cliente aprova; o comercial gera o contrato de 12 meses, confere a prévia das datas, o gestor o ativa e o sistema cria as OS previstas.
3. **Abastecer o veículo:** a secretária transfere do almoxarifado para o veículo do técnico 2 kg de raticida (lote L) e 10 porta-iscas.
4. **Execução em campo:** o técnico abre a OS no celular, inicia, registra o gel aplicado na cozinha, cria a área "Doca" que não existia, instala 6 porta-iscas e os marca na planta, inspeciona as 4 ratoeiras do depósito (uma com captura), tira fotos, coleta a assinatura do gerente e conclui. O estoque do veículo é baixado e o comprovante fica disponível.
5. **"O que deixamos lá?":** o contrato do cliente vai ser encerrado; o gestor abre o inventário do local, vê 10 dispositivos por área e na planta, gera a OS de retirada e, ao final, todos voltam a `em_estoque` ou são baixados como perdidos.
6. **Reposição:** o painel do gestor mostra que o raticida está abaixo do mínimo, um lote vence em 20 dias e o veículo do técnico 3 está com saldo negativo de gel.

## Edge Cases

- Cliente com o mesmo CNPJ e vários locais (rede/franquia) → um cliente, vários locais.
- O mesmo cliente real atendido por duas empresas assinantes → dois cadastros independentes, um em cada empresa.
- OS concluída sem cliente presente → assinatura ausente com justificativa obrigatória.
- Técnico tenta concluir com dispositivo do local não inspecionado → bloqueia até inspecionar ou justificar.
- Proposta aprovada parcialmente (cliente aceita só um item) → nova versão apenas com os itens aceitos antes da aprovação.
- Contrato suspenso com OS já `agendada` → a OS agendada não é cancelada automaticamente; o sistema avisa e pede decisão.
- Periodicidade cuja data cai em dia inexistente (ex.: dia 31 em mês de 30 dias) → usa o último dia do mês.
- Dispositivo encontrado em área diferente da registrada → ação "reposicionar".
- Usuário técnico desativado com OS agendadas → aviso para reatribuição; seu veículo fica sem responsável até nova atribuição.
- OS sem veículo (técnico sem veículo atribuído) → baixa do almoxarifado.
- Veículo inativado com saldo → bloqueado até transferir o saldo para outro local.
- Lote vence entre o agendamento e a execução → bloqueia o lote vencido na execução (REQ-040), outros lotes continuam disponíveis.
- Empresa suspensa com técnico no meio de uma OS → a próxima gravação é recusada com mensagem clara; o que já foi salvo é preservado.
- Perda de conexão durante a execução → o que foi salvo por etapa permanece salvo (REQ-048).

## Acceptance Criteria

- **AC-001** (REQ-001, REQ-049) — Given um visitante não autenticado, When acessa qualquer URL de dados ou de API, Then recebe redirecionamento para login (tela) ou 401 (API) e nenhum dado é retornado.
- **AC-002** (REQ-002, REQ-049) — Given um usuário apenas `tecnico`, When chama diretamente o endpoint de criação de proposta ou de listagem de OS de outro técnico, Then recebe 403 e nada é alterado.
- **AC-003** (REQ-003) — Given um usuário desativado pelo gestor, When tenta entrar, Then o login é negado; e as OS que ele executou continuam exibindo seu nome.
- **AC-004** (REQ-004) — Given uma OS reagendada, When o gestor consulta a auditoria da OS, Then vê usuário, data/hora, data antiga, data nova e motivo.
- **AC-005** (REQ-005) — Given um cliente ativo com CNPJ X na empresa A, When alguém da empresa A cadastra outro cliente com o CNPJ X ou com CNPJ de dígito verificador inválido, Then o cadastro é recusado com mensagem específica.
- **AC-006** (REQ-006, REQ-007, REQ-008) — Given um cliente com 2 locais e 3 áreas no primeiro, When se abre a ficha do cliente, Then cada local mostra suas áreas, OS, contratos, plantas e dispositivos instalados separadamente.
- **AC-007** (REQ-009, REQ-010, REQ-011, REQ-012, REQ-013) — Given o gestor, When cadastra um produto químico sem número de registro ou sem princípio ativo, Then o cadastro é recusado; e serviços/produtos inativos não aparecem para seleção em novas propostas/OS.
- **AC-008** (REQ-014, REQ-017) — Given uma proposta com 2 itens e desconto, When o comercial gera o PDF, Then o PDF mostra número, versão, cliente, locais, itens, subtotal, desconto, total e validade iguais aos da tela.
- **AC-009** (REQ-015, REQ-016) — Given uma proposta `enviada` versão 1, When o comercial altera um valor, Then é criada a versão 2 em `rascunho` e a versão 1 continua consultável sem alteração.
- **AC-010** (REQ-018) — Given uma proposta `enviada` com validade vencida ontem, When alguém tenta aprová-la, Then ela está `expirada` e a aprovação é recusada.
- **AC-011** (REQ-019) — Given uma proposta `aprovada` com serviço recorrente, When o comercial gera o contrato, Then o contrato em `rascunho` herda cliente, locais, itens, valores e referência à proposta.
- **AC-012** (REQ-020, REQ-021, REQ-022) — Given um contrato de 12 meses com um serviço mensal e um trimestral, When o gestor o torna `vigente`, Then são geradas 16 OS `prevista` com datas-alvo distribuídas na vigência, e cláusulas/valores deixam de ser editáveis.
- **AC-013** (REQ-022) — Given um contrato `vigente` com OS previstas futuras, When é cancelado com motivo, Then as OS `prevista` futuras ficam `cancelada` e as OS `concluida` permanecem inalteradas.
- **AC-014** (REQ-023) — Given um modelo de contrato com variáveis, When o PDF do contrato é gerado, Then nenhuma variável aparece sem preenchimento e os dados conferem com o contrato.
- **AC-015** (REQ-024) — Given um contrato que vence em 20 dias e N=30, When o gestor abre o painel, Then o contrato aparece em "a vencer"; e ao renovar é criado novo contrato vinculado ao anterior.
- **AC-016** (REQ-025, REQ-026, REQ-032) — Given uma OS `agendada`, When a secretária a reagenda informando motivo, Then a data anterior e o motivo ficam registrados e a OS aparece na nova data da agenda do técnico.
- **AC-017** (REQ-027, REQ-048) — Given o técnico A logado em um celular de 360 px, When abre a lista de OS, Then vê apenas as OS atribuídas a ele, sem rolagem horizontal, com endereço, contato, dispositivos e plantas do local.
- **AC-018** (REQ-028, REQ-029) — Given uma OS em execução sem produto aplicado e sem a marcação "sem aplicação de produto", When o técnico tenta concluir, Then a conclusão é bloqueada com a lista do que falta.
- **AC-019** (REQ-029, REQ-035) — Given um local com 4 dispositivos ativos e só 3 inspecionados, When o técnico tenta concluir, Then a conclusão é bloqueada até inspecionar o quarto ou justificar.
- **AC-020** (REQ-030, REQ-039) — Given saldo de 100 g do produto P (lote L) no veículo V, When uma OS com veículo V que aplicou 30 g de P/L é concluída, Then o saldo de P/L em V passa a 70 g com movimentação `saida_os` vinculada à OS e o almoxarifado não muda; e se o saldo em V fosse 10 g, a OS conclui, o saldo de V fica −20 g e surge alerta de divergência.
  Changed 2026-11-05: saldo passa a ser do veículo da OS (resposta OQ-08).
- **AC-021** (REQ-031, REQ-045) — Given uma OS concluída com 2 produtos aplicados, When o comprovante é gerado, Then contém todos os campos de REQ-031 preenchidos com os dados da empresa configurados e dos produtos aplicados.
- **AC-022** (REQ-033, REQ-034) — Given o dispositivo D-0001 `em_estoque` no veículo V, When o técnico o instala na área "Depósito" do local L pela OS 10, Then D-0001 fica `instalado` em L/Depósito com data e OS 10; e uma tentativa de instalá-lo em outro local é recusada.
- **AC-023** (REQ-035) — Given um dispositivo marcado "não encontrado" na inspeção, When o gestor confirma, Then ele passa a `perdido` e sai do inventário do local.
- **AC-024** (REQ-036) — Given um local com dispositivos em 3 áreas e uma planta com marcações, When o gestor gera o inventário em PDF, Then o PDF traz a lista agrupada por área (código, tipo, data de instalação, última inspeção, situação) e a planta com as marcações, batendo com a tela.
- **AC-025** (REQ-037) — Given um contrato com 5 dispositivos instalados nos seus locais, When o gestor o encerra, Then o sistema alerta os 5 dispositivos e oferece criar uma OS de retirada já listando-os.
- **AC-026** (REQ-038, REQ-040) — Given o lote L2 do produto P vencido, When o técnico registra aplicação de P, Then L2 não aparece como opção (ou é recusado se enviado diretamente à API).
- **AC-027** (REQ-039, REQ-042) — Given uma movimentação registrada, When qualquer usuário tenta editá-la ou excluí-la, Then não é possível; o ajuste é feito por nova movimentação que aparece no extrato com motivo e usuário.
- **AC-028** (REQ-041, REQ-046) — Given um item com saldo consolidado abaixo do mínimo e um lote vencendo em 15 dias, When o gestor abre o painel, Then ambos aparecem em alertas de estoque.
- **AC-029** (REQ-043, REQ-044) — Given a proposta `PROP-2026-0003` cancelada com motivo, When a próxima proposta da mesma empresa é criada, Then recebe `PROP-2026-0004`, e a 0003 continua consultável como cancelada.
- **AC-030** (REQ-047) — Given 50 OS de vários técnicos, When a secretária filtra por técnico B e período da semana, Then vê exatamente as OS de B naquele período.
- **AC-031** (REQ-002) — Given um usuário apenas `tecnico`, When visualiza uma OS, Then valores monetários de proposta/contrato não são exibidos nem retornados pela API; e Given um usuário `secretaria`, Then os valores são exibidos somente leitura.
  Changed 2026-11-05: adicionada visualização de valores pela secretária (resposta OQ-01).
- **AC-032** (REQ-050, REQ-060) — Given um cliente sem contratos vigentes nem OS abertas, When o gestor solicita anonimização, Then dados pessoais são substituídos e as OS/comprovantes com menos de 5 anos permanecem com os dados exigidos.
- **AC-033** (REQ-051) — Given qualquer tela ou PDF, When exibe data, valor ou quantidade, Then usa DD/MM/AAAA, R$ e vírgula decimal.
- **AC-034** (REQ-052) — Given uma OS concluída com 3 fotos e assinatura, When qualquer usuário tenta substituir ou remover um anexo, Then não é possível e os anexos continuam acessíveis na OS.
- **AC-035** (REQ-053) — Given o ambiente de homologação, When se executa o procedimento de restauração do último backup, Then os dados e anexos restaurados conferem com a origem (verificação manual documentada).
- **AC-036** (REQ-054) — Given dois usuários com a mesma proposta aberta, When ambos salvam alterações, Then o segundo recebe aviso de conflito e nenhuma alteração é perdida silenciosamente.
- **AC-037** (REQ-061, REQ-049) — Given as empresas A e B com dados cadastrados, When um usuário `gestor` de A tenta ler, por tela, API ou URL direta de arquivo/PDF, qualquer cliente, OS, anexo ou documento de B (usando IDs válidos de B), Then recebe 404/403 e nenhum dado de B é retornado; o teste cobre todas as entidades de M2–M9.
- **AC-038** (REQ-062, REQ-063) — Given o `admin_plataforma`, When cria a empresa C com seu gestor, Then o gestor consegue entrar e a empresa começa vazia; When suspende C, Then nenhum usuário de C consegue entrar; When reativa C, Then os dados estão intactos; e o `admin_plataforma` não consegue listar clientes ou OS de C.
- **AC-039** (REQ-064) — Given a empresa A com cliente CNPJ X, dispositivo `D-0001` e proposta `PROP-2026-0001`, When a empresa B cadastra o mesmo CNPJ X, o código `D-0001` e cria sua primeira proposta, Then todos os cadastros são aceitos e a proposta de B recebe `PROP-2026-0001`.
- **AC-040** (REQ-058, REQ-022) — Given um contrato de 6 meses iniciando em 01/03 com um serviço "a cada 15 dias" e outro "sob demanda", When o usuário pede a prévia e depois ativa, Then a prévia lista as datas a cada 15 dias dentro da vigência, as OS geradas correspondem exatamente à prévia, e nenhuma OS é gerada para o serviço sob demanda até alguém criá-la a partir do contrato.
- **AC-041** (REQ-007) — Given um técnico executando a OS 20 no local L, When cria a área "Doca", Then a área passa a existir em L marcada como "criada em campo" com o técnico e a OS 20, e pode ser usada para aplicações e dispositivos na mesma OS.
- **AC-042** (REQ-055, REQ-034) — Given o local L com uma planta, When o técnico instala D-0007 marcando um ponto na planta e depois o reposiciona para outro ponto, Then a planta mostra D-0007 só na posição nova, com legenda (código, tipo, área), e a auditoria guarda a posição anterior.
- **AC-043** (REQ-056, REQ-057) — Given 2 kg do item R (lote L) no almoxarifado, When a secretária transfere 500 g de R/L para o veículo V, Then o almoxarifado fica com 1,5 kg, V com 500 g, o saldo consolidado continua 2 kg e o extrato mostra as duas pontas da mesma transferência; e se a gravação falhar no meio, nenhum dos dois saldos muda.
- **AC-044** (REQ-056) — Given o técnico T com o veículo V1 ativo, When o gestor tenta atribuir também o veículo V2 a T, Then a atribuição é recusada até V1 ser desatribuído.
- **AC-045** (REQ-059) — Given uma empresa de teste com 200 usuários, 120.000 OS (12 meses × 10.000) e 100 empresas na base, When se executa o teste de carga das listagens filtradas, telas do técnico e geração de PDF, Then o p95 fica abaixo de 2 s nas telas e de 10 s nos PDFs.
- **AC-046** (REQ-060) — Given uma OS concluída há 4 anos e 11 meses de um cliente anonimizado, When o gestor consulta a OS, Then o comprovante e os registros de aplicação continuam disponíveis.

## Dependencies

- Nenhuma spec anterior.
- Stack técnica decidida em `CTX-DEC-20261105-tech-stack` (2026-11-05); a spec continua independente de implementação e o `plan.md` aplica essa decisão.
- Modelos de proposta e contrato da empresa, que o usuário vai enviar (OQ-06): necessários para o layout dos PDFs (REQ-017, REQ-023), não para o comportamento.
- Geração de PDF, armazenamento de arquivos (fotos, assinaturas, plantas) e hospedagem: a definir no plano.

## Assumptions

<!-- Hipóteses explícitas e reversíveis. Não são requisitos confirmados. -->

- ~~**A-01**~~ revogada 2026-11-05 — era "uma única empresa (uso interno)"; o usuário definiu **SaaS multiempresa** (REQ-061..064).
- **A-02** — Confirmada 2026-11-05 (OQ-02): o técnico usa a aplicação web no celular, com internet; sem offline no MVP.
- **A-03** — O perfil `financeiro` no MVP apenas consulta valores de propostas, contratos e OS (sem cobrança), já que o módulo financeiro está fora do escopo.
- **A-04** — O conteúdo mínimo do comprovante de execução (REQ-031) e as obrigações da empresa (responsável técnico, licenças) foram inferidos da regulamentação sanitária brasileira para empresas de controle de vetores e pragas urbanas (ANVISA — RDC nº 52/2009, substituída pela RDC nº 622/2022) e **precisam ser validados** por um responsável técnico e pela legislação estadual/municipal aplicável.
- **A-05** — Estoque simples: um almoxarifado central por empresa mais os veículos; saída registrada na conclusão da OS a partir do veículo da OS; saldo negativo permitido com alerta (BR-07) para não travar o trabalho de campo.
  Changed 2026-11-05: "almoxarifado único" → almoxarifado + veículos (OQ-08).
- **A-06** — Dispositivos de monitoramento são controlados individualmente por código (etiqueta no dispositivo); consumíveis (iscas, placas) são materiais de estoque.
- **A-07** — Assinatura do cliente é desenho na tela + nome digitado, sem valor de assinatura eletrônica qualificada.
- **A-08** — Envio de proposta/contrato/comprovante ao cliente é feito fora do sistema (download do PDF) no MVP.
- **A-09** — Esta spec cobre o MVP inteiro; no planejamento ela pode ser dividida em specs por módulo (com rastreabilidade de REQs via `supersedes`/`dependencies`) se o plano ficar grande demais para uma entrega.
- **A-10** — Os números de capacidade de REQ-059 (200 usuários e 10.000 OS/mês por empresa, 100 empresas) são uma meta inicial derivada de "suportar todos os portes" (OQ-07); a confirmar.
- **A-11** — Cada usuário (login) pertence a uma única empresa; quem trabalha para duas empresas tem dois logins (ver OQ-11).
- **A-12** — Na criação, a empresa recebe uma lista padrão editável de pragas-alvo e tipos de dispositivo (cópia própria, não compartilhada entre empresas); serviços e produtos começam vazios.
- **A-13** — Na LGPD, cada empresa assinante é a controladora dos dados dos seus clientes e o orbi é o operador; termos de uso/contrato de tratamento de dados ficam fora desta spec.
- **A-14** — A ativação de novas empresas no MVP é feita manualmente pela equipe do orbi (sem cadastro self-service nem cobrança de assinatura).

## Open Questions

<!-- Perguntas locais. Perguntas que afetam o projeto inteiro → Context/ (QUE). -->

- **OQ-01** — Matriz de permissões BR-01. **Answered 2026-11-05:** secretária vê valores; técnico cria áreas; comercial cancela contrato; técnico não vê valores. Aplicado em BR-01, REQ-007, AC-031, AC-041.
- **OQ-02** — Técnicos sem sinal com frequência? **Answered 2026-11-05:** raramente → web online, sem offline no MVP (REQ-048, A-02).
- **OQ-03** — Mapa/croqui ou lista? **Answered 2026-11-05:** os dois — lista por área e planta com marcações (REQ-036, REQ-055). Laudos de auditoria para clientes específicos não foram pedidos; ficam fora.
- **OQ-04** — Periodicidades? **Answered 2026-11-05:** "tem várias formas de configurar" → regra configurável + sob demanda (REQ-058).
- **OQ-05** — Retenção? **Answered 2026-11-05:** 5 anos (REQ-060). Confirmar com responsável técnico/contador se alguma norma exige mais.
- **OQ-06** — Modelos de proposta e contrato existentes? **Answered 2026-11-05:** sim, o usuário vai enviar. **Pendente:** receber os arquivos (necessários antes das tarefas de layout de PDF, não bloqueiam a spec).
- **OQ-07** — Porte da operação? **Answered 2026-11-05:** "precisa suportar todas essas operações" → REQ-059 com meta A-10.
- **OQ-08** — Estoque por veículo/EPI? **Answered 2026-11-05:** estoque por veículo (REQ-056, REQ-057). Controle de EPI entregue por técnico não foi pedido; fica fora.
- **OQ-09** — Empresa única ou SaaS? **Answered 2026-11-05:** SaaS multiempresa (M0, REQ-061..064); revoga A-01.
- **OQ-10** — Como as empresas vão contratar e pagar o orbi (planos, limites, teste grátis, cadastro self-service)? Fora do MVP por enquanto (A-14), mas afeta o planejamento.
- **OQ-11** — Uma mesma pessoa pode precisar acessar mais de uma empresa com o mesmo login (ex.: responsável técnico terceirizado de várias dedetizadoras)? Hoje: não (A-11).

## Context References

<!-- IDs CTX-... também listados em context_refs. -->

- `CTX-QUE-20261104-project-purpose-and-scope` — esta spec contém a definição de propósito informada pelo usuário em 2026-11-05 (SaaS multiempresa para dedetizadoras); a question ainda não foi atualizada em `Context/` (aguarda `salvar contexto`).
- `CTX-QUE-20261104-project-type-and-stack` — respondida por `CTX-DEC-20261105-tech-stack`.
- `CTX-DEC-20261105-tech-stack` — stack usada no `plan.md`.

## Change Log

- 2026-11-05 — Criação (REQ-001..054, AC-001..036).
- 2026-11-05 — Respostas OQ-01..09: modelo SaaS multiempresa (M0, REQ-061..064), periodicidade configurável (REQ-058), plantas com marcações (REQ-055), estoque por veículo (REQ-056, REQ-057), capacidade (REQ-059), retenção de 5 anos (REQ-060), BR-01 revisada, AC-037..046; título alterado de "Sistema de gestão para empresa de controle de pragas (MVP)" para o atual.
- 2026-11-05 — Spec revisada e aprovada pelo usuário: `draft` → `specified`. Pendências registradas sem bloquear: OQ-06 (modelos de PDF), OQ-10, OQ-11, A-04, A-10.
- 2026-11-05 — `plan.md`, `tasks.md` (T001–T089) e `verification.md` (V-001–V-046) criados: `specified` → `planned`.
