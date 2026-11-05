import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

// Exemplo de teste de integração (página + componentes de UI).
// Os testes com PostgreSQL real entram a partir da T005/T006.
describe("página inicial", () => {
  it("renderiza o nome do produto e o botão de entrada", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("<h1");
    expect(html).toContain("orbi");
    expect(html).toContain("Entrar (em breve)");
  });
});
