'use strict';

// Offline price regression: no browser, network, checkout or payment is opened.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const oldPrice = /\$120\b|\$1,300\b|USD\s+120\b|USD\s+1[,.]300\b|"price":"(?:120|1300)"/;
const priceFiles = ['index.html', 'pricing/index.html', 'license/index.html', 'terms/index.html', 'legal.js', 'assets/js/checkout.js'];
for (const file of priceFiles) assert(!oldPrice.test(read(file)), `Old price in ${file}`);
for (const file of ['index.html', 'pricing/index.html', 'license/index.html']) {
  assert(read(file).includes('$399 <small'), `Monthly card in ${file}`);
  assert(read(file).includes('$4,300 <small'), `Annual card in ${file}`);
}
const home = read('index.html');
const schema = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const product = Array.isArray(schema) ? schema.find(item => item.offers) : schema;
assert.deepEqual(product.offers.map(offer => [offer.price, offer.priceCurrency]), [['399', 'USD'], ['4300', 'USD']]);
const monthlyPrice = Number(product.offers[0].price), annualPrice = Number(product.offers[1].price);
assert.equal(monthlyPrice * 12 - annualPrice, 488);
const licenseHtml = read('license/index.html');
assert.equal((licenseHtml.match(/data-i18n="annualSavings"/g) || []).length, 1);
assert(licenseHtml.indexOf('data-i18n="annualSavings"') > licenseHtml.indexOf('data-i18n="annualCopy"'));
const translatedNodes = [...licenseHtml.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g)].map(m => ({ getAttribute: () => m[1], textContent: m[2] }));
const translatedWindow = {};
vm.runInNewContext(read('assets/js/page-i18n.js'), { window: translatedWindow, document: { body: { dataset: { page: 'license' } }, querySelectorAll: () => translatedNodes } }, { timeout: 1000 });
for (const language of ['en', 'ko', 'ja', 'de', 'es']) {
  const savings = translatedWindow.ODRE_PAGE_I18N[language].annualSavings;
  assert(/10[.,]?2\s*%/.test(savings) && /12/.test(savings) && /488/.test(savings), 'Annual savings copy: ' + language);
  if (language !== 'en') assert.notEqual(savings, translatedWindow.ODRE_PAGE_I18N.en.annualSavings);
}
assert.equal((read('terms/index.html').match(/USD 399 per Unit per month/g) || []).length, 2);
assert.equal((read('terms/index.html').match(/USD 4,300 per Unit per year/g) || []).length, 2);
const translations = read('legal.js');
assert.equal((translations.match(/USD 399/g) || []).length, 4);
assert.equal((translations.match(/USD 4,300/g) || []).length, 2);
assert.equal((translations.match(/USD 4\.300/g) || []).length, 2);

function element(id, value = '1') {
  return { id, value, textContent: '', disabled: false, dataset: {}, listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    setAttribute() {}, focus() {} };
}
const nodes = Object.fromEntries(['monthlyUnits', 'monthlyTotal', 'annualUnits', 'annualTotal', 'monthlyCheckout', 'annualCheckout'].map(id => [id, element(id)]));
const buttons = ['monthlyUnits', 'annualUnits'].flatMap(target => [-1, 1].map(delta => {
  const button = element(`${target}-${delta}`);
  button.dataset = { quantityTarget: target, quantityDelta: String(delta) };
  return button;
}));
let requestedScripts = 0;
const document = {
  getElementById: id => nodes[id], querySelectorAll: () => buttons,
  querySelector: () => null, documentElement: { lang: 'en' },
  addEventListener() {}, createElement: () => ({}),
  head: { appendChild() { requestedScripts++; } }
};
const unexpected = () => { throw new Error('Checkout must not open in offline price regression'); };
vm.runInNewContext(read('assets/js/checkout.js'), {
  document, URLSearchParams, location: { search: '', assign: unexpected },
  window: { alert: unexpected, setTimeout: unexpected }, console
}, { timeout: 1000 });
assert.equal(requestedScripts, 0); // Paused checkout must not request Paddle.js.
let quantityCases = 0;
for (const [quantity, monthly, annual] of [['1', '$399', '$4,300'], ['2', '$798', '$8,600'], ['20', '$7,980', '$86,000'], ['0', '$399', '$4,300'], ['21', '$8,379', '$90,300'], ['999', '$398,601', '$4,295,700'], ['1000', '$399,000', '$4,300,000'], ['1001', '$399,000', '$4,300,000'], ['invalid', '$399', '$4,300']]) {
  nodes.monthlyUnits.value = quantity;
  nodes.annualUnits.value = quantity;
  nodes.monthlyUnits.listeners.input();
  assert.equal(nodes.monthlyTotal.textContent, monthly);
  assert.equal(nodes.annualTotal.textContent, annual);
  quantityCases++;
}
buttons.find(button => button.dataset.quantityTarget === 'monthlyUnits' && button.dataset.quantityDelta === '1').listeners.click();
assert.equal(nodes.monthlyTotal.textContent, '$798');
buttons.find(button => button.dataset.quantityTarget === 'annualUnits' && button.dataset.quantityDelta === '1').listeners.click();
assert.equal(nodes.annualTotal.textContent, '$8,600');
for (const target of ['monthlyUnits', 'annualUnits']) {
  const minus = buttons.find(button => button.dataset.quantityTarget === target && button.dataset.quantityDelta === '-1');
  const plus = buttons.find(button => button.dataset.quantityTarget === target && button.dataset.quantityDelta === '1');
  nodes[target].value = '999'; nodes[target].listeners.input(); plus.listeners.click();
  assert.equal(Number(nodes[target].value), 1000); assert.equal(plus.disabled, true);
  plus.listeners.click(); assert.equal(Number(nodes[target].value), 1000);
  minus.listeners.click(); assert.equal(Number(nodes[target].value), 999); assert.equal(plus.disabled, false);
  nodes[target].value = '1'; nodes[target].listeners.input(); assert.equal(minus.disabled, true);
  minus.listeners.click(); assert.equal(Number(nodes[target].value), 1);
}
assert(nodes.monthlyCheckout.disabled && nodes.annualCheckout.disabled);
console.log(JSON.stringify({ staticPriceFiles: priceFiles.length, languagePriceCoverage: ['en', 'ko', 'ja', 'de', 'es'], quantityCases, stepButtons: 'PASS', structuredData: 'PASS', paddleScriptRequests: 0, actualNetworkRequests: 0, checkoutOpened: 0, pass: true }, null, 2));
