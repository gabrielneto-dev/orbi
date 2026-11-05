import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("junta classes e ignora valores falsos", () => {
    expect(cn("p-2", false, undefined, "text-sm")).toBe("p-2 text-sm");
  });

  it("resolve conflitos do Tailwind mantendo a última classe", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
