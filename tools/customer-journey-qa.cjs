const { chromium } = require('playwright');

const base = 'http://127.0.0.1:4173';
const requirements = {
  '/': ['/product/', '/docs/', '/pricing/', '/contact/#trial', '/license/?plan=monthly', '/license/?plan=annual'],
  '/product/': ['/docs/#quick-start', '/pricing/'],
  '/security/': ['/docs/', '/contact/#trial', '/pricing/'],
  '/docs/': ['/contact/#trial', '/pricing/', '/payment/register/'],
  '/pricing/': ['/contact/#trial', '/license/?plan=monthly', '/license/?plan=annual', '/enterprise/'],
  '/license/': ['/enterprise/', '/payment/register/', '/docs/#installation'],
  '/payment/success/': ['/payment/register/', '/docs/#installation']
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const findings = [];
  for (const lang of ['en', 'ko', 'ja', 'de', 'es']) {
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(code => localStorage.setItem('odre-pqc-lang', code), lang);
    for (const [route, required] of Object.entries(requirements)) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.locator('main a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
      for (const href of required) if (!hrefs.includes(href)) findings.push(`${lang} ${route}: missing ${href}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const lang of ['en', 'ko', 'ja', 'de', 'es']) {
    await page.goto(base + '/pricing/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(code => localStorage.setItem('odre-pqc-lang', code), lang);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#mobile-toggle').click();
    if (!await page.locator('.mobile-direct[href="/pricing/"]').isVisible()) findings.push(`${lang} mobile: pricing route hidden`);
    if (!await page.locator('.mobile-primary[href="/docs/#downloads"]').isVisible()) findings.push(`${lang} mobile: download route hidden`);
  }
  await browser.close();
  console.log(JSON.stringify({ languages: ['en', 'ko', 'ja', 'de', 'es'], routes: Object.keys(requirements), findings }, null, 2));
  if (findings.length) process.exit(1);
})().catch(error => { console.error(error); process.exit(2); });
