const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const failures = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const secret = 'ODRE-qa-only-secret-key-123456789';
    const consoleText = [];
    page.on('console', message => consoleText.push(message.text()));
    let verifyRequest = null;
    await page.route('https://odreai.com/commercial/v1/licenses/verify', async route => {
      verifyRequest = route.request();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, status: 'ACTIVE', plan_code: 'annual', available_units: 2, purchased_units: 3, expires_at: '2027-09-04T00:00:00Z' }) });
    });
    await page.goto('http://127.0.0.1:4173/payment/register/?flow=activate', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(__dirname, '..', '.qa-artifacts', `payment-register-activation-${viewport.width}.png`), fullPage: true });
    if (!await page.locator('#activationView').isVisible()) failures.push(`${viewport.width}: activation view not visible`);
    if (await page.locator('#activationTab').getAttribute('aria-selected') !== 'true') failures.push(`${viewport.width}: activation tab state`);
    const badges = await page.locator('.flow-tab .badge').allTextContents();
    if (badges.map(value => value.trim()).join(',') !== '01,02') failures.push(`${viewport.width}: flow order ${badges}`);
    await page.locator('#licenseId').fill('123e4567-e89b-42d3-a456-426614174000');
    await page.locator('#licenseKey').fill(secret);
    await page.locator('#activationButton').click();
    await page.locator('#activationResult.show').waitFor({ state: 'visible' });
    if (!verifyRequest) failures.push(`${viewport.width}: verification request missing`);
    else {
      const body = verifyRequest.postDataJSON();
      if (body.license_id !== '123e4567-e89b-42d3-a456-426614174000' || body.license_key !== secret) failures.push(`${viewport.width}: verification body mismatch`);
      if (verifyRequest.url().includes(secret)) failures.push(`${viewport.width}: key exposed in URL`);
    }
    if (await page.locator('#licenseKey').inputValue()) failures.push(`${viewport.width}: key not cleared`);
    if (consoleText.some(value => value.includes(secret))) failures.push(`${viewport.width}: key exposed in console`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) failures.push(`${viewport.width}: horizontal overflow ${overflow}px`);
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({ viewports: [1440, 390], failures }, null, 2));
  if (failures.length) process.exit(1);
})().catch(error => { console.error(error); process.exit(2); });
