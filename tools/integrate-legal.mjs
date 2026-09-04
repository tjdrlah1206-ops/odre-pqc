import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
for (const name of ['terms', 'privacy', 'refund']) {
  const file = path.join(root, name, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace('<link rel="stylesheet" href="/legal.css">', '<meta property="og:type" content="website"><meta property="og:site_name" content="ODRE PQC"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/legal.css">');
  html = html.replace(/<body data-policy="([^"]+)">/, '<body data-policy="$1" data-page="legal"><div data-site-header class="site-header-placeholder"></div>');
  html = html.replace(/<header class="top">.*?<\/header>/, '');
  html = html.replace('<main>', '<main id="main">');
  html = html.replace('<section class="hero">', '<section class="page-hero legal-hero">');
  html = html.replace(/<footer class="footer">.*?<\/footer>/, '<div data-site-footer></div>');
  html = html.replace('<script src="/legal.js"></script>', '<script src="/assets/js/site.js"></script><script src="/legal.js"></script>');
  fs.writeFileSync(file, html, 'utf8');
}
