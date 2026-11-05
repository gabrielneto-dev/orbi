import { describe, expect, it } from "vitest";
import {
  parsePlainDate,
  saoPauloToInstant,
  TIME_ZONE,
  todayInSaoPaulo,
  toSaoPauloDate,
} from "@/lib/timezone";

describe("fuso America/Sao_Paulo", () => {
  it("usa o fuso de São Paulo", () => {
    expect(TIME_ZONE).toBe("America/Sao_Paulo");
  });

  describe("virada de dia", () => {
    it("23:59 em São Paulo ainda é o mesmo dia, embora já seja o dia seguinte em UTC", () => {
      // 06/11/2026 02:59 UTC = 05/11/2026 23:59 em São Paulo (UTC−3)
      expect(toSaoPauloDate(new Date("2026-11-06T02:59:00Z"))).toBe("2026-11-05");
    });

    it("00:00 em São Paulo já é o dia seguinte", () => {
      expect(toSaoPauloDate(new Date("2026-11-06T03:00:00Z"))).toBe("2026-11-06");
    });

    it("todayInSaoPaulo segue o dia local, não o de UTC", () => {
      expect(todayInSaoPaulo(new Date("2027-01-01T01:00:00Z"))).toBe("2026-12-31");
      expect(todayInSaoPaulo(new Date("2027-01-01T03:00:00Z"))).toBe("2027-01-01");
    });
  });

  describe("saoPauloToInstant", () => {
    it("converte meia-noite local para 03:00 UTC", () => {
      expect(saoPauloToInstant("2026-11-05").toISOString()).toBe("2026-11-05T03:00:00.000Z");
    });

    it("converte data e hora local", () => {
      expect(saoPauloToInstant("2026-11-05", "23:30").toISOString()).toBe(
        "2026-11-06T02:30:00.000Z",
      );
    });

    it("é o inverso de toSaoPauloDate", () => {
      const instant = saoPauloToInstant("2026-03-01", "00:00");
      expect(toSaoPauloDate(instant)).toBe("2026-03-01");
      expect(toSaoPauloDate(new Date(instant.getTime() - 1))).toBe("2026-02-28");
    });

    it("usa a base de fusos (horário de verão de 2018 era UTC−2)", () => {
      expect(saoPauloToInstant("2018-12-01").toISOString()).toBe("2018-12-01T02:00:00.000Z");
    });

    it("recusa hora inválida", () => {
      expect(() => saoPauloToInstant("2026-11-05", "24:00")).toThrow(RangeError);
      expect(() => saoPauloToInstant("2026-11-05", "9:00")).toThrow(RangeError);
    });
  });

  describe("parsePlainDate", () => {
    it("lê AAAA-MM-DD", () => {
      expect(parsePlainDate("2028-02-29")).toEqual({ year: 2028, month: 2, day: 29 });
    });

    it("recusa datas inexistentes ou em outro formato", () => {
      expect(() => parsePlainDate("2026-02-29")).toThrow(RangeError);
      expect(() => parsePlainDate("2026-13-01")).toThrow(RangeError);
      expect(() => parsePlainDate("05/11/2026")).toThrow(RangeError);
    });
  });

  it("recusa instante inválido", () => {
    expect(() => toSaoPauloDate(new Date("x"))).toThrow(RangeError);
  });
});
