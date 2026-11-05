// Configuração da autenticação lida do ambiente. Sem dependência do Better Auth: testável sozinha.

/** Padrão de inatividade até a sessão expirar: 8 horas (decisão do usuário, 2026-11-05). */
export const DEFAULT_IDLE_TIMEOUT_MINUTES = 480;
const MIN_IDLE_TIMEOUT_MINUTES = 5;
const MAX_IDLE_TIMEOUT_MINUTES = 7 * 24 * 60;

/** Lê SESSION_IDLE_TIMEOUT_MINUTES: vazio → padrão; inteiro entre 5 min e 7 dias. */
export function parseIdleTimeoutMinutes(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return DEFAULT_IDLE_TIMEOUT_MINUTES;
  const minutes = Number(value);
  if (
    !Number.isInteger(minutes) ||
    minutes < MIN_IDLE_TIMEOUT_MINUTES ||
    minutes > MAX_IDLE_TIMEOUT_MINUTES
  ) {
    throw new Error(
      `SESSION_IDLE_TIMEOUT_MINUTES deve ser um inteiro entre ${MIN_IDLE_TIMEOUT_MINUTES} e ${MAX_IDLE_TIMEOUT_MINUTES}`,
    );
  }
  return minutes;
}

/**
 * Tempos da sessão do Better Auth, em segundos. A sessão vence `expiresIn` depois da última
 * renovação, e é renovada no primeiro uso depois de `updateAge`. Assim ela expira entre
 * (inatividade − updateAge) e (inatividade) sem uso — no máximo 15 min antes do configurado.
 */
export function sessionTimings(idleTimeoutMinutes: number) {
  const expiresIn = idleTimeoutMinutes * 60;
  const updateAge = Math.min(15 * 60, Math.floor(expiresIn / 4));
  return { expiresIn, updateAge };
}

/** Limite de tentativas de login por IP (REQ-049): 5 por minuto. */
export const LOGIN_RATE_LIMIT = { window: 60, max: 5 } as const;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
