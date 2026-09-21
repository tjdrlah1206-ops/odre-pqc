'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['index.html','product/index.html','security/index.html','docs/index.html','pricing/index.html','license/index.html','trust/index.html','releases/index.html','company/index.html','contact/index.html','terms/index.html','privacy/index.html','refund/index.html'];
const navHrefs = ['/product/','/docs/','/pricing/','/trust/','/payment/register/?flow=activate','/#trial'];

for (const file of pages) {
  const nav = read(file).match(/<nav class="container static-primary-nav"[\s\S]*?<\/nav>/)?.[0];
  assert(nav, `${file}: fallback nav`);
  assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1]).slice(1), navHrefs, `${file}: identical nav`);
}

const home = read('index.html');
assert.equal((home.match(/<section class="section(?: light| trial-final)?"/g) || []).length, 5, 'Home has five scan-friendly sections');
assert.equal((home.match(/class="inline-disclosure"/g) || []).length, 5, 'Home uses inline disclosure for secondary detail');
assert(home.includes('id="trial"') && home.indexOf('id="trial"') > home.indexOf('id="learn-more"'), 'Trial is the final Home section');
assert(home.includes('data-site-paused="download"'), 'Trial download remains paused');
assert(!home.includes('class="hero-release"'), 'Release detail is not front-loaded');

const docs = read('docs/index.html');
const category = docs.match(/class="docs-category-list"[\s\S]*?<\/section>/)?.[0] || '';
assert.equal((category.match(/<details /g) || []).length, 4, 'Docs shows four categories');
assert(read('assets/js/site.js').includes("details.className = 'docs-section'"), 'Docs content expands inline');

const keys = ['detailsView','learnMoreTitle','updateTitle','updateCopy','trialFinalTitle','trialDownload'];
const translatedWindow = {};
const translatedNodes = [...home.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(match => ({ getAttribute: () => match[1], textContent: match[2] }));
vm.runInNewContext(read('assets/js/page-i18n.js'), {
  window: translatedWindow,
  document: { body: { dataset: { page: 'home' } }, querySelectorAll: () => translatedNodes },
  location: { pathname: '/' }
}, { timeout: 1500 });
for (const language of ['ko','ja','de','es']) {
  for (const key of keys) {
    assert(translatedWindow.ODRE_PAGE_I18N[language][key], `${language}: ${key}`);
    assert.notEqual(translatedWindow.ODRE_PAGE_I18N[language][key], translatedWindow.ODRE_PAGE_I18N.en[key], `${language}: ${key} translated`);
  }
}

for (const file of ['assets/js/checkout.js','payment/register/native-portal.js','payment/register/index.html','payment/index.html']) {
  cp.execFileSync('git', ['diff', '--exit-code', 'HEAD', '--', file], { cwd: root, stdio: 'pipe' });
}

console.log(JSON.stringify({ pages: pages.length, navItems: navHrefs.length, primaryPages: 4, homeSections: 5, homeDisclosures: 5, docsCategories: 4, languages: 5, paymentRuntimeChanged: false, pass: true }, null, 2));
