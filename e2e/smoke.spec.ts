import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("LifeOS site", () => {
  test("feature content is present in the DOM before any interaction", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Everything is an entry." })).toBeAttached();
  });

  test("skip-intro link reveals and focuses the features section", async ({ page }) => {
    await page.goto("/");
    // The skip link is intentionally off-screen until keyboard-focused
    // (visually-hidden-until-focus pattern), so activate it the way a
    // real keyboard user would rather than a mouse .click(), which
    // correctly refuses to click something outside the viewport.
    await page.getByRole("link", { name: /skip intro/i }).focus();
    await page.keyboard.press("Enter");
    const heading = page.getByRole("heading", { name: "Everything is an entry." });
    await expect(heading).toBeVisible();
    const focusedText = await page.evaluate(() => document.activeElement?.closest("section")?.querySelector("h2")?.textContent);
    expect(focusedText).toBe("Everything is an entry.");
  });

  test("scrolling back closes the pad again — reversible, not one-way", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /skip intro/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toHaveCSS("opacity", "1");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.locator("main")).toHaveCSS("opacity", "0");
  });

  test("no accessibility violations after reveal", async ({ page }) => {
    await page.goto("/");
    // The skip link is intentionally off-screen until keyboard-focused
    // (visually-hidden-until-focus pattern), so activate it the way a
    // real keyboard user would rather than a mouse .click(), which
    // correctly refuses to click something outside the viewport.
    await page.getByRole("link", { name: /skip intro/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Everything is an entry." })).toBeVisible();
    // The reveal fades `main` in over .8s — wait for that transition to
    // finish before scanning, otherwise axe measures text against the
    // still-transparent ancestor's opacity and reports false contrast
    // violations mid-fade.
    await expect(page.locator("main")).toHaveCSS("opacity", "1");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("LifeOS site — reduced motion", () => {
  test("skip-intro still reveals and focuses features with motion off", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // The skip link is intentionally off-screen until keyboard-focused
    // (visually-hidden-until-focus pattern), so activate it the way a
    // real keyboard user would rather than a mouse .click(), which
    // correctly refuses to click something outside the viewport.
    await page.getByRole("link", { name: /skip intro/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Everything is an entry." })).toBeVisible();
  });
});
