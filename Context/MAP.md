# Context Map

Roteador: **pergunta → branch → índice → registro**. Não é a documentação completa.
Manual do sistema: `README.md`. Primeiro leia este arquivo e `STATE.md`.

## Project

- Estado atual → `STATE.md`
- O que é o projeto → `core/overview.md`
- Objetivos / não objetivos → `core/goals.md`
- Restrições → `core/constraints.md`
- Termos → `core/glossary.md`

## Branches

Nenhuma branch de domínio ainda (ver `branches/README.md`). Quando criadas, liste aqui:

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

- Decisões → `global/decisions/` · ativas: `CTX-DEC-20261104-adopt-context-engineering` (sistema de contexto), `CTX-DEC-20261105-adopt-spec-driven-development` (SDD)
- Perguntas abertas → `global/questions/` · `rg -l "status: open" Context/`
- Assumptions → `global/assumptions/` · idioma do contexto: `CTX-ASM-20261104-context-language-pt-br`
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
