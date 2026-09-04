(function () {
  'use strict';
  const API_ENDPOINT = 'https://odreai.com/commercial/v1/purchase-claims';
  const query = new URLSearchParams(location.search);
  const recover = document.getElementById('recover');
  if (recover) {
    const allowed = ['transaction_id', 'subscription_id', 'plan', 'units'];
    const target = new URLSearchParams();
    allowed.forEach((key) => { const value = query.get(key); if (value) target.set(key, value); });
    recover.href = `/payment/register/${target.size ? `?${target.toString()}` : ''}`;
  }
  const form = document.getElementById('claimForm');
  if (!form) return;
  const reference = document.getElementById('paymentReference');
  const email = document.getElementById('email');
  const plan = document.getElementById('plan');
  const units = document.getElementById('units');
  const consent = document.getElementById('consent');
  const button = document.getElementById('submitButton');
  const message = document.getElementById('message');
  const queryReference = (query.get('transaction_id') || query.get('subscription_id') || '').trim();
  if (/^[A-Za-z0-9._-]{5,127}$/.test(queryReference)) reference.value = queryReference;
  plan.value = query.get('plan') === 'annual' ? 'annual' : 'monthly';
  units.value = String(Math.max(1, Math.min(20, Number.parseInt(query.get('units'), 10) || 1)));
  const show = (kind, text) => { message.className = `result show ${kind}`; message.textContent = text; };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ref = reference.value.trim();
    const quantity = Math.max(1, Math.min(20, Number.parseInt(units.value, 10) || 1));
    units.value = String(quantity);
    if (!/^[A-Za-z0-9._-]{5,127}$/.test(ref) || !email.validity.valid || !consent.checked) { show('error', 'Enter a valid transaction reference, payment email and confirmation.'); return; }
    button.disabled = true; button.textContent = 'Confirming your purchase…';
    try {
      const response = await fetch(API_ENDPOINT, { method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ provider: 'paddle', provider_reference: ref, delivery_email: email.value.trim(), plan_code: plan.value, expected_units: quantity }) });
      try { await response.json(); } catch (_) {}
      if (response.status === 202) show('warn', 'Your payment is still being confirmed. You do not need to pay again.');
      else if (response.ok) { show('ok', 'Confirmation received. Check your email for the next step.'); form.reset(); }
      else if (response.status === 409) show('warn', 'This transaction reference has already been registered. Contact License Support if you need help.');
      else show('error', 'We could not confirm the purchase right now. Your payment record is not changed. Please contact License Support.');
    } catch (_) { show('error', 'We could not reach the confirmation service. Your payment record is not changed. Please contact License Support.'); }
    finally { button.disabled = false; button.textContent = 'Confirm purchase and send license email'; }
  });
})();
