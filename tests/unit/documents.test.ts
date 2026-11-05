import { describe, expect, it } from "vitest";
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  normalizeCnpj,
  normalizeCpf,
} from "@/lib/documents";

describe("CPF", () => {
  it("aceita CPF válido com ou sem máscara", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });

  it("recusa dígito verificador errado", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("529.982.247-15")).toBe(false);
  });

  it("recusa sequências repetidas, tamanho errado e caracteres estranhos", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("000.000.000-00")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("529982247255")).toBe(false);
    expect(isValidCpf("529a98224725")).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });

  it("normaliza para só dígitos e formata com máscara", () => {
    expect(normalizeCpf(" 529.982.247-25 ")).toBe("52998224725");
    expect(normalizeCpf("529.982.247")).toBeNull();
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });
});

describe("CNPJ numérico", () => {
  it("aceita CNPJ válido com ou sem máscara", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11222333000181")).toBe(true);
  });

  it("recusa dígito verificador errado", () => {
    expect(isValidCnpj("11.222.333/0001-80")).toBe(false);
    expect(isValidCnpj("11.222.333/0001-91")).toBe(false);
  });

  it("recusa sequências repetidas e tamanho errado", () => {
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    expect(isValidCnpj("11111111111111")).toBe(false);
    expect(isValidCnpj("1122233300018")).toBe(false);
    expect(isValidCnpj("")).toBe(false);
  });
});

describe("CNPJ alfanumérico (Receita Federal, desde julho de 2026)", () => {
  it("aceita o exemplo oficial 12.ABC.345/01DE-35", () => {
    expect(isValidCnpj("12.ABC.345/01DE-35")).toBe(true);
    expect(isValidCnpj("12ABC34501DE35")).toBe(true);
  });

  it("aceita letras minúsculas e normaliza para maiúsculas", () => {
    expect(isValidCnpj("12.abc.345/01de-35")).toBe(true);
    expect(normalizeCnpj("12.abc.345/01de-35")).toBe("12ABC34501DE35");
  });

  it("recusa dígito verificador errado", () => {
    expect(isValidCnpj("12.ABC.345/01DE-36")).toBe(false);
    expect(isValidCnpj("12.ABC.345/01DF-35")).toBe(false);
  });

  it("recusa letras nos dígitos verificadores e caracteres fora de A-Z/0-9", () => {
    expect(isValidCnpj("12ABC34501DE3A")).toBe(false);
    expect(isValidCnpj("12ABC34501D#35")).toBe(false);
  });

  it("formata com a mesma máscara do CNPJ numérico", () => {
    expect(formatCnpj("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatCnpj("123")).toBe("123");
  });
});
