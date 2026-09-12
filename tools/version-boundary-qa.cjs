'use strict';

// Offline customer-facing version-boundary regression. No product or network access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = {
  home: read('index.html'),
  docs: read('docs/index.html'),
  contact: read('contact/index.html'),
  trust: read('trust/index.html'),
  releases: read('releases/index.html')
};
const i18nSource = read('assets/js/page-i18n.js');
const productionVersion = '0.3.0';
const coreVersion = 'v0.2.9';
const customerHash = '30D969CA880CCC6D544D5532EBC19AD62F187902DEF4EF34AAFFB047B722BF1B';
const coreHash = 'A8AFA10EE0AFACEF1C0FAF55FF07B96C722920E5AEE8692F6F026E804F028697';

for (const [page, html] of Object.entries(pages)) {
  assert(html.includes(productionVersion), `${page}: missing Production version`);
  assert(html.includes(coreVersion), `${page}: missing sealed Core version`);
}
assert(pages.home.includes('Production Bundle'));
assert(pages.home.includes('Core Security Engine'));
assert(pages.docs.includes('Production Bundle 0.3.0 packages the sealed ODRE PQC Core v0.2.9'));
assert(pages.contact.includes('sealed Core Security Engine v0.2.9'));
assert(pages.trust.includes('<th data-i18n="productionBundle">Production Bundle</th><td>0.3.0</td>'));
assert(pages.trust.includes('<th data-i18n="coreSecurityEngine">Core Security Engine</th><td>v0.2.9'));
assert(pages.releases.includes('ODRE PQC Production 0.3.0'));
assert(pages.trust.includes(customerHash));
assert(pages.trust.includes(coreHash));

for (const [page, key] of Object.entries({
  home: 'releaseCopy',
  docs: 'downloadsCopy',
  contact: 'trialDeliveryCopy',
  trust: 'productDownloadCopy',
  releases: 'v030'
})) {
  const html = pages[page];
  const nodes = [...html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(match => ({
    getAttribute: () => match[1],
    textContent: match[2].replace(/&amp;/g, '&')
  }));
  const window = {};
  vm.runInNewContext(i18nSource, {
    window,
    document: { body: { dataset: { page } }, querySelectorAll: () => nodes }
  }, { timeout: 1000 });
  // English is asserted directly from static HTML above; the runtime dictionary supplies four alternates.
  for (const language of ['ko', 'ja', 'de', 'es']) {
    const copy = window.ODRE_PAGE_I18N[language][key];
    assert(copy.includes(productionVersion), `${page}/${language}: missing Production version`);
    assert(copy.includes(coreVersion), `${page}/${language}: missing Core version`);
  }
}

const customerSources = Object.values(pages).join('\n') + '\n' + i18nSource;
assert(!/Core(?: Security Engine)?\s*(?:version|:)?\s*v?0\.3\.0/i.test(customerSources));
assert(!/56[,.]730[,.]320|56[,.]731[,.]226|56,731,576/.test(customerSources));
assert(!/00DC788B5ECAAAC08C53ACBAD009DC296185149A9917124FF0F16C0EDAABC182/.test(customerSources));
assert(!/page-i18n\.js\?v=(?:artifact-n1|version-boundary)-20260912/.test(customerSources));

console.log(JSON.stringify({
  result: 'PASS',
  production_bundle: '0.3.0',
  core_security_engine: 'v0.2.9',
  languages: 5,
  customer_pages: 5,
  stale_archive_sizes: 0,
  core_relabeling_findings: 0,
  product_bytes_modified: 0,
  network_requests: 0
}, null, 2));
