import { chromium } from "@playwright/test";

const URL = process.env.ANALYZE_URL || "https://ritual-fin-replit.vercel.app/settings/rules";
const OUT_DIR = process.env.ANALYZE_OUT_DIR || "playwright-report/analyze-settings-rules";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const finalUrl = page.url();

  await page.screenshot({
    path: `${OUT_DIR}/01.png`,
    fullPage: true,
  });

  const title = await page.title();

  let h1Text = "";
  try {
    h1Text = (await page.locator("h1").first().innerText()).trim();
  } catch {
    // ignore
  }

  const result = {
    urlRequested: URL,
    urlFinal: finalUrl,
    title,
    h1Text,
    consoleErrors,
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));

  await browser.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

