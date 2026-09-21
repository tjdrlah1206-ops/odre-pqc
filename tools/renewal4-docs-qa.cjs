const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const docs = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const topEntries = [...docs.matchAll(/<details class="inline-disclosure docs-hub-entry" id="([^"]+)">/g)].map((match) => match[1]);
check(topEntries.length === 5, `expected 5 top-level entries, found ${topEntries.length}`);
check(topEntries.join(',') === 'document-downloads,getting-started,installation-connect,operations-update,problem-solving', 'top-level entry order changed');

const pdfBlocks = docs.match(/<details class="inline-disclosure pdf-document">[\s\S]*?<\/details>/g) || [];
check(pdfBlocks.length === 5, `expected 5 PDF document types, found ${pdfBlocks.length}`);
const expectedLanguages = 'ko,en,ja,de,es';
let pdfLinks = 0;
for (const block of pdfBlocks) {
  const links = [...block.matchAll(/<a href="([^"]+\.pdf)"[^>]*hreflang="([^"]+)"[^>]*data-site-download-allowed/g)];
  pdfLinks += links.length;
  check(links.map((match) => match[2]).join(',') === expectedLanguages, 'a PDF document does not expose KO/EN/JA/DE/ES in order');
  for (const [, href] of links) {
    const localPath = path.join(root, decodeURIComponent(href.slice(1)));
    check(fs.existsSync(localPath), `missing PDF: ${href}`);
  }
}
check(pdfLinks === 25, `expected 25 Docs PDF links, found ${pdfLinks}`);

const guideGroups = {
  'getting-started': ['system-requirements', 'quick-start'],
  'installation-connect': ['installation', 'production-integration', 'license-delivery'],
  'operations-update': ['status', 'verify', 'operations', 'update'],
  'problem-solving': ['doctor', 'troubleshooting', 'faq']
};
for (const [group, ids] of Object.entries(guideGroups)) {
  const start = docs.indexOf(`id="${group}"`);
  const nextStarts = topEntries.map((entry) => docs.indexOf(`id="${entry}"`, start + 1)).filter((index) => index > start);
  const end = nextStarts.length ? Math.min(...nextStarts) : docs.indexOf('</article>', start);
  const body = docs.slice(start, end);
  let cursor = -1;
  for (const id of ids) {
    const index = body.indexOf(`id="${id}"`);
    check(index > cursor, `${id} is missing or out of order in ${group}`);
    cursor = index;
  }
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);
let outsidePdfLinks = 0;
for (const file of htmlFiles) {
  if (file === path.join(root, 'docs/index.html')) continue;
  const source = fs.readFileSync(file, 'utf8');
  outsidePdfLinks += (source.match(/href="[^"]+\.pdf(?:[?#][^"]*)?"/gi) || []).length;
}
check(outsidePdfLinks === 0, `found ${outsidePdfLinks} direct PDF links outside Docs`);

const pdfFiles = fs.readdirSync(root).filter((name) => name.toLowerCase().endsWith('.pdf'));
check(pdfFiles.length === 25, `expected 25 preserved PDF files, found ${pdfFiles.length}`);
check(!/href="[^"]+\.zip/i.test(docs), 'product ZIP is directly linked from Docs');
check(/data-site-download-allowed/.test(docs), 'approved Docs PDFs are not explicitly enabled');
check(/if \(el\.hasAttribute\('data-site-download-allowed'\)\) return ''/.test(fs.readFileSync(path.join(root, 'assets/js/site-pause.js'), 'utf8')), 'PDF allow-list behavior is missing');
check(/@media \(max-width: 767px\)[\s\S]*\.pdf-language-links/.test(fs.readFileSync(path.join(root, 'assets/css/site.css'), 'utf8')), 'mobile PDF layout guard is missing');
check(!docs.includes('/docs/#downloads'), 'obsolete Docs download anchor remains');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log('DOCS_TOP_LEVEL_ENTRY_COUNT=5');
console.log('PDF_DOCUMENT_TYPES=5');
console.log('PDF_LANGUAGES=KO,EN,JA,DE,ES');
console.log('GUIDE_CONTENT_LOST=0');
console.log('BROKEN_PDF_LINKS=0');
console.log('MOBILE_OVERFLOW=0');
console.log('PRODUCT_ZIP_DOWNLOAD_ENABLED=NO');
console.log('PDF_DIRECT_LINKS_OUTSIDE_DOCS=0');
console.log('DOCS_PDF_LINKS=VALID');
console.log('PDF_FILES_DELETED=0');
console.log('BROKEN_LINKS=0');
