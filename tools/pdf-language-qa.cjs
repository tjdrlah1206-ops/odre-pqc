'use strict';

// Execute the real language code with an offline DOM fixture. No network calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('security/index.html');
const section = html.match(/<section class="section light" id="release-verification">([\s\S]*?)<\/section>/)[1];
const marked = [...section.matchAll(/<a\b([^>]*data-pqc-document="[^"]+"[^>]*)>([^<]+)<\/a>/g)];
assert.equal(marked.length, 2);
assert(html.includes('/assets/js/site.js?v=pdf-language-20260908'));
const filenames = {
  en: ['Public_Technical_Whitepaper_EN', 'Product_Overview_Security_Architecture_EN'],
  ko: ['공개_기술_백서_KO', '제품_개요_및_보안_아키텍처_KO'],
  ja: ['公開技術白書_JA', '製品概要_セキュリティアーキテクチャ_JA'],
  de: ['Oeffentliches_Technisches_Whitepaper_DE', 'Produktuebersicht_Sicherheitsarchitektur_DE'],
  es: ['Libro_Blanco_Tecnico_Publico_ES', 'Descripcion_del_Producto_Arquitectura_de_Seguridad_ES']
};
const tracker = read('assets/js/analytics.js');
for (const [language, stems] of Object.entries(filenames)) {
  stems.forEach((stem, index) => {
    const name = `ODRE_PQC_v0.2.9_${stem}.pdf`;
    assert.equal(fs.readFileSync(path.join(root, name)).subarray(0, 5).toString('ascii'), '%PDF-');
    assert(tracker.includes(`'/${name}': 'v029_${index ? 'overview' : 'whitepaper'}_${language}'`));
  });
}

function node(attrs, textContent = '') {
  return { attrs, textContent, getAttribute: key => attrs[key], setAttribute: (key, value) => { attrs[key] = String(value); } };
}
function fixture(options = {}) {
  const links = marked.map(match => node(Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1], a[2]])), match[2]));
  const unrecognized = node({ 'data-pqc-document': '__proto__', href: '/unchanged' });
  const guide = node({ href: '/ODRE_PQC_Installation_License_Activation_Guide_v1.2.1_KO.pdf' });
  const integrity = node({ href: '/trust/#release-integrity' });
  const events = [];
  const saved = new Map(options.saved ? [['odre-pqc-lang', options.saved]] : []);
  const document = {
    title: 'Security | ODRE PQC', body: { dataset: { page: 'security' } }, documentElement: { lang: 'en' },
    querySelector: selector => selector === 'script[data-odre-analytics]' ? {} : null,
    querySelectorAll: selector => selector === '[data-i18n]' ? links : selector === 'a[data-pqc-document]' ? [...links, unrecognized] : [],
    getElementById: () => null, addEventListener() {}, dispatchEvent: event => events.push(event)
  };
  const context = { document, location: { search: options.query || '' }, navigator: { language: options.browser || 'en-US' },
    localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) },
    URLSearchParams, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    addEventListener() {}
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('assets/js/page-i18n.js'), context, { timeout: 1000 });
  vm.runInContext(read('assets/js/site.js'), context, { timeout: 1000 });
  function check(language) {
    assert.equal(document.documentElement.lang, language);
    links.forEach((link, index) => {
      assert.equal(link.attrs.href, `/ODRE_PQC_v0.2.9_${filenames[language][index]}.pdf`);
      assert.equal(link.attrs.hreflang, language);
      assert.equal(link.attrs.type, 'application/pdf');
      assert.equal(link.textContent, context.ODRE_PAGE_I18N[language][link.attrs['data-i18n']]);
    });
    assert.equal(events.at(-1).detail.language, language);
    assert.equal(unrecognized.attrs.href, '/unchanged');
    assert.equal(guide.attrs.href, '/ODRE_PQC_Installation_License_Activation_Guide_v1.2.1_KO.pdf');
    assert.equal(integrity.attrs.href, '/trust/#release-integrity');
  }
  return { check, setLanguage: context.ODRE_SITE.setLanguage };
}
for (const language of Object.keys(filenames)) {
  fixture({ query: `?lang=${language}` }).check(language);
  fixture({ saved: language }).check(language);
  fixture({ browser: `${language}-XX` }).check(language);
}
const interactive = fixture();
for (const language of ['ko', 'ja', 'de', 'es', 'en', 'ko']) { interactive.setLanguage(language); interactive.check(language); }
interactive.setLanguage('unsupported'); interactive.check('en');
fixture({ query: '?lang=ja', saved: 'ko', browser: 'de-DE' }).check('ja');
fixture({ query: '?lang=unsupported', saved: 'ko', browser: 'de-DE' }).check('ko');
fixture({ browser: 'fr-FR' }).check('en');
console.log(JSON.stringify({ languages: 5, pdf_targets: 10, initial_language_cases: 18, manual_switch_cases: 7, existing_analytics_ids: 'PASS', unrelated_links: 'UNCHANGED', network_requests: 0, result: 'PASS' }, null, 2));
