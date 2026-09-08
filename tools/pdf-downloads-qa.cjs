'use strict';

// Offline regression for the customer-supplied v1.2.1 PDFs. No PDF rewriting.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const expected = {
  EN: '375fcb0e4d99157f91d88d19fd8db395752f421526b2e89162c2e13528fa6819',
  KO: 'e842efa9e09a905b092553d0b779c1f384ad2a69104803f46a9f2f463e04380b',
  JA: '76dd5221dcfe8099ecf412da982bfece805ce36383a4e4108cd2eacaf5b0fd49',
  DE: 'e155d8471df5ffa0d2ced45029cb1b711fb3de74289aa41cc0822e869ddcf9a6',
  ES: '273b0a6275eac51f6d12ee4c84ff0b4d7baad878c2b9de696cf5b1e3efc86b21'
};
const html = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8');
const section = html.match(/<section id="downloads">([\s\S]*?)<\/section>/)[1];
const links = [...section.matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a>/g)];
assert.equal(links.length, 5);
assert.equal(new Set(links.map(link => link[1].match(/href="([^"]+)"/)[1])).size, 5);
assert(!section.includes('v0.2.9'), 'download listing must not mix old whitepapers with the new guides');
for (const [language, sha256] of Object.entries(expected)) {
  const name = `ODRE_PQC_Installation_License_Activation_Guide_v1.2.1_${language}.pdf`;
  const link = links.find(item => item[1].includes(`href="/${name}"`));
  assert(link, `Missing ${language} guide`);
  assert(link[1].includes(' download '));
  assert(link[1].includes(`hreflang="${language.toLowerCase()}"`));
  assert(link[1].includes('type="application/pdf"'));
  assert(link[2].includes('v1.2.1 · PDF'));
  const bytes = fs.readFileSync(path.join(root, name));
  assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), sha256, `Original bytes changed: ${name}`);
}

// Execute the real translation dictionary offline, including its later overrides.
const nodes = [...section.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]+)</g)].map(match => ({
  getAttribute: () => match[1], textContent: match[2].replace(/&amp;/g, '&')
}));
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/page-i18n.js'), 'utf8'), {
  window, document: { body: { dataset: { page: 'docs' } }, querySelectorAll: () => nodes }
}, { timeout: 1000 });
const titles = {
  en: 'Installation & License Activation Guides',
  ko: '설치 및 라이선스 활성화 가이드',
  ja: 'インストール・ライセンス有効化ガイド',
  de: 'Installations- und Lizenzaktivierungsleitfäden',
  es: 'Guías de instalación y activación de licencias'
};
for (const [language, title] of Object.entries(titles)) {
  assert.equal(window.ODRE_PAGE_I18N[language].downloadsTitle, title);
  assert(window.ODRE_PAGE_I18N[language].downloadsCopy.includes('v1.2.1'));
}
assert(html.includes('/assets/js/page-i18n.js?v=guides-v1.2.1'));
console.log(JSON.stringify({ guides: 5, original_sha256_matches: 5, language_cases: 5, network_requests: 0, result: 'PASS' }, null, 2));
