'use strict';
// Offline only: the DOM and Paddle are test doubles; no browser or real checkout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const testRoute = 'payment/live-check-4a753f1fe8c8431f';
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const normal = read('assets/js/checkout.js');
const testSource = read(`${testRoute}/checkout.js`);
const testHtml = read(`${testRoute}/index.html`);
const token = 'live_92a112a9e75e51a31ebe4862254';
const testPrice = 'pri_01m20nj5f1mfq56dmp1mgt08k8';
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
function node(id) {
  return { id, value: '1', checked: false, disabled: false, textContent: '', dataset: {}, attrs: {}, listeners: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
    setAttribute(name, value) { this.attrs[name] = value; }, focus() {} };
}
function fixture(options = {}) {
  const nodes = Object.fromEntries(['realChargeAcknowledged', 'liveTestCheckout', 'testStatus'].map(id => [id, node(id)]));
  const scripts = [], initializations = [], opens = [], logs = [];
  const paddle = {
    Initialize(settings) { initializations.push(settings); if (options.initError) throw new Error('SENSITIVE_TEST_SENTINEL'); },
    Checkout: { open(settings) { opens.push(settings); if (options.openError) throw new Error('SENSITIVE_TEST_SENTINEL'); } },
    Environment: { set() { throw new Error('Unexpected environment override'); } }
  };
  const context = {
    document: { getElementById: id => nodes[id], createElement: () => ({}), head: { appendChild: script => scripts.push(script) } },
    location: { protocol: 'https:', hostname: 'pqc.odreai.com', search: '', hash: '', ...options.location },
    window: options.sdkAlreadyLoaded ? { Paddle: paddle } : {}, console: { log: (...args) => logs.push(args), error: (...args) => logs.push(args) }
  };
  // All active checkout tests exercise the exact shipped source with mock Paddle.
  // Only the retained pause regression uses an explicitly disabled in-memory copy.
  const source = options.pausedCopy ? testSource.replace('var TEST_CHECKOUT_ENABLED = true;', 'var TEST_CHECKOUT_ENABLED = false;') : testSource;
  vm.runInNewContext(source, context, { timeout: 1000 });
  return { nodes, scripts, opens, initializations, logs,
    acknowledge(value = true) { nodes.realChargeAcknowledged.checked = value; nodes.realChargeAcknowledged.listeners.change?.(); },
    click() { nodes.liveTestCheckout.listeners.click?.(); },
    load() { context.window.Paddle = paddle; scripts[0].onload(); },
    event(name) { initializations[0].eventCallback({ name, data: { transaction_id: 'SENSITIVE_TEST_SENTINEL' } }); }
  };
}

