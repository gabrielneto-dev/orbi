import { describe, expect, it } from "vitest";
import {
  DEFAULT_IDLE_TIMEOUT_MINUTES,
  parseIdleTimeoutMinutes,
  sessionTimings,
} from "@/server/auth/config.ts";

describe("parseIdleTimeoutMinutes", () => {
  it("usa 8 horas quando a variável está vazia ou ausente", () => {
    expect(DEFAULT_IDLE_TIMEOUT_MINUTES).toBe(480);
    expect(parseIdleTimeoutMinutes(undefined)).toBe(480);
    expect(parseIdleTimeoutMinutes("")).toBe(480);
    expect(parseIdleTimeoutMinutes("  ")).toBe(480);
  });

  it("aceita inteiros entre 5 minutos e 7 dias", () => {
    expect(parseIdleTimeoutMinutes("5")).toBe(5);
    expect(parseIdleTimeoutMinutes("120")).toBe(120);
    expect(parseIdleTimeoutMinutes("10080")).toBe(10080);
  });

  it("recusa valores fora do intervalo ou não inteiros", () => {
    for (const value of ["0", "4", "10081", "1.5", "abc", "-30"]) {
      expect(() => parseIdleTimeoutMinutes(value)).toThrow(/SESSION_IDLE_TIMEOUT_MINUTES/);
    }
  });
});

describe("sessionTimings", () => {
  it("8 horas: expira em 8 h e renova a cada 15 min de uso", () => {
    expect(sessionTimings(480)).toEqual({ expiresIn: 28_800, updateAge: 900 });
  });

  it("tempos curtos renovam a cada quarto do período", () => {
    expect(sessionTimings(20)).toEqual({ expiresIn: 1_200, updateAge: 300 });
  });
});
