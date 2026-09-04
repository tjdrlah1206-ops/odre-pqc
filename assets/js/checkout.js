(function () {
  'use strict';
  var PADDLE_CHECKOUT = Object.freeze({
    environment: 'sandbox',
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
  if (!units || !annualUnits) return;
  function boundedQuantity(input) { var n = Math.max(1, Math.min(20, Number.parseInt(input.value, 10) || 1)); input.value = n; return n; }
  function updateTotals() { total.textContent = '$' + (boundedQuantity(units) * 120).toLocaleString('en-US'); annualTotal.textContent = '$' + (boundedQuantity(annualUnits) * 1300).toLocaleString('en-US'); }
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
    if (window.Paddle) {
      window.Paddle.Environment.set(PADDLE_CHECKOUT.environment);
      window.Paddle.Initialize({ token: PADDLE_CHECKOUT.clientToken, eventCallback: handlePaddleEvent });
      paddleReady = true;
    }
  } catch (error) { console.error('Paddle sandbox initialization failed', error); }
  function unavailableMessage() {
    var language = document.documentElement.lang;
    return ({ en: 'Paddle Sandbox checkout could not be loaded. Please try again.', ko: 'Paddle 샌드박스 결제를 불러오지 못했습니다. 다시 시도하세요.', ja: 'Paddle Sandboxを読み込めませんでした。もう一度お試しください。', de: 'Paddle Sandbox konnte nicht geladen werden. Bitte erneut versuchen.', es: 'No se pudo cargar Paddle Sandbox. Inténtelo de nuevo.' })[language] || 'Paddle Sandbox checkout could not be loaded. Please try again.';
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
  var requested = new URLSearchParams(location.search).get('plan');
  if (requested === 'annual') annualUnits.focus(); else if (requested === 'monthly') units.focus();
}());
