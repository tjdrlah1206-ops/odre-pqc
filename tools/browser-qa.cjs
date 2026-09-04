const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = 'http://127.0.0.1:4173';
const routes = ['/', '/product/', '/security/', '/docs/', '/pricing/', '/trust/', '/company/', '/contact/', '/enterprise/', '/releases/', '/license/', '/payment/', '/payment/register/', '/payment/success/', '/privacy/', '/refund/', '/terms/'];
const viewports = [
  { name: '360', width: 360, height: 800 }, { name: '375', width: 375, height: 812 },
  { name: '390', width: 390, height: 844 }, { name: '430', width: 430, height: 900 },
  { name: '768', width: 768, height: 1024 }, { name: '1024', width: 1024, height: 900 },
  { name: '1440', width: 1440, height: 1000 }
];
const output = path.join(__dirname, '..', '.qa-artifacts');
fs.mkdirSync(output, { recursive: true });

async function launch(label) {
  if (label === 'edge') return chromium.launch({ channel: 'msedge', headless: true });
  try { return await chromium.launch({ channel: 'chrome', headless: true }); }
  catch (error) { return chromium.launch({ headless: true }); }
}

(async () => {
  const failures = [], consoleErrors = [];
  for (const browserName of ['chrome', 'edge']) {
    let browser;
    try { browser = await launch(browserName); }
    catch (error) { failures.push(browserName + ' launch: ' + error.message); continue; }
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      for (const route of routes) {
        const page = await context.newPage();
        page.on('console', msg => { if (msg.type() === 'error' && !(route === '/payment/register/' && msg.text().includes("frame-ancestors") && msg.text().includes('ignored'))) consoleErrors.push(`${browserName} ${viewport.name} ${route}: ${msg.text()}`); });
        page.on('pageerror', error => consoleErrors.push(`${browserName} ${viewport.name} ${route}: ${error.message}`));
        try {
          const response = await page.goto(root + route, { waitUntil: 'domcontentloaded', timeout: 20000 });
          if (!response || response.status() >= 400) failures.push(`${browserName} ${viewport.name} ${route}: HTTP ${response && response.status()}`);
          await page.waitForTimeout(120);
          const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
          if (overflow.sw > overflow.cw + 1) failures.push(`${browserName} ${viewport.name} ${route}: overflow ${overflow.sw}/${overflow.cw}`);
          if (viewport.width >= 1024) {
            if (!await page.locator('.desktop-nav').isVisible()) failures.push(`${browserName} ${viewport.name} ${route}: desktop nav hidden`);
          } else {
            if (!await page.locator('#mobile-toggle').isVisible()) failures.push(`${browserName} ${viewport.name} ${route}: mobile toggle hidden`);
          }
          if (route === '/' && viewport.width < 1024) {
            await page.locator('#mobile-toggle').click();
            if (!await page.locator('#mobile-drawer').isVisible()) failures.push(`${browserName} ${viewport.name}: mobile drawer did not open`);
            const product = page.locator('.mobile-group-head').first(); await product.click();
            if (!await page.locator('#mobile-menu-0 a').first().isVisible()) failures.push(`${browserName} ${viewport.name}: mobile submenu did not open`);
            const locked = await page.evaluate(() => document.body.classList.contains('nav-open'));
            if (!locked) failures.push(`${browserName} ${viewport.name}: body scroll not locked`);
            if (browserName === 'chrome' && viewport.name === '390') await page.screenshot({ path: path.join(output, 'mobile-menu-390.png') });
            await page.keyboard.press('Escape');
            if (await page.locator('#mobile-drawer').evaluate(node => node.classList.contains('open'))) failures.push(`${browserName} ${viewport.name}: ESC did not close drawer`);
          }
          if (route === '/' && viewport.width >= 1024) {
            const triggers = page.locator('.nav-trigger');
            for (let i = 0; i < await triggers.count(); i++) {
              await triggers.nth(i).click();
              const id = await triggers.nth(i).getAttribute('aria-controls');
              if (!await page.locator('#' + id).isVisible()) failures.push(`${browserName} ${viewport.name}: desktop menu ${i} did not open`);
              if (browserName === 'chrome' && viewport.name === '1440' && i === 0) await page.screenshot({ path: path.join(output, 'desktop-menu-1440.png') });
              await page.keyboard.press('Escape');
            }
          }
          if (route === '/docs/' && viewport.width < 1024) {
            await page.locator('.docs-mobile-toggle').click();
            if (!await page.locator('.docs-sidebar').isVisible()) failures.push(`${browserName} ${viewport.name}: docs contents did not open`);
          }
          if (browserName === 'chrome' && viewport.name === '1440') {
            const name = route === '/' ? 'home' : route.split('/').filter(Boolean).join('-');
            await page.screenshot({ path: path.join(output, `${name}-1440.png`), fullPage: true });
          }
          if (browserName === 'chrome' && viewport.name === '390') {
            const name = route === '/' ? 'home' : route.split('/').filter(Boolean).join('-');
            await page.screenshot({ path: path.join(output, `${name}-390.png`), fullPage: true });
          }
        } catch (error) { failures.push(`${browserName} ${viewport.name} ${route}: ${error.message}`); }
        await page.close();
      }
      await context.close();
    }
    await browser.close();
  }
  const result = { testedPages: routes.length, viewports: viewports.map(x => x.name), browsers: ['Chrome', 'Edge'], failures, consoleErrors };
  fs.writeFileSync(path.join(output, 'browser-qa.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (failures.length || consoleErrors.length) process.exit(1);
})().catch(error => { console.error(error); process.exit(1); });
