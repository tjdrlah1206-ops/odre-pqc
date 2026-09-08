(function () {
  'use strict';
  // Deliberately unlisted, NOT access-controlled. Only this page references the test price.
  var CLIENT_TOKEN = 'live_92a112a9e75e51a31ebe4862254';
  var TEST_PRICE_ID = 'pri_01m20nj5f1mfq56dmp1mgt08k8';
  var acknowledgement = document.getElementById('realChargeAcknowledged');
  var button = document.getElementById('liveTestCheckout');
  var status = document.getElementById('testStatus');
  if (!acknowledgement || !button || !status) return;
  var loading = false, ready = false, opened = false, completed = false, failed = false;
  var validLocation = location.protocol === 'https:' && location.hostname === 'pqc.odreai.com' && !location.search && !location.hash;

  function updateButton() {
    var enabled = validLocation && acknowledgement.checked && !loading && !opened && !completed && !failed;
    button.disabled = !enabled;
    button.setAttribute('aria-disabled', String(!enabled));
  }
  function fail() {
    loading = false; opened = false; failed = true;
    status.textContent = '결제창을 열거나 확인하지 못했습니다. 자동 재시도하지 않습니다. 이미 결제했다면 다시 결제하지 말고 Paddle 거래와 서버 상태를 먼저 확인하세요.';
    updateButton();
  }
  function onEvent(event) {
    if (!event || typeof event.name !== 'string' || completed) return;
    if (event.name === 'checkout.completed') {
      completed = true; opened = false;
      status.textContent = 'Paddle 결제 완료 알림을 받았습니다. 서버의 Webhook·License·Activation·Unit·Lease 검증은 별도로 확인해야 합니다. 다시 결제하지 말고 시험 구독의 취소·다음 청구도 확인하세요.';
      updateButton();
    } else if (event.name === 'checkout.closed') {
      opened = false;
      status.textContent = '결제창을 닫았습니다. 결제 여부가 불확실하다면 다시 결제하기 전에 Paddle 거래 내역을 확인하세요.';
      updateButton();
    } else if (event.name === 'checkout.error' || event.name === 'checkout.payment.error') {
      fail();
    }
  }
  function openCheckout() {
    if (!validLocation || !acknowledgement.checked || !ready || opened || completed || failed) { updateButton(); return; }
    opened = true;
    status.textContent = '실제 $1 월 정기결제 창을 열었습니다. 결제창의 금액·세금·갱신 조건을 확인하세요.';
    updateButton();
    try {
      window.Paddle.Checkout.open({ items: [{ priceId: TEST_PRICE_ID, quantity: 1 }], settings: { displayMode: 'overlay', theme: 'light', locale: 'ko', showAddDiscounts: false } });
    } catch (error) { fail(); }
  }
  function initialize() {
    try {
      if (!window.Paddle || ready) throw new Error('PADDLE_NOT_AVAILABLE');
      // Production is Paddle.js's default. Never select sandbox or use an API secret here.
      window.Paddle.Initialize({ token: CLIENT_TOKEN, eventCallback: onEvent });
      ready = true; loading = false;
      if (acknowledgement.checked) openCheckout();
      else { status.textContent = '실제 결제 안내를 다시 확인한 뒤 버튼을 눌러 주세요.'; updateButton(); }
    } catch (error) { fail(); }
  }
  button.addEventListener('click', function () {
    if (!validLocation || !acknowledgement.checked || loading || opened || completed || failed) return;
    if (ready) { openCheckout(); return; }
    loading = true;
    status.textContent = 'Paddle 결제창을 준비하고 있습니다. 결제 완료 전까지 창을 반복해서 열지 마세요.';
    updateButton();
    if (window.Paddle) { initialize(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = initialize;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  acknowledgement.addEventListener('change', updateButton);
  if (!validLocation) status.textContent = '정식 HTTPS 주소를 쿼리·프래그먼트 없이 열어 주세요. 다른 주소나 결제 매개변수가 붙은 URL에서는 실행하지 않습니다.';
  updateButton();
}());
