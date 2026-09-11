'use strict';
// Offline release-link assertions only. No download, checkout or production API calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const mainUrl = 'https://odreai.com/odre-pqc/downloads/production/0.3.0/ODRE_PQC_PRODUCTION_0.3.0_CUSTOMER_DELIVERY.zip';
const checksumUrl = mainUrl + '.sha256';
const archiveSha256 = 'D955EB659D48BCD09BDE67A55021143FF5F8ABE6ED32E1879BA6697A5D2104F4';
const contact = read('contact/index.html');
const section = contact.match(/<section\b[^>]*id="trial"[^>]*>([\s\S]*?)<\/section>/)[1];

assert(!/mailto:|onclick=|formaction=|<form\b/.test(section));
assert(!/<button\b/.test(section));
assert(!/disabled|aria-disabled/.test(section));
assert(section.includes(`id="trial-download" href="${mainUrl}"`));
assert(section.includes(`id="trial-checksum" href="${checksumUrl}"`));
assert(section.includes(archiveSha256));
assert(section.includes('56,731,226-byte'));
assert(section.includes('No ZIP password is required'));
assert.equal((section.match(/<a\b/g) || []).length, 3);

const pdfName = 'ODRE_PQC_14_Day_Free_Trial_Guide_v1.3_RC2_EN.pdf';
for (const value of ['id="trial-guide-pdf"', 'data-pqc-document="trial"', `href="/${pdfName}"`, `download="${pdfName}"`, 'hreflang="en"', 'type="application/pdf"']) {
  assert(section.includes(value), value);
}
const pdf = fs.readFileSync(path.join(root, pdfName));
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
const koreanPdf = fs.readFileSync(path.join(root, pdfName.replace('_EN.pdf', '_KO.pdf')));
assert.equal(createHash('sha256').update(koreanPdf).digest('hex'), '0b06981b5c64ed836cf055d8fd6fd3f9f26c569bbbee484b278f0d21a7d3bbab');

for (const role of ['Sales', 'License', 'Technical', 'Security', 'General']) assert(contact.includes(`[ODRE PQC ${role}]`));
assert.equal((contact.match(/<article class="card">/g) || []).length, 5);
assert(!contact.includes('ODRE%20PQC%2014-Day%20Trial'));

const keys = {
  home: ['trialCta', 'requestTrial', 'downloadCta', 'releaseDownloadLink', 'releaseHashLink'],
  pricing: ['requestTrial', 'trial2'],
  contact: ['downloadLabel', 'trialTitle', 'trialCta', 'checksumCta', 'trialPdf', 'trialDownloadReady'],
  docs: ['nextCopy', 'nextTrial', 'faq3a', 'downloadsTitle', 'downloadsCopy', 'downloadHashCopy', 'productArchiveTitle', 'productChecksumTitle'],
  trust: ['productDownloadTitle', 'productDownloadCopy', 'downloadProduct', 'downloadChecksum']
};
for (const [page, file] of [['home', 'index.html'], ['pricing', 'pricing/index.html'], ['contact', 'contact/index.html'], ['docs', 'docs/index.html'], ['trust', 'trust/index.html']]) {
  const html = read(file);
  const nodes = [...html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(match => ({ getAttribute: () => match[1], textContent: match[2] }));
  const window = {};
  vm.runInNewContext(read('assets/js/page-i18n.js'), { window, document: { body: { dataset: { page } }, querySelectorAll: () => nodes } }, { timeout: 1000 });
  for (const language of ['en', 'ko', 'ja', 'de', 'es']) {
    const copy = window.ODRE_PAGE_I18N[language];
    for (const key of keys[page]) assert(copy[key] && copy[key].length > 0, `${page}/${language}/${key}`);
    if (page === 'contact') {
      assert(/download|다운로드|ダウンロード|herunterladen|descargar|ZIP/i.test(copy.trialCta));
      assert(/SHA-256/.test(copy.checksumCta));
    }
  }
}

for (const script of ['assets/js/site.js', 'assets/js/checkout.js', 'assets/js/analytics.js']) {
  assert(!/trial-download/.test(read(script)), `Unexpected download handler: ${script}`);
}
for (const file of ['index.html', 'contact/index.html', 'docs/index.html', 'trust/index.html']) {
  const source = read(file);
  assert(!source.includes('CUSTOMER_DELIVERY_AES256'));
  assert(!source.includes('14AAEF12C137DDD7126C0E2D2C6CC98DA2DA378F830A13CD9E666653D484C1CF'));
}
console.log(JSON.stringify({ result: 'PASS', languages: 5, release: '0.3.0', mainDownloadUrl: mainUrl, checksumUrl, archiveBytes: 56731226, archiveSha256, trialEmailLink: 'REMOVED', actualDownloadRequests: 0, productionApiCalls: 0 }, null, 2));
