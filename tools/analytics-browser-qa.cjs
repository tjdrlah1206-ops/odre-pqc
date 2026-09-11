// Browser QA served exclusively from loopback. Runtime-only JS copies point
// telemetry at loopback, including native lifecycle Beacons. Production files
// are not rewritten. A non-forwarding proxy remains active during teardown.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '.qa-artifacts');
const routes = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/company/', '/contact/', '/releases/', '/license/', '/payment/', '/payment/register/', '/payment/success/', '/terms/', '/privacy/', '/refund/'];
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
fs.mkdirSync(out, { recursive: true });

(async () => {
  const findings = [], visits = [], activities = [], downloads = [], errors = [];
  let origin, blockedProxyRequests = 0, excludedAdminRequests = 0, headlessNativeRequests = 0;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, origin);
    if (url.origin !== origin) { blockedProxyRequests++; response.writeHead(403); response.end(); return; }
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'POST' && /^\/odre-pqc\/analytics\/v1\/(visit|activity|download-click)$/.test(url.pathname)) {
      if (/headless/i.test(request.headers['user-agent'] || '')) headlessNativeRequests++;
      if (String(request.headers.cookie || '').includes('isolated_analytics_admin=local-only-fixture')) {
        excludedAdminRequests++; request.resume(); response.writeHead(202, {'Content-Type':'application/json'}); response.end('{"accepted":false}'); return;
      }
      const chunks = []; let bytes = 0;
      request.on('data', chunk => { bytes += chunk.length; if (bytes > 4096) request.destroy(); else chunks.push(chunk); });
      request.on('end', () => {
        try { const payload = JSON.parse(Buffer.concat(chunks)); (url.pathname.endsWith('/visit') ? visits : url.pathname.endsWith('/download-click') ? downloads : activities).push(payload); response.writeHead(202, {'Content-Type':'application/json'}); response.end('{"accepted":true}'); }
        catch (_) { response.writeHead(400); response.end(); }
      });
      return;
    }
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const local = path.resolve(root, relative, url.pathname.endsWith('/') ? 'index.html' : '');
    if (request.method !== 'GET' || !local.startsWith(root + path.sep) || !fs.existsSync(local) || !fs.statSync(local).isFile()) { response.writeHead(404); response.end(); return; }
    // Keep navigation native without downloading PDF bytes in isolated QA.
    if (path.extname(local).toLowerCase() === '.pdf') { response.writeHead(204); response.end(); return; }
    let body = fs.readFileSync(local);
    if (url.pathname === '/assets/js/analytics.js') body = Buffer.from(body.toString().replaceAll('https://pqc.odreai.com', origin).replaceAll('https://odreai.com/odre-pqc/analytics/v1/', origin + '/odre-pqc/analytics/v1/'));
    if (path.extname(local) === '.html') body = Buffer.from(body.toString().replaceAll('connect-src https://odreai.com;', 'connect-src ' + origin + ';'));
    response.writeHead(200, {'Content-Type':types[path.extname(local)] || 'application/octet-stream'}); response.end(body);
  });
  server.on('connect', (_request, socket) => { blockedProxyRequests++; socket.end('HTTP/1.1 403 Forbidden\r\n\r\n'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true, proxy:{server:origin}, args:['--proxy-bypass-list=<-loopback>', '--disable-background-networking', '--user-agent=' + ua] });
  async function contextFor(locale = 'en-US', width = 1280) {
    const context = await browser.newContext({ locale, userAgent: ua, viewport: { width, height: 900 }, serviceWorkers:'block' });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) return route.continue();
      return route.abort();
    });
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    return context;
  }
  async function loaded(page, url) {
    const before=visits.length;
    await page.goto(url, {waitUntil:'domcontentloaded'});
    for (let i=0; i<40 && visits.length===before; i++) await page.waitForTimeout(100);
    assert.ok(visits.length>before, 'loopback visit received');
    await page.waitForTimeout(200);
  }
  try {
    const administrator = await contextFor();
    await administrator.addCookies([{name:'isolated_analytics_admin',value:'local-only-fixture',url:origin,httpOnly:true,sameSite:'Strict'}]);
    const inspection = await administrator.newPage(); await inspection.goto(origin + '/docs/', {waitUntil:'domcontentloaded'});
    for (let index=0; index<40 && excludedAdminRequests===0; index++) await inspection.waitForTimeout(100);
    assert.equal(excludedAdminRequests,1); await inspection.waitForTimeout(200);
    await inspection.evaluate(()=>document.dispatchEvent(new Event('odre:language')));
    await inspection.locator('a[href$=".pdf"]').first().click();
    await inspection.goto('about:blank'); await administrator.close();
    assert.equal(excludedAdminRequests,1); assert.equal(visits.length,0); assert.equal(activities.length,0);
    assert.equal(downloads.length,0);
    const context = await contextFor(); const page = await context.newPage();
    for (const route of routes) {
      const before = visits.length;
      await loaded(page, origin + route);
      assert.equal(visits.length - before, 1, `one pageview ${route}`);
      assert.equal(visits.at(-1).path, route);
      assert.equal(await page.locator('script[data-odre-analytics]').count(), 1);
    }
    await context.close();
    for (const [locale, rendered, source, fallback] of [['de-DE', 'de', 'browser', false], ['fr-FR', 'en', 'fallback', true], ['ko-KR', 'ko', 'browser', false], ['ja-JP', 'ja', 'browser', false], ['es-ES', 'es', 'browser', false]]) {
      const local = await contextFor(locale, 360); const view = await local.newPage();
      await loaded(view, origin + '/privacy/');
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
    await loaded(pay, `${origin}/payment/success/?transaction_id=${sentinel}&subscription_id=${sentinel}#${sentinel}`);
    assert.ok(!JSON.stringify(visits.concat(activities)).includes(sentinel));
    assert.ok(await pay.locator('#recover').isVisible());
    await loaded(pay, origin + '/payment/register/?flow=activate');
    assert.ok(await pay.locator('#activationView').isVisible());
    assert.equal(await pay.locator('#activationTab').getAttribute('aria-selected'), 'true');
    await payment.close();
    const pdfContext = await contextFor('ko-KR', 360); const pdfPage = await pdfContext.newPage();
    for (const route of ['/docs/', '/security/', '/trust/', '/releases/']) {
      await loaded(pdfPage, origin + route);
      const links = pdfPage.locator('a[href$=".pdf"]'); const count = await links.count();
      for (let index=0; index<count; index++) {
        const href=await links.nth(index).getAttribute('href');
        const isNewGuide=/^\/ODRE_PQC_Installation_License_Activation_Guide_v1\.2\.1_(EN|KO|JA|DE|ES)\.pdf$/.test(href);
        const isReleaseEvidence=/^\/ODRE_PQC_Release_Evidence_20260910_(EN|KO|JA|DE|ES)\.pdf$/.test(href);
        const before=downloads.length; await links.nth(index).click();
        if (isNewGuide || isReleaseEvidence) {
          await pdfPage.waitForTimeout(100);
          assert.equal(downloads.length,before,'new guides have no approved server analytics ID');
          continue;
        }
        for (let wait=0; wait<40 && downloads.length===before; wait++) await pdfPage.waitForTimeout(50);
        assert.equal(downloads.length,before+1, `one event for each real PDF activation: ${route} ${href}`);
        assert.equal(downloads.at(-1).path,route); assert.equal(downloads.at(-1).rendered_language,'ko');
      }
    }
    assert.equal(downloads.length,4);
    assert.deepEqual([...new Set(downloads.map(item=>item.pdf_id))].sort(), ['v029_overview_ko','v029_whitepaper_en','v029_whitepaper_ko']);
    assert.equal(new Set(downloads.map(item=>item.event_id)).size,4);
    await pdfContext.close();
    await new Promise(resolve => setTimeout(resolve, 200));
    assert.deepEqual(errors, [], 'no browser page errors'); assert.deepEqual(findings, [], 'no layout findings');
    fs.writeFileSync(path.join(out, 'analytics-browser-payloads.json'), JSON.stringify({ visits, activities, downloads }, null, 2));
    assert.ok(activities.length > 29, 'native lifecycle Beacons reached the loopback collector');
    assert.equal(headlessNativeRequests,0, 'native exit events preserve the synthetic ordinary-browser UA');
    console.log(JSON.stringify({ public_pages: routes.length, language_cases: 5, privacy_mobile_width: 360, findings, browser_errors: errors, telemetry_destination:'loopback-only runtime fixture', native_lifecycle_capture:true, blocked_proxy_requests:blockedProxyRequests, excluded_admin_requests:excludedAdminRequests, headless_native_requests:headlessNativeRequests, visit_count:visits.length, activity_count:activities.length, pdf_clicks:downloads.length, unique_pdfs:new Set(downloads.map(item=>item.pdf_id)).size, result: 'PASS' }, null, 2));
  } finally { await browser.close(); await new Promise(resolve => setTimeout(resolve, 100)); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
