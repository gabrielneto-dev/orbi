/**
 * Fuso horário do produto (REQ-051).
 *
 * Convenções:
 * - Instantes (`timestamptz` no banco) são `Date`.
 * - Datas de calendário (`date` no banco, ex.: `target_date` da OS) são strings `YYYY-MM-DD`
 *   interpretadas em `America/Sao_Paulo`. Nunca use `new Date("YYYY-MM-DD")` para elas:
 *   isso vira meia-noite UTC, que em São Paulo ainda é o dia anterior.
 */

export const TIME_ZONE = "America/Sao_Paulo";

const PLAIN_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const PLAIN_TIME = /^(\d{2}):(\d{2})$/;

const wallClockFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function assertValidInstant(instant: Date): void {
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError("Data/hora inválida");
  }
}

/** Data e hora de parede em São Paulo para um instante. */
export function wallClockInSaoPaulo(instant: Date): WallClock {
  assertValidInstant(instant);
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  for (const part of wallClockFormatter.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return {
    year: parts.year ?? 0,
    month: parts.month ?? 0,
    day: parts.day ?? 0,
    hour: parts.hour ?? 0,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  };
}

/** Diferença (ms) entre a hora de parede em São Paulo e UTC naquele instante. */
function offsetMs(epochMs: number): number {
  const wall = wallClockInSaoPaulo(new Date(epochMs));
  const wallAsUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  return wallAsUtc - Math.floor(epochMs / 1000) * 1000;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

/** Lê e valida uma data de calendário `YYYY-MM-DD`. */
export function parsePlainDate(value: string): { year: number; month: number; day: number } {
  const match = PLAIN_DATE.exec(value);
  if (!match) throw new RangeError(`Data inválida (esperado AAAA-MM-DD): ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError(`Data inexistente: ${value}`);
  }
  return { year, month, day };
}

/** Data de calendário (`YYYY-MM-DD`) em São Paulo para um instante. */
export function toSaoPauloDate(instant: Date): string {
  const wall = wallClockInSaoPaulo(instant);
  return `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)}`;
}

/** Hoje em São Paulo (`YYYY-MM-DD`). */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return toSaoPauloDate(now);
}

/**
 * Instante correspondente a uma data e hora de parede em São Paulo.
 * Usa a base de fusos do sistema (inclui o horário de verão histórico).
 */
export function saoPauloToInstant(date: string, time = "00:00"): Date {
  const { year, month, day } = parsePlainDate(date);
  const timeMatch = PLAIN_TIME.exec(time);
  const hour = Number(timeMatch?.[1]);
  const minute = Number(timeMatch?.[2]);
  if (!timeMatch || hour > 23 || minute > 59) {
    throw new RangeError(`Hora inválida (esperado HH:mm): ${time}`);
  }

  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const firstGuess = wallAsUtc - offsetMs(wallAsUtc);
  const secondOffset = offsetMs(firstGuess);
  return new Date(wallAsUtc - secondOffset);
}
