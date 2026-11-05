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
- Papéis do banco e login × RLS → `CTX-DEC-20261105-auth-db-role`

## Branches

Nenhuma branch de domínio ainda (ver `branches/README.md`): não há código nem conhecimento específico de área. Quando criadas, liste aqui:

```text
### <Nome>
Path: branches/<branch>/
Status: active
Primary tags: ...
Routes:
- <assunto> → branches/<branch>/_index.md
```

## Desenvolvimento (SDD)

- Protocolo SDD → `../Specs/README.md`
- Specs existentes, status, próximo ID → `../Specs/INDEX.md`
- Spec ativa, fase, próxima tarefa, bloqueios → `../Specs/STATE.md`
- Decisão de adoção → `CTX-DEC-20261105-adopt-spec-driven-development`

## Global (transversal)

- Decisões → `global/decisions/` · ativas: `CTX-DEC-20261104-adopt-context-engineering` (sistema de contexto), `CTX-DEC-20261105-adopt-spec-driven-development` (SDD), `CTX-DEC-20261105-product-scope-saas-pest-control` (escopo do produto), `CTX-DEC-20261105-tech-stack` (stack: Next.js + PostgreSQL em VPS), `CTX-DEC-20261105-auth-db-role` (papel `orbi_auth` para login; sessão expira após 8 h sem uso)
- Perguntas → `global/questions/` · abertas: `rg -l "status: open" Context/` (nenhuma em 2026-11-05)
- Assumptions → `global/assumptions/` · idioma do contexto: `CTX-ASM-20261104-context-language-pt-br`; conteúdo regulatório do comprovante: `CTX-ASM-20261105-regulatory-certificate-content`
- Planos / riscos → `global/plans/`, `global/risks/` (vazios)

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
