# Context changelog

Mudanças **estruturais** da memória (branches, taxonomia, protocolos, schema, grandes consolidações).
Não é log de conversa.

## 2026-11-05 — Fluxo git direto na main

- `AGENTS.md`: nova seção `Git workflow` (fora dos blocos gerenciados): todo trabalho vai direto para `main`, sem branches nem PRs; push só em fast-forward; commits/pushes continuam sob pedido do usuário.

## 2026-11-05 — Domínio definido (controle de pragas)

- `core/` preenchido com o produto (SaaS multiempresa para dedetizadoras): overview, goals, constraints e glossário de domínio. Decisão: `CTX-DEC-20261105-product-scope-saas-pest-control`.
- Taxonomia: novas tags `product` e `regulatory`; comentário de domínio atualizado.
- Ainda sem branches de domínio (sem código); critérios em `branches/README.md`.

## 2026-11-05 — Correção do validador no Windows

- `_meta/tools/context_check.py`: o campo `path` do catálogo passa a usar `/` em qualquer SO (`as_posix()`); no Windows o catálogo era regravado com `\` e acusava "out of date" sem mudança real.

## 2026-11-05 — Primeiras branches de domínio: backend e infra

- Criadas `branches/backend/` (banco, RLS, autenticação) e `branches/infra/` (ambiente local, dependências), com `_index.md`. Motivo: a implementação da SPEC-0001 (T001–T008) produziu conhecimento específico de área.
- `CTX-DEC-20261105-auth-db-role` movida de `global/decisions/` para `branches/backend/decisions/` (ID mantido; `branch: backend`).
- Taxonomia: branches `backend` e `infra`; novo grupo de tags `engineering` (`database`, `multi-tenancy`, `security`, `authentication`, `dev-environment`, `docker`, `dependencies`).
- `MAP.md`: rotas das duas branches.

## 2026-11-05 — Integração com Spec-Driven Development

- Instalado `Specs/` (protocolo SDD adaptativo, `INDEX`, `STATE`, templates, `sdd_check.py`). Decisão: `CTX-DEC-20261105-adopt-spec-driven-development`.
- `AGENTS.md`: novo bloco gerenciado `SPEC-DRIVEN`; bloco `CONTEXT-ENGINEERING` preservado sem alterações.
- Política de escrita (`README.md` §9): exceção explícita para `DEC` de decisões duráveis tomadas no planejamento de specs. Pipeline de `salvar contexto` inclui o estado do SDD por referência; template de checkpoint ganhou a seção `SDD state`.
- `MAP.md`: rotas para `Specs/`. Taxonomia: tag `spec-driven-development`.

## 2026-11-04 — Bootstrap do sistema de contexto

- Instalada a arquitetura `Context/` (versão 1): `README`, `MAP`, `STATE`, `_meta/`, `core/`, `global/`, `checkpoints/`.
- Criados `AGENTS.md` (bloco `CONTEXT-ENGINEERING`) e `CLAUDE.md` (`@AGENTS.md`).
- Nenhuma branch de domínio criada: o repositório só continha `README.md` (`# orbi`). Ver `CTX-QUE-20261104-project-purpose-and-scope`.
- Adicionado validador `_meta/tools/context_check.py` (IDs, relações, taxonomia, segredos, catálogo).
- Decisão: `CTX-DEC-20261104-adopt-context-engineering`.
