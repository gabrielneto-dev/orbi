import { describe, expect, it } from "vitest";
import { z } from "@/lib/validation.ts";
import {
  AppError,
  conflict,
  ERROR_STATUS,
  fieldErrorsFromZod,
  httpStatusFor,
  notFound,
  validationFailed,
} from "@/server/result.ts";

describe("resultado padronizado", () => {
  it("cada código tem o status HTTP do plano", () => {
    expect(ERROR_STATUS).toEqual({
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      VALIDATION: 422,
    });
    expect(httpStatusFor({ ok: true, data: 1 })).toBe(200);
    expect(httpStatusFor(notFound().toResult())).toBe(404);
  });

  it("AppError vira { ok: false, code, message, fields? } com mensagem padrão em pt-BR", () => {
    expect(conflict().toResult()).toEqual({
      ok: false,
      code: "CONFLICT",
      message: "O registro foi alterado por outra pessoa; recarregue e tente de novo",
    });
    expect(validationFailed({ nome: ["Obrigatório"] }).toResult()).toEqual({
      ok: false,
      code: "VALIDATION",
      message: "Corrija os campos destacados",
      fields: { nome: ["Obrigatório"] },
    });
    expect(new AppError("FORBIDDEN", "Sem acesso").message).toBe("Sem acesso");
  });
});

describe("fieldErrorsFromZod", () => {
  const schema = z.object({
    nome: z.string().min(2),
    endereco: z.object({ cep: z.string().regex(/^\d{8}$/) }),
  });

  it("agrupa mensagens por caminho do campo, em pt-BR", () => {
    const parsed = schema.safeParse({ nome: "A", endereco: { cep: "123" } });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const fields = fieldErrorsFromZod(parsed.error);
    expect(Object.keys(fields).sort()).toEqual(["endereco.cep", "nome"]);
    expect(fields.nome?.[0]).toMatch(/2 caracteres/);
    // Mensagem do locale pt-BR do Zod, não a padrão em inglês.
    expect(fields.nome?.[0]).not.toMatch(/too small|expected/i);
  });

  it("erro sem caminho (o objeto inteiro) fica na chave vazia", () => {
    const parsed = schema.safeParse("não é objeto");
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(Object.keys(fieldErrorsFromZod(parsed.error))).toEqual([""]);
  });
});
