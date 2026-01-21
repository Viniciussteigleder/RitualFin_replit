import { test, expect, type Page } from "@playwright/test";

async function signup(page: Page) {
  const randomId = Math.random().toString(36).slice(2);
  await page.goto("/signup");
  await page.fill('input[name="username"]', `flicker_${randomId}`);
  await page.fill('input[name="email"]', `flicker_${randomId}@example.com`);
  await page.fill('input[name="password"]', "Password123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/", { timeout: 15000 });
}

const viewports = [
  { width: 500, height: 800 },
  { width: 1000, height: 800 },
  { width: 1280, height: 800 },
];

for (const viewport of viewports) {
  test(`transactions: no scroll/hover jitter (${viewport.width}x${viewport.height})`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);

    await page.addInitScript(() => {
      window.localStorage.setItem("DEBUG_FLICKER", "1");
      window.localStorage.setItem("DEBUG_FLICKER_MOCK_DATA", "1");
      window.localStorage.setItem("UI_PERF_FIXES", "1");
    });

    await signup(page);

    await page.goto("/transactions");
    await expect(page.locator('[data-testid="transactions-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-row"]').first()).toBeVisible();

    await page.waitForFunction(() => document.documentElement.dataset.uiPerfFixes === "1");
    await page.waitForFunction(() => Boolean(window.__flickerDebug?.enabled));

    const blurStatus = await page.evaluate(() => {
      const scope = document.querySelector('[data-ui-perf-scope="transactions"]');
      if (!scope) return { found: 0, bad: 0 };
      const candidates = scope.querySelectorAll(
        ".backdrop-blur,.backdrop-blur-sm,.backdrop-blur-md,.backdrop-blur-lg,.backdrop-blur-xl,.backdrop-blur-2xl,.backdrop-blur-3xl"
      );
      let bad = 0;
      for (const el of Array.from(candidates)) {
        const s = window.getComputedStyle(el);
        const bf = (s as any).backdropFilter ?? "none";
        if (bf && bf !== "none") bad += 1;
      }
      return { found: candidates.length, bad };
    });
    expect(blurStatus.bad).toBe(0);

    await page.evaluate(() => window.__flickerDebug?.startWindow("e2e-scroll-hover"));

    const scroll = page.locator('[data-testid="transactions-virtualized-scroll"]');
    await expect(scroll).toBeVisible();
    await scroll.hover();
    const box = await scroll.boundingBox();
    expect(box).toBeTruthy();

    for (let i = 0; i < 12; i++) {
      await scroll.evaluate((el, delta) => {
        (el as HTMLElement).scrollTop += Number(delta);
      }, 650);
    }

    for (let i = 0; i < 10; i++) {
      await page.mouse.move(
        (box?.x ?? 0) + Math.min(250, (box?.width ?? 0) / 2),
        (box?.y ?? 0) + 60 + (i % 10) * 24
      );
      await scroll.evaluate((el, delta) => {
        (el as HTMLElement).scrollTop += Number(delta);
      }, 250);
    }

    const snapshot = await page.evaluate(() => window.__flickerDebug?.endWindow());
    expect(snapshot).toBeTruthy();

    await expect(page.locator('[data-testid="transactions-page-header"]')).toBeVisible();
    const headerJitter = await page.evaluate(async () => {
      const el = document.querySelector('[data-testid="transactions-page-header"]') as HTMLElement | null;
      if (!el) return null;

      const samples: number[] = [];
      await new Promise<void>((resolve) => {
        let i = 0;
        const step = () => {
          samples.push(el.getBoundingClientRect().top);
          i += 1;
          if (i >= 30) return resolve();
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      const min = Math.min(...samples);
      const max = Math.max(...samples);
      return { delta: max - min };
    });
    expect(headerJitter).toBeTruthy();
    expect(headerJitter?.delta).toBeLessThanOrEqual(3);

    expect(snapshot.cls.total).toBeLessThanOrEqual(0.001);
    expect(snapshot.frames.maxDeltaMs).toBeLessThanOrEqual(50);
    expect(snapshot.frames.over33ms).toBeLessThanOrEqual(10);

    const topLeft = await page.evaluate(() => {
      const el = document.elementFromPoint(5, 5);
      if (!el) return null;
      return { tag: el.tagName, role: el.getAttribute("role"), testId: el.getAttribute("data-testid") };
    });
    expect(topLeft).toBeTruthy();
    expect(topLeft?.role).not.toBe("dialog");
  });
}
