import { expect, test } from "@playwright/test";

test("página inicial abre com o nome do produto", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("orbi");
  await expect(page.getByRole("heading", { level: 1, name: "orbi" })).toBeVisible();
});

test("página inicial não tem rolagem horizontal", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
