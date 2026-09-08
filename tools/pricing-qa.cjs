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
  assert(read(file).includes('$250 <small'), `Monthly card in ${file}`);
  assert(read(file).includes('$2,700 <small'), `Annual card in ${file}`);
}
const home = read('index.html');
const schema = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const product = Array.isArray(schema) ? schema.find(item => item.offers) : schema;
assert.deepEqual(product.offers.map(offer => [offer.price, offer.priceCurrency]), [['250', 'USD'], ['2700', 'USD']]);
assert.equal((read('terms/index.html').match(/USD 250 per Unit per month/g) || []).length, 2);
assert.equal((read('terms/index.html').match(/USD 2,700 per Unit per year/g) || []).length, 2);
const translations = read('legal.js');
assert.equal((translations.match(/USD 250/g) || []).length, 4);
assert.equal((translations.match(/USD 2,700/g) || []).length, 2);
assert.equal((translations.match(/USD 2\.700/g) || []).length, 2);

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
assert.equal(requestedScripts, 0); // Public purchase UI remains closed during Live verification.
let quantityCases = 0;
for (const [quantity, monthly, annual] of [['1', '$250', '$2,700'], ['2', '$500', '$5,400'], ['20', '$5,000', '$54,000'], ['0', '$250', '$2,700'], ['21', '$5,000', '$54,000'], ['invalid', '$250', '$2,700']]) {
  nodes.monthlyUnits.value = quantity;
  nodes.annualUnits.value = quantity;
  nodes.monthlyUnits.listeners.input();
  assert.equal(nodes.monthlyTotal.textContent, monthly);
  assert.equal(nodes.annualTotal.textContent, annual);
  quantityCases++;
}
buttons.find(button => button.dataset.quantityTarget === 'monthlyUnits' && button.dataset.quantityDelta === '1').listeners.click();
assert.equal(nodes.monthlyTotal.textContent, '$500');
buttons.find(button => button.dataset.quantityTarget === 'annualUnits' && button.dataset.quantityDelta === '1').listeners.click();
assert.equal(nodes.annualTotal.textContent, '$5,400');
assert(nodes.monthlyCheckout.disabled && nodes.annualCheckout.disabled);
console.log(JSON.stringify({ staticPriceFiles: priceFiles.length, languagePriceCoverage: ['en', 'ko', 'ja', 'de', 'es'], quantityCases, stepButtons: 'PASS', structuredData: 'PASS', networkRequests: 0, checkoutOpened: 0, pass: true }, null, 2));
