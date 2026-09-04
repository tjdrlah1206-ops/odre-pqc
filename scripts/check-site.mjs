import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  if (entry.name === '.git' || entry.name === 'node_modules') return [];
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const textFiles = files.filter((file) =>
  /\.(?:html|css|js|json|xml|txt)$/i.test(file)
  && !file.includes(`${path.sep}scripts${path.sep}`)
);
const failures = [];
const internalLinks = [];
const titles = new Map();
const descriptions = new Map();

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  const noindex = /<meta\s+name=["']robots["'][^>]*noindex/i.test(text);
  const title = text.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = text.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  if (!title) failures.push(`MISSING_TITLE ${rel}`);
  if (!description && path.basename(file) !== '404.html') failures.push(`MISSING_DESCRIPTION ${rel}`);
  if (!/<h1\b/i.test(text) && path.basename(file) !== '404.html') failures.push(`MISSING_H1 ${rel}`);
  if (!noindex && path.basename(file) !== '404.html') {
    if (!/rel=["']canonical["']/i.test(text)) failures.push(`MISSING_CANONICAL ${rel}`);
    if (!/property=["']og:title["']/i.test(text)) failures.push(`MISSING_OG_TITLE ${rel}`);
    if (!/name=["']twitter:card["']/i.test(text)) failures.push(`MISSING_TWITTER_CARD ${rel}`);
    if (!/hreflang=/i.test(text)) failures.push(`MISSING_HREFLANG ${rel}`);
  }
  if (title) {
    if (titles.has(title)) failures.push(`DUPLICATE_TITLE ${title}: ${titles.get(title)}, ${rel}`);
    titles.set(title, rel);
  }
  if (description && !noindex) {
    if (descriptions.has(description)) failures.push(`DUPLICATE_DESCRIPTION ${rel}`);
    descriptions.set(description, rel);
  }
  for (const match of text.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const value = match[1];
    if (value.startsWith('/') && !value.startsWith('//')) internalLinks.push({ file: rel, value });
  }
}

for (const { file, value } of internalLinks) {
  const clean = decodeURIComponent(value.split('#')[0].split('?')[0]);
  if (!clean) continue;
  let target = path.join(root, clean.replace(/^\/+/, ''));
  if (clean.endsWith('/')) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) failures.push(`BROKEN_LINK ${file} -> ${value}`);
  const fragment = value.includes('#') ? decodeURIComponent(value.split('#')[1]) : '';
  if (fragment && fs.existsSync(target)) {
    const targetText = fs.readFileSync(target, 'utf8');
    const escapedFragment = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`(?:id|name)=["']${escapedFragment}["']`, 'i').test(targetText)) {
      failures.push(`BROKEN_FRAGMENT ${file} -> ${value}`);
    }
  }
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  for (const match of text.matchAll(/href=["']#([^"']+)["']/gi)) {
    const fragment = decodeURIComponent(match[1]);
    const escapedFragment = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`(?:id|name)=["']${escapedFragment}["']`, 'i').test(text)) {
      failures.push(`BROKEN_FRAGMENT ${rel} -> #${fragment}`);
    }
  }
}

const siteJs = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
const i18nKeys = new Set(htmlFiles.flatMap((file) => [...fs.readFileSync(file, 'utf8').matchAll(/data-i18n=["']([^"']+)["']/g)].map((match) => match[1])));
for (const key of i18nKeys) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const count = (siteJs.match(new RegExp(`['"]${escaped}['"]\\s*:`, 'g')) || []).length;
  if (count !== 5) failures.push(`MISSING_TRANSLATION ${key}: ${count}/5`);
}

const corpus = textFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const banned = [
  ['OLD_PRICE', /(?:1,300|1300|1\.300)/gi],
  ['OLD_VERSION', /\bv0\.2\.[0-8]\b/gi],
  ['SANDBOX_REFERENCE', /sandbox/gi],
  ['SYNTHETIC_TEST_REFERENCE', /synthetic[ -]?test/gi],
  ['AI_MARKETING_COPY', /hide the complexity|cutting-edge|revolutionary|game-changing|future-proof/gi]
];
for (const [label, pattern] of banned) {
  const matches = corpus.match(pattern) || [];
  if (matches.length) failures.push(`${label} ${matches.length}`);
}
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /(?:api[_-]?key|client[_-]?secret|access[_-]?token|private[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/gi,
  /sk-[A-Za-z0-9]{20,}/g
];
let secretFindings = 0;
for (const pattern of secretPatterns) secretFindings += (corpus.match(pattern) || []).length;
if (secretFindings) failures.push(`SECRET_FINDINGS ${secretFindings}`);

const result = {
  htmlFiles: htmlFiles.length,
  internalLinks: internalLinks.length,
  brokenLinks: failures.filter((item) => item.startsWith('BROKEN_LINK')).length,
  brokenFragments: failures.filter((item) => item.startsWith('BROKEN_FRAGMENT')).length,
  missingTranslationKeys: failures.filter((item) => item.startsWith('MISSING_TRANSLATION')).length,
  secretFindings,
  failures
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = failures.length ? 1 : 0;
