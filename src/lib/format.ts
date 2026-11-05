/**
 * Formatação pt-BR para telas e PDFs (REQ-051, AC-033): DD/MM/AAAA, R$ e vírgula decimal.
 *
 * Valores `numeric` do banco chegam como string ("1234.50") e são formatados sem passar por
 * ponto flutuante.
 */

import { parsePlainDate, wallClockInSaoPaulo } from "./timezone";

export const LOCALE = "pt-BR";

const DECIMAL_STRING = /^-?\d+(\.\d+)?$/;

type Numeric = number | string;

function toFormattable(value: Numeric): number | `${number}` {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new RangeError(`Número inválido: ${value}`);
    return value;
  }
  const trimmed = value.trim();
  if (!DECIMAL_STRING.test(trimmed)) throw new RangeError(`Número inválido: ${value}`);
  return trimmed as `${number}`;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

/**
 * Data no formato DD/MM/AAAA.
 * - `Date`: instante, convertido para o dia em São Paulo.
 * - `string`: data de calendário `YYYY-MM-DD`, exibida como está (sem conversão de fuso).
 */
export function formatDate(value: Date | string): string {
  if (typeof value === "string") {
    const { year, month, day } = parsePlainDate(value);
    return `${pad(day)}/${pad(month)}/${pad(year, 4)}`;
  }
  const wall = wallClockInSaoPaulo(value);
  return `${pad(wall.day)}/${pad(wall.month)}/${pad(wall.year, 4)}`;
}

/** Data e hora em São Paulo no formato DD/MM/AAAA HH:mm. */
export function formatDateTime(value: Date): string {
  const wall = wallClockInSaoPaulo(value);
  return `${formatDate(value)} ${pad(wall.hour)}:${pad(wall.minute)}`;
}

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "BRL",
});

/** Valor monetário: `R$ 1.234,56` (o espaço após `R$` é não separável). */
export function formatCurrency(value: Numeric): string {
  return currencyFormatter.format(toFormattable(value));
}

/**
 * Número com vírgula decimal e ponto de milhar: `1.234,5`.
 * Padrão de até 3 casas decimais, a precisão das quantidades de estoque.
 */
export function formatNumber(
  value: Numeric,
  { minFractionDigits = 0, maxFractionDigits = 3 } = {},
): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(toFormattable(value));
}

const PT_BR_DECIMAL = /^(-)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?$/;

/**
 * Lê um número digitado em pt-BR ("1.234,56", "0,5", "12") e devolve a string decimal
 * canônica ("1234.56") para gravar em `numeric`. Retorna `null` se o texto não for válido.
 */
export function parseDecimal(input: string): string | null {
  const match = PT_BR_DECIMAL.exec(input.trim());
  if (!match) return null;
  const [, sign = "", integerPart = "", fraction] = match;
  const integer = integerPart.replaceAll(".", "").replace(/^0+(?=\d)/, "");
  return `${sign}${integer}${fraction ? `.${fraction}` : ""}`;
}
