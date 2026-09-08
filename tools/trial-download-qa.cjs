'use strict';
// Offline assertions only. No download, email, checkout or production API calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const contact = read('contact/index.html');
const section = contact.match(/<section\b[^>]*id="trial"[^>]*>([\s\S]*?)<\/section>/)[1];
assert(!/mailto:|href=|onclick=|formaction=|<form\b/.test(section));
const buttons = [...section.matchAll(/<button\b([^>]*)>([^<]*)<\/button>/g)];
assert.equal(buttons.length, 1);
for (const value of ['id="trial-download"', 'type="button"', ' disabled ', 'aria-disabled="true"', 'aria-describedby="trial-download-status"']) assert(buttons[0][1].includes(value));
assert.equal((contact.match(/id="trial-download-status"/g) || []).length, 1);
assert(!contact.includes('ODRE%20PQC%2014-Day%20Trial'));
const css = read('assets/css/site.css');
assert(css.includes('.button:disabled'));
const keys = {
  home: ['trialCta', 'requestTrial'], pricing: ['requestTrial', 'trial2'],
  contact: ['trialTitle', 'trialCopy', 'trialCta', 'trialDownloadPending'],
  docs: ['nextCopy', 'nextTrial', 'faq3a'], security: ['nextCopy', 'nextTrial']
};
for (const [page, file] of [['home', 'index.html'], ['pricing', 'pricing/index.html'], ['contact', 'contact/index.html'], ['docs', 'docs/index.html'], ['security', 'security/index.html']]) {
  const html = read(file);
  assert(!/>Request[^<]*(?:trial|evaluation)[^<]*</i.test(html));
  const nodes = [...html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(m => ({ getAttribute: () => m[1], textContent: m[2] }));
  const window = {};
  vm.runInNewContext(read('assets/js/page-i18n.js'), { window, document: { body: { dataset: { page } }, querySelectorAll: () => nodes } }, { timeout: 1000 });
  for (const language of ['en', 'ko', 'ja', 'de', 'es']) {
    const copy = window.ODRE_PAGE_I18N[language];
    for (const key of keys[page]) {
      assert(copy[key] && copy[key].length > 0, `${page}/${language}/${key}`);
      if (language !== 'en') assert.notEqual(copy[key], window.ODRE_PAGE_I18N.en[key]);
    }
    if (page === 'contact') {
      assert(!/Request|요청|依頼|anfragen|Solicitar/i.test(copy.trialCta));
      assert(/download|다운로드|ダウンロード|herunterladen|descargar/i.test(copy.trialCta));
    }
  }
}
for (const script of ['assets/js/site.js', 'assets/js/checkout.js', 'assets/js/analytics.js']) {
  assert(!/trial-download/.test(read(script)), `Unapproved download handler: ${script}`);
}
console.log(JSON.stringify({ result: 'PASS', languages: 5, pages: 5, trialButton: 'DISABLED', downloadUrl: 'NOT_CONFIGURED', trialEmailLink: 'REMOVED', actualDownloadRequests: 0, productionApiCalls: 0 }, null, 2));
