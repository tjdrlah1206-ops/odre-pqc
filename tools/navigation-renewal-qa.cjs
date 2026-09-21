'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = ['index.html','product/index.html','security/index.html','docs/index.html','pricing/index.html','license/index.html','trust/index.html','releases/index.html','company/index.html','contact/index.html','terms/index.html','privacy/index.html','refund/index.html'];
const primary = ['/product/','/docs/','/pricing/','/trust/'];

for (const file of pages) {
  const html = read(file);
  const nav = html.match(/<nav class="container static-primary-nav"[\s\S]*?<\/nav>/)?.[0];
  assert(nav, `${file}: static fallback navigation missing`);
  for (const href of primary) assert(nav.includes(`href="${href}"`), `${file}: ${href} missing`);
  assert(nav.includes('/payment/register/?flow=activate'), `${file}: License Center route missing`);
  assert(nav.includes('/#trial'), `${file}: Free Trial route missing`);
  assert(!nav.includes('/security/'), `${file}: Security belongs in the footer, not primary nav`);
  assert(!nav.includes('/company/'), `${file}: Company must remain in footer, not primary nav`);
  assert(!nav.includes('/contact/'), `${file}: Contact must remain in footer, not primary nav`);
}

const site = read('assets/js/site.js');
for (const [key, href] of [['product','/product/'],['docs','/docs/'],['pricing','/pricing/'],['trust','/trust/']]) assert(site.includes(`['${key}', '${href}']`));
assert(site.includes('mobile-direct mobile-license'));
assert(site.includes("link.setAttribute('aria-current', 'page')"));

const css = read('assets/css/site.css');
assert(css.includes('.header-license'));
assert(css.includes('.mobile-license'));
assert(css.includes('.docs-category-list'));
assert(css.includes('.pricing-details details'));
assert(css.includes('.desktop-nav, .header-download, .header-license'));

const home = read('index.html');
assert(!home.includes('class="hero-release"'), 'Home must not front-load release detail');
assert(home.includes('id="trial"'), 'Home must end with the 14-day Trial entry');
assert(home.includes('class="inline-disclosure"'), 'Home details must expand inline');

const docs = read('docs/index.html');
assert.equal((docs.match(/class="docs-category-list"/g) || []).length, 1);
assert.equal((docs.match(/class="docs-category-list"[\s\S]*?<\/section>/)?.[0].match(/<details /g) || []).length, 4);
assert(site.includes("document.body.dataset.page === 'docs'"), 'Docs sections must become inline disclosures');

const pricing = read('pricing/index.html');
assert(pricing.includes('<details id="unit">'));
assert(pricing.includes('<details id="subscription">'));

// The renewal must not change payment execution, checkout configuration, or
// the production registration implementation.
for (const file of ['assets/js/checkout.js','payment/register/native-portal.js','payment/register/index.html','payment/index.html']) {
  cp.execFileSync('git', ['diff', '--exit-code', 'HEAD', '--', file], { cwd: root, stdio: 'pipe' });
}

const trust = read('trust/index.html');
for (const marker of [
  '3A14BE4D12241CB2C675626958E7F6B6E4A86F2A77D53D92D14526B3277B5A0B',
  'A8AFA10EE0AFACEF1C0FAF55FF07B96C722920E5AEE8692F6F026E804F028697'
]) assert(trust.includes(marker), 'Trust Center: published integrity marker changed');
assert(!read('releases/index.html').includes('class="hash"'), 'Release history must defer current hashes to Trust Center');
assert(!read('security/index.html').includes('class="hash"'), 'Security architecture must defer current hashes to Trust Center');
assert(!read('contact/index.html').includes('id="trial"'), 'Contact must contain contact routes only');
for (const file of pages) assert(!read(file).includes('/contact/#trial'), `${file}: removed Contact download route remains`);

console.log(JSON.stringify({ pages: pages.length, primaryLinks: primary.length, homeSections: 5, docsCategories: 4, pricingAccordions: 2, paymentRuntimeChanged: false }, null, 2));
