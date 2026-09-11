// Offline contract tests: no sockets, production requests, browser installation,
// customer input or credentials. All network methods are in-memory test doubles.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto').webcrypto;

const root = path.resolve(__dirname, '..');
const siteSource = fs.readFileSync(path.join(root, 'assets/js/site.js'), 'utf8');
const trackerSource = fs.readFileSync(path.join(root, 'assets/js/analytics.js'), 'utf8');
const routes = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/company/', '/contact/', '/releases/', '/license/', '/payment/', '/payment/register/', '/payment/success/', '/terms/', '/privacy/', '/refund/'];
function storage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return { getItem: key => map.has(key) ? map.get(key) : null, setItem: (key, value) => map.set(key, String(value)), values: map };
}
function environment(options = {}) {
  let tick = 0;
  const docEvents = {}, windowEvents = {}, scripts = [], requests = [], beacons = [], timers = [], intervals = [];
  const local = options.local || storage();
  const session = options.session || storage();
  const add = (events, type, callback) => (events[type] ||= []).push(callback);
  const emit = (events, type, detail) => (events[type] || []).forEach(callback => callback(detail || { type }));
  const document = {
    title: 'ODRE PQC', documentElement: { lang: 'en' }, visibilityState: options.hidden ? 'hidden' : 'visible', referrer: options.referrer || '',
    querySelector: selector => selector === 'script[data-odre-analytics]' ? scripts.find(value => value.attrs['data-odre-analytics'] !== undefined) || null : null,
    querySelectorAll: () => [], getElementById: () => null,
    createElement: () => ({ attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } }),
    head: { appendChild: element => scripts.push(element) },
    addEventListener: (type, callback) => add(docEvents, type, callback),
    dispatchEvent: event => emit(docEvents, event.type, event)
  };
  const context = {
    document, location: { origin: options.origin || 'https://pqc.odreai.com', pathname: options.path || '/', search: options.query || '', hash: options.hash || '' },
    navigator: { language: options.language || 'en-US', userAgent: options.ua || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36', maxTouchPoints: options.maxTouchPoints || 0,
      sendBeacon: (url, blob) => { beacons.push({ url, blob }); return options.beaconResult !== false; } },
    localStorage: local, sessionStorage: session, screen: { width: 1920, height: 1080 },
    crypto, Uint8Array, URL, URLSearchParams, Blob, Promise, Number, console,
    CustomEvent: class { constructor(type, values) { this.type = type; this.detail = values.detail; } },
    history: { state: null, replaceState: () => { context.location.hash = ''; } },
    Date: { now: () => 1809730800000 + (options.wallOffset || 0) + tick },
    performance: { now: () => tick },
    addEventListener: (type, callback) => add(windowEvents, type, callback),
    setTimeout: callback => timers.push(callback), setInterval: callback => intervals.push(callback),
    fetch: (url, request) => {
      requests.push({ url, ...request, json: JSON.parse(request.body) });
      if (options.network === 'pending') return new Promise(() => {});
      const reply = options.reply ? options.reply({ url, request, number: requests.length }) : { status: 202, body: { accepted: true } };
      return options.network === 'fail' ? Promise.reject(new Error('offline')) : Promise.resolve({ status: reply.status, json: () => reply.invalidJson ? Promise.reject(new Error('invalid JSON')) : Promise.resolve(reply.body) });
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(siteSource, context, { filename: 'site.js' });
  return {
    context, requests, beacons, scripts, timers, intervals, local, session,
    start: () => vm.runInContext(trackerSource, context, { filename: 'analytics.js' }),
    advance: ms => { tick += ms; },
    heartbeat: () => intervals.forEach(callback => callback()),
    visibility: value => { document.visibilityState = value; emit(docEvents, 'visibilitychange'); },
    emitWindow: type => emit(windowEvents, type),
    pdfClick: (href, values = {}) => {
      const event = { type: 'click', isTrusted: true, button: 0, defaultPrevented: false, ...values,
        target: { closest: selector => selector === 'a[href]' ? { getAttribute: () => href } : null },
        preventDefault() { this.defaultPrevented = true; } };
      emit(docEvents, event.type, event); return event;
    },
    select: code => emit(docEvents, 'click', { target: { closest: selector => selector === '[data-language-choice]' ? { getAttribute: () => code } : null } })
  };
}
const flush = async () => { for (let index = 0; index < 16; index += 1) await Promise.resolve(); };
let assertions = 0;
async function test(name, body) { await body(); assertions += 1; process.stdout.write(`PASS ${name}\n`); }

(async () => {
  await test('17 pages use the common loader once, payment scripts unchanged by integration', () => {
    routes.forEach(route => {
      const file = path.join(root, route.slice(1), 'index.html');
      const html = fs.readFileSync(file, 'utf8');
      assert.equal((html.match(/src="\/assets\/js\/site\.js(?:\?[^"#]*)?"/g) || []).length, 1, route);
      assert.ok(!html.includes('src="/assets/js/analytics.js"'), route);
      const env = environment({ path: route }); env.start();
      assert.equal(env.requests.filter(item => item.url.endsWith('/visit')).length, 1, route);
      assert.equal(env.scripts.length, 1); assert.equal(env.scripts[0].async, true);
      assert.equal(env.scripts[0].referrerPolicy, 'no-referrer');
    });
  });
  await test('one pageview per document despite duplicate execution and language selection', async () => {
    const env = environment({ language: 'de-DE' }); env.start(); env.start(); await flush();
    env.select('ko'); await flush();
    assert.equal(env.requests.filter(item => item.url.endsWith('/visit')).length, 1);
    const update = env.requests.at(-1).json;
    assert.equal(update.browser_language, 'de-DE'); assert.equal(update.browser_primary_language, 'de');
    assert.equal(update.selected_language, 'ko'); assert.equal(update.rendered_language, 'ko');
    assert.equal(update.language_source, 'manual'); assert.equal(update.translated_view, true); assert.equal(update.fallback_used, false);
  });
  await test('new browser choice, unsupported fallback and legacy ambiguity remain distinct', () => {
    for (const [language, saved, source, rendered, fallback] of [
      ['de-DE', null, 'browser', 'de', false], ['fr-FR', null, 'fallback', 'en', true],
      ['de-DE', 'ko', 'unknown', 'ko', false], ['fr-FR', 'en', 'unknown', 'en', false]
    ]) {
      const env = environment({ language, local: storage(saved ? { 'odre-pqc-lang': saved } : {}) }); env.start();
      const value = env.requests[0].json;
      assert.equal(value.language_source, source); assert.equal(value.rendered_language, rendered); assert.equal(value.selected_language, null); assert.equal(value.fallback_used, fallback);
    }
    const query = environment({ language: 'de-DE', query: '?lang=ko' }); query.start();
    assert.equal(query.requests[0].json.rendered_language, 'ko'); assert.equal(query.requests[0].json.language_source, 'unknown');
  });
  await test('explicit language preference persists without losing its provenance', () => {
    const local = storage(); const first = environment({ language: 'de-DE', local }); first.select('ja');
    const next = environment({ language: 'de-DE', local }); next.start();
    assert.equal(next.requests[0].json.selected_language, 'ja'); assert.equal(next.requests[0].json.language_source, 'manual');
  });
  await test('changed browser locale preserves saved display but downgrades stale automatic provenance', () => {
    for (const [originalLanguage, changedLanguage] of [['fr-FR', 'de-DE'], ['de-DE', 'ko-KR']]) {
      const local = storage(); const first = environment({ language: originalLanguage, local });
      const saved = first.context.document.documentElement.lang;
      const next = environment({ language: changedLanguage, local }); next.start();
      assert.equal(next.requests[0].json.rendered_language, saved); assert.equal(next.requests[0].json.language_source, 'unknown');
      assert.equal(next.requests[0].json.selected_language, null); assert.equal(next.requests[0].json.fallback_used, false);
    }
  });
  await test('sensitive query/fragment/referrer input cannot enter payload or session storage', async () => {
    const secret = 'PRIVATE_TEST_SENTINEL';
    const env = environment({ path: '/payment/success/', query: `?transaction_id=${secret}&email=${secret}`, hash: `#${secret}`, referrer: `https://search.example/results?subscription_id=${secret}#${secret}` });
    env.start(); await flush();
    assert.equal(env.requests[0].json.path, '/payment/success/'); assert.equal(env.requests[0].json.referrer_hostname, 'search.example');
    for (const request of env.requests) { assert.ok(!request.body.includes(secret)); assert.equal(request.credentials, 'include'); assert.equal(request.referrerPolicy, 'no-referrer'); assert.equal(request.redirect, 'error'); }
    assert.ok(!JSON.stringify([...env.session.values]).includes(secret));
    assert.ok(!JSON.stringify(env.requests.map(item => item.json)).includes('Mozilla'));
  });
  await test('duration is cumulative visible time; hide/pagehide duplicates suppressed', async () => {
    const env = environment(); env.start(); await flush();
    env.advance(60000); env.heartbeat(); await flush();
    assert.equal(env.requests.at(-1).json.active_ms, 60000);
    env.advance(5000); env.visibility('hidden'); env.emitWindow('pagehide');
    assert.equal(env.beacons.filter(item => item.url.endsWith('/activity')).length, 1);
    assert.equal(JSON.parse(await env.beacons[0].blob.text()).active_ms, 65000);
    env.advance(600000); env.heartbeat(); env.visibility('visible'); env.advance(20000); env.heartbeat(); await flush();
    assert.equal(env.requests.at(-1).json.active_ms, 85000);
    assert.equal(new Set(env.requests.map(item => item.json.pageview_id)).size, 1);
  });
  await test('document locale remains consistent on PDF navigation teardown', async () => {
    const env = environment({ language: 'ko-KR', path: '/docs/' }); env.start(); await flush();
    env.context.navigator.language = 'en-US';
    env.advance(3000); env.visibility('hidden');
    const exit = JSON.parse(await env.beacons.at(-1).blob.text());
    assert.equal(exit.browser_language, 'ko-KR'); assert.equal(exit.browser_primary_language, 'ko');
    assert.equal(exit.rendered_language, 'ko'); assert.equal(exit.language_source, 'browser');
    env.visibility('visible'); env.select('de'); await flush();
    assert.equal(env.requests.at(-1).json.browser_language, 'ko-KR');
    assert.equal(env.requests.at(-1).json.rendered_language, 'de');
    assert.equal(env.requests.at(-1).json.language_source, 'manual');
  });
  await test('pending initial request gets idempotent pagehide visit with cumulative time', async () => {
    const env = environment({ network: 'pending' }); env.start(); env.advance(2500); env.visibility('hidden');
    const finalVisit = env.beacons.find(item => item.url.endsWith('/visit'));
    assert.ok(finalVisit); const value = JSON.parse(await finalVisit.blob.text());
    assert.equal(value.pageview_id, env.requests[0].json.pageview_id); assert.equal(value.active_ms, 2500);
    assert.equal(env.beacons.filter(item => item.url.endsWith('/activity')).length, 0);
  });
  await test('excluded administrator stops all document telemetry without persisting exclusion', async () => {
    const session = storage();
    const env = environment({ session, reply: () => ({ status: 202, body: { accepted: false } }) }); env.start(); await flush();
    env.advance(60000); env.heartbeat(); env.select('ko'); env.visibility('hidden'); env.emitWindow('pagehide'); env.visibility('visible'); env.emitWindow('pageshow');
    while (env.timers.length) env.timers.shift()();
    await flush(); assert.equal(env.requests.length, 1); assert.equal(env.beacons.length, 0);
    assert.equal(session.getItem('odre-pqc-analytics-optout'), null);
    const loggedOut = environment({ session }); loggedOut.start(); await flush();
    assert.equal(loggedOut.requests.filter(item => item.url.endsWith('/visit')).length, 1);
    assert.equal(loggedOut.requests.filter(item => item.url.endsWith('/activity')).length, 1);
  });
  await test('later administrator exclusion stops heartbeat, language and exit updates', async () => {
    const env = environment({ reply: ({ number }) => ({ status: 202, body: { accepted: number < 3 } }) }); env.start(); await flush();
    env.advance(60000); env.heartbeat(); await flush(); assert.equal(env.requests.length, 3);
    env.advance(60000); env.heartbeat(); env.select('ja'); env.visibility('hidden'); env.emitWindow('pagehide'); await flush();
    assert.equal(env.requests.length, 3); assert.equal(env.beacons.length, 0);
  });
  await test('malformed 202 responses never masquerade as acceptance or permanent exclusion', async () => {
    for (const reply of [{ status: 202, body: {} }, { status: 202, body: { accepted: 'false' } }, { status: 202, invalidJson: true }]) {
      const env = environment({ reply: () => reply }); env.start();
      for (let index = 0; index < 5; index++) { await flush(); if (env.timers.length) env.timers.shift()(); }
      assert.equal(env.requests.length, 3); assert.ok(env.requests.every(item => item.url.endsWith('/visit')));
    }
  });
  await test('transient failure can recover but queued retries cannot undo exclusion', async () => {
    for (const accepted of [true, false]) {
      const env = environment({ reply: ({ number }) => number === 1 ? { status: 503 } : { status: 202, body: { accepted } } });
      env.start(); await flush(); const queued = env.timers.shift(); assert.ok(queued); queued(); await flush();
      const count = env.requests.length; queued(); env.visibility('hidden'); await flush();
      assert.equal(env.requests.length, count); assert.equal(count, accepted ? 3 : 2);
      if (!accepted) assert.equal(env.beacons.length, 0);
    }
  });
  await test('Android and iPhone visible 60 seconds survive hide without counting background', async () => {
    for (const ua of ['Mozilla/5.0 (Linux; Android 14) Chrome/130.0.0.0 Mobile Safari/537.36', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1']) {
      const env = environment({ ua, maxTouchPoints: 5 }); env.start(); await flush();
      env.advance(60000); env.heartbeat(); await flush();
      assert.equal(env.requests.at(-1).json.active_ms, 60000); assert.equal(env.requests[0].json.device, 'mobile');
      assert.ok(env.requests.every(item => item.credentials === 'include'));
      env.advance(5000); env.visibility('hidden'); env.emitWindow('pagehide');
      assert.equal(env.beacons.length, 1); const last = JSON.parse(await env.beacons[0].blob.text());
      assert.equal(last.active_ms, 65000); assert.equal(last.pageview_id, env.requests[0].json.pageview_id);
      const count = env.requests.length; env.advance(600000); env.heartbeat(); await flush(); assert.equal(env.requests.length, count);
      env.visibility('visible'); await flush(); assert.equal(env.requests.at(-1).json.active_ms, 65000);
    }
  });
  await test('computer suspension cannot add hours of unobserved visible dwell', async () => {
    const env = environment(); env.start(); await flush(); env.advance(10800000); env.heartbeat(); await flush();
    assert.equal(env.requests.at(-1).json.active_ms, 90000);
  });
  await test('IP-literal and single-label referrers are discarded instead of rejecting visits', () => {
    for (const referrer of ['https://127.0.0.1/private', 'https://[::1]/private', 'https://intranet/private']) {
      const env = environment({ referrer }); env.start(); assert.equal(env.requests[0].json.referrer_hostname, null);
    }
  });
  await test('network outage is silent and initial request retry count is bounded', async () => {
    const env = environment({ network: 'fail' }); env.start();
    for (let index = 0; index < 5; index += 1) { await flush(); if (env.timers.length) env.timers.shift()(); }
    await flush(); assert.equal(env.requests.filter(item => item.url.endsWith('/visit')).length, 3);
  });
  await test('tab session continuity, paths and 30-minute inactivity rotation', () => {
    const session = storage(); const first = environment({ path: '/product/', session }); first.start();
    const next = environment({ path: '/docs/', session, wallOffset: 1000 }); next.start();
    assert.equal(next.requests[0].json.session_id, first.requests[0].json.session_id);
    assert.equal(next.requests[0].json.visitor_id, first.requests[0].json.visitor_id);
    assert.equal(next.requests[0].json.entry_path, '/product/'); assert.equal(next.requests[0].json.previous_path, '/product/');
    const later = environment({ path: '/pricing/', session, wallOffset: 1900000 }); later.start();
    assert.notEqual(later.requests[0].json.session_id, next.requests[0].json.session_id);
    assert.equal(later.requests[0].json.visitor_id, next.requests[0].json.visitor_id); assert.equal(later.requests[0].json.entry_path, '/pricing/');
  });
  await test('admin/API/unapproved paths, local development and known bots send nothing', () => {
    for (const options of [{ path: '/admin.html' }, { path: '/api/' }, { path: '/private/' }, { origin: 'http://127.0.0.1:4173' }, { origin: 'https://untrusted.example' }, { ua: 'Googlebot/2.1' }, { ua: 'HeadlessChrome/130' }]) {
      const env = environment(options); env.start(); assert.equal(env.requests.length, 0);
    }
  });
  await test('administrator inspection opt-out suppresses this tab and strips the control marker', () => {
    const session = storage();
    const first = environment({ hash: '#odre-analytics-off', session }); first.start();
    assert.equal(first.requests.length, 0); assert.equal(first.context.location.hash, '');
    assert.equal(session.getItem('odre-pqc-analytics-optout'), 'true');
    const next = environment({ path: '/pricing/', session }); next.start(); assert.equal(next.requests.length, 0);
    assert.ok(!JSON.stringify([...session.values]).includes('#odre-analytics-off'));
  });
  await test('storage-disabled browser remains functional and uses cryptographic ephemeral IDs', () => {
    const disabled = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } };
    const env = environment({ local: disabled, session: disabled }); env.start();
    assert.match(env.requests[0].json.visitor_id, /^[0-9a-f-]{36}$/); assert.equal(env.requests[0].json.screen_width, 1900); assert.equal(env.requests[0].json.screen_height, 1100);
  });
  await test('coarse desktop/mobile/tablet and browser/OS families without persisting raw UA', () => {
    for (const [ua, touch, device, os, browser] of [
      ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1', 5, 'mobile', 'iOS', 'Safari'],
      ['Mozilla/5.0 (Linux; Android 14) Chrome/130.0.0.0 Mobile Safari/537.36', 5, 'mobile', 'Android', 'Chrome'],
      ['Mozilla/5.0 (Linux; Android 14) Chrome/130.0.0.0 Safari/537.36', 5, 'tablet', 'Android', 'Chrome'],
      ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/17.0 Safari/605.1.15', 5, 'tablet', 'iOS', 'Safari'],
      ['Mozilla/5.0 (Windows NT 10.0) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', 0, 'desktop', 'Windows', 'Edge'],
      ['Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0', 0, 'desktop', 'Linux', 'Firefox']
    ]) {
      const env = environment({ ua, maxTouchPoints: touch }); env.start(); const value = env.requests[0].json;
      assert.equal(value.device, device); assert.equal(value.os, os); assert.equal(value.browser, browser);
      assert.ok(!env.requests[0].body.includes(ua));
    }
  });
  await test('five-language privacy notice and static no-JavaScript disclosure exist', () => {
    const privacy = fs.readFileSync(path.join(root, 'privacy/index.html'), 'utf8');
    const legal = fs.readFileSync(path.join(root, 'legal.js'), 'utf8');
    assert.ok(privacy.includes('id="analytics-privacy"')); assert.ok(privacy.includes('sessionStorage'));
    for (const title of ['First-party website statistics', '자체 홈페이지 방문 통계', '自社サイトのアクセス統計', 'Eigene Website-Statistik', 'Estadísticas propias del sitio']) assert.ok(legal.includes(title));
  });
  await test('installation, trial and release-evidence guides remain untracked; four legacy references retain their IDs', async () => {
    const env = environment({ path: '/docs/', language: 'ko-KR' }); env.start(); await flush();
    const links = [];
    for (const route of routes) {
      const html = fs.readFileSync(path.join(root, route.slice(1), 'index.html'), 'utf8');
      links.push(...Array.from(html.matchAll(/href="([^"]+\.pdf)"/g), match => match[1]));
    }
    assert.equal(links.length, 11);
    const releaseEvidence = links.filter(href => href === '/ODRE_PQC_Release_Evidence_20260910_EN.pdf');
    assert.equal(releaseEvidence.length, 1, 'one release-evidence link was added after the legacy fixture');
    const guides = links.filter(href => /^\/ODRE_PQC_Installation_License_Activation_Guide_v1\.2\.1_(EN|KO|JA|DE|ES)\.pdf$/.test(href));
    assert.equal(guides.length, 5);
    assert.equal(new Set(guides).size, 5);
    const trialFallbacks = links.filter(href => href === '/ODRE_PQC_14_Day_Free_Trial_Guide_v1.3_RC2_EN.pdf');
    assert.equal(trialFallbacks.length, 1);
    const trialGuides = ['KO','EN','JA','ES','DE'].map(language => `/ODRE_PQC_14_Day_Free_Trial_Guide_v1.3_RC2_${language}.pdf`);
    for (const href of guides) assert.equal(env.pdfClick(href).defaultPrevented, false);
    for (const href of trialGuides) assert.equal(env.pdfClick(href).defaultPrevented, false);
    for (const href of releaseEvidence) assert.equal(env.pdfClick(href).defaultPrevented, false);
    assert.equal(env.beacons.length, 0, 'new guides must not masquerade as registered v0.2.9 whitepapers');
    for (const href of links.filter(href => !guides.includes(href) && !trialGuides.includes(href) && !releaseEvidence.includes(href))) assert.equal(env.pdfClick(href).defaultPrevented, false);
    const sent = await Promise.all(env.beacons.map(async item => ({ url: item.url, payload: JSON.parse(await item.blob.text()) })));
    assert.equal(sent.length, 4); assert.ok(sent.every(item => item.url.endsWith('/download-click')));
    assert.equal(new Set(sent.map(item => item.payload.pdf_id)).size, 2);
    assert.equal(new Set(sent.map(item => item.payload.event_id)).size, 4);
    assert.ok(sent.every(item => item.payload.rendered_language === 'ko' && item.payload.path === '/docs/'));
    assert.ok(sent.some(item => item.payload.pdf_id === 'v029_whitepaper_en'));
    assert.ok(sent.every(item => !('url' in item.payload) && !('document_language' in item.payload)));
  });
  await test('PDF allowlist discards URLs, secrets, untrusted events and menu-only navigation', async () => {
    const env = environment(); env.start(); await flush();
    const pdf = '/ODRE_PQC_v0.2.9_Public_Technical_Whitepaper_EN.pdf';
    for (const href of ['/docs/#downloads', '/private.pdf', 'https://untrusted.example' + pdf, 'https://synthetic:synthetic@pqc.odreai.com' + pdf, '/bad%ZZ.pdf']) env.pdfClick(href);
    env.pdfClick(pdf, { isTrusted: false }); env.pdfClick(pdf, { button: 2 });
    assert.equal(env.beacons.length, 0);
    env.pdfClick(pdf + '?token=PRIVATE_PDF_SENTINEL#PRIVATE_PDF_SENTINEL');
    env.pdfClick(pdf, { type: 'auxclick', button: 1 });
    assert.equal(env.beacons.length, 2);
    for (const item of env.beacons) assert.ok(!(await item.blob.text()).includes('PRIVATE_PDF_SENTINEL'));
  });
  await test('PDF click survives pending visit but never bypasses known administrator exclusion', async () => {
    const pdf='/ODRE_PQC_v0.2.9_Public_Technical_Whitepaper_EN.pdf';
    const pending=environment({network:'pending'}); pending.start(); pending.pdfClick(pdf);
    assert.equal(pending.beacons.filter(item=>item.url.endsWith('/download-click')).length,1);
    const excluded=environment({reply:()=>({status:202,body:{accepted:false}})}); excluded.start(); await flush(); excluded.pdfClick(pdf);
    assert.equal(excluded.beacons.length,0);
    const fallback=environment({beaconResult:false}); fallback.start(); await flush(); fallback.pdfClick(pdf); await flush();
    const sent=fallback.requests.find(item=>item.url.endsWith('/download-click'));
    assert.ok(sent); assert.equal(sent.keepalive,true); assert.equal(sent.credentials,'include');
    assert.equal(sent.json.event_id,JSON.parse(await fallback.beacons[0].blob.text()).event_id);
  });
  process.stdout.write(`ANALYTICS_QA: ${assertions}/${assertions} PASS; NETWORK_CONTACT: 0\n`);
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
