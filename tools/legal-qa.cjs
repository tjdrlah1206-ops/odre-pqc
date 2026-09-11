'use strict';
// Local-only document and language regression. No browser/network/payment calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = read('legal.js');
const languages = ['en', 'ko', 'ja', 'es', 'de'];
const pages = ['terms', 'privacy', 'refund'];
const rendered = {};
let checks = 0;
function contextFor(page, query, saved = 'en', blockedStorage = false) {
  const html = read(page + '/index.html');
  const template = html.match(/<template id="english-content">([\s\S]*?)<\/template>/)[1];
  const nodes = {};
  function element() { return { textContent: '', innerHTML: '', content: '', firstChild: { textContent: '' }, children: [], appendChild(child) { this.children.push(child); }, replaceChildren() { this.children = []; } }; }
  for (const role of ['title','intro','updated','content','notice','contact-title','contact-text']) nodes['[data-role=' + role + ']'] = element();
  nodes['#english-content'] = { innerHTML: template };
  nodes['meta[name=description]'] = element();
  nodes['meta[property="og:title"]'] = element();
  nodes['meta[property="og:description"]'] = element();
  const analytics = page === 'privacy' ? element() : null;
  const events = {};
  const document = {
    title: html.match(/<title>(.*?)<\/title>/)[1], body: { dataset: { policy: page } }, documentElement: { lang: 'en' },
    querySelector(key) { assert(key in nodes, key); return nodes[key]; },
    getElementById(id) { assert.equal(id, 'analytics-privacy'); return analytics; },
    createElement: element,
    addEventListener(name, fn) { (events[name] ||= []).push(fn); }
  };
  vm.runInNewContext(source, {
    document, location: { search: query }, URLSearchParams,
    localStorage: { getItem() { if (blockedStorage) throw new Error('Storage denied'); return saved; } },
    navigator: { language: 'en-US' }
  }, { timeout: 1000 });
  return { html, template, nodes, document, analytics, switchTo(language) { for (const fn of events['odre:language']) fn({ detail: { language } }); } };
}
function verify(page, language, c) {
  assert.equal(c.document.documentElement.lang, language);
  const body = c.nodes['[data-role=content]'].innerHTML;
  assert(body.length > 500);
  assert(!/DRAFT|NOT_FOR_DISTRIBUTION|C:\\Users|1[–~〜-]20 Units|PayPal|PRIVATE KEY-----|Codex|GitHub|MCP|BLOCKED_BY_AUTHORITY|tool failure|승인 필요|자동 안전검토/i.test(body));
  assert(!/September [47], 2026|2026년 9월 [47]일|2026年9月[47]日/.test(c.nodes['[data-role=updated]'].textContent));
  assert(c.nodes['[data-role=notice]'].textContent.length > 30);
  assert.equal(c.nodes['meta[property="og:title"]'].content, c.document.title);
  if (page === 'terms') {
    for (const word of ['0.3.0','ODRE Server Gateway','ODRE v3','private Core','Protected Handler','HTTPS/TLS','14','Device proof','Offline Lease','plaintext/classical fallback']) assert(body.includes(word), language + ': ' + word);
    assert(/250/.test(body) && /2[,.]700/.test(body) && /1[–~〜-]1[,.]000|1 a 1\.000/.test(body));
  } else if (page === 'privacy') {
    assert(/Device[ -]proof/.test(body), language + ': Device proof (German compound permits a hyphen)');
    for (const word of ['Trial/Paid','Lease','Resend','license@mail.odreai.com','odreai2025@gmail.com','https://www.paddle.com/legal/privacy']) assert(body.includes(word), language + ': ' + word);
    assert(c.analytics.children.length >= 6);
    assert(c.analytics.children.some(n => n.textContent.includes('sessionStorage')));
    assert(!/until an approved policy|承認済み方針|승인된 보존 정책|genehmigten Richtlinie|política aprobada/.test(c.analytics.children.map(n => n.textContent).join(' ')));
  } else {
    assert(body.includes('https://paddle.net/'));
    assert(body.includes('https://www.paddle.com/legal/refund-policy'));
    assert(/License Key/.test(body));
  }
  checks++;
  return body;
}
for (const page of pages) {
  rendered[page] = {};
  for (const language of languages) {
    // Explicit query must win over saved language, including blocked storage.
    const c = contextFor(page, '?lang=' + language, language === 'en' ? 'ko' : 'en', true);
    rendered[page][language] = verify(page, language, c);
    if (language === 'en') {
      const staticBody = c.html.match(/<div data-role="content">([\s\S]*?)<\/div><(?:section id="analytics-privacy"|div class="notice")/)[1];
      assert.equal(staticBody, c.template);
      assert.equal(staticBody, rendered[page].en);
    } else assert.notEqual(rendered[page][language], rendered[page].en);
    for (const other of languages) { c.switchTo(other); verify(page, other, c); }
    assert(c.html.includes('/legal.js?v=legal-customer-20260911'));
    assert(c.html.includes('href="https://pqc.odreai.com/' + page + '/"'));
  }
  const saved = contextFor(page, '?lang=unsupported', 'ja'); verify(page, 'ja', saved);
  const fallback = contextFor(page, '', 'unsupported'); verify(page, 'en', fallback);
}
assert(read('assets/js/checkout.js').includes('publicCheckoutEnabled: false'));
assert(read('payment/live-check-4a753f1fe8c8431f/index.html').includes('noindex'));
console.log(JSON.stringify({ result: 'PASS', pages: pages.length, languages: languages.length, renderedChecks: checks, staticEnglishMatchesTemplate: true, explicitLanguageWithBlockedStorage: 'PASS', paymentApiCalls: 0, networkCalls: 0 }, null, 2));
