'use strict';
// Offline fixtures only. No browser, Paddle API, payment or production calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const retired = /\/enterprise\/|Enterprise|21\+\s*Units|21 (?:or more )?Units|1[–～〜~-]20\s*Units|1 a 20\s*Units/i;
const files = ['index.html', 'pricing/index.html', 'license/index.html', 'docs/index.html', 'contact/index.html', 'payment/index.html', 'terms/index.html', 'company/index.html', 'trust/index.html', 'legal.js', 'assets/js/site.js', 'assets/js/page-i18n.js', 'sitemap.xml'];
for (const file of files) assert(!retired.test(read(file)), `Retired enterprise/range copy: ${file}`);
assert(!fs.existsSync(path.join(root, 'enterprise/index.html')));
const html = read('license/index.html');
assert.equal((html.match(/<article class="price-card/g) || []).length, 2);
assert(html.includes('class="pricing-grid license-plans"'));
const css = read('assets/css/site.css');
assert(css.includes('.pricing-grid.license-plans { grid-template-columns: repeat(2, minmax(0, 1fr)); }'));
assert(css.includes('.pricing-grid, .pricing-grid.license-plans { grid-template-columns: 1fr; }'));
for (const id of ['monthlyUnits', 'annualUnits']) {
  const input = html.match(new RegExp('<input\\b[^>]*id="' + id + '"[^>]*>'))[0];
  assert(input.includes('min="1"') && input.includes('max="1000"') && input.includes('step="1"'));
}
for (const [page, file] of [['home', 'index.html'], ['pricing', 'pricing/index.html'], ['license', 'license/index.html'], ['docs', 'docs/index.html'], ['contact', 'contact/index.html'], ['company', 'company/index.html']]) {
  const nodes = [...read(file).matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(m => ({ getAttribute: () => m[1], textContent: m[2] }));
  const window = {};
  vm.runInNewContext(read('assets/js/page-i18n.js'), { window, document: { body: { dataset: { page } }, querySelectorAll: () => nodes } }, { timeout: 1000 });
  for (const language of ['en', 'ko', 'ja', 'de', 'es']) {
    const copy = window.ODRE_PAGE_I18N[language];
    for (const node of nodes) assert(!retired.test(copy[node.getAttribute()] || ''), `${page}/${language}/${node.getAttribute()}`);
    if (page === 'license' || page === 'pricing') {
      const normalized = copy.unitPolicy.replace(/[,.]/g, '');
      assert(/1[–～~]1000|1 a 1000/.test(normalized), `${page}/${language} range`);
      if (language !== 'en') assert.notEqual(copy.unitPolicy, window.ODRE_PAGE_I18N.en.unitPolicy);
    }
  }
}
const source = read('assets/js/checkout.js');
assert(source.includes('publicCheckoutEnabled: false'));
// Enable only the in-memory copy to inspect future checkout arguments via a mock.
const nodes = Object.fromEntries(['monthlyUnits', 'annualUnits', 'monthlyTotal', 'annualTotal', 'monthlyCheckout', 'annualCheckout'].map(id => [id, { id, value: '1', listeners: {}, setAttribute() {}, focus() {}, addEventListener(k, fn) { this.listeners[k] = fn; } }]));
const opens = [];
let initialized = 0;
vm.runInNewContext(source.replace('publicCheckoutEnabled: false', 'publicCheckoutEnabled: true'), {
  document: { documentElement: { lang: 'en' }, getElementById: id => nodes[id], querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, createElement() { throw new Error('No network'); }, head: { appendChild() { throw new Error('No network'); } } },
  window: { Paddle: { Initialize() { initialized++; }, Checkout: { open(value) { opens.push(value); } } }, alert() { throw new Error('Unexpected unavailable checkout'); } },
  location: { search: '' }, URLSearchParams, console
}, { timeout: 1000 });
assert.equal(initialized, 1);
for (const [plan, priceId] of [['monthly', 'pri_01m1p2dqq1xv8em7tgv81cwkms'], ['annual', 'pri_01m1p2gh8th4460tab4m0v2vyg']]) {
  for (const [input, expected] of [['1', 1], ['20', 20], ['21', 21], ['999', 999], ['1000', 1000], ['1001', 1000]]) {
    nodes[plan + 'Units'].value = input;
    nodes[plan + 'Checkout'].listeners.click();
    assert.deepEqual(JSON.parse(JSON.stringify(opens.at(-1).items)), [{ priceId, quantity: expected }]);
  }
}
console.log(JSON.stringify({ result: 'PASS', languages: 5, range: '1-1000', plans: 2, mockedCheckoutBoundaryCases: opens.length, enterprisePageAndLinks: 'REMOVED', actualCheckoutCalls: 0, actualPayments: 0, productionApiCalls: 0 }, null, 2));
