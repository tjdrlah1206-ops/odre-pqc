import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.name === '.git' || entry.name === 'work' ? [] : entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)); }
for (const file of walk(root).filter(file => file.endsWith('.html'))) {
  if (file === path.join(root, 'payment', 'register', 'index.html')) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('rel="icon"')) html = html.replace('</head>', '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"></head>');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
  const title = html.match(/<title>([^<]+)<\/title>/);
  const description = html.match(/<meta name="description" content="([^"]+)"/);
  if (canonical && title && description && !html.includes('property="og:title"')) {
    const social = `<meta property="og:title" content="${title[1]}"><meta property="og:description" content="${description[1]}"><meta property="og:url" content="${canonical[1]}">`;
    html = html.replace('</head>', social + '</head>');
  }
  if (canonical && !html.includes('hreflang=')) {
    const base = canonical[1];
    const join = base.includes('?') ? '&' : '?';
    const alternates = ['en','ko','ja','de','es'].map(lang => `<link rel="alternate" hreflang="${lang}" href="${base}${join}lang=${lang}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${base}">`;
    html = html.replace(canonical[0], canonical[0] + '>' + alternates).replace('>>', '>');
  }
  fs.writeFileSync(file, html, 'utf8');
}
