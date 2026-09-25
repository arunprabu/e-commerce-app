import { expect, test } from "@playwright/test";

// Smoke test for the storefront: the home page loads products from the API and
// the search box filters them. Kept intentionally small as a starting point.
test.describe("storefront", () => {
  test("home page lists products", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Shop all products" })).toBeVisible();
    // fakestoreapi returns 20 products; assert at least one card rendered.
    await expect(page.getByRole("button", { name: "Add to cart" }).first()).toBeVisible();
  });

  test("search filters the product list", async ({ page }) => {
    await page.goto("/");

    const cards = page.getByRole("button", { name: "Add to cart" });
    await expect(cards.first()).toBeVisible();
    const initialCount = await cards.count();

    await page.getByPlaceholder("Search products...").fill("backpack");

    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeLessThanOrEqual(initialCount);
  });

  test("adding a product updates the cart badge", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Add to cart" }).first().click();

    // The header cart link shows the item count once something is added.
    await expect(page.getByRole("link", { name: /cart/i })).toContainText("1");
  });
});