check('normal Live identities and closed public gate', () => {
  for (const value of [token, 'pro_01m1p28azxeewd9syewtj13f58', 'pri_01m1p2dqq1xv8em7tgv81cwkms', 'pri_01m1p2gh8th4460tab4m0v2vyg']) assert(normal.includes(value));
  assert(normal.includes("environment: 'production'"));
  assert(normal.includes('publicCheckoutEnabled: false'));
  assert(!normal.includes(testPrice));
  assert(!/test_[a-z0-9]{20,}|Environment\.set\(/.test(normal));
  assert(read('license/index.html').includes('checkout.js?v=checkout-paused-20260909'));
});
check('shipped test-only reopening retains disabled no-script controls', () => {
  assert(testSource.includes('var TEST_CHECKOUT_ENABLED = true;'));
  assert(testHtml.includes('type="checkbox" disabled'));
  assert(testHtml.includes('운영자용 $1 시험 결제만 다시 열었습니다.'));
  assert(testHtml.includes('정식 월간·연간 판매 결제는 계속 중단'));
  assert(testHtml.includes('추가 결제가 필요한지 먼저 확인'));
  assert(testHtml.includes('checkout.js?v=live-test-resumed-20260910'));
  assert(!/setTimeout|setInterval|new Date|Date\.now|localStorage|sessionStorage/.test(testSource));
});
for (const sdkAlreadyLoaded of [false, true]) {
  for (const search of ['', '?enabled=true&checkout=true', '?_ptxn=txn_untrusted']) {
    check(`in-memory pause regression prevents SDK load/init/open: preloaded=${sdkAlreadyLoaded}, query=${search}`, () => {
      const f = fixture({ pausedCopy: true, sdkAlreadyLoaded, location: { search } });
      assert(f.nodes.liveTestCheckout.disabled && f.nodes.realChargeAcknowledged.disabled);
      assert(f.nodes.testStatus.textContent.includes('배포패키지'));
      f.acknowledge(); f.click(); f.click();
      // Even changing the HTML control state does not install a payment handler.
      f.nodes.liveTestCheckout.disabled = false;
      f.nodes.realChargeAcknowledged.disabled = false;
      f.click();
      assert.equal(f.scripts.length, 0);
      assert.equal(f.initializations.length, 0);
      assert.equal(f.opens.length, 0);
      assert.equal(f.logs.length, 0);
    });
  }
}
check('normal purchase gate stays closed in all five languages', () => {
  for (const language of ['en','ko','ja','de','es']) {
    const nodes = Object.fromEntries(['monthlyUnits','monthlyTotal','annualUnits','annualTotal','monthlyCheckout','annualCheckout'].map(id => [id,node(id)]));
    const title = node('title'), copy = node('copy');
    const events = {};
    let initialized = 0, opened = 0, scripts = 0;
    const document = { documentElement:{lang:language}, getElementById:id=>nodes[id], querySelectorAll:()=>[],
      querySelector:selector=>selector.includes('availabilityTitle')?title:copy, addEventListener:(name,fn)=>events[name]=fn,
      createElement:()=>({}), head:{appendChild(){ scripts++; }} };
    vm.runInNewContext(normal,{document,URLSearchParams,location:{search:'?plan=annual'},window:{Paddle:{Initialize(){initialized++;},Checkout:{open(){opened++;}}},alert(){},setTimeout(){throw new Error('No redirect');}},console},{timeout:1000});
    assert.equal(initialized,0); assert.equal(opened,0); assert.equal(scripts,0);
    assert(nodes.monthlyCheckout.disabled && nodes.annualCheckout.disabled);
    assert.equal(nodes.monthlyTotal.textContent,'$250'); assert.equal(nodes.annualTotal.textContent,'$2,700');
    assert(title.textContent && copy.textContent);
    const localized = title.textContent;
    title.textContent = 'translation reset'; events['odre:language']();
    assert.equal(title.textContent,localized);
    nodes.monthlyCheckout.listeners.click(); nodes.annualCheckout.listeners.click();
    assert.equal(opened,0);
  }
});
check('test page has noindex and explicit recurring-charge / visibility warnings', () => {
  assert(testHtml.includes('content="noindex,nofollow,noarchive"'));
  assert(testHtml.includes('로그인 보호는 없습니다'));
  assert(testHtml.includes('URL을 아는 사람은 접근'));
  assert(testHtml.includes('취소 전까지 갱신되는 월 정기구독'));
  assert(testHtml.includes('적용 세금'));
  assert(testHtml.includes('각각 확인해야 합니다'));
  assert(testHtml.includes('type="checkbox"'));
  assert(testHtml.includes('disabled aria-disabled="true"'));
  assert(!/analytics\.js|assets\/js\/site\.js|localStorage|sessionStorage|onload=/.test(testHtml+testSource));
});
check('test page excluded from menus, sitemap and ordinary pages', () => {
  const files = ['index.html','assets/js/site.js','sitemap.xml','robots.txt','license/index.html','pricing/index.html','payment/index.html','payment/success/index.html','docs/index.html'];
  for (const file of files) {
    assert(!read(file).includes(testRoute), `Incoming link in ${file}`);
    assert(!read(file).includes(testPrice), `Test price in ${file}`);
  }
});
check('page load and unchecked click never load Paddle or open checkout', () => {
  const f=fixture(); assert(f.nodes.liveTestCheckout.disabled); f.click();
  assert.equal(f.scripts.length,0); assert.equal(f.opens.length,0);
});
check('acknowledgement alone never opens checkout', () => {
  const f=fixture(); f.acknowledge(); assert(!f.nodes.liveTestCheckout.disabled);
  assert.equal(f.scripts.length,0); assert.equal(f.opens.length,0);
});
check('explicit click uses Live token, exact test price and quantity one', () => {
  const f=fixture(); f.acknowledge(); f.click();
  assert.equal(f.scripts.length,1); assert.equal(f.scripts[0].src,'https://cdn.paddle.com/paddle/v2/paddle.js');
  f.load(); assert.equal(f.initializations.length,1); assert.equal(f.initializations[0].token,token);
  assert.deepEqual(JSON.parse(JSON.stringify(f.opens[0])),{items:[{priceId:testPrice,quantity:1}],settings:{displayMode:'overlay',theme:'light',locale:'ko',showAddDiscounts:false}});
  assert(f.nodes.liveTestCheckout.disabled);
});
check('preloaded SDK still requires acknowledgement and a manual click', () => {
  const f=fixture({sdkAlreadyLoaded:true}); f.click();
  assert.equal(f.initializations.length,0); assert.equal(f.opens.length,0);
  f.acknowledge(); assert.equal(f.opens.length,0);
  f.click(); f.click();
  assert.equal(f.scripts.length,0); assert.equal(f.initializations.length,1); assert.equal(f.opens.length,1);
  assert.equal(f.opens[0].items[0].priceId,testPrice); assert.equal(f.opens[0].items[0].quantity,1);
});
check('rapid repeated clicks cannot duplicate initialization or open', () => {
  const f=fixture(); f.acknowledge(); f.click(); f.click(); f.click(); f.load(); f.click();
  assert.equal(f.scripts.length,1); assert.equal(f.initializations.length,1); assert.equal(f.opens.length,1);
});
check('unchecking while SDK loads prevents checkout', () => {
  const f=fixture(); f.acknowledge(); f.click(); f.acknowledge(false); f.load();
  assert.equal(f.opens.length,0); assert(f.nodes.liveTestCheckout.disabled);
  f.acknowledge(); f.click(); assert.equal(f.opens.length,1); assert.equal(f.initializations.length,1);
});
check('script download failure closes without retry', () => {
  const f=fixture(); f.acknowledge(); f.click(); f.scripts[0].onerror(); f.click(); f.acknowledge();
  assert(f.nodes.liveTestCheckout.disabled); assert.equal(f.scripts.length,1); assert.equal(f.opens.length,0);
});
check('missing SDK closes without exposing exception', () => {
  const f=fixture(); f.acknowledge(); f.click(); f.scripts[0].onload();
  assert(f.nodes.liveTestCheckout.disabled); assert.equal(f.opens.length,0); assert.equal(f.logs.length,0);
});
for(const error of ['initError','openError']) check(`${error} stays closed with no secret logging`,()=>{
  const f=fixture({[error]:true}); f.acknowledge(); f.click(); f.load(); f.click();
  assert(f.nodes.liveTestCheckout.disabled); assert.equal(f.logs.length,0);
  assert(!f.nodes.testStatus.textContent.includes('SENSITIVE_TEST_SENTINEL'));
  assert.equal(f.initializations.length,1);
});
check('completed is not a License/Lease PASS and prevents reopening',()=>{
  const f=fixture(); f.acknowledge(); f.click(); f.load(); f.event('checkout.completed'); f.event('checkout.closed'); f.acknowledge(); f.click();
  assert(f.nodes.liveTestCheckout.disabled); assert.equal(f.opens.length,1); assert.equal(f.logs.length,0);
  assert(f.nodes.testStatus.textContent.includes('별도로 확인'));
  assert(!f.nodes.testStatus.textContent.includes('SENSITIVE_TEST_SENTINEL'));
});
check('closed checkout may reopen only after a fresh manual click',()=>{
  const f=fixture(); f.acknowledge(); f.click(); f.load(); f.event('checkout.closed');
  assert.equal(f.opens.length,1); assert(!f.nodes.liveTestCheckout.disabled);
  f.click(); assert.equal(f.opens.length,2); assert.equal(f.initializations.length,1);
});
for(const event of ['checkout.error','checkout.payment.error']) check(`${event} cannot auto retry`,()=>{
  const f=fixture(); f.acknowledge(); f.click(); f.load(); f.event(event); f.event('checkout.closed'); f.click();
  assert(f.nodes.liveTestCheckout.disabled); assert.equal(f.opens.length,1);
});
for(const location of [{protocol:'http:'},{hostname:'example.invalid'},{search:'?_ptxn=txn_untrusted'},{search:'?priceId=untrusted&quantity=999'},{hash:'#open'}]) check(`reject unsafe location ${JSON.stringify(location)}`,()=>{
  const f=fixture({location}); f.acknowledge(); f.click();
  assert(f.nodes.liveTestCheckout.disabled); assert.equal(f.scripts.length,0); assert.equal(f.opens.length,0);
});
check('no server secrets, automatic financial writes or direct backend calls',()=>{
  assert(!/pdl_live_apikey_[a-z0-9]+|pdl_ntfset_[a-z0-9]+|-----BEGIN .*PRIVATE KEY-----/i.test(normal+testSource+testHtml));
  assert(!/fetch\(|XMLHttpRequest|sendBeacon|console\./.test(testSource));
});
console.log(JSON.stringify({result:'PASS',checks,languages:5,testPage:'ENABLED_UNLISTED_NOT_AUTHENTICATED',publicCheckout:'PAUSED_PENDING_PACKAGE_AND_EXPLICIT_REOPEN_APPROVAL',activeCheckoutRegression:'EXACT_SHIPPED_SOURCE_MOCK_PADDLE',pauseRegression:'DISABLED_IN_MEMORY_COPY_MOCK_PADDLE',realCheckoutsOpened:0,realTransactionsCreated:0,productionApiRequests:0,browserVisualTest:'NOT_RUN'}));
