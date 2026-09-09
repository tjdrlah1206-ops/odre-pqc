(function () {
  'use strict';

  var supported = ['en', 'ko', 'ja', 'de', 'es'];
  var languageNames = { en: 'English', ko: '한국어', ja: '日本語', de: 'Deutsch', es: 'Español' };
  var common = {
    en: {
      skip: 'Skip to content', homeLabel: 'ODRE PQC home', primaryNav: 'Primary navigation', menuLabel: 'Menu', mobileNav: 'Mobile navigation', product: 'Product', security: 'Security', docs: 'Documentation', pricing: 'Pricing', license: 'License', trust: 'Trust Center', company: 'Company', download: 'Download', language: 'Language', overview: 'Overview', how: 'How it works', deployment: 'Deployment', requirements: 'System requirements', architecture: 'Security architecture', cryptography: 'Cryptography', failclosed: 'Fail-closed protection', verification: 'Release & verification', quickstart: 'Quick start', installation: 'Installation', operations: 'Operations', activation: 'License delivery', licenseOptions: 'License options', licenseOptionsDesc: 'Plans, Units, and delivery', activateLicense: 'Activate License', activateLicenseDesc: 'Link a license to an installed server', faq: 'FAQ', releases: 'Release notes', integrity: 'Release integrity', advisories: 'Security advisories', disclosure: 'Vulnerability reporting', lifecycle: 'Support lifecycle', data: 'Data handling', about: 'ODRE AI',  contact: 'Contact', resources: 'Resources', legal: 'Legal', terms: 'Terms of Service', privacy: 'Privacy Policy', refund: 'Refund Policy', commercial: 'Commercial license terms', footerText: 'Application-embedded post-quantum protection for supported FastAPI environments.', korea: 'Korea', productDesc: 'Integration, deployment, and supported environments', securityDesc: 'Architecture, controls, and defined boundaries', docsDesc: 'Installation and operational guidance', trustDesc: 'Integrity, maintenance, and reporting', companyDesc: 'ODRE AI and commercial contact routes'
    },
    ko: {
      skip: '본문으로 건너뛰기', homeLabel: 'ODRE PQC 홈', primaryNav: '주요 메뉴', menuLabel: '메뉴', mobileNav: '모바일 메뉴', product: '제품', security: '보안', docs: '문서', pricing: '가격', license: '라이선스', trust: '신뢰 센터', company: '회사', download: '다운로드', language: '언어', overview: '개요', how: '작동 방식', deployment: '배포', requirements: '시스템 요구사항', architecture: '보안 아키텍처', cryptography: '암호 기술', failclosed: 'Fail-closed 보호', verification: '릴리스 및 검증', quickstart: '빠른 시작', installation: '설치', operations: '운영', activation: '라이선스 전달', licenseOptions: '라이선스 옵션', licenseOptionsDesc: '요금제, Unit, 전달 안내', activateLicense: '라이선스 활성화', activateLicenseDesc: '구매 라이선스를 설치 서버에 연결', faq: '자주 묻는 질문', releases: '릴리스 노트', integrity: '릴리스 무결성', advisories: '보안 공지', disclosure: '취약점 신고', lifecycle: '지원 수명주기', data: '데이터 처리', about: 'ODRE AI',  contact: '연락처', resources: '자료', legal: '법적 고지', terms: '서비스 이용약관', privacy: '개인정보 처리방침', refund: '환불 정책', commercial: '상용 라이선스 약관', footerText: '지원되는 FastAPI 환경을 위한 애플리케이션 내장형 포스트양자 보호.', korea: '대한민국', productDesc: '통합, 배포, 지원 환경', securityDesc: '아키텍처, 보호 통제, 명확한 범위', docsDesc: '설치와 운영 안내', trustDesc: '무결성, 유지보수, 신고', companyDesc: 'ODRE AI와 상업 문의 채널'
    },
    ja: {
      skip: '本文へ移動', homeLabel: 'ODRE PQC ホーム', primaryNav: 'メインナビゲーション', menuLabel: 'メニュー', mobileNav: 'モバイルナビゲーション', product: '製品', security: 'セキュリティ', docs: 'ドキュメント', pricing: '価格', license: 'ライセンス', trust: 'トラストセンター', company: '会社', download: 'ダウンロード', language: '言語', overview: '概要', how: '仕組み', deployment: '導入', requirements: 'システム要件', architecture: 'セキュリティ構成', cryptography: '暗号技術', failclosed: 'Fail-closed保護', verification: 'リリースと検証', quickstart: 'クイックスタート', installation: 'インストール', operations: '運用', activation: 'ライセンス送付', licenseOptions: 'ライセンスオプション', licenseOptionsDesc: 'プラン、Unit、送付案内', activateLicense: 'ライセンスを有効化', activateLicenseDesc: '購入済みライセンスをサーバーに接続', faq: 'FAQ', releases: 'リリースノート', integrity: 'リリース整合性', advisories: 'セキュリティ勧告', disclosure: '脆弱性報告', lifecycle: 'サポートライフサイクル', data: 'データ処理', about: 'ODRE AI',  contact: 'お問い合わせ', resources: 'リソース', legal: '法務', terms: '利用規約', privacy: 'プライバシーポリシー', refund: '返金ポリシー', commercial: '商用ライセンス条件', footerText: '対応FastAPI環境向けのアプリケーション組み込み型ポスト量子保護。', korea: '韓国', productDesc: '統合、導入、対応環境', securityDesc: 'アーキテクチャ、制御、定義範囲', docsDesc: 'インストールと運用ガイド', trustDesc: '整合性、保守、報告', companyDesc: 'ODRE AIと商用窓口'
    },
    de: {
      skip: 'Zum Inhalt springen', homeLabel: 'ODRE PQC Startseite', primaryNav: 'Hauptnavigation', menuLabel: 'Menü', mobileNav: 'Mobile Navigation', product: 'Produkt', security: 'Sicherheit', docs: 'Dokumentation', pricing: 'Preise', license: 'Lizenz', trust: 'Trust Center', company: 'Unternehmen', download: 'Download', language: 'Sprache', overview: 'Überblick', how: 'Funktionsweise', deployment: 'Bereitstellung', requirements: 'Systemanforderungen', architecture: 'Sicherheitsarchitektur', cryptography: 'Kryptografie', failclosed: 'Fail-closed-Schutz', verification: 'Release & Verifikation', quickstart: 'Schnellstart', installation: 'Installation', operations: 'Betrieb', activation: 'Lizenzzustellung', licenseOptions: 'Lizenzoptionen', licenseOptionsDesc: 'Tarife, Units und Zustellung', activateLicense: 'Lizenz aktivieren', activateLicenseDesc: 'Lizenz mit dem installierten Server verbinden', faq: 'FAQ', releases: 'Versionshinweise', integrity: 'Release-Integrität', advisories: 'Sicherheitshinweise', disclosure: 'Schwachstelle melden', lifecycle: 'Support-Lebenszyklus', data: 'Datenverarbeitung', about: 'ODRE AI',  contact: 'Kontakt', resources: 'Ressourcen', legal: 'Rechtliches', terms: 'Nutzungsbedingungen', privacy: 'Datenschutz', refund: 'Rückerstattung', commercial: 'Kommerzielle Lizenzbedingungen', footerText: 'Anwendungsintegrierter Post-Quanten-Schutz für unterstützte FastAPI-Umgebungen.', korea: 'Korea', productDesc: 'Integration, Bereitstellung und unterstützte Umgebungen', securityDesc: 'Architektur, Kontrollen und definierte Grenzen', docsDesc: 'Installation und Betriebsanleitung', trustDesc: 'Integrität, Wartung und Meldung', companyDesc: 'ODRE AI und kommerzielle Kontakte'
    },
    es: {
      skip: 'Ir al contenido', homeLabel: 'Inicio de ODRE PQC', primaryNav: 'Navegación principal', menuLabel: 'Menú', mobileNav: 'Navegación móvil', product: 'Producto', security: 'Seguridad', docs: 'Documentación', pricing: 'Precios', license: 'Licencia', trust: 'Centro de confianza', company: 'Empresa', download: 'Descargar', language: 'Idioma', overview: 'Resumen', how: 'Cómo funciona', deployment: 'Despliegue', requirements: 'Requisitos del sistema', architecture: 'Arquitectura de seguridad', cryptography: 'Criptografía', failclosed: 'Protección fail-closed', verification: 'Versión y verificación', quickstart: 'Inicio rápido', installation: 'Instalación', operations: 'Operaciones', activation: 'Entrega de licencia', licenseOptions: 'Opciones de licencia', licenseOptionsDesc: 'Planes, Units y entrega', activateLicense: 'Activar licencia', activateLicenseDesc: 'Vincular la licencia al servidor instalado', faq: 'Preguntas frecuentes', releases: 'Notas de versión', integrity: 'Integridad de la versión', advisories: 'Avisos de seguridad', disclosure: 'Informar vulnerabilidad', lifecycle: 'Ciclo de soporte', data: 'Tratamiento de datos', about: 'ODRE AI',  contact: 'Contacto', resources: 'Recursos', legal: 'Legal', terms: 'Términos de servicio', privacy: 'Privacidad', refund: 'Reembolsos', commercial: 'Términos de licencia comercial', footerText: 'Protección poscuántica integrada en la aplicación para entornos FastAPI compatibles.', korea: 'Corea', productDesc: 'Integración, despliegue y entornos compatibles', securityDesc: 'Arquitectura, controles y límites definidos', docsDesc: 'Instalación y guía operativa', trustDesc: 'Integridad, mantenimiento e informes', companyDesc: 'ODRE AI y canales comerciales'
    }
  };

  function t(key) { return (common[current] && common[current][key]) || common.en[key] || key; }
  function storedLanguage() { try { return localStorage.getItem('odre-pqc-lang'); } catch (error) { return null; } }
  function initialLanguage() {
    var query = new URLSearchParams(location.search).get('lang');
    if (supported.indexOf(query) >= 0) return query;
    var stored = storedLanguage();
    if (supported.indexOf(stored) >= 0) return stored;
    var browser = String(navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported.indexOf(browser) >= 0 ? browser : 'en';
  }
  var current = initialLanguage();
  // A legacy saved language may have been selected automatically. Never label it
  // as a manual choice without provenance from the actual language selector.
  function initialLanguageState() {
    var query = new URLSearchParams(location.search).get('lang');
    if (supported.indexOf(query) >= 0) return { source: 'unknown', selected: null };
    var browser = String(navigator.language || 'en').slice(0, 2).toLowerCase();
    var stored = storedLanguage();
    if (supported.indexOf(stored) >= 0) {
      try {
        var saved = JSON.parse(localStorage.getItem('odre-pqc-language-provenance'));
        if (saved && saved.language === stored && ['manual', 'browser', 'fallback', 'unknown'].indexOf(saved.source) >= 0) {
          if ((saved.source === 'browser' && stored !== browser) ||
              (saved.source === 'fallback' && (supported.indexOf(browser) >= 0 || stored !== 'en'))) {
            return { source: 'unknown', selected: null };
          }
          return { source: saved.source, selected: saved.source === 'manual' ? stored : null };
        }
      } catch (error) {}
      return { source: 'unknown', selected: null };
    }
    return { source: supported.indexOf(browser) >= 0 ? 'browser' : 'fallback', selected: null };
  }
  var languageState = initialLanguageState();
  function analyticsLanguage() {
    return {
      selected_language: languageState.selected,
      rendered_language: document.documentElement.lang,
      language_source: languageState.source,
      translated_view: document.documentElement.lang !== 'en',
      fallback_used: languageState.source === 'fallback' && document.documentElement.lang === 'en'
    };
  }
  var englishTitle = document.title;
  var englishDescriptionNode = document.querySelector('meta[name="description"]');
  var englishDescription = englishDescriptionNode ? englishDescriptionNode.getAttribute('content') : '';

  var groups = [
    { key: 'product', href: '/product/', items: [['overview','/product/','productDesc'],['how','/product/#how-it-works','how'],['deployment','/product/#deployment','deployment'],['requirements','/product/#system-requirements','requirements']] },
    { key: 'security', href: '/security/', items: [['architecture','/security/','securityDesc'],['cryptography','/security/#cryptography','cryptography'],['failclosed','/security/#fail-closed','failclosed'],['verification','/security/#release-verification','verification']] },
    { key: 'docs', href: '/docs/', items: [['quickstart','/docs/#quick-start','docsDesc'],['installation','/docs/#installation','installation'],['operations','/docs/#operations','operations'],['faq','/docs/#faq','faq'],['releases','/releases/','releases']] },
    { key: 'license', href: '/license/', items: [['licenseOptions','/license/','licenseOptionsDesc'],['activateLicense','/payment/register/?flow=activate','activateLicenseDesc']] },
    { key: 'trust', href: '/trust/', items: [['integrity','/trust/#release-integrity','trustDesc'],['advisories','/trust/#security-advisories','advisories'],['disclosure','/trust/#vulnerability-reporting','disclosure'],['lifecycle','/trust/#support-lifecycle','lifecycle'],['data','/trust/#data-handling','data']] },
    { key: 'company', href: '/company/', items: [['about','/company/','companyDesc'],['contact','/contact/','contact']] }
  ];

  function desktopGroup(group, index) {
    var id = 'desktop-menu-' + index;
    var links = group.items.map(function (item) {
      return '<a href="' + item[1] + '"><strong data-common="' + item[0] + '">' + t(item[0]) + '</strong><span data-common="' + item[2] + '">' + t(item[2]) + '</span></a>';
    }).join('');
    return '<div class="nav-group"><button class="nav-trigger" type="button" aria-expanded="false" aria-controls="' + id + '" data-common="' + group.key + '">' + t(group.key) + '</button><div class="nav-panel" id="' + id + '">' + links + '</div></div>';
  }

  function mobileGroup(group, index) {
    var id = 'mobile-menu-' + index;
    var links = group.items.map(function (item) { return '<a href="' + item[1] + '" data-common="' + item[0] + '">' + t(item[0]) + '</a>'; }).join('');
    return '<div class="mobile-group"><button class="mobile-group-head" type="button" aria-expanded="false" aria-controls="' + id + '" data-common="' + group.key + '">' + t(group.key) + '</button><div class="mobile-submenu" id="' + id + '" hidden>' + links + '</div></div>';
  }

  function languageButtons(mobile) {
    return supported.map(function (code) {
      return '<button type="button" role="menuitemradio" aria-checked="' + String(code === current) + '" data-language-choice="' + code + '">' + languageNames[code] + '</button>';
    }).join('');
  }

  function headerMarkup() {
    return '<a class="skip-link" href="#main" data-common="skip">' + t('skip') + '</a>' +
      '<header class="site-header" id="site-header"><div class="header-inner">' +
      '<a class="brand" href="/" data-brand-home aria-label="' + t('homeLabel') + '"><span class="brand-mark" aria-hidden="true"></span><span>ODRE PQC</span></a>' +
      '<nav class="desktop-nav" data-primary-nav aria-label="' + t('primaryNav') + '">' + groups.slice(0, 3).map(desktopGroup).join('') + '<a class="nav-direct" href="/pricing/" data-common="pricing">' + t('pricing') + '</a>' + groups.slice(3).map(function(group,index){ return desktopGroup(group,index+3); }).join('') + '</nav>' +
      '<div class="header-actions"><a class="header-download" href="/docs/#downloads" data-common="download">' + t('download') + '</a>' +
      '<div class="language-wrap"><button class="language-button" id="language-button" type="button" aria-expanded="false" aria-controls="language-menu" aria-label="' + t('language') + '">' + current + '</button><div class="language-menu" id="language-menu" role="menu" hidden>' + languageButtons(false) + '</div></div>' +
      '<button class="mobile-toggle" id="mobile-toggle" type="button" aria-expanded="false" aria-controls="mobile-drawer" aria-label="' + t('menuLabel') + '"><span></span></button></div></div></header>' +
      '<div class="mobile-overlay" id="mobile-overlay"></div><aside class="mobile-drawer" id="mobile-drawer" aria-label="' + t('mobileNav') + '" aria-hidden="true"><nav class="mobile-nav">' +
      groups.slice(0, 3).map(mobileGroup).join('') + '<a class="mobile-direct" href="/pricing/" data-common="pricing">' + t('pricing') + '</a>' + groups.slice(3).map(function(group,index){ return mobileGroup(group,index+3); }).join('') +
      '<a class="button mobile-primary" href="/docs/#downloads" data-common="download">' + t('download') + '</a><div class="mobile-languages"><strong data-common="language">' + t('language') + '</strong><div class="mobile-language-grid" role="menu">' + languageButtons(true) + '</div></div></nav></aside>';
  }

  function footerColumn(title, links) {
    return '<div class="footer-column"><strong data-common="' + title + '">' + t(title) + '</strong>' + links.map(function (link) { return '<a href="' + link[1] + '" data-common="' + link[0] + '">' + t(link[0]) + '</a>'; }).join('') + '</div>';
  }

  function footerMarkup() {
    return '<footer class="site-footer"><div class="container footer-main"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span><span>ODRE PQC</span></a><p data-common="footerText">' + t('footerText') + '</p></div>' +
      footerColumn('product', [['overview','/product/'],['deployment','/product/#deployment'],['requirements','/product/#system-requirements'],['pricing','/pricing/']]) +
      footerColumn('security', [['architecture','/security/'],['verification','/security/#release-verification'],['advisories','/trust/#security-advisories'],['integrity','/trust/#release-integrity']]) +
      footerColumn('resources', [['docs','/docs/'],['quickstart','/docs/#quick-start'],['releases','/releases/'],['faq','/docs/#faq']]) +
      footerColumn('company', [['about','/company/'],['contact','/contact/'],['activateLicense','/payment/register/?flow=activate']]) +
      footerColumn('legal', [['terms','/terms/'],['privacy','/privacy/'],['refund','/refund/'],['commercial','/terms/']]) +
      '</div><div class="container footer-bottom"><span>© 2026 ODRE AI. All rights reserved.</span><span data-common="korea">' + t('korea') + '</span></div></footer>';
  }

  var headerHost = document.querySelector('[data-site-header]');
  var footerHost = document.querySelector('[data-site-footer]');
  if (headerHost) headerHost.innerHTML = headerMarkup();
  if (footerHost) footerHost.innerHTML = footerMarkup();

  var header = document.getElementById('site-header');
  var mobileToggle = document.getElementById('mobile-toggle');
  var mobileDrawer = document.getElementById('mobile-drawer');
  var mobileOverlay = document.getElementById('mobile-overlay');
  var lastFocus = null;

  function closeDesktop(except) {
    document.querySelectorAll('.nav-group.open').forEach(function (group) {
      if (group === except) return;
      group.classList.remove('open');
      group.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    });
  }
  document.querySelectorAll('.nav-trigger').forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('.nav-group');
      var opening = !group.classList.contains('open');
      closeDesktop(group);
      group.classList.toggle('open', opening);
      button.setAttribute('aria-expanded', String(opening));
      if (opening) group.querySelector('.nav-panel a').focus();
    });
    button.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); if (button.getAttribute('aria-expanded') !== 'true') button.click(); }
    });
  });
  document.addEventListener('click', function (event) { if (!event.target.closest('.nav-group')) closeDesktop(); });

  function focusable(root) { return Array.prototype.slice.call(root.querySelectorAll('a[href],button:not([disabled]),select,input,textarea,[tabindex]:not([tabindex="-1"])')).filter(function (el) { return !el.hidden && el.offsetParent !== null; }); }
  function openMobile() {
    lastFocus = document.activeElement;
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.classList.add('nav-open');
    var items = focusable(mobileDrawer); if (items.length) items[0].focus();
  }
  function closeMobile() {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (lastFocus) lastFocus.focus();
  }
  if (mobileToggle) mobileToggle.addEventListener('click', function () { mobileDrawer.classList.contains('open') ? closeMobile() : openMobile(); });
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-group-head').forEach(function (button) {
    button.addEventListener('click', function () {
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  var languageButton = document.getElementById('language-button');
  var languageMenu = document.getElementById('language-menu');
  if (languageButton) languageButton.addEventListener('click', function () {
    var open = languageButton.getAttribute('aria-expanded') === 'true';
    languageButton.setAttribute('aria-expanded', String(!open));
    languageMenu.hidden = open;
    if (!open) languageMenu.querySelector('button').focus();
  });

  // Only explicitly marked document links follow the selected page language.
  // Keep the original English href usable when JavaScript is unavailable.
  var publicDocuments = {
    en: { whitepaper: 'ODRE_PQC_v0.2.9_Public_Technical_Whitepaper_EN.pdf', overview: 'ODRE_PQC_v0.2.9_Product_Overview_Security_Architecture_EN.pdf' },
    ko: { whitepaper: 'ODRE_PQC_v0.2.9_공개_기술_백서_KO.pdf', overview: 'ODRE_PQC_v0.2.9_제품_개요_및_보안_아키텍처_KO.pdf' },
    ja: { whitepaper: 'ODRE_PQC_v0.2.9_公開技術白書_JA.pdf', overview: 'ODRE_PQC_v0.2.9_製品概要_セキュリティアーキテクチャ_JA.pdf' },
    de: { whitepaper: 'ODRE_PQC_v0.2.9_Oeffentliches_Technisches_Whitepaper_DE.pdf', overview: 'ODRE_PQC_v0.2.9_Produktuebersicht_Sicherheitsarchitektur_DE.pdf' },
    es: { whitepaper: 'ODRE_PQC_v0.2.9_Libro_Blanco_Tecnico_Publico_ES.pdf', overview: 'ODRE_PQC_v0.2.9_Descripcion_del_Producto_Arquitectura_de_Seguridad_ES.pdf' }
  };

  // Trial guides are reviewed, separate PDFs in all five site languages.
  Object.keys(publicDocuments).forEach(function (code) {
    publicDocuments[code].trial = 'ODRE_PQC_14_Day_Free_Trial_Guide_v1.3_RC2_' + code.toUpperCase() + '.pdf';
  });

  function applyDocumentLanguage(code) {
    var documents = publicDocuments[code] || publicDocuments.en;
    document.querySelectorAll('a[data-pqc-document]').forEach(function (link) {
      var filename = documents[link.getAttribute('data-pqc-document')];
      if (typeof filename !== 'string') return;
      link.setAttribute('href', '/' + filename);
      link.setAttribute('hreflang', code);
      link.setAttribute('type', 'application/pdf');
      if (link.getAttribute('data-pqc-document') === 'trial') link.setAttribute('download', filename);
    });
  }

  function applyLanguage(code, source) {
    if (supported.indexOf(code) < 0) code = 'en';
    if (source === 'manual') languageState = { source: 'manual', selected: code };
    current = code;
    document.documentElement.lang = code;
    try {
      localStorage.setItem('odre-pqc-lang', code);
      localStorage.setItem('odre-pqc-language-provenance', JSON.stringify({ language: code, source: languageState.source }));
    } catch (error) {}
    document.querySelectorAll('[data-common]').forEach(function (node) { node.textContent = t(node.getAttribute('data-common')); });
    if (window.ODRE_PAGE_I18N && window.ODRE_PAGE_I18N[code]) {
      var page = window.ODRE_PAGE_I18N[code];
      document.querySelectorAll('[data-i18n]').forEach(function (node) { var key = node.getAttribute('data-i18n'); if (page[key] !== undefined) node.textContent = page[key]; });
      document.querySelectorAll('[data-i18n-html]').forEach(function (node) { var key = node.getAttribute('data-i18n-html'); if (page[key] !== undefined) node.innerHTML = page[key]; });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) { var key = node.getAttribute('data-i18n-placeholder'); if (page[key] !== undefined) node.setAttribute('placeholder', page[key]); });
    }
    applyDocumentLanguage(code);
    document.querySelectorAll('[data-language-choice]').forEach(function (button) { button.setAttribute('aria-checked', String(button.getAttribute('data-language-choice') === code)); });
    if (languageButton) languageButton.textContent = code;
    document.querySelectorAll('[data-brand-home]').forEach(function (node) { node.setAttribute('aria-label', t('homeLabel')); });
    var primaryNav = document.querySelector('[data-primary-nav]'); if (primaryNav) primaryNav.setAttribute('aria-label', t('primaryNav'));
    if (mobileToggle) mobileToggle.setAttribute('aria-label', t('menuLabel'));
    if (mobileDrawer) mobileDrawer.setAttribute('aria-label', t('mobileNav'));
    if (languageButton) languageButton.setAttribute('aria-label', t('language'));
    var titleNode = document.querySelector('main h1');
    var leadNode = document.querySelector('main .page-lead, main .hero-copy');
    var pageCopy = window.ODRE_PAGE_I18N && window.ODRE_PAGE_I18N[code];
    if (pageCopy && pageCopy.seoTitle) document.title = pageCopy.seoTitle;
    else if (code !== 'en' && titleNode) document.title = titleNode.textContent.trim() + ' | ODRE PQC';
    else if (code === 'en') document.title = englishTitle;
    var description = pageCopy && pageCopy.seoDescription ? pageCopy.seoDescription : (code !== 'en' && leadNode ? leadNode.textContent.trim() : null);
    if (description) {
      var metaDescription = document.querySelector('meta[name="description"]'); if (metaDescription) metaDescription.setAttribute('content', description);
      var ogDescription = document.querySelector('meta[property="og:description"]'); if (ogDescription) ogDescription.setAttribute('content', description);
    } else if (code === 'en' && englishDescription) {
      var englishMetaDescription = document.querySelector('meta[name="description"]'); if (englishMetaDescription) englishMetaDescription.setAttribute('content', englishDescription);
      var englishOgDescription = document.querySelector('meta[property="og:description"]'); if (englishOgDescription) englishOgDescription.setAttribute('content', englishDescription);
    }
    var ogTitle = document.querySelector('meta[property="og:title"]'); if (ogTitle) ogTitle.setAttribute('content', document.title);
    var twitterTitle = document.querySelector('meta[name="twitter:title"]'); if (twitterTitle) twitterTitle.setAttribute('content', document.title);
    var twitterDescription = document.querySelector('meta[name="twitter:description"]'); if (twitterDescription) twitterDescription.setAttribute('content', description || englishDescription);
    document.dispatchEvent(new CustomEvent('odre:language', { detail: Object.assign({ language: code }, analyticsLanguage()) }));
  }
  document.addEventListener('click', function (event) {
    var choice = event.target.closest('[data-language-choice]');
    if (choice) { applyLanguage(choice.getAttribute('data-language-choice'), 'manual'); if (languageMenu) { languageMenu.hidden = true; languageButton.setAttribute('aria-expanded','false'); } }
    if (languageMenu && !event.target.closest('.language-wrap')) { languageMenu.hidden = true; languageButton.setAttribute('aria-expanded','false'); }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { var openDesktop = document.querySelector('.nav-group.open .nav-trigger'); closeDesktop(); if (openDesktop) openDesktop.focus(); if (mobileDrawer && mobileDrawer.classList.contains('open')) closeMobile(); if (languageMenu && !languageMenu.hidden) { languageMenu.hidden = true; languageButton.setAttribute('aria-expanded','false'); languageButton.focus(); } }
    if (event.key === 'Tab' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      var items = focusable(mobileDrawer); if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  document.querySelectorAll('.faq-question').forEach(function (button) {
    button.addEventListener('click', function () {
      var answer = document.getElementById(button.getAttribute('aria-controls'));
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      answer.hidden = open;
    });
  });
  var docsToggle = document.querySelector('.docs-mobile-toggle');
  var docsSidebar = document.querySelector('.docs-sidebar');
  if (docsToggle && docsSidebar) docsToggle.addEventListener('click', function () {
    var open = docsToggle.getAttribute('aria-expanded') === 'true';
    docsToggle.setAttribute('aria-expanded', String(!open)); docsSidebar.classList.toggle('open', !open);
  });
  document.querySelectorAll('.docs-sidebar a').forEach(function (link) { link.addEventListener('click', function () { if (window.innerWidth < 1024 && docsSidebar) { docsSidebar.classList.remove('open'); docsToggle.setAttribute('aria-expanded','false'); } }); });

  window.addEventListener('scroll', function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 12); }, { passive: true });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && mobileDrawer && mobileDrawer.classList.contains('open')) closeMobile(); });
  applyLanguage(current);
  window.ODRE_SITE = { language: function () { return current; }, setLanguage: function (code) { applyLanguage(code, 'manual'); }, analyticsLanguage: analyticsLanguage };
  // One asynchronous common inclusion covers all public pages. The tracker
  // itself has an explicit path/origin allowlist and cannot block navigation.
  if (!document.querySelector('script[data-odre-analytics]')) {
    var analytics = document.createElement('script');
    analytics.src = '/assets/js/analytics.js';
    analytics.async = true;
    analytics.referrerPolicy = 'no-referrer';
    analytics.setAttribute('data-odre-analytics', '');
    document.head.appendChild(analytics);
  }
}());
