#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from lxml import etree
from lxml import html as lhtml

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://pqc.odreai.com'
LANGS = ('en', 'ko', 'ja', 'de', 'es')
GENERATED_LANGS = LANGS[1:]
PAGES = {
    'home': Path('index.html'),
    'product': Path('product/index.html'),
    'docs': Path('docs/index.html'),
    'pricing': Path('pricing/index.html'),
    'trust': Path('trust/index.html'),
    'security': Path('security/index.html'),
    'license': Path('license/index.html'),
    'terms': Path('terms/index.html'),
    'privacy': Path('privacy/index.html'),
    'refund': Path('refund/index.html'),
    'contact': Path('contact/index.html'),
    'releases': Path('releases/index.html'),
}
LEGAL = {'terms', 'privacy', 'refund'}
MARKER_RE = re.compile(r'\n?<!-- static-locale-alternates:start -->[\s\S]*?<!-- static-locale-alternates:end -->\n?')
SITE_JS_RE = re.compile(r'(/assets/js/site\.js)\?[^"\']+')


def route_for(page: str, lang: str) -> str:
    base = '/' if page == 'home' else f'/{page}/'
    return base if lang == 'en' else f'/{lang}{base}'


def alternates(page: str) -> str:
    links = [f'<link rel="alternate" hreflang="{lang}" href="{SITE}{route_for(page, lang)}">' for lang in LANGS]
    links.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}{route_for(page, "en")}">')
    return '<!-- static-locale-alternates:start -->\n' + '\n'.join(links) + '\n<!-- static-locale-alternates:end -->'


def add_alternates(source: str, page: str) -> str:
    source = MARKER_RE.sub('\n', source)
    return source.replace('</head>', alternates(page) + '\n</head>', 1)


