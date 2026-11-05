---
id: CTX-NTE-20261105-pnpm-minimum-release-age
type: note
title: pnpm recusa versões publicadas há menos de 24 h — usar a versão anterior, sem exceção na política
branch: infra
tags: [dependencies, security]
status: active
confidence: verified
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-FCT-20261105-local-dev-environment, CTX-FCT-20261105-auth-module]
depends_on: []
supersedes: null
superseded_by: null
valid_from: 2026-11-05
valid_until: null
revisit_at: null
---

# pnpm e a idade mínima de versão

## Problem

O pnpm 12 aplica a política `minimumReleaseAge` (proteção contra pacotes comprometidos recém-publicados): uma versão com menos de ~24 h é recusada com `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`.

## Investigation

Na T008, `pnpm add better-auth@1.7.18` (publicada no mesmo dia) **passou**, mas o pnpm acrescentou sozinho uma lista `minimumReleaseAgeExclude` com o pacote e as dependências `@better-auth/*` no `pnpm-workspace.yaml`, desligando a proteção para eles. Depois disso, trocar a versão falhava porque o `pnpm-lock.yaml` ainda trazia as entradas 1.7.18.

## Validated solution

1. Restaurar `package.json`, `pnpm-lock.yaml` e `pnpm-workspace.yaml` (`git checkout`).
2. Instalar a versão anterior, já fora da janela: `pnpm add better-auth@1.7.17 --save-exact`.

## Avoid

- Não commitar `minimumReleaseAgeExclude` no `pnpm-workspace.yaml`. Depois de cada `pnpm add`, confira o `git diff` desse arquivo.
- Não tentar trocar de versão sem restaurar o lockfile antes.
- Se uma versão nova for realmente necessária (ex.: correção de segurança), peça a decisão ao usuário antes de abrir exceção.
