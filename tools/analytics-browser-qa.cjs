// Full browser rendering with every request intercepted. No Production contact.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.qa-artifacts');
const routes = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/company/', '/contact/', '/enterprise/', '/releases/', '/license/', '/payment/', '/payment/register/', '/payment/success/', '/terms/', '/privacy/', '/refund/'];
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const findings = [], visits = [], activities = [], errors = [];
  async function contextFor(locale = 'en-US', width = 1280) {
    const context = await browser.newContext({ locale, userAgent: ua, viewport: { width, height: 900 } });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === 'https://pqc.odreai.com') {
        const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        const local = path.resolve(root, relative, url.pathname.endsWith('/') ? 'index.html' : '');
        if (!local.startsWith(root + path.sep) || !fs.existsSync(local) || !fs.statSync(local).isFile()) return route.fulfill({ status: 404, body: 'not found' });
        return route.fulfill({ status: 200, contentType: types[path.extname(local)] || 'application/octet-stream', body: fs.readFileSync(local) });
      }
      if (url.origin === 'https://odreai.com' && /^\/odre-pqc\/analytics\/v1\/(visit|activity)$/.test(url.pathname)) {
        const body = JSON.parse(route.request().postData());
        (url.pathname.endsWith('/visit') ? visits : activities).push(body);
        return route.fulfill({ status: 202, headers: { 'Access-Control-Allow-Origin': 'https://pqc.odreai.com' }, contentType: 'application/json', body: '{"accepted":true}' });
      }
      return route.abort();
    });
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    return context;
  }
  try {
    const context = await contextFor(); const page = await context.newPage();
    for (const route of routes) {
      const before = visits.length;
      await page.goto('https://pqc.odreai.com' + route, { waitUntil: 'networkidle' });
      assert.equal(visits.length - before, 1, `one pageview ${route}`);
      assert.equal(visits.at(-1).path, route);
      assert.equal(await page.locator('script[data-odre-analytics]').count(), 1);
    }
    await context.close();
    for (const [locale, rendered, source, fallback] of [['de-DE', 'de', 'browser', false], ['fr-FR', 'en', 'fallback', true], ['ko-KR', 'ko', 'browser', false], ['ja-JP', 'ja', 'browser', false], ['es-ES', 'es', 'browser', false]]) {
      const local = await contextFor(locale, 360); const view = await local.newPage();
      await view.goto('https://pqc.odreai.com/privacy/', { waitUntil: 'networkidle' });
      const visit = visits.at(-1);
      assert.equal(visit.browser_language, locale); assert.equal(visit.rendered_language, rendered); assert.equal(visit.language_source, source); assert.equal(visit.fallback_used, fallback);
      assert.equal(await view.locator('#analytics-privacy h2').count(), 1);
      const overflow = await view.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 1) findings.push(`${locale} privacy360 overflow:${overflow}`);
      await view.screenshot({ path: path.join(out, `analytics-privacy-${rendered}-360.png`), fullPage: true });
      const before = visits.length;
      await view.locator('#mobile-toggle').click();
      await view.locator('.mobile-language-grid [data-language-choice="ja"]').click();
      await view.waitForTimeout(100);
      assert.equal(visits.length, before, 'language change does not add pageview');
      assert.equal(activities.at(-1).selected_language, 'ja'); assert.equal(activities.at(-1).language_source, 'manual');
      assert.equal(await view.locator('html').getAttribute('lang'), 'ja');
      await local.close();
    }
    const payment = await contextFor(); const pay = await payment.newPage();
    const sentinel = 'PQC_OFFLINE_PRIVACY_SENTINEL';
    await pay.goto(`https://pqc.odreai.com/payment/success/?transaction_id=${sentinel}&subscription_id=${sentinel}#${sentinel}`, { waitUntil: 'networkidle' });
    assert.ok(!JSON.stringify(visits.concat(activities)).includes(sentinel));
    assert.ok(await pay.locator('#recover').isVisible());
    await pay.goto('https://pqc.odreai.com/payment/register/?flow=activate', { waitUntil: 'networkidle' });
    assert.ok(await pay.locator('#activationView').isVisible());
    assert.equal(await pay.locator('#activationTab').getAttribute('aria-selected'), 'true');
    await payment.close();
    assert.deepEqual(errors, [], 'no browser page errors'); assert.deepEqual(findings, [], 'no layout findings');
    fs.writeFileSync(path.join(out, 'analytics-browser-payloads.json'), JSON.stringify({ visits, activities }, null, 2));
    console.log(JSON.stringify({ public_pages: routes.length, language_cases: 5, privacy_mobile_width: 360, findings, browser_errors: errors, network_contact: 0, result: 'PASS' }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
