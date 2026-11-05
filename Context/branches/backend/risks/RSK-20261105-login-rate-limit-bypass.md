---
id: CTX-RSK-20261105-login-rate-limit-bypass
type: risk
title: Rate limit de login contornado por Server Action ou anulado por proxy sem X-Forwarded-For confiável
branch: backend
tags: [authentication, security]
status: open
confidence: high
created_at: 2026-11-05
updated_at: 2026-11-05
source_ids: []
related: [CTX-FCT-20261105-auth-module]
depends_on: []
supersedes: null
superseded_by: null
valid_from: 2026-11-05
valid_until: null
revisit_at: null
---

# Rate limit de login contornado ou anulado

## Risk

O limite de 5 tentativas/min por IP (REQ-049) pode deixar de proteger o login de duas formas:

1. **Contornado:** o Better Auth só aplica o rate limit a requisições HTTP em `/api/auth/*`. Uma tela de login que chame `auth.api.signInEmail` dentro de uma Server Action não passa por ele, e a força bruta fica sem limite.
2. **Anulado:** o IP vem do cabeçalho `X-Forwarded-For`. Se o proxy de produção não o definir (ou repassar o valor enviado pelo cliente), todos os clientes caem no mesmo contador (`no-trusted-ip`, que bloqueia todo mundo junto) ou um atacante troca de "IP" a cada tentativa.

## Cause

Comportamento do Better Auth 1.7.x, observado no código (`api/rate-limiter`) e nos testes da T008.

## Impact

Alto: tentativas de senha sem limite, ou login bloqueado para todos os usuários.

## Signals

Login implementado como Server Action; muitas respostas 429 para usuários legítimos; em produção, IPs iguais ou vazios nas sessões (`sessions.ip_address`).

## Mitigation

- T017 (tela de login): enviar o formulário para `/api/auth/sign-in/email` pelo cliente, ou aplicar um limite próprio antes de chamar `auth.api`. Teste E2E com 6 tentativas → 429.
- T083 (deploy): o Caddy deve sobrescrever `X-Forwarded-For` com o IP real do cliente, e `advanced.ipAddress` deve ser revisado para a topologia de produção.

## Owner

Agente que implementar a T017 e a T083 da SPEC-0001.
