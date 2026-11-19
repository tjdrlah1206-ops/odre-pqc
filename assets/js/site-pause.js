/* Owner-authorized retirement: keep public information, disable transactions. */
(function () {
  'use strict';
  window.ODRE_PQC_ACTIONS_DISABLED = true;
  var messages = {
    ko: '제품·자료 다운로드 및 구매가 중단되었습니다.',
    en: 'Product downloads, document downloads and purchases are unavailable.',
    ja: '製品・資料のダウンロードと購入は停止しています。',
    de: 'Produkt- und Dokumentdownloads sowie Käufe sind deaktiviert.',
    es: 'Las descargas de productos y documentos y las compras están desactivadas.'
  };
  function message() { return messages[document.documentElement.lang] || messages.en; }
  function action(node) {
    if (!node || !node.matches) return false;
    if (node.matches('[data-site-paused],a[download],[data-checkout-plan],[data-checkout],[data-doc-download]')) return true;
    if (/^(monthlyCheckout|annualCheckout|trialDownload|downloadButton)$/.test(node.id)) return true;
    var href = node.getAttribute('href');
    if (!href) return false;
    try {
      var url = new URL(href, location.href);
      return /\.(pdf|zip|whl|aar|tar|gz|sha256|p7s|sig|der|pem|json)$/i.test(url.pathname) ||
        /\/(?:downloads?)(?:\/|$)/i.test(url.pathname) ||
        /(^|\.)paddle\.com$/i.test(url.hostname) ||
        /\/(?:checkout|purchase)(?:\/|$)/i.test(url.pathname);
    } catch (_) { return false; }
  }
  function disable(node) {
    if (!action(node)) return;
    if (node.hasAttribute('href')) node.removeAttribute('href');
    if (!node.hasAttribute('data-site-paused')) node.setAttribute('data-site-paused', 'true');
    if (node.getAttribute('aria-disabled') !== 'true') node.setAttribute('aria-disabled', 'true');
    if (node.getAttribute('tabindex') !== '-1') node.setAttribute('tabindex', '-1');
    if (node.title !== message()) node.title = message();
    if ('disabled' in node && !node.disabled) node.disabled = true;
  }
  function refresh() {
    document.querySelectorAll('a,button,[data-checkout],[data-checkout-plan]').forEach(disable);
  }
  function prevent(event) {
    var target = event.target && event.target.closest ? event.target.closest('a,button,[data-site-paused]') : null;
    if (!target || !action(target)) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    disable(target);
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  document.addEventListener('click', prevent, true);
  document.addEventListener('auxclick', prevent, true);
  document.addEventListener('keydown', prevent, true);
  function start() {
    refresh();
    new MutationObserver(refresh).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'lang']
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
