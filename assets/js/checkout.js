(function () {
  'use strict';
  var PADDLE_CHECKOUT = Object.freeze({
    environment: 'sandbox',
    publicCheckoutEnabled: false,
    clientToken: 'test_aea926287a8b0b55a8409ff49fb',
    priceIds: Object.freeze({
      monthly: 'pri_01m1p5ygmnxy4h6zb69c8jp5yh',
      annual: 'pri_01m1p6051n2ja1bej5m4nc71yy'
    })
  });
  var units = document.getElementById('monthlyUnits');
  var total = document.getElementById('monthlyTotal');
  var annualUnits = document.getElementById('annualUnits');
  var annualTotal = document.getElementById('annualTotal');
  var monthlyCheckout = document.getElementById('monthlyCheckout');
  var annualCheckout = document.getElementById('annualCheckout');
  var quantityButtons = Array.prototype.slice.call(document.querySelectorAll('[data-quantity-target][data-quantity-delta]'));
  if (!units || !annualUnits) return;
  function boundedQuantity(input) { var n = Math.max(1, Math.min(20, Number.parseInt(input.value, 10) || 1)); input.value = n; return n; }
  function updateStepButtons(input) {
    var quantity = Number.parseInt(input.value, 10) || 1;
    quantityButtons.filter(function (button) { return button.dataset.quantityTarget === input.id; }).forEach(function (button) {
      var delta = Number.parseInt(button.dataset.quantityDelta, 10);
      button.disabled = (delta < 0 && quantity <= 1) || (delta > 0 && quantity >= 20);
    });
  }
  function updateTotals() {
    total.textContent = '$' + (boundedQuantity(units) * 120).toLocaleString('en-US');
    annualTotal.textContent = '$' + (boundedQuantity(annualUnits) * 1300).toLocaleString('en-US');
    updateStepButtons(units); updateStepButtons(annualUnits);
  }
  quantityButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var input = document.getElementById(button.dataset.quantityTarget);
      if (!input) return;
      input.value = Math.max(1, Math.min(20, boundedQuantity(input) + Number.parseInt(button.dataset.quantityDelta, 10)));
      updateTotals();
    });
  });
  units.addEventListener('input', updateTotals); units.addEventListener('change', updateTotals); annualUnits.addEventListener('input', updateTotals); annualUnits.addEventListener('change', updateTotals); updateTotals();
  var activeCheckout = { plan: 'monthly', units: 1 };
  var paddleReady = false;
  function handlePaddleEvent(event) {
    var id = event && event.name === 'checkout.completed' && event.data ? String(event.data.transaction_id || '') : '';
    if (!/^txn_[a-z0-9]{20,64}$/i.test(id)) return;
    var params = new URLSearchParams({ transaction_id: id, plan: activeCheckout.plan, units: String(activeCheckout.units) });
    window.setTimeout(function () { location.assign('/payment/success/?' + params.toString()); }, 1400);
  }
  try {
    if (PADDLE_CHECKOUT.publicCheckoutEnabled && PADDLE_CHECKOUT.environment === 'live' && window.Paddle) {
      window.Paddle.Environment.set(PADDLE_CHECKOUT.environment);
      window.Paddle.Initialize({ token: PADDLE_CHECKOUT.clientToken, eventCallback: handlePaddleEvent });
      paddleReady = true;
    }
  } catch (error) { console.error('Checkout initialization failed'); }
  function unavailableMessage() {
    var language = document.documentElement.lang;
    return ({ en: 'Online checkout is not currently accepting orders. Contact Commercial for purchase assistance.', ko: '현재 온라인 결제를 이용할 수 없습니다. 구매는 상업 문의 채널을 이용하세요.', ja: '現在オンライン決済は利用できません。購入については商用窓口へお問い合わせください。', de: 'Der Online-Checkout nimmt derzeit keine Bestellungen an. Wenden Sie sich für den Kauf an den Vertrieb.', es: 'El pago en línea no acepta pedidos actualmente. Contacte con el área comercial para comprar.' })[language] || 'Online checkout is not currently accepting orders. Contact Commercial for purchase assistance.';
  }
  function openCheckout(plan) {
    if (!paddleReady) { window.alert(unavailableMessage()); return; }
    var input = plan === 'annual' ? annualUnits : units;
    var quantity = boundedQuantity(input);
    activeCheckout = { plan: plan, units: quantity };
    window.Paddle.Checkout.open({ items: [{ priceId: PADDLE_CHECKOUT.priceIds[plan], quantity: quantity }], settings: { displayMode: 'overlay', theme: 'light' } });
  }
  monthlyCheckout.addEventListener('click', function () { openCheckout('monthly'); });
  annualCheckout.addEventListener('click', function () { openCheckout('annual'); });
  if (!PADDLE_CHECKOUT.publicCheckoutEnabled || PADDLE_CHECKOUT.environment !== 'live') {
    monthlyCheckout.disabled = true; monthlyCheckout.setAttribute('aria-disabled', 'true');
    annualCheckout.disabled = true; annualCheckout.setAttribute('aria-disabled', 'true');
  }
  var requested = new URLSearchParams(location.search).get('plan');
  if (requested === 'annual') annualUnits.focus(); else if (requested === 'monthly') units.focus();
}());
