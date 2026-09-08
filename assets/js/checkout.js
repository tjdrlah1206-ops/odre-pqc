(function () {
  'use strict';
  var PADDLE_CHECKOUT = Object.freeze({
    environment: 'production',
    // Keep the public purchase UI closed until the distribution package is ready and the owner explicitly approves reopening.
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
  function boundedQuantity(input) { var n = Math.max(1, Math.min(1000, Number.parseInt(input.value, 10) || 1)); input.value = n; return n; }
  function updateStepButtons(input) {
    var quantity = Number.parseInt(input.value, 10) || 1;
    quantityButtons.filter(function (button) { return button.dataset.quantityTarget === input.id; }).forEach(function (button) {
      var delta = Number.parseInt(button.dataset.quantityDelta, 10);
      button.disabled = (delta < 0 && quantity <= 1) || (delta > 0 && quantity >= 1000);
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
      input.value = Math.max(1, Math.min(1000, boundedQuantity(input) + Number.parseInt(button.dataset.quantityDelta, 10)));
      updateTotals();
    });
  });
  units.addEventListener('input', updateTotals); units.addEventListener('change', updateTotals); annualUnits.addEventListener('input', updateTotals); annualUnits.addEventListener('change', updateTotals); updateTotals();
  var activeCheckout = { plan: 'monthly', units: 1 };
  var paddleReady = false;
  var checkoutLabels = {
    en: { pendingTitle: 'Checkout is temporarily paused.', pendingCopy: 'Checkout will remain closed until the distribution package is ready and reopening is approved. No new orders are created on this page. Existing subscriptions and license activation remain available.', readyTitle: 'Live checkout is available.', readyCopy: 'This is a real recurring subscription. Paddle calculates applicable taxes at checkout.', monthly: 'Monthly checkout', annual: 'Annual checkout' },
    ko: { pendingTitle: '결제를 일시 중단했습니다.', pendingCopy: '배포패키지 준비 완료 및 재개 승인 전까지 결제를 중단합니다. 이 페이지에서는 새 주문을 생성하지 않습니다. 기존 구독과 라이선스 활성화는 유지됩니다.', readyTitle: 'Live 결제를 이용할 수 있습니다.', readyCopy: '실제 요금이 청구되는 정기구독입니다. 적용 세금은 Paddle 결제창에서 계산됩니다.', monthly: '월간 결제', annual: '연간 결제' },
    ja: { pendingTitle: '決済を一時停止しています。', pendingCopy: '配布パッケージの準備が完了し、再開が承認されるまで決済を停止します。このページでは新規注文は作成されません。既存のサブスクリプションとライセンスの有効化は継続します。', readyTitle: '本番決済をご利用いただけます。', readyCopy: '実際に請求される継続課金です。適用される税額はPaddleの決済画面で計算されます。', monthly: '月間プランの決済', annual: '年間プランの決済' },
    de: { pendingTitle: 'Der Checkout ist vorübergehend pausiert.', pendingCopy: 'Der Checkout bleibt geschlossen, bis das Auslieferungspaket fertiggestellt und die Wiederaufnahme freigegeben ist. Diese Seite erstellt keine neuen Bestellungen. Bestehende Abonnements und die Lizenzaktivierung bleiben verfügbar.', readyTitle: 'Live-Checkout ist verfügbar.', readyCopy: 'Dies ist ein echtes, wiederkehrendes Abonnement. Paddle berechnet anfallende Steuern im Checkout.', monthly: 'Monatliches Abonnement bezahlen', annual: 'Jährliches Abonnement bezahlen' },
    es: { pendingTitle: 'Los pagos están temporalmente suspendidos.', pendingCopy: 'Los pagos permanecerán cerrados hasta que el paquete de distribución esté listo y se autorice la reapertura. Esta página no crea pedidos nuevos. Las suscripciones existentes y la activación de licencias siguen disponibles.', readyTitle: 'El pago real está disponible.', readyCopy: 'Es una suscripción recurrente con cargos reales. Paddle calcula los impuestos aplicables al pagar.', monthly: 'Pagar suscripción mensual', annual: 'Pagar suscripción anual' }
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
    return (checkoutLabels[language] || checkoutLabels.en).pendingCopy;
  }
  function openCheckout(plan) {
    if (!PADDLE_CHECKOUT.publicCheckoutEnabled || !paddleReady) { window.alert(unavailableMessage()); return; }
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
