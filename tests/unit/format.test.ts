import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  parseDecimal,
} from "@/lib/format";

// Intl usa espaço não separável entre "R$" e o valor.
const NBSP = String.fromCharCode(0xa0);

describe("formatDate (DD/MM/AAAA)", () => {
  it("formata data de calendário sem deslocar o dia", () => {
    expect(formatDate("2026-11-05")).toBe("05/11/2026");
    expect(formatDate("2027-01-01")).toBe("01/01/2027");
  });

  it("formata instante pelo dia em São Paulo", () => {
    expect(formatDate(new Date("2026-11-06T02:59:00Z"))).toBe("05/11/2026");
    expect(formatDate(new Date("2026-11-06T03:00:00Z"))).toBe("06/11/2026");
  });

  it("recusa texto que não é data AAAA-MM-DD", () => {
    expect(() => formatDate("2026-11-05T10:00:00Z")).toThrow(RangeError);
  });
});

describe("formatDateTime (DD/MM/AAAA HH:mm)", () => {
  it("usa a hora de São Paulo em 24 h", () => {
    expect(formatDateTime(new Date("2026-11-05T17:07:00Z"))).toBe("05/11/2026 14:07");
    expect(formatDateTime(new Date("2026-11-06T02:59:00Z"))).toBe("05/11/2026 23:59");
    expect(formatDateTime(new Date("2026-11-06T03:00:00Z"))).toBe("06/11/2026 00:00");
  });
});

describe("formatCurrency (R$)", () => {
  it("usa R$, ponto de milhar e vírgula decimal", () => {
    expect(formatCurrency(1234.5)).toBe(`R$${NBSP}1.234,50`);
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
  });

  it("formata valores numeric vindos do banco como texto, sem erro de ponto flutuante", () => {
    expect(formatCurrency("9999999999.99")).toBe(`R$${NBSP}9.999.999.999,99`);
    expect(formatCurrency("0.10")).toBe(`R$${NBSP}0,10`);
  });

  it("formata valores negativos", () => {
    expect(formatCurrency("-15.00")).toBe(`-R$${NBSP}15,00`);
  });

  it("recusa valores inválidos em vez de mostrar NaN", () => {
    expect(() => formatCurrency("abc")).toThrow(RangeError);
    expect(() => formatCurrency("1,50")).toThrow(RangeError);
    expect(() => formatCurrency(Number.NaN)).toThrow(RangeError);
  });
});

describe("formatNumber (vírgula decimal)", () => {
  it("usa vírgula decimal e até 3 casas por padrão", () => {
    expect(formatNumber("1234.5")).toBe("1.234,5");
    expect(formatNumber("0.125")).toBe("0,125");
    expect(formatNumber(2)).toBe("2");
  });

  it("aceita casas decimais fixas", () => {
    expect(formatNumber("12.5", { minFractionDigits: 2, maxFractionDigits: 2 })).toBe("12,50");
  });
});

describe("parseDecimal (entrada em pt-BR)", () => {
  it("converte para a forma decimal canônica", () => {
    expect(parseDecimal("1.234,56")).toBe("1234.56");
    expect(parseDecimal("0,5")).toBe("0.5");
    expect(parseDecimal(" 12 ")).toBe("12");
    expect(parseDecimal("1234,5")).toBe("1234.5");
    expect(parseDecimal("-3,25")).toBe("-3.25");
    expect(parseDecimal("007")).toBe("7");
  });

  it("recusa formatos ambíguos ou inválidos", () => {
    expect(parseDecimal("1.5")).toBeNull();
    expect(parseDecimal("1,234.56")).toBeNull();
    expect(parseDecimal("12,")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
    expect(parseDecimal("")).toBeNull();
  });
});
