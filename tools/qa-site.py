from __future__ import annotations
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
HTML = sorted(ROOT.rglob('*.html'))

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=set(); self.title=''; self._title=False; self.meta={}; self.canonical=None; self.header=False; self.footer=False; self.hreflang=set()
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag in ('a','link') and a.get('href'): self.links.append(('href',a['href']))
        if tag in ('script','img') and a.get('src'): self.links.append(('src',a['src']))
        if tag=='title': self._title=True
        if tag=='meta':
            key=a.get('name') or a.get('property');
            if key: self.meta[key]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href')
        if tag=='link' and a.get('rel')=='alternate' and a.get('hreflang'): self.hreflang.add(a.get('hreflang'))
        if 'data-site-header' in a: self.header=True
        if 'data-site-footer' in a: self.footer=True
    def handle_endtag(self, tag):
        if tag=='title': self._title=False
    def handle_data(self, data):
        if self._title: self.title += data

def target_for(url: str):
    parsed=urlparse(url)
    if parsed.scheme or url.startswith('//') or url.startswith('mailto:') or url.startswith('tel:') or url.startswith('javascript:'): return None
    path=unquote(parsed.path)
    if not path: return None
    target=(ROOT / path.lstrip('/')) if path.startswith('/') else None
    if target is None: return None
    if target.is_dir() or path.endswith('/'): target=target/'index.html'
    return target, parsed.fragment

pages={}
for file in HTML:
    parser=Page(); parser.feed(file.read_text(encoding='utf-8')); pages[file]=parser

broken=[]
for file,p in pages.items():
    for attr,url in p.links:
        resolved=target_for(url)
        if not resolved: continue
        target,fragment=resolved
        if not target.exists(): broken.append(f'{file.relative_to(ROOT)}: {url} -> missing {target.relative_to(ROOT)}')
        elif fragment and target.suffix=='.html':
            tp=pages.get(target)
            if tp is None: tp=Page(); tp.feed(target.read_text(encoding='utf-8'))
            if fragment not in tp.ids: broken.append(f'{file.relative_to(ROOT)}: {url} -> missing fragment #{fragment}')

metadata=[]; shared=[]
for file,p in pages.items():
    if not p.title.strip(): metadata.append(f'{file.relative_to(ROOT)} missing title')
    if not p.meta.get('description'): metadata.append(f'{file.relative_to(ROOT)} missing description')
    if not p.canonical: metadata.append(f'{file.relative_to(ROOT)} missing canonical')
    if 'noindex' not in p.meta.get('robots',''):
        for key in ['og:title','og:description','og:url','twitter:card']:
            if not p.meta.get(key): metadata.append(f'{file.relative_to(ROOT)} missing {key}')
        if p.hreflang != {'en','ko','ja','de','es','x-default'}: metadata.append(f'{file.relative_to(ROOT)} incomplete hreflang')
    if not p.header or not p.footer: shared.append(str(file.relative_to(ROOT)))

text='\n'.join(f.read_text(encoding='utf-8',errors='ignore') for f in ROOT.rglob('*') if f.is_file() and f.suffix.lower() not in {'.pdf','.zip','.png','.jpg','.jpeg','.webp'} and '.git' not in f.parts and 'tools' not in f.parts)
old_price=len(re.findall(r'(?:\$|USD\s*)1[,.]?200\b',text,re.I))
banned=[s for s in ['Hide the complexity','FULL DEVSEC AUDIT PASS','Trusted by security teams worldwide'] if s.lower() in text.lower()]
secrets=[]
for pattern in [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'\bsk_live_[A-Za-z0-9]+',r'\bsk_test_[A-Za-z0-9]+',r'PADDLE_API_KEY\s*=']:
    if re.search(pattern,text): secrets.append(pattern)

result={
  'html_pages':len(HTML),'broken_links':broken,'metadata_findings':metadata,'shared_layout_findings':shared,
  'old_price_findings':old_price,'banned_copy_findings':banned,'secret_findings':secrets
}
print(json.dumps(result,ensure_ascii=False,indent=2))
if broken or metadata or shared or old_price or banned or secrets: sys.exit(1)
