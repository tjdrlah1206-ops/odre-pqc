const { chromium } = require('playwright');

const base = process.env.ODRE_QA_BASE || 'http://127.0.0.1:4173';
const routes = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/company/', '/contact/', '/enterprise/', '/releases/', '/license/', '/payment/register/', '/payment/success/', '/terms/', '/privacy/', '/refund/'];
const languages = ['en', 'ko', 'ja', 'de', 'es'];
const viewports = [{ name: '1440', width: 1440, height: 1000 }, { name: '390', width: 390, height: 844 }, { name: '360', width: 360, height: 800 }];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const findings = [];
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const lang of languages) {
      await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(code => localStorage.setItem('odre-pqc-lang', code), lang);
      for (const route of routes) {
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(40);
        const state = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          emptyButtons: [...document.querySelectorAll('a,button')].filter(node => node.offsetParent !== null && !node.textContent.trim() && !node.getAttribute('aria-label')).length,
          clipped: [...document.querySelectorAll('a.button,button,.nav-trigger,.mobile-direct,.mobile-group-head')].filter(node => node.offsetParent !== null && node.scrollWidth > node.clientWidth + 2).length
        }));
        if (state.lang !== lang) findings.push(`${viewport.name} ${lang} ${route}: document language ${state.lang}`);
        if (state.overflow > 1) findings.push(`${viewport.name} ${lang} ${route}: horizontal overflow ${state.overflow}px`);
        if (state.emptyButtons) findings.push(`${viewport.name} ${lang} ${route}: ${state.emptyButtons} unlabeled controls`);
        if (state.clipped) findings.push(`${viewport.name} ${lang} ${route}: ${state.clipped} clipped controls`);
      }
    }
    await context.close();
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await desktop.locator('#language-button').click();
  const desktopLanguages = await desktop.locator('#language-menu [data-language-choice]').count();
  if (desktopLanguages !== 5) findings.push(`desktop language selector count ${desktopLanguages}`);
  await desktop.locator('[data-language-choice="de"]').first().click();
  await desktop.goto(base + '/pricing/', { waitUntil: 'domcontentloaded' });
  if (await desktop.locator('html').getAttribute('lang') !== 'de') findings.push('manual language selection did not persist');
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await mobile.locator('#mobile-toggle').click();
  const mobileLanguages = await mobile.locator('.mobile-language-grid [data-language-choice]').count();
  if (mobileLanguages !== 5) findings.push(`mobile language selector count ${mobileLanguages}`);
  await mobile.close();

  const fallbackContext = await browser.newContext({ locale: 'fr-FR' });
  const fallback = await fallbackContext.newPage();
  await fallback.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await fallback.evaluate(() => localStorage.clear());
  await fallback.reload({ waitUntil: 'domcontentloaded' });
  if (await fallback.locator('html').getAttribute('lang') !== 'en') findings.push('unsupported language did not fall back to English');
  await fallbackContext.close();
  await browser.close();

  const result = { pages: routes.length, languages, viewports: viewports.map(item => item.name), desktopLanguages, mobileLanguages, findings };
  console.log(JSON.stringify(result, null, 2));
  if (findings.length) process.exit(1);
})().catch(error => { console.error(error); process.exit(2); });