def export_i18n() -> dict:
    proc = subprocess.run(['node', str(ROOT / 'tools/export-static-i18n.mjs')], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8')
    return json.loads(proc.stdout)


def set_meta(doc, selector: str, attribute: str, value: str) -> None:
    match = re.fullmatch(r'meta\[(name|property)="([^"]+)"\]', selector)
    if not match: raise ValueError(f'Unsupported selector: {selector}')
    nodes = doc.xpath(f'//meta[@{match.group(1)}="{match.group(2)}"]')
    if nodes:
        nodes[0].set(attribute, value)


def replace_inner(node, fragment: str) -> None:
    node.text = None
    for child in list(node): node.remove(child)
    fragments = lhtml.fragments_fromstring(fragment)
    previous = None
    for item in fragments:
        if isinstance(item, str):
            if previous is None: node.text = (node.text or '') + item
            else: previous.tail = (previous.tail or '') + item
        else:
            node.append(item)
            previous = item


def prefix_internal_links(doc, lang: str) -> None:
    routes = {route_for(page, 'en'): route_for(page, lang) for page in PAGES}
    for node in doc.xpath('//*[@href]'):
        href = node.get('href')
        if not href or href.startswith(('#', 'mailto:', 'tel:', 'javascript:')) or href.startswith(('http://', 'https://', '//')):
            continue
        parts = urlsplit(href)
        target = routes.get(parts.path)
        if target:
            node.set('href', urlunsplit(('', '', target, parts.query, parts.fragment)))


def materialize_regular(doc, page: str, lang: str, data: dict) -> tuple[str, str]:
    translations = data['pages'][page][lang]
    common = data['common'][lang]
    for node in doc.xpath('//*[@data-i18n]'):
        key = node.get('data-i18n')
        if key in translations:
            node.text = str(translations[key])
            for child in list(node): node.remove(child)
    for node in doc.xpath('//*[@data-i18n-html]'):
        key = node.get('data-i18n-html')
        if key in translations: replace_inner(node, str(translations[key]))
    for node in doc.xpath('//*[@data-common]'):
        key = node.get('data-common')
        if key in common:
            node.text = str(common[key])
            for child in list(node): node.remove(child)
    h1 = doc.xpath('//main//h1')[0] if doc.xpath('//main//h1') else None
    title = translations.get('seoTitle') or ((h1.text_content().strip() + ' | ODRE PQC') if h1 is not None else 'ODRE PQC')
    lead = doc.xpath('//main//*[contains(concat(" ", normalize-space(@class), " "), " page-lead ") or contains(concat(" ", normalize-space(@class), " "), " hero-copy ")]')
    description = translations.get('seoDescription') or (lead[0].text_content().strip() if lead else '')
    return title, description


def materialize_legal(doc, page: str, lang: str, data: dict) -> tuple[str, str]:
    translated = data['legal']['pages'][page][lang]
    labels = data['legal']['labels'][lang]
    title_nodes = doc.xpath('//*[@data-role="title"]')
    intro_nodes = doc.xpath('//*[@data-role="intro"]')
    content_nodes = doc.xpath('//*[@data-role="content"]')
    if title_nodes: title_nodes[0].text = translated['title']
    if intro_nodes: intro_nodes[0].text = translated['intro']
    if content_nodes: replace_inner(content_nodes[0], translated['body'])
    updated = doc.xpath('//*[@data-role="updated"]')
    if updated: updated[0].text = data['legal']['termsUpdated'][lang] if page == 'terms' else labels['updated']
    notice = doc.xpath('//*[@data-role="notice"]')
    if notice: notice[0].text = data['legal']['notices'][lang][page]
    contact_title = doc.xpath('//*[@data-role="contact-title"]')
    if contact_title: contact_title[0].text = labels['contact']
    return translated['title'] + ' | ODRE PQC', translated['intro']


def update_jsonld(doc, lang: str, route: str, title: str, description: str) -> None:
    for node in doc.xpath('//script[@type="application/ld+json"]'):
        try: value = json.loads(node.text or '')
        except json.JSONDecodeError: continue
        value['url'] = SITE + route
        value['inLanguage'] = lang
        value['name'] = value.get('name') or title
        value['description'] = description
        node.text = json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def build() -> None:
    data = export_i18n()
    generated = []
    for page, rel in PAGES.items():
        source_path = ROOT / rel
        source = MARKER_RE.sub('\n', source_path.read_text(encoding='utf-8'))
        source = SITE_JS_RE.sub(r'\1?v=multilingual-static-2-20260922', source)
        source_path.write_text(add_alternates(source, page), encoding='utf-8', newline='\n')
        for lang in GENERATED_LANGS:
            doc = lhtml.document_fromstring(source)
            doc.set('lang', lang)
            body = doc.xpath('//body')[0]
            body.set('data-document-language', lang)
            body.set('data-static-locale', lang)
            title, description = materialize_legal(doc, page, lang, data) if page in LEGAL else materialize_regular(doc, page, lang, data)
            title_nodes = doc.xpath('//title')
            if title_nodes: title_nodes[0].text = title
            set_meta(doc, 'meta[name="description"]', 'content', description)
            set_meta(doc, 'meta[property="og:title"]', 'content', title)
            set_meta(doc, 'meta[property="og:description"]', 'content', description)
            route = route_for(page, lang)
            canonical = doc.xpath('//link[@rel="canonical"]')
            if canonical: canonical[0].set('href', SITE + route)
            set_meta(doc, 'meta[property="og:url"]', 'content', SITE + route)
            prefix_internal_links(doc, lang)
            update_jsonld(doc, lang, route, title, description)
            rendered = etree.tostring(doc, method='html', encoding='unicode', doctype='<!doctype html>')
            rendered = rendered.replace('</head>', alternates(page) + '\n</head>', 1)
            out = ROOT / lang / rel
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(rendered + ('\n' if not rendered.endswith('\n') else ''), encoding='utf-8', newline='\n')
            generated.append(route)

    sitemap_urls = [route_for(page, 'en') for page in PAGES]
    sitemap_urls += [route_for(page, lang) for lang in GENERATED_LANGS for page in PAGES]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap.extend(f'  <url><loc>{html.escape(SITE + route)}</loc></url>' for route in sitemap_urls)
    sitemap.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8', newline='\n')
    print(json.dumps({'pages': len(PAGES), 'generated': len(generated), 'sitemap_urls': len(sitemap_urls)}, indent=2))


if __name__ == '__main__':
    try: build()
    except Exception as error:
        print(f'STATIC_LOCALE_GENERATION_FAILED: {error}', file=sys.stderr)
        raise
