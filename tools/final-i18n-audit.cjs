const { chromium } = require('playwright');

const base = process.env.ODRE_QA_BASE || 'http://127.0.0.1:4173';
const routes = [
  '/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/',
  '/company/', '/contact/', '/enterprise/', '/releases/', '/license/',
  '/payment/', '/payment/register/', '/payment/success/', '/terms/',
  '/privacy/', '/refund/'
];
const languages = ['ko', 'ja', 'de', 'es'];
const allowed = /^(ODRE PQC|ODRE AI|FastAPI|Python|OpenSSL|ML-KEM-768|ML-DSA-65|SHA-256|Wheel|Wheel SHA-256|Official wheel|Windows|Windows Server 2022|Ubuntu 24\.04 LTS|AMD64|API|CLI|Paddle|PayPal|doctor|verify|status|install\(app\)|v0\.2\.9|Unit|Units|License ID|License Key|Offline Lease|Product|Security|Documentation|Pricing|Trust Center|Company|Download|Downloads|Installation|Enterprise|Release|Runtime|Version|Plan|1–20 Units online)$/i;

async function visibleI18n(page) {
  return page.locator('[data-i18n], [data-t], [data-x]').evaluateAll(nodes => nodes
    .map(node => ({ key: node.hasAttribute('data-i18n') ? node.getAttribute('data-i18n') : node.hasAttribute('data-t') ? 't:' + node.getAttribute('data-t') : 'x:' + node.getAttribute('data-x'), text: node.textContent.trim() }))
    .filter(item => item.text));
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const findings = {};
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { localStorage.setItem('odre-pqc-lang', 'en'); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const english = new Map((await visibleI18n(page)).map(item => [item.key, item.text]));
    findings[route] = {};
    for (const lang of languages) {
      await page.evaluate(language => { localStorage.setItem('odre-pqc-lang', language); }, lang);
      await page.reload({ waitUntil: 'domcontentloaded' });
      const same = (await visibleI18n(page)).filter(item => {
        const source = english.get(item.key);
        return source && item.text === source && !allowed.test(item.text) && !/^[\d$€.,+–—:/()\s-]+$/.test(item.text);
      });
      findings[route][lang] = same.map(item => item.key);
    }
  }
  await browser.close();
  console.log(JSON.stringify(findings, null, 2));
  process.exit(Object.values(findings).some(row => Object.values(row).some(items => items.length)) ? 1 : 0);
})().catch(error => { console.error(error); process.exit(2); });
