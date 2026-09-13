/* Temporary owner-requested website download/checkout pause, 2026-09-13.
   This controls website actions; it does not revoke server URLs or subscriptions. */
(function () {
  'use strict';
  var copy = {
    en: 'Downloads and checkout are temporarily unavailable.',
    ko: '다운로드와 결제를 일시 중단했습니다.',
    ja: 'ダウンロードと決済を一時停止しています。',
    de: 'Downloads und Zahlungen sind vorübergehend deaktiviert.',
    es: 'Las descargas y los pagos están temporalmente desactivados.'
  };
  function reason() { return copy[document.documentElement.lang] || copy.en; }
  function kind(el) {
    if (el.hasAttribute('data-site-paused')) return el.getAttribute('data-site-paused');
    var href = el.getAttribute('href') || '';
    var key = [el.getAttribute('data-i18n'), el.getAttribute('data-common'), el.id].join(' ');
    if (el.hasAttribute('download') || el.hasAttribute('data-pqc-document') ||
        /\.(pdf|zip|whl|exe|sha256|tar|gz|txt)([?#]|$)|\/release-pins\.json([?#]|$)|\/downloads\//i.test(href) ||
        /download|requestTrial|trialCta|trialPdf/i.test(key)) return 'download';
    if (/\/license\/\?plan=|(?:checkout|buy)\.paddle\.com/i.test(href) ||
        /buyMonthly|buyAnnual|checkout|purchase/i.test(key)) return 'checkout';
    return '';
  }
  function set(el, name, value) {
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  }
  function disable(el) {
    var type = kind(el);
    if (!type) return;
    set(el, 'data-site-paused', type);
    if (el.hasAttribute('href')) {
      set(el, 'data-paused-href', el.getAttribute('href'));
      el.removeAttribute('href');
    }
    if (el.hasAttribute('download')) el.removeAttribute('download');
    set(el, 'aria-disabled', 'true');
    set(el, 'tabindex', '-1');
    set(el, 'title', reason());
    if (el.tagName === 'BUTTON' && !el.disabled) el.disabled = true;
  }
  function refresh() {
    document.querySelectorAll('a,button').forEach(disable);
  }
  function block(event) {
    var el = event.target && event.target.closest ? event.target.closest('a,button') : null;
    if (!el || !kind(el)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    disable(el);
  }
  document.addEventListener('click', block, true);
  document.addEventListener('auxclick', block, true);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') block(event);
  }, true);
  document.addEventListener('odre:language', refresh);
  new MutationObserver(refresh).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ['href', 'download', 'disabled', 'lang']
  });
  document.addEventListener('DOMContentLoaded', refresh);
  refresh();
}());

