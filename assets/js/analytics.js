(function () {
  'use strict';

  // First-party, tab-scoped operational statistics. No cookies, form access,
  // fingerprint, query strings, URL fragments or raw user-agent persistence.
  if (window.__odrePqcAnalytics || location.origin !== 'https://pqc.odreai.com') return;
  // The authenticated admin dashboard offers this explicit inspection link.
  // Only a boolean opt-out is stored; the marker itself is never transmitted.
  if (location.hash === '#odre-analytics-off') {
    try { sessionStorage.setItem('odre-pqc-analytics-optout', 'true'); } catch (error) {}
    try { history.replaceState(history.state, '', location.pathname + location.search); } catch (error) {}
    return;
  }
  try { if (sessionStorage.getItem('odre-pqc-analytics-optout') === 'true') return; } catch (error) {}
  var paths = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/company/', '/contact/', '/enterprise/', '/releases/', '/license/', '/payment/', '/payment/register/', '/payment/success/', '/terms/', '/privacy/', '/refund/'];
  function safePath(value) { return typeof value === 'string' && paths.indexOf(value) >= 0 ? value : null; }
  var path = safePath(location.pathname);
  if (!path || !window.crypto || !window.crypto.getRandomValues) return;
  var ua = String(navigator.userAgent || '');
  if (/bot\b|crawler|spider|headless|lighthouse|pagespeed|preview|slurp/i.test(ua)) return;
  window.__odrePqcAnalytics = true;

  var endpoint = 'https://odreai.com/odre-pqc/analytics/v1/';
  var storageKey = 'odre-pqc-analytics-session-v1';
  var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  var supported = ['en', 'ko', 'ja', 'de', 'es'];
  function uuid() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();
    var bytes = window.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.prototype.map.call(bytes, function (value) { return ('0' + value.toString(16)).slice(-2); }).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }
  var previous = null;
  try { previous = JSON.parse(sessionStorage.getItem(storageKey)); } catch (error) {}
  var now = Date.now();
  var sameSession = previous && uuidPattern.test(previous.visitor_id) && uuidPattern.test(previous.session_id) &&
    typeof previous.last_activity === 'number' && now >= previous.last_activity && now - previous.last_activity < 1800000;
  var state = {
    visitor_id: previous && uuidPattern.test(previous.visitor_id) ? previous.visitor_id : uuid(),
    session_id: sameSession ? previous.session_id : uuid(),
    entry_path: sameSession && safePath(previous.entry_path) ? previous.entry_path : path,
    previous_path: path,
    last_activity: now
  };
  function persist() {
    state.last_activity = Date.now();
    try { sessionStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) {}
  }
  var referrerHostname = null;
  var referrerPath = null;
  try {
    var referrer = new URL(document.referrer);
    var hostname = referrer.hostname.toLowerCase().replace(/\.$/, '');
    if ((referrer.protocol === 'https:' || referrer.protocol === 'http:') && hostname.length <= 253 && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) {
      referrerHostname = hostname;
      if (referrer.origin === location.origin) referrerPath = safePath(referrer.pathname);
    }
  } catch (error) {}
  function languageFields() {
    var language = window.ODRE_SITE && window.ODRE_SITE.analyticsLanguage ? window.ODRE_SITE.analyticsLanguage() : {};
    var browser = String(navigator.language || 'en');
    if (!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(browser) || browser.length > 35) browser = 'und';
    var rendered = supported.indexOf(document.documentElement.lang) >= 0 ? document.documentElement.lang : 'en';
    return {
      browser_language: browser,
      browser_primary_language: browser.split('-')[0].toLowerCase(),
      selected_language: supported.indexOf(language.selected_language) >= 0 ? language.selected_language : null,
      rendered_language: rendered,
      language_source: ['manual', 'browser', 'fallback', 'unknown'].indexOf(language.language_source) >= 0 ? language.language_source : 'unknown',
      translated_view: rendered !== 'en',
      fallback_used: language.language_source === 'fallback' && rendered === 'en'
    };
  }
  function browserFamily() {
    if (/Edg\/|EdgiOS\/|EdgA\//.test(ua)) return 'Edge';
    if (/OPR\/|Opera/.test(ua)) return 'Opera';
    if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox';
    if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
    return /Safari\//.test(ua) ? 'Safari' : 'Other';
  }
  function osFamily() {
    if (/Android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iOS';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac OS|Macintosh/.test(ua)) return 'macOS';
    return /Linux/.test(ua) ? 'Linux' : 'Other';
  }
  var os = osFamily();
  function dimension(value) { return Number.isFinite(value) && value > 0 ? Math.min(10000, Math.round(value / 100) * 100) : 0; }
  var ids = { visitor_id: state.visitor_id, session_id: state.session_id, pageview_id: uuid() };
  var visit = Object.assign({}, ids, {
    path: path,
    previous_path: sameSession ? safePath(previous.previous_path) : referrerPath,
    entry_path: state.entry_path,
    referrer_hostname: referrerHostname,
    device: /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (os === 'iOS' && /Macintosh/.test(ua)) ? 'tablet' : /Mobile|iPhone|iPod/i.test(ua) ? 'mobile' : 'desktop',
    screen_width: dimension(window.screen && window.screen.width),
    screen_height: dimension(window.screen && window.screen.height),
    browser: browserFamily(),
    os: os
  }, languageFields());
  persist();

  var visibleSince = document.visibilityState === 'visible' ? performance.now() : null;
  var accumulated = 0;
  var visitAccepted = false;
  var visitAttempts = 0;
  var sendingVisit = false;
  var lastActivityKey = '';
  function activeMs() {
    if (visibleSince !== null) {
      var sampleTime = performance.now();
      // A suspended computer must not turn hours without timer execution into
      // hours of dwell. Allow modest heartbeat jitter, then cap each sample.
      accumulated += Math.min(90000, Math.max(0, sampleTime - visibleSince));
      visibleSince = sampleTime;
    }
    return Math.min(86400000, Math.floor(accumulated));
  }
  function beacon(route, payload) {
    try { return Boolean(navigator.sendBeacon && navigator.sendBeacon(endpoint + route, new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' }))); }
    catch (error) { return false; }
  }
  function post(route, payload) {
    try {
      return fetch(endpoint + route, { method: 'POST', mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload), keepalive: true, cache: 'no-store' })
        .then(function (response) { return response.status === 202; }, function () { return false; });
    } catch (error) { return Promise.resolve(false); }
  }
  function sendVisit(final) {
    if (visitAccepted) return;
    var payload = Object.assign({}, visit, { active_ms: activeMs() }, languageFields());
    if (final && beacon('visit', payload)) return;
    if (sendingVisit || visitAttempts >= 3) return;
    sendingVisit = true;
    visitAttempts += 1;
    post('visit', payload).then(function (accepted) {
      sendingVisit = false;
      visitAccepted = accepted;
      if (accepted) sendActivity(false, true);
      else if (visitAttempts < 3) setTimeout(function () { sendVisit(false); }, visitAttempts * 3000);
    });
  }
  function sendActivity(final, force) {
    if (!visitAccepted) sendVisit(final);
    var payload = Object.assign({}, ids, { active_ms: activeMs() }, languageFields());
    var key = JSON.stringify(payload);
    if (!force && key === lastActivityKey) return;
    lastActivityKey = key;
    persist();
    if (final && beacon('activity', payload)) return;
    post('activity', payload).then(function (accepted) { if (!accepted && lastActivityKey === key) lastActivityKey = ''; });
  }
  function visibilityChanged() {
    if (document.visibilityState === 'hidden') {
      if (visibleSince !== null) { activeMs(); visibleSince = null; }
      sendActivity(true, false);
    } else if (visibleSince === null) {
      visibleSince = performance.now();
      sendActivity(false, true);
    }
  }
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('pagehide', function () {
    if (visibleSince !== null) { activeMs(); visibleSince = null; }
    sendActivity(true, false);
  });
  window.addEventListener('pageshow', function () {
    if (document.visibilityState === 'visible' && visibleSince === null) { visibleSince = performance.now(); sendActivity(false, true); }
  });
  document.addEventListener('odre:language', function () { sendActivity(false, true); });
  setInterval(function () { if (document.visibilityState === 'visible') sendActivity(false, true); }, 60000);
  sendVisit(false);
}());
