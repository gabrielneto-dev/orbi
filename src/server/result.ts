import type { z } from "zod";

/**
 * Resultado padronizado de Server Actions e route handlers (plan.md › Contracts).
 * Recurso de outra empresa responde NOT_FOUND, sem revelar que existe (AC-037).
 */
export const ERROR_STATUS = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

/** Mensagens por campo (`"endereco.cep"` → ["Obrigatório"]). */
export type FieldErrors = Record<string, string[]>;

export type ActionFailure = {
  ok: false;
  code: ErrorCode;
  message: string;
  fields?: FieldErrors;
};

export type ActionResult<T> = { ok: true; data: T } | ActionFailure;

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Entre para continuar",
  FORBIDDEN: "Você não tem permissão para esta ação",
  NOT_FOUND: "Não encontrado",
  CONFLICT: "O registro foi alterado por outra pessoa; recarregue e tente de novo",
  VALIDATION: "Corrija os campos destacados",
};

/** Erro esperado de regra de negócio. Lançado em qualquer camada, vira `ActionFailure`. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fields?: FieldErrors;

  constructor(code: ErrorCode, message = DEFAULT_MESSAGES[code], fields?: FieldErrors) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.fields = fields;
  }

  toResult(): ActionFailure {
    return {
      ok: false,
      code: this.code,
      message: this.message,
      ...(this.fields ? { fields: this.fields } : {}),
    };
  }
}

export const unauthenticated = (message?: string) => new AppError("UNAUTHENTICATED", message);
export const forbidden = (message?: string) => new AppError("FORBIDDEN", message);
export const notFound = (message?: string) => new AppError("NOT_FOUND", message);
export const conflict = (message?: string) => new AppError("CONFLICT", message);
export const validationFailed = (fields: FieldErrors, message?: string) =>
  new AppError("VALIDATION", message, fields);

/** Converte os erros do Zod em mensagens por campo; erros sem caminho ficam em `""`. */
export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

export function httpStatusFor(result: ActionResult<unknown>): number {
  return result.ok ? 200 : ERROR_STATUS[result.code];
}
