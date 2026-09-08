(function () {
  'use strict';
  var PADDLE_CHECKOUT = Object.freeze({
    environment: 'production',
    // Keep the public purchase UI closed until the separate Live E2E and release gates are approved.
    // This client-side switch is not an authorization boundary for Paddle prices.
    publicCheckoutEnabled: false,
    productId: 'pro_01m1p28azxeewd9syewtj13f58',
    clientToken: 'live_92a112a9e75e51a31ebe4862254',
    priceIds: Object.freeze({
      monthly: 'pri_01m1p2dqq1xv8em7tgv81cwkms',
      annual: 'pri_01m1p2gh8th4460tab4m0v2vyg'
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
  var checkoutLabels = {
    en: { pendingTitle: 'Live purchase preparation is in progress.', pendingCopy: 'Public checkout remains closed pending Live end-to-end verification and release approval. No order is created on this page.', readyTitle: 'Live checkout is available.', readyCopy: 'This is a real recurring subscription. Paddle calculates applicable taxes at checkout.', monthly: 'Monthly checkout', annual: 'Annual checkout' },
    ko: { pendingTitle: 'Live 결제와 제품 출시를 준비하고 있습니다.', pendingCopy: 'Live 전체 흐름 검증과 출시 승인 전까지 일반 고객 결제는 열지 않습니다. 현재 이 페이지에서는 주문을 생성하지 않습니다.', readyTitle: 'Live 결제를 이용할 수 있습니다.', readyCopy: '실제 요금이 청구되는 정기구독입니다. 적용 세금은 Paddle 결제창에서 계산됩니다.', monthly: '월간 결제', annual: '연간 결제' },
    ja: { pendingTitle: '本番決済と製品リリースを準備中です。', pendingCopy: '本番環境での一連の検証とリリース承認が完了するまで、一般向け決済は停止しています。このページでは現在、注文は作成されません。', readyTitle: '本番決済をご利用いただけます。', readyCopy: '実際に請求される継続課金です。適用される税額はPaddleの決済画面で計算されます。', monthly: '月間プランの決済', annual: '年間プランの決済' },
    de: { pendingTitle: 'Live-Zahlungen und Produktfreigabe werden vorbereitet.', pendingCopy: 'Der öffentliche Checkout bleibt bis zur Live-End-to-End-Prüfung und Freigabe geschlossen. Auf dieser Seite wird derzeit keine Bestellung erstellt.', readyTitle: 'Live-Checkout ist verfügbar.', readyCopy: 'Dies ist ein echtes, wiederkehrendes Abonnement. Paddle berechnet anfallende Steuern im Checkout.', monthly: 'Monatliches Abonnement bezahlen', annual: 'Jährliches Abonnement bezahlen' },
    es: { pendingTitle: 'Estamos preparando los pagos reales y el lanzamiento.', pendingCopy: 'El pago público permanece cerrado hasta completar la verificación integral en Live y aprobar el lanzamiento. Esta página no crea pedidos actualmente.', readyTitle: 'El pago real está disponible.', readyCopy: 'Es una suscripción recurrente con cargos reales. Paddle calcula los impuestos aplicables al pagar.', monthly: 'Pagar suscripción mensual', annual: 'Pagar suscripción anual' }
  };
  function setCheckoutEnabled(enabled) {
    [monthlyCheckout, annualCheckout].forEach(function (button) {
      button.disabled = !enabled;
      button.setAttribute('aria-disabled', String(!enabled));
    });
  }
  function applyCheckoutLabels() {
    var labels = checkoutLabels[document.documentElement.lang] || checkoutLabels.en;
    var title = document.querySelector('[data-i18n="availabilityTitle"]');
    var copy = document.querySelector('[data-i18n="availabilityCopy"]');
    if (title) title.textContent = paddleReady ? labels.readyTitle : labels.pendingTitle;
    if (copy) copy.textContent = paddleReady ? labels.readyCopy : labels.pendingCopy;
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
      if (PADDLE_CHECKOUT.environment !== 'production' || !/^live_[a-z0-9]+$/.test(PADDLE_CHECKOUT.clientToken)) throw new Error('Invalid Live configuration');
      // Paddle.js defaults to production. Do not pass the unsupported value "live".
      window.Paddle.Initialize({ token: PADDLE_CHECKOUT.clientToken, eventCallback: handlePaddleEvent });
      paddleReady = true;
      setCheckoutEnabled(true);
      applyCheckoutLabels();
    } catch (error) { paddleReady = false; setCheckoutEnabled(false); applyCheckoutLabels(); console.error('Checkout initialization failed'); }
  }
  function loadPaddle() {
    setCheckoutEnabled(false);
    applyCheckoutLabels();
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
  document.addEventListener('odre:language', applyCheckoutLabels);
  loadPaddle();
  var requested = new URLSearchParams(location.search).get('plan');
  if (requested === 'annual') annualUnits.focus(); else if (requested === 'monthly') units.focus();
}());
