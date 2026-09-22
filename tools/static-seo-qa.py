#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

from lxml import html as lhtml

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://pqc.odreai.com'
LANGS = ('en', 'ko', 'ja', 'de', 'es')
PAGES = ('home', 'product', 'docs', 'pricing', 'trust', 'security', 'license', 'terms', 'privacy', 'refund', 'contact', 'releases')


def route(page: str, lang: str) -> str:
    base = '/' if page == 'home' else f'/{page}/'
    return base if lang == 'en' else f'/{lang}{base}'


def file_for(page: str, lang: str) -> Path:
    base = Path('index.html') if page == 'home' else Path(page) / 'index.html'
    return ROOT / base if lang == 'en' else ROOT / lang / base


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def main() -> int:
    errors: list[str] = []
    expected_urls = {SITE + route(page, lang) for lang in LANGS for page in PAGES}
    english_h1 = {}
    docs = {}
    for page in PAGES:
        for lang in LANGS:
            path = file_for(page, lang)
            if not path.is_file():
                fail(f'MISSING_FILE {path.relative_to(ROOT)}', errors); continue
            source = path.read_text(encoding='utf-8')
            doc = lhtml.document_fromstring(source)
            docs[(page, lang)] = (source, doc)
            if doc.get('lang') != lang: fail(f'HTML_LANG {page} {lang} {doc.get("lang")}', errors)
            canonical = doc.xpath('//link[@rel="canonical"]/@href')
            expected = SITE + route(page, lang)
            if canonical != [expected]: fail(f'CANONICAL {page} {lang} {canonical}', errors)
            alternates = {(node.get('hreflang'), node.get('href')) for node in doc.xpath('//link[@rel="alternate"][@hreflang]')}
            wanted = {(code, SITE + route(page, code)) for code in LANGS} | {('x-default', SITE + route(page, 'en'))}
            if alternates != wanted: fail(f'HREFLANG {page} {lang}', errors)
            title = doc.xpath('string(//title)').strip()
            description = doc.xpath('string(//meta[@name="description"]/@content)').strip()
            h1 = doc.xpath('string(//main//h1)').strip()
            main_text = ' '.join(doc.xpath('//main')[0].text_content().split()) if doc.xpath('//main') else ''
            if not title: fail(f'TITLE {page} {lang}', errors)
            if not description: fail(f'DESCRIPTION {page} {lang}', errors)
            if not h1: fail(f'H1 {page} {lang}', errors)
            if len(main_text) < 200: fail(f'MAIN_STATIC {page} {lang}', errors)
            if lang == 'en': english_h1[page] = h1
            elif h1 == english_h1.get(page): fail(f'H1_NOT_LOCALIZED {page} {lang}', errors)
            robots = doc.xpath('string(//meta[@name="robots"]/@content)').lower()
            if 'noindex' in robots: fail(f'NOINDEX {page} {lang}', errors)
            for node in doc.xpath('//script[@type="application/ld+json"]'):
                try: data = json.loads(node.text or '')
                except json.JSONDecodeError as exc: fail(f'JSONLD_PARSE {page} {lang} {exc}', errors); continue
                if lang != 'en' and data.get('inLanguage') != lang: fail(f'JSONLD_LANGUAGE {page} {lang}', errors)
                offers = data.get('offers', [])
                if offers:
                    prices = {str(item.get('price')) for item in offers if isinstance(item, dict)}
                    if prices != {'399', '4300'}: fail(f'JSONLD_PRICE {page} {lang} {prices}', errors)
            for href in doc.xpath('//@href'):
                if not href.startswith('/') or href.startswith('//'): continue
                target = urlsplit(href).path
                if re.search(r'\.[A-Za-z0-9]{2,5}$', target): continue
                candidate = ROOT / target.lstrip('/')
                if target.endswith('/'): candidate /= 'index.html'
                if not candidate.exists(): fail(f'BROKEN_LINK {page} {lang} {href}', errors)

    for lang in LANGS:
        source, product = docs.get(('product', lang), ('', None))
        if product is None: continue
        product_text = product.xpath('//main')[0].text_content()
        if 'from odre_pqc import install' not in product_text or 'install(app)' not in product_text:
            fail(f'PRODUCT_CONTRACT {lang}', errors)
        provisional = re.findall(r'\b(?:1182\.7626|3\.2581|4\.1219|4\.8010)\b', product_text)
        if provisional: fail(f'PROVISIONAL_PERFORMANCE {lang} {provisional}', errors)

    sitemap = lhtml.etree.parse(str(ROOT / 'sitemap.xml'))
    found = {node.text for node in sitemap.xpath('//*[local-name()="loc"]')}
    if found != expected_urls: fail(f'SITEMAP_SET missing={expected_urls-found} extra={found-expected_urls}', errors)
    if any('?lang=' in url for url in found): fail('SITEMAP_QUERY_URL', errors)
    robots = (ROOT / 'robots.txt').read_text(encoding='utf-8')
    if 'Disallow: /ko' in robots or 'Disallow: /ja' in robots or 'Disallow: /de' in robots or 'Disallow: /es' in robots:
        fail('ROBOTS_LANGUAGE_BLOCK', errors)

    summary = {
        'clusters': len(PAGES), 'html_files': len(PAGES) * len(LANGS),
        'self_canonical': len(PAGES) * len(LANGS), 'hreflang_reciprocal': len(PAGES) * len(LANGS),
        'sitemap_urls': len(found), 'errors': len(errors)
    }
    print(json.dumps(summary, indent=2))
    for error in errors: print(error, file=sys.stderr)
    return 1 if errors else 0


if __name__ == '__main__': raise SystemExit(main())
