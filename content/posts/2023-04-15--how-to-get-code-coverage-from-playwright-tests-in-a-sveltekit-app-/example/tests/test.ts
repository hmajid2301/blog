import { expect, test } from "./baseFixtures.js";

test("index page has expected h1", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to SvelteKit" })
  ).toBeVisible();
  await expect(page.getByText("This should be six: 6")).toBeVisible();
});
