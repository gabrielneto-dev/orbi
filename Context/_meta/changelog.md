# Context changelog

Mudanças **estruturais** da memória (branches, taxonomia, protocolos, schema, grandes consolidações).
Não é log de conversa.

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
