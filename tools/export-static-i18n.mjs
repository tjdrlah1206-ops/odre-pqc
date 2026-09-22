import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const pageSource = fs.readFileSync(new URL('assets/js/page-i18n.js', root), 'utf8');
const siteSource = fs.readFileSync(new URL('assets/js/site.js', root), 'utf8');
const legalSourceRaw = fs.readFileSync(new URL('legal.js', root), 'utf8');
const pageNames = ['home', 'product', 'docs', 'pricing', 'trust', 'security', 'license', 'contact', 'releases'];

const pages = {};
for (const page of pageNames) {
  const sandbox = { window: {}, document: { body: { dataset: { page } }, querySelectorAll: () => [] } };
  vm.createContext(sandbox);
  vm.runInContext(pageSource, sandbox, { filename: 'page-i18n.js' });
  pages[page] = sandbox.window.ODRE_PAGE_I18N;
}

const commonMatch = siteSource.match(/var common = (\{[\s\S]*?\r?\n  \});\r?\n\r?\n  var deviceMenuCopy=/);
if (!commonMatch) throw new Error('Unable to locate common language dictionary');
const common = vm.runInNewContext(`(${commonMatch[1]})`);
const deviceMatch = siteSource.match(/var deviceMenuCopy=(\{[^\n]+\});/);
const trialMatch = siteSource.match(/var trialMenuCopy = (\{[^\n]+\});/);
if (!deviceMatch || !trialMatch) throw new Error('Unable to locate menu language dictionaries');
const device = vm.runInNewContext(`(${deviceMatch[1]})`);
const trial = vm.runInNewContext(`(${trialMatch[1]})`);
for (const language of Object.keys(common)) Object.assign(common[language], device[language], { freeTrial: trial[language] });

let legalSource = legalSourceRaw
  .replace('const labels=', 'window.__legalPages=pages;\nconst labels=')
  .replace('const legalNotices=', 'window.__legalLabels=labels;\nconst legalNotices=')
  .replace('const analyticsPrivacy=', 'window.__legalNotices=legalNotices;\nconst analyticsPrivacy=')
  .replace('const termsUpdated=', 'window.__analyticsPrivacy=analyticsPrivacy;\nconst termsUpdated=')
  .replace('function apply(lang)', 'window.__termsUpdated=termsUpdated;\nfunction apply(lang)');
const legalSandbox = { window: {}, document: { body: { dataset: { policy: 'terms' } }, querySelector: () => null, getElementById: () => null, addEventListener: () => {}, createElement: () => ({}) }, location: { search: '' }, navigator: { language: 'en' }, localStorage: { getItem: () => null } };
vm.createContext(legalSandbox);
try { vm.runInContext(legalSource, legalSandbox, { filename: 'legal.js' }); } catch (error) {
  if (!legalSandbox.window.__termsUpdated) throw error;
}

process.stdout.write(JSON.stringify({
  pages,
  common,
  legal: {
    pages: legalSandbox.window.__legalPages,
    labels: legalSandbox.window.__legalLabels,
    notices: legalSandbox.window.__legalNotices,
    analyticsPrivacy: legalSandbox.window.__analyticsPrivacy,
    termsUpdated: legalSandbox.window.__termsUpdated
  }
}));
