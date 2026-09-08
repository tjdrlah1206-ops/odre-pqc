'use strict';
// Offline DOM tests of shipped language code. No download/checkout/API requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const hashes = {
  ko: 'f2732a68e84260c7bd35f2c292cc2cbb4b83bb8220acc00bda2ca9b7af9e4217',
  en: '9b291e5d6d0ec9340d74bac1b9f15f316ffc1c3aefbb36098aea13ad57a36448',
  ja: 'd6e9c46bb696d7943f4f7bc67fb1ffb2d489db65a4feea090a5c838848462862',
  es: 'd03a68b7f007460f3f5b7773c31e504885b5cc912d8d57515598cf277d69f2c1',
  de: 'eb0a08f2af6fb36771c3404b7dfcdc9dec62e021762c03adf047f6939034303e'
};
const filename = lang => `ODRE_PQC_14_Day_Free_Trial_Guide_v1.3_RC1_${lang.toUpperCase()}.pdf`;
for (const [lang, hash] of Object.entries(hashes)) {
  const bytes = fs.readFileSync(path.join(root, filename(lang)));
  assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
}
const html = read('contact/index.html');
assert(html.includes('/assets/js/site.js?v=launch-contract-20260909'));
assert(html.includes('/assets/js/page-i18n.js?v=launch-contract-20260909'));
const markup = html.match(/<a\b([^>]*id="trial-guide-pdf"[^>]*)>([^<]+)<\/a>/);
assert(markup);
function node(attrs, textContent = '') {
  return { attrs, textContent, getAttribute: key => attrs[key], setAttribute: (key, value) => { attrs[key] = String(value); } };
}
function fixture(options = {}) {
  const guide = node(Object.fromEntries([...markup[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]])), markup[2]);
  // Without JS, the English document matches the HTML document language.
  assert.equal(guide.attrs.href, '/' + filename('en'));
  assert.equal(guide.attrs.download, filename('en'));
  assert.equal(guide.attrs.hreflang, 'en');
  const unknown = node({ 'data-pqc-document': '__proto__', href: '/unchanged' });
  const installer = node({ id: 'trial-download', disabled: '', 'aria-disabled': 'true' });
  const events = [];
  const saved = new Map(options.saved ? [['odre-pqc-lang', options.saved]] : []);
  const document = {
    title: 'Contact | ODRE PQC', body: { dataset: { page: 'contact' } }, documentElement: { lang: 'en' },
    querySelector: selector => selector === 'script[data-odre-analytics]' ? {} : null,
    querySelectorAll: selector => selector === '[data-i18n]' ? [guide] : selector === 'a[data-pqc-document]' ? [guide, unknown] : [],
    getElementById: () => null, addEventListener() {}, dispatchEvent: event => events.push(event)
  };
  const context = { document, location: { search: options.query || '' }, navigator: { language: options.browser || 'en-US' },
    localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) },
    URLSearchParams, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } }, addEventListener() {}
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('assets/js/page-i18n.js'), context, { timeout: 1000 });
  vm.runInContext(read('assets/js/site.js'), context, { timeout: 1000 });
  function check(lang) {
    assert.equal(document.documentElement.lang, lang);
    assert.equal(guide.attrs.href, '/' + filename(lang));
    assert.equal(guide.attrs.download, filename(lang));
    assert.equal(guide.attrs.hreflang, lang);
    assert.equal(guide.attrs.type, 'application/pdf');
    assert.equal(guide.textContent, context.ODRE_PAGE_I18N[lang].trialPdf);
    assert(!/Korean|韓国語|koreanisches|coreano/.test(guide.textContent));
    assert.equal(unknown.attrs.href, '/unchanged');
    assert.equal(installer.attrs['aria-disabled'], 'true');
    assert.equal(installer.attrs.href, undefined);
    assert.equal(events.at(-1).detail.language, lang);
  }
  return { check, setLanguage: context.ODRE_SITE.setLanguage };
}
for (const lang of Object.keys(hashes)) {
  fixture({ query: '?lang=' + lang }).check(lang);
  fixture({ saved: lang }).check(lang);
  fixture({ browser: lang + '-XX' }).check(lang);
}
const interactive = fixture();
for (const lang of ['ko','en','ja','de','es','ko']) { interactive.setLanguage(lang); interactive.check(lang); }
interactive.setLanguage('unsupported'); interactive.check('en');
fixture({ query: '?lang=ja', saved: 'ko', browser: 'de-DE' }).check('ja');
fixture({ query: '?lang=unsupported', saved: 'ko' }).check('ko');
fixture({ browser: 'fr-FR' }).check('en');
console.log(JSON.stringify({ result: 'PASS', language_pdfs: 5, hashes: '5/5 PASS', initial_language_cases: 18,
  manual_language_cases: 7, untranslated_korean_labels: 0, installer_download: 'DISABLED', network_requests: 0 }, null, 2));
