'use strict';

// Real Chromium regression through the DevTools Protocol. No external package required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = process.env.SITE_BASE || 'http://127.0.0.1:4173';
const port = 9225;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'odre-pqc-browser-qa-'));
const child = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function endpoint() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = pages.find(item => item.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await delay(100);
  }
  throw new Error('Chromium DevTools endpoint did not become ready');
}

(async () => {
  const socket = new WebSocket(await endpoint());
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  const exceptions = [];
  const consoleErrors = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push('console.error');
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const routes = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/license/', '/trust/', '/company/', '/contact/'];
  const languages = ['en', 'ko', 'ja', 'de', 'es'];
  const viewports = [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }];
  const expectedEnglishTitles = {
    '/': 'Post-Quantum Security for FastAPI APIs | ODRE PQC',
    '/product/': 'Post-Quantum API Security & PQC Gateway | ODRE PQC',
    '/security/': 'ML-KEM-768 & ML-DSA-65 Security Architecture | ODRE PQC',
    '/docs/': 'FastAPI PQC Integration Documentation | ODRE PQC',
    '/pricing/': 'Post-Quantum Security Software Pricing | ODRE PQC',
    '/license/': 'ODRE PQC License Options',
    '/trust/': 'PQC Security Validation & Runtime Evidence | ODRE PQC',
    '/company/': 'ODRE AI | Company',
    '/contact/': 'Contact ODRE AI | ODRE PQC'
  };
  const titlesByLanguage = new Map(languages.map(lang => [lang, new Map()]));
  let cases = 0;
  const findings = [];
  for (const viewport of viewports) {
    await send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.name === 'mobile' });
    for (const route of routes) {
      for (const lang of languages) {
        await send('Page.navigate', { url: `${base}${route}?lang=${lang}` });
        for (let attempt = 0; attempt < 50; attempt++) {
          const state = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
          if (state.result.value === 'complete') break;
          await delay(20);
        }
        const evaluated = await send('Runtime.evaluate', {
          expression: `(() => ({
            lang: document.documentElement.lang,
            title: document.title,
            h1: document.querySelectorAll('h1').length,
            text: (document.querySelector('main')?.innerText || '').trim().length,
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            trialDisabled: document.querySelector('#trial-download')?.disabled ?? null,
            contactMailRoutes: document.querySelectorAll('main a[href^="mailto:odreai2025@gmail.com?subject="]').length,
            docsIntegration: !!document.querySelector('#production-integration')
          }))()`,
          returnByValue: true
        });
        const value = evaluated.result.value;
        const label = `${viewport.name} ${route} ${lang}`;
        if (value.lang !== lang) findings.push(`${label}: document language ${value.lang}`);
        if (!value.title) findings.push(`${label}: empty title`);
        if (lang === 'en' && value.title !== expectedEnglishTitles[route]) findings.push(`${label}: unexpected title ${value.title}`);
        const titleMap = titlesByLanguage.get(lang);
        if (titleMap.has(value.title) && titleMap.get(value.title) !== route) findings.push(`${label}: title duplicates ${titleMap.get(value.title)}`);
        titleMap.set(value.title, route);
        if (value.h1 !== 1) findings.push(`${label}: H1 count ${value.h1}`);
        if (value.text < 100) findings.push(`${label}: insufficient visible content`);
        if (value.scrollWidth > value.innerWidth + 1) findings.push(`${label}: horizontal overflow ${value.scrollWidth}/${value.innerWidth}`);
        if (route === '/contact/' && (value.trialDisabled !== true || value.contactMailRoutes !== 5)) findings.push(`${label}: contact/trial contract`);
        if (route === '/docs/' && value.docsIntegration !== true) findings.push(`${label}: production integration section`);
        cases++;
      }
    }
  }
  socket.close();
  assert.deepEqual(exceptions, [], `Browser exceptions: ${exceptions.join(', ')}`);
  assert.deepEqual(consoleErrors, [], `Console errors: ${consoleErrors.length}`);
  assert.deepEqual(findings, [], findings.join('\n'));
  console.log(JSON.stringify({ result: 'PASS', engine: 'Google Chrome', routes: routes.length, languages: languages.length, viewports: viewports.length, rendered_cases: cases, horizontal_overflow: 0, console_errors: 0, exceptions: 0 }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
}).finally(async () => {
  child.kill();
  await delay(100);
  const resolved = path.resolve(profile);
  const tempRoot = path.resolve(os.tmpdir()) + path.sep;
  if (resolved.startsWith(tempRoot)) fs.rmSync(resolved, { recursive: true, force: true });
});
