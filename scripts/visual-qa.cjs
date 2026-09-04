const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.SITE_URL || 'http://127.0.0.1:4173';
const outputDir = path.join(process.cwd(), 'qa-screenshots');
fs.mkdirSync(outputDir, { recursive: true });

const browsers = [
  { name: 'chrome', executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
  { name: 'edge', executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' }
];
const viewports = [
  { name: '360', width: 360, height: 800 },
  { name: '375', width: 375, height: 812 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 1000 }
];
const routes = [
  '/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/contact/',
  '/enterprise/', '/download/', '/legal/', '/terms/', '/privacy/', '/refund/',
  '/commercial-license/', '/security-advisories/', '/responsible-disclosure/',
  '/support-lifecycle/', '/release-notes/', '/faq/', '/payment/success/', '/payment/register/'
];

const results = {
  checks: 0,
  consoleErrors: [],
  pageErrors: [],
  badResponses: [],
  horizontalOverflow: [],
  interactionFailures: [],
  screenshots: []
};

(async () => {

for (const browserSpec of browsers) {
  if (!fs.existsSync(browserSpec.executablePath)) {
    results.interactionFailures.push(`${browserSpec.name}: browser executable missing`);
    continue;
  }
  const browser = await chromium.launch({ headless: true, executablePath: browserSpec.executablePath });
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, locale: 'en-US', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') results.consoleErrors.push(`${browserSpec.name}/${viewport.name}: ${message.text()}`);
    });
    page.on('pageerror', (error) => results.pageErrors.push(`${browserSpec.name}/${viewport.name}: ${error.message}`));

    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(20);
      results.checks += 1;
      if (!response || response.status() >= 400) results.badResponses.push(`${browserSpec.name}/${viewport.name} ${route}: ${response?.status() ?? 'no response'}`);
      const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      if (overflow.scroll > overflow.client + 1) results.horizontalOverflow.push(`${browserSpec.name}/${viewport.name} ${route}: ${overflow.scroll}/${overflow.client}`);
      const h1Count = await page.locator('h1').count();
      if (h1Count !== 1) results.interactionFailures.push(`${browserSpec.name}/${viewport.name} ${route}: h1=${h1Count}`);
    }

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    if (viewport.width < 900) {
      const toggle = page.locator('[data-menu-toggle]');
      if (!(await toggle.isVisible())) {
        results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: mobile menu toggle hidden`);
      } else {
        await toggle.click();
        if ((await toggle.getAttribute('aria-expanded')) !== 'true' || !(await page.locator('[data-menu]').isVisible())) {
          results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: mobile menu did not open`);
        }
      }
    } else if (await page.locator('[data-menu-toggle]').isVisible()) {
      results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: mobile toggle visible on desktop`);
    }

    await page.keyboard.press('Tab');
    const activeTag = await page.evaluate(() => document.activeElement?.tagName || '');
    if (activeTag === 'BODY') results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: keyboard focus did not advance`);

    await page.goto(`${baseUrl}/pricing/`, { waitUntil: 'networkidle' });
    const priceCards = page.locator('.pricing-grid .price-card');
    if ((await priceCards.count()) !== 3) results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: pricing card count`);
    if (viewport.width < 768 && (await priceCards.count()) === 3) {
      const boxes = await priceCards.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map(({ x, y, width }) => ({ x, y, width })));
      if (!(boxes[0].y < boxes[1].y && boxes[1].y < boxes[2].y && boxes.every((box) => box.width <= viewport.width))) {
        results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: pricing cards do not stack`);
      }
    }
    await page.locator('[data-unit-input]').fill('20');
    const totals = await page.locator('[data-monthly-total], [data-annual-total]').allTextContents();
    const purchaseHref = await page.locator('[data-purchase-plan="annual"]').getAttribute('href');
    if (totals[0] !== 'US$2,400' || totals[1] !== 'US$24,000' || !purchaseHref.includes('20%20Units')) {
      results.interactionFailures.push(`${browserSpec.name}/${viewport.name}: Unit pricing calculation`);
    }

    const shouldCapture = process.env.CAPTURE === '1' && (browserSpec.name === 'chrome' || viewport.name === '390' || viewport.name === '1440');
    if (shouldCapture) {
      for (const route of ['/', '/pricing/', '/security/', '/docs/', '/payment/success/']) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
        const slug = route === '/' ? 'home' : route.replaceAll('/', '');
        const screenshot = path.join(outputDir, `${browserSpec.name}-${viewport.name}-${slug}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
        results.screenshots.push(path.relative(process.cwd(), screenshot));
      }
    }
    await context.close();
  }
  await browser.close();
}

const languageBrowser = await chromium.launch({ headless: true, executablePath: browsers[0].executablePath });
const languageContext = await languageBrowser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
const languagePage = await languageContext.newPage();
await languagePage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
if ((await languagePage.getAttribute('html', 'lang')) !== 'en') results.interactionFailures.push('Unsupported locale did not fall back to English');
await languagePage.selectOption('[data-language]', 'ko');
await languagePage.reload({ waitUntil: 'networkidle' });
if ((await languagePage.getAttribute('html', 'lang')) !== 'ko') results.interactionFailures.push('Language preference did not persist');
await languageContext.close();
await languageBrowser.close();

const summary = {
  ...results,
  consoleErrorCount: results.consoleErrors.length,
  pageErrorCount: results.pageErrors.length,
  badResponseCount: results.badResponses.length,
  horizontalOverflowCount: results.horizontalOverflow.length,
  interactionFailureCount: results.interactionFailures.length
};
fs.writeFileSync(path.join(process.cwd(), 'qa-results.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (summary.consoleErrorCount || summary.pageErrorCount || summary.badResponseCount || summary.horizontalOverflowCount || summary.interactionFailureCount) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
