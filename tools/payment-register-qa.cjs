const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const failures = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const standardViewports = [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 360, height: 800 }];
  const edgeViewports = [{ width: 1024, height: 900 }, { width: 430, height: 900 }, { width: 375, height: 812 }];
  const languages = ['en', 'ko', 'ja', 'de', 'es'];
  const cases = languages.flatMap(language => standardViewports.map(viewport => ({ language, viewport })))
    .concat(edgeViewports.map(viewport => ({ language: 'en', viewport })));
  for (const { language, viewport } of cases) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(value => localStorage.setItem('odre-pqc-lang', value), language);
    const page = await context.newPage();
    const secret = 'ODRE-qa-only-secret-key-123456789';
    const consoleText = [];
    page.on('console', message => consoleText.push(message.text()));
    let verifyRequest = null;
    let statusRequest = null;
    const statusToken = 'S'.repeat(43);
    await page.route('https://odreai.com/commercial/v1/web-activation/approve', async route => {
      verifyRequest = route.request();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ approved: true, status: 'APPROVED', status_token: statusToken, retry_after: 2 }) });
    });
    await page.route('https://odreai.com/commercial/v1/web-activation/status', async route => {
      statusRequest = route.request();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ACTIVE', license: 'ACTIVE', lease: 'LEASE_VALID' }) });
    });
    await page.goto('http://127.0.0.1:4173/payment/register/?flow=activate', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(__dirname, '..', '.qa-artifacts', `payment-register-activation-${language}-${viewport.width}.png`), fullPage: true });
    if (!await page.locator('#activationView').isVisible()) failures.push(`${language}/${viewport.width}: activation view not visible`);
    if (await page.locator('#activationTab').getAttribute('aria-selected') !== 'true') failures.push(`${language}/${viewport.width}: activation tab state`);
    const badges = await page.locator('.flow-tab .badge').allTextContents();
    if (badges.map(value => value.trim()).join(',') !== '01,02') failures.push(`${language}/${viewport.width}: flow order ${badges}`);
    if (await page.locator('#paymentView .summary').count()) failures.push(`${language}/${viewport.width}: inert plan/unit summary still present`);
    if (viewport.width >= 1024) {
      const licenseTrigger = page.locator('.desktop-nav .nav-trigger[data-common="license"]');
      await licenseTrigger.click();
      if (await licenseTrigger.getAttribute('aria-expanded') !== 'true') failures.push(`${language}/${viewport.width}: desktop License menu state`);
      if (!await page.locator('.desktop-nav a[href="/payment/register/?flow=activate"]').isVisible()) failures.push(`${language}/${viewport.width}: desktop Activate License link missing`);
      await page.keyboard.press('Escape');
    } else {
      await page.locator('#mobile-toggle').click();
      const licenseHead = page.locator('.mobile-group-head[data-common="license"]');
      await licenseHead.click();
      if (!await page.locator('.mobile-submenu a[href="/payment/register/?flow=activate"]').isVisible()) failures.push(`${language}/${viewport.width}: mobile Activate License link missing`);
      await page.locator('#mobile-toggle').click();
    }
    await page.locator('#licenseId').fill('123e4567-e89b-42d3-a456-426614174000');
    await page.locator('#licenseKey').fill(secret);
    await page.locator('#licenseKeyToggle').click();
    if (await page.locator('#licenseKey').getAttribute('type') !== 'text') failures.push(`${language}/${viewport.width}: key reveal failed`);
    await page.locator('#licenseKeyToggle').click();
    if (await page.locator('#licenseKey').getAttribute('type') !== 'password') failures.push(`${language}/${viewport.width}: key hide failed`);
    await page.locator('#deviceCode').fill('8F3K2M9Q');
    if (await page.locator('#deviceCode').inputValue() !== '8F3K-2M9Q') failures.push(`${language}/${viewport.width}: code normalization failed`);
    await page.locator('#activationButton').click();
    await page.locator('#activationMessage.ok').waitFor({ state: 'visible' });
    if (!verifyRequest) failures.push(`${language}/${viewport.width}: approval request missing`);
    else {
      const body = verifyRequest.postDataJSON();
      if (body.license_id !== '123e4567-e89b-42d3-a456-426614174000' || body.license_key !== secret || body.device_code !== '8F3K-2M9Q') failures.push(`${language}/${viewport.width}: approval body mismatch`);
      if (verifyRequest.url().includes(secret)) failures.push(`${language}/${viewport.width}: key exposed in URL`);
    }
    await page.waitForFunction(() => document.querySelector('#activationMessage').textContent.includes('ACTIVE'));
    if (!statusRequest || statusRequest.postDataJSON().status_token !== statusToken) failures.push(`${language}/${viewport.width}: status capability request missing`);
    const completionDialog = page.locator('#activationCompleteDialog');
    if (!await completionDialog.isVisible()) failures.push(`${language}/${viewport.width}: completion dialog not visible`);
    const completionText = await completionDialog.textContent();
    if (!completionText.includes('ACTIVE') || !completionText.includes('VALID')) failures.push(`${language}/${viewport.width}: completion status missing`);
    if (completionText.includes(secret) || completionText.includes(statusToken)) failures.push(`${language}/${viewport.width}: secret exposed in completion dialog`);
    await page.screenshot({ path: path.join(__dirname, '..', '.qa-artifacts', `payment-register-complete-${language}-${viewport.width}.png`), fullPage: true });
    await page.locator('#activationCompleteClose').click();
    if (await completionDialog.isVisible()) failures.push(`${language}/${viewport.width}: completion dialog did not close`);
    if (!await page.locator('#activationMessage').textContent().then(value => value.includes('ACTIVE'))) failures.push(`${language}/${viewport.width}: inline completion state missing after close`);
    if (await page.locator('#licenseKey').inputValue()) failures.push(`${language}/${viewport.width}: key not cleared`);
    if (consoleText.some(value => value.includes(secret))) failures.push(`${language}/${viewport.width}: key exposed in console`);
    const storage = await page.evaluate(() => ({ local: Object.values(localStorage), session: Object.values(sessionStorage) }));
    if ([...storage.local, ...storage.session].some(value => String(value).includes(secret) || String(value).includes(statusToken))) failures.push(`${language}/${viewport.width}: secret stored in browser storage`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) failures.push(`${language}/${viewport.width}: horizontal overflow ${overflow}px`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#licenseKey').fill(secret);
    await page.reload({ waitUntil: 'domcontentloaded' });
    if (await page.locator('#licenseKey').inputValue()) failures.push(`${language}/${viewport.width}: key survived reload`);
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({ languages, viewports: [...new Set(cases.map(value => value.viewport.width))], failures }, null, 2));
  if (failures.length) process.exit(1);
})().catch(error => { console.error(error); process.exit(2); });
