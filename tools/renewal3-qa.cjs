const fs = require('fs');
const assert = require('assert');

const read = (path) => fs.readFileSync(path, 'utf8');
const css = read('assets/css/site.css');
const site = read('assets/js/site.js');
const pricing = read('pricing/index.html');
const home = read('index.html');

assert(site.includes("['product', 'security', 'trust']"), 'progressive disclosure pages missing');
assert(site.includes("details.className = 'page-disclosure'"), 'shared disclosure UI missing');
assert(css.includes('@media (max-width: 1023px)'), 'tablet/mobile breakpoint missing');
assert(css.includes('@media (max-width: 767px)'), 'phone breakpoint missing');
assert(css.includes('.mobile-group-head, .mobile-direct') && css.includes('min-height: 56px'), 'mobile navigation touch target missing');
assert(css.includes('.mobile-language-grid button { min-height: 46px'), 'language touch target missing');
assert(css.includes('.page-disclosure > summary') && css.includes('min-height: 76px'), 'phone disclosure touch target missing');
assert(css.includes('.table-wrap { max-width: 100%; overflow-x: auto'), 'table overflow guard missing');
assert(css.includes('word-break: break-all'), 'hash overflow guard missing');
assert(css.includes('.code-block') && css.includes('overflow-x: auto'), 'code overflow guard missing');
assert(css.includes('.pricing-grid.plans-2') && css.includes('grid-template-columns: 1fr'), 'phone pricing stack missing');
assert(!pricing.includes('class="price-label" data-i18n="trial"'), 'Trial must not be a pricing plan');
assert(pricing.includes('href="/#trial"'), 'Pricing must keep the Trial path');
assert(home.includes('id="trial"'), 'Home bottom Trial section missing');
assert(!home.includes('id="home-journey"'), 'redundant home jump navigation remains');

console.log(JSON.stringify({
  progressivePages: ['product', 'security', 'trust'],
  phoneBreakpoints: [1023, 767, 390],
  touchTargets: { navigation: 56, language: 46, disclosure: 76 },
  overflowGuards: ['table', 'code', 'hash'],
  pricingPlans: 2,
  trialRole: 'home entry point',
  pass: true
}, null, 2));
