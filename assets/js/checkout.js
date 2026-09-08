(function () {
  'use strict';
  var PADDLE_CHECKOUT = Object.freeze({
    environment: 'sandbox',
    publicCheckoutEnabled: true,
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
    total.textContent = '$' + (boundedQuantity(units) * 250).toLocaleString('en-US');
    annualTotal.textContent = '$' + (boundedQuantity(annualUnits) * 2700).toLocaleString('en-US');
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
  var sandboxLabels = {
    en: { title: 'Sandbox checkout is enabled for testing.', copy: 'Test transactions only. No real charge will be made.', monthly: 'Monthly sandbox checkout', annual: 'Annual sandbox checkout' },
    ko: { title: '테스트용 샌드박스 결제가 활성화되었습니다.', copy: '테스트 거래만 생성되며 실제 요금은 청구되지 않습니다.', monthly: '월간 샌드박스 결제', annual: '연간 샌드박스 결제' },
    ja: { title: 'テスト用サンドボックス決済が有効です。', copy: 'テスト取引のみで、実際の請求は発生しません。', monthly: '月間サンドボックス決済', annual: '年間サンドボックス決済' },
    de: { title: 'Der Sandbox-Checkout ist zum Testen aktiviert.', copy: 'Nur Testtransaktionen; es erfolgt keine echte Belastung.', monthly: 'Monatlicher Sandbox-Checkout', annual: 'Jährlicher Sandbox-Checkout' },
    es: { title: 'El pago sandbox está habilitado para pruebas.', copy: 'Solo transacciones de prueba; no se realizará ningún cargo real.', monthly: 'Pago sandbox mensual', annual: 'Pago sandbox anual' }
  };
  function setCheckoutEnabled(enabled) {
    [monthlyCheckout, annualCheckout].forEach(function (button) {
      button.disabled = !enabled;
      button.setAttribute('aria-disabled', String(!enabled));
    });
  }
  function applySandboxLabels() {
    if (!paddleReady || PADDLE_CHECKOUT.environment !== 'sandbox') return;
    var labels = sandboxLabels[document.documentElement.lang] || sandboxLabels.en;
    var title = document.querySelector('[data-i18n="availabilityTitle"]');
    var copy = document.querySelector('[data-i18n="availabilityCopy"]');
    if (title) title.textContent = labels.title;
    if (copy) copy.textContent = labels.copy;
    monthlyCheckout.textContent = labels.monthly;
    annualCheckout.textContent = labels.annual;
  }
  function handlePaddleEvent(event) {
    var id = event && event.name === 'checkout.completed' && event.data ? String(event.data.transaction_id || '') : '';
    if (!/^txn_[a-z0-9]{20,64}$/i.test(id)) return;
    var params = new URLSearchParams({ transaction_id: id, plan: activeCheckout.plan, units: String(activeCheckout.units) });
    window.setTimeout(function () { location.assign('/payment/success/?' + params.toString()); }, 1400);
  }
  function initializePaddle() {
    try {
      if (!PADDLE_CHECKOUT.publicCheckoutEnabled || !window.Paddle) return;
      if (['sandbox', 'live'].indexOf(PADDLE_CHECKOUT.environment) < 0) throw new Error('Unsupported Paddle environment');
      window.Paddle.Environment.set(PADDLE_CHECKOUT.environment);
      window.Paddle.Initialize({ token: PADDLE_CHECKOUT.clientToken, eventCallback: handlePaddleEvent });
      paddleReady = true;
      setCheckoutEnabled(true);
      applySandboxLabels();
    } catch (error) { console.error('Checkout initialization failed'); }
  }
  function loadPaddle() {
    setCheckoutEnabled(false);
    if (!PADDLE_CHECKOUT.publicCheckoutEnabled) return;
    if (window.Paddle) { initializePaddle(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = initializePaddle;
    script.onerror = function () { console.error('Checkout initialization failed'); };
    document.head.appendChild(script);
  }
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
  document.addEventListener('odre:language', applySandboxLabels);
  loadPaddle();
  var requested = new URLSearchParams(location.search).get('plan');
  if (requested === 'annual') annualUnits.focus(); else if (requested === 'monthly') units.focus();
}());
