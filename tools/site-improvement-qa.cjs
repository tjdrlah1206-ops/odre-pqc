'use strict';

// Offline regression for the 2026-09-11 B2B content, trial-flow, platform and SEO update.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const indexable = [
  ['', 'https://pqc.odreai.com/'],
  ['product/', 'https://pqc.odreai.com/product/'],
  ['security/', 'https://pqc.odreai.com/security/'],
  ['docs/', 'https://pqc.odreai.com/docs/'],
  ['pricing/', 'https://pqc.odreai.com/pricing/'],
  ['trust/', 'https://pqc.odreai.com/trust/'],
  ['company/', 'https://pqc.odreai.com/company/'],
  ['contact/', 'https://pqc.odreai.com/contact/'],
  ['releases/', 'https://pqc.odreai.com/releases/'],
  ['license/', 'https://pqc.odreai.com/license/'],
  ['terms/', 'https://pqc.odreai.com/terms/'],
  ['privacy/', 'https://pqc.odreai.com/privacy/'],
  ['refund/', 'https://pqc.odreai.com/refund/']
];

const titles = new Map();
const descriptions = new Map();
for (const [route, canonical] of indexable) {
  const html = read(route + 'index.html');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(title, `${route || '/'}: title missing`);
  assert(description, `${route || '/'}: description missing`);
  assert(!titles.has(title), `${route || '/'}: duplicate title with ${titles.get(title)}`);
  assert(!descriptions.has(description), `${route || '/'}: duplicate description with ${descriptions.get(description)}`);
  titles.set(title, route || '/');
  descriptions.set(description, route || '/');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route || '/'}: H1 count`);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${route || '/'}: canonical`);
  assert(html.includes(`<meta property="og:url" content="${canonical}">`), `${route || '/'}: og:url`);
  assert(/<meta name="robots" content="index,follow/.test(html), `${route || '/'}: indexability`);
  assert(!html.includes('rel="alternate" hreflang='), `${route || '/'}: hreflang is not applicable to the client-side locale switcher`);
}

const seoIntent = {
  'index.html': ['FastAPI', 'Post-Quantum'],
  'product/index.html': ['Post-Quantum API Security', 'PQC Gateway'],
  'security/index.html': ['ML-KEM-768', 'ML-DSA-65'],
  'docs/index.html': ['FastAPI PQC Integration'],
  'pricing/index.html': ['Post-Quantum Security Software Pricing'],
  'trust/index.html': ['PQC Security Validation', 'Runtime Evidence']
};
for (const [file, terms] of Object.entries(seoIntent)) {
  const title = read(file).match(/<title>([^<]+)<\/title>/)[1];
  for (const term of terms) assert(title.includes(term), `${file}: missing title intent ${term}`);
}

const sourceFiles = [];
(function walk(dir = root) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'qa-screenshots' || entry.name === 'tools') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:html|js|json|xml|md|txt)$/.test(entry.name)) sourceFiles.push(full);
  }
})();
const oldPrice = /\$120\b|120\s*\/\s*month|\$1,300\b|1300\s*\/\s*year|(?:1\s*[-–]\s*)?20\s+Units/i;
const oldTrialRequest = /이메일로 평가판 요청|メールで評価版を依頼|Evaluierung per E-Mail anfragen|Solicitar evaluación por correo|14일 평가판 요청|14日間評価版を依頼|14-Tage-Evaluierung anfragen|Solicitar evaluación de 14 días/i;
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  assert(!oldPrice.test(source), `${path.relative(root, file)}: obsolete price`);
  assert(!oldTrialRequest.test(source), `${path.relative(root, file)}: obsolete trial request`);
}

const contact = read('contact/index.html');
for (const role of ['Sales', 'License', 'Technical', 'Security', 'General']) {
  assert(contact.includes(`[ODRE PQC ${role}]`), `contact prefix: ${role}`);
}
assert.equal((contact.match(/mailto:odreai2025@gmail\.com/g) || []).length, 5, 'single public mailbox link per role');
assert(contact.includes('No email request is required.'));
assert(/id="trial-download"[^>]*disabled/.test(contact));

const product = read('product/index.html');
const docs = read('docs/index.html');
for (const html of [product, docs]) {
  assert(html.includes('from odre_pqc import install'));
  assert(html.includes('install(app)'));
  assert(html.includes('Gateway'));
  assert(html.includes('Protected Handler'));
}
for (const file of ['product/index.html', 'company/index.html']) {
  const html = read(file);
  assert(html.includes('Windows Server 2022 AMD64'));
  assert(html.includes('CPython 3.12.10'));
  assert(html.includes('Ubuntu 24.04.4 LTS AMD64'));
  assert(html.includes('CPython 3.12.3'));
}
assert(read('company/index.html').includes('OpenSSL 3.5.8'));

const home = read('index.html');
for (const phrase of ['Existing FastAPI path', 'Path with ODRE PQC', 'No plaintext or classical fallback', 'not mobile-to-server end-to-end PQC']) assert(home.includes(phrase));
const license = read('license/index.html');
for (const phrase of ['Published security and runtime evidence', 'Commercial checkout', 'customer distribution bundle is finalized']) assert(license.includes(phrase));

const robots = read('robots.txt');
assert(/User-agent:\s*\*/.test(robots));
assert(/Allow:\s*\//.test(robots));
assert(!/Disallow:\s*\//.test(robots));
assert(robots.includes('Sitemap: https://pqc.odreai.com/sitemap.xml'));
const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(sitemapUrls, indexable.map(([, url]) => url));
for (const changed of indexable.map(([, url]) => new URL(url).pathname)) {
  assert(sitemap.includes(`<loc>https://pqc.odreai.com${changed}</loc><lastmod>2026-09-11</lastmod>`), `lastmod ${changed}`);
}

const pageI18n = read('assets/js/page-i18n.js');
for (const page of ['home', 'product', 'docs', 'company', 'contact', 'license']) {
  const html = read(page === 'home' ? 'index.html' : `${page}/index.html`);
  const nodes = [...html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(match => ({ getAttribute: () => match[1], textContent: match[2] }));
  const window = {};
  vm.runInNewContext(pageI18n, { window, document: { body: { dataset: { page } }, querySelectorAll: () => nodes } }, { timeout: 1000 });
  for (const lang of ['en', 'ko', 'ja', 'de', 'es']) {
    const copy = window.ODRE_PAGE_I18N[lang];
    assert(copy, `${page}/${lang}`);
    for (const node of nodes) assert.equal(typeof copy[node.getAttribute()], 'string', `${page}/${lang}/${node.getAttribute()}`);
  }
}

const recrawl = read('tools/SEO_RECRAWL_REQUESTS.md');
assert(recrawl.includes('https://pqc.odreai.com/sitemap.xml'));
for (const [, url] of indexable) assert(recrawl.includes(url), `recrawl list: ${url}`);
console.log(JSON.stringify({
  result: 'PASS',
  indexable_urls: indexable.length,
  sitemap_urls: sitemapUrls.length,
  title_duplicates: 0,
  description_duplicates: 0,
  canonical_errors: 0,
  old_price_references: 0,
  obsolete_trial_requests: 0,
  languages: 5,
  verified_platform_combinations: 2,
  new_seo_pages: 0
}, null, 2));
