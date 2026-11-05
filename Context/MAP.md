# Context Map

Roteador: **pergunta → branch → índice → registro**. Não é a documentação completa.
Manual do sistema: `README.md`. Primeiro leia este arquivo e `STATE.md`.

## Project

- Estado atual → `STATE.md`
- O que é o projeto (SaaS para dedetizadoras) → `core/overview.md` · decisão `CTX-DEC-20261105-product-scope-saas-pest-control`
- Objetivos / não objetivos → `core/goals.md`
- Restrições (isolamento, LGPD, retenção, regulatório) → `core/constraints.md`
- Termos do domínio (OS, proposta, dispositivo, comprovante…) → `core/glossary.md`
- Requisitos detalhados do MVP → `../Specs/features/SPEC-0001--pest-control-mvp/spec.md`
- Stack e arquitetura → `CTX-DEC-20261105-tech-stack` + `plan.md` da SPEC-0001

## Branches

### Backend
Path: branches/backend/
Status: active
Primary tags: database, multi-tenancy, authentication, security
Routes:
- Papéis do banco, RLS, `withTenant()`, como criar tabela de empresa → `branches/backend/_index.md` › `CTX-FCT-20261105-tenant-isolation-model`
- Login, sessão, cookies, criação de usuários (Better Auth) → `CTX-FCT-20261105-auth-module`
- Login × RLS, papel `orbi_auth`, inatividade de 8 h → `CTX-DEC-20261105-auth-db-role`
- Cuidados com rate limit na tela de login e no deploy → `CTX-RSK-20261105-login-rate-limit-bypass`

### Infra
Path: branches/infra/
Status: active
Primary tags: dev-environment, docker, dependencies
Routes:
- Ambiente local (Docker, portas, `.env`, Python dos validadores) → `branches/infra/_index.md` › `CTX-FCT-20261105-local-dev-environment`
- Versão de pacote recusada pelo pnpm (`minimumReleaseAge`) → `CTX-NTE-20261105-pnpm-minimum-release-age`

## Desenvolvimento (SDD)

- Protocolo SDD → `../Specs/README.md`
- Specs existentes, status, próximo ID → `../Specs/INDEX.md`
- Spec ativa, fase, próxima tarefa, bloqueios → `../Specs/STATE.md`
- Decisão de adoção → `CTX-DEC-20261105-adopt-spec-driven-development`

## Global (transversal)

- Decisões → `global/decisions/` · ativas: `CTX-DEC-20261104-adopt-context-engineering` (sistema de contexto), `CTX-DEC-20261105-adopt-spec-driven-development` (SDD), `CTX-DEC-20261105-product-scope-saas-pest-control` (escopo do produto), `CTX-DEC-20261105-tech-stack` (stack: Next.js + PostgreSQL em VPS); por branch: `CTX-DEC-20261105-auth-db-role` (backend)
- Perguntas → `global/questions/` · abertas: `rg -l "status: open" Context/` (nenhuma em 2026-11-05)
- Assumptions → `global/assumptions/` · idioma do contexto: `CTX-ASM-20261104-context-language-pt-br`; conteúdo regulatório do comprovante: `CTX-ASM-20261105-regulatory-certificate-content`
- Planos / riscos → `global/plans/`, `global/risks/` (vazios); riscos de área ficam nas branches (`rg "type: risk" Context/branches/`)

## Histórico e evidência

- Checkpoints de sessão → `checkpoints/` (mais recente indicado em `STATE.md`)
- Fontes / evidências (L3) → `sources/`
- Ideias não aprovadas → `future/`
- Material histórico → `archive/`

## Meta

- Busca rápida por metadados → `_meta/catalog.jsonl` (derivado)
- Tags, status, branches válidos → `_meta/taxonomy.yaml`
- Templates → `_meta/templates/`
- Validar / reconstruir catálogo → `python3 Context/_meta/tools/context_check.py --rebuild-catalog`
- Mudanças estruturais → `_meta/changelog.md`
