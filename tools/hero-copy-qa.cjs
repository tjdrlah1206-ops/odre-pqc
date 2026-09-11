'use strict';

// Offline content/layout-rule regression. No live browser, API or payment calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('index.html');
const hero = html.match(/<section class="hero home-hero">([\s\S]*?)<\/section>/)[1];
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.equal((hero.match(/class="hero-title-line(?: [^"]*)?"/g) || []).length, 4);
assert.equal((hero.match(/<li>/g) || []).length, 3);
assert(hero.includes('hero-title-brand">ODRE PQC.</span>'));
const actions = hero.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)[1];
assert.deepEqual([...actions.matchAll(/href="([^"]+)"/g)].map(m => m[1]), ['https://odreai.com/odre-pqc/downloads/production/0.3.0/ODRE_PQC_PRODUCTION_0.3.0_CUSTOMER_DELIVERY.zip', '/contact/#trial', '/docs/']);
const release = hero.match(/<aside class="hero-release"[^>]*>([\s\S]*?)<\/aside>/)[1];
assert.deepEqual([...release.matchAll(/href="([^"]+)"/g)].map(m => m[1]), ['/contact/#trial', '/security/#release-verification', '/product/#system-requirements', '/security/#cryptography', '/trust/#product-download']);
for (const text of ['v0.3.0', 'Windows Server 2022', 'Ubuntu 24.04 LTS', 'Python 3.12', 'ML-KEM-768', 'ML-DSA-65']) assert(release.includes(text));

const nodes = [...hero.matchAll(/<([a-z0-9]+)\b[^>]*data-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g)].map(m => ({
  getAttribute: () => m[2], textContent: m[3].replace(/&amp;/g, '&')
}));
const window = {};
vm.runInNewContext(read('assets/js/page-i18n.js'), {
  window, document: { body: { dataset: { page: 'home' } }, querySelectorAll: () => nodes }
}, { timeout: 1000 });
const required = ['heroClientLine', 'heroServerLine', 'heroSecurityLine', 'heroCopy', 'heroFeaturesLabel', 'heroFeatureClientTitle', 'heroFeatureClientCopy', 'heroFeatureServerTitle', 'heroFeatureServerCopy', 'heroFeatureSecurityTitle', 'heroFeatureSecurityCopy'];
for (const language of ['en', 'ko', 'ja', 'de', 'es']) {
  const copy = window.ODRE_PAGE_I18N[language];
  for (const key of required) {
    assert.equal(typeof copy[key], 'string', `${language}/${key}`);
    assert(copy[key].trim().length > 0);
    if (language !== 'en') assert.notEqual(copy[key], window.ODRE_PAGE_I18N.en[key], `English fallback: ${language}/${key}`);
  }
  for (const platform of ['Android', 'iOS', 'Web']) assert(copy.heroFeatureClientCopy.includes(platform));
  assert(copy.heroFeatureClientCopy.includes('SDK'));
  for (const component of ['FastAPI', 'ODRE PQC', 'install(app)', 'Core', 'Gateway', 'Windows Server 2022', 'Ubuntu 24.04 LTS']) assert(copy.heroFeatureServerCopy.includes(component));
  const setup = copy.heroFeatureServerCopy.toLowerCase();
  assert(setup.indexOf('import') >= 0);
  assert(setup.indexOf('import') < setup.indexOf('install(app)'));
  assert(setup.indexOf('install(app)') < setup.indexOf('gateway'));
  assert(copy.heroFeatureSecurityTitle.includes('Fail-Closed'));
  assert(copy.heroFeatureSecurityCopy.includes('Protected Handler'));
  assert(copy.heroCopy.includes('HTTPS/TLS') && copy.heroCopy.includes('Gateway → Core'));
}
const ko = window.ODRE_PAGE_I18N.ko;
assert.deepEqual([ko.heroClientLine, ko.heroServerLine, ko.heroSecurityLine], ['클라이언트는 그대로.', '서버 설치는 간편하게.', '보호를 검증할 수 없으면, 요청을 차단합니다.']);
assert(ko.heroFeatureSecurityCopy.includes('실행 전에 해당 요청을 차단합니다.'));
assert(ko.heroFeatureSecurityCopy.includes('서버 전체를 끄는 것이 아닙니다.'));
assert(ko.heroFeatureServerCopy.includes('install(app)으로 Core 경계를 등록한 뒤 Gateway를 연결합니다.'));
assert(hero.includes('install(app)'));

const css = read('assets/css/site.css');
const tablet = css.split('@media (max-width: 1023px) {')[1].split('@media (max-width: 767px) {')[0];
const mobile = css.split('@media (max-width: 767px) {')[1].split('@media (max-width: 390px) {')[0];
assert(tablet.includes('.home-hero .hero-grid { grid-template-columns: 1fr;'));
assert(mobile.includes('.home-hero .hero-title { font-size: clamp('));
assert(mobile.includes('.hero-release { grid-template-columns: repeat(2, minmax(0, 1fr));'));
assert(mobile.includes('.hero-actions .button { width: 100%; }'));
assert(!css.match(/\.home-hero[^}]*height:\s*\d+px/));
assert(html.includes('/assets/css/site.css?v=site-conversion-20260911'));
assert(html.includes('/assets/js/page-i18n.js?v=launch-030-20260912'));
assert.equal((html.match(/name="naver-site-verification"/g) || []).length, 1);
assert(html.includes('href="https://pqc.odreai.com/"'));
console.log(JSON.stringify({ result: 'PASS', languages: 5, features_per_language: 3, korean_headline: 'EXACT_MATCH', protected_request_scope: 'PRESERVED', client_tls_scope: 'PRESERVED', call_to_action_links: 3, release_links: 5, responsive_css_rules: 'PASS', browser_visual_test: 'NOT_RUN', network_requests: 0 }, null, 2));
