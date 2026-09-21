(function () {
  'use strict';

  var supported = ['ko', 'en', 'ja', 'de', 'es'];
  var languageNames = { ko: '한국어', en: 'English', ja: '日本語', de: 'Deutsch', es: 'Español' };
  var files = {
    ko: {
      product_overview: '/ODRE_PQC_0.3.1_Product_Overview_Security_Architecture_KO.pdf',
      whitepaper: '/ODRE_PQC_0.3.1_Public_Technical_Whitepaper_KO.pdf',
      release_evidence: '/ODRE_PQC_0.3.1_Release_Evidence_KO.pdf',
      trial: '/ODRE_PQC_0.3.1_RC1_14_Day_Free_Trial_Guide_KO.pdf',
      installation: '/ODRE_PQC_Installation_License_Operations_0.3.1_RC1_KO.pdf'
    },
    en: {
      product_overview: '/ODRE_PQC_0.3.1_Product_Overview_Security_Architecture_EN.pdf',
      whitepaper: '/ODRE_PQC_0.3.1_Public_Technical_Whitepaper_EN.pdf',
      release_evidence: '/ODRE_PQC_0.3.1_Release_Evidence_EN.pdf',
      trial: '/ODRE_PQC_0.3.1_RC1_14_Day_Free_Trial_Guide_EN.pdf',
      installation: '/ODRE_PQC_Installation_License_Operations_0.3.1_RC1_EN.pdf'
    },
    ja: {
      product_overview: '/ODRE_PQC_0.3.1_Product_Overview_Security_Architecture_JA.pdf',
      whitepaper: '/ODRE_PQC_0.3.1_Public_Technical_Whitepaper_JA.pdf',
      release_evidence: '/ODRE_PQC_0.3.1_Release_Evidence_JA.pdf',
      trial: '/ODRE_PQC_0.3.1_RC1_14_Day_Free_Trial_Guide_JA.pdf',
      installation: '/ODRE_PQC_Installation_License_Operations_0.3.1_RC1_JA.pdf'
    },
    de: {
      product_overview: '/ODRE_PQC_0.3.1_Product_Overview_Security_Architecture_DE.pdf',
      whitepaper: '/ODRE_PQC_0.3.1_Public_Technical_Whitepaper_DE.pdf',
      release_evidence: '/ODRE_PQC_0.3.1_Release_Evidence_DE.pdf',
      trial: '/ODRE_PQC_0.3.1_RC1_14_Day_Free_Trial_Guide_DE.pdf',
      installation: '/ODRE_PQC_Installation_License_Operations_0.3.1_RC1_DE.pdf'
    },
    es: {
      product_overview: '/ODRE_PQC_0.3.1_Product_Overview_Security_Architecture_ES.pdf',
      whitepaper: '/ODRE_PQC_0.3.1_Public_Technical_Whitepaper_ES.pdf',
      release_evidence: '/ODRE_PQC_0.3.1_Release_Evidence_ES.pdf',
      trial: '/ODRE_PQC_0.3.1_RC1_14_Day_Free_Trial_Guide_ES.pdf',
      installation: '/ODRE_PQC_Installation_License_Operations_0.3.1_RC1_ES.pdf'
    }
  };
  var copy = {
    en: {
      button: 'View PDF', panel: 'English documents',
      product_overview: ['Product Overview', 'Product scope and core architecture.'],
      whitepaper: ['Public Technical Whitepaper', 'Security boundary and technical architecture.'],
      release_evidence: ['Release Evidence', 'Public release verification results.'],
      trial: ['14-Day Free Trial Guide', 'Installation, Trial start, and operation.'],
      installation: ['Installation & License Activation / Operations Guide', 'Installation, activation, and operating procedures.']
    },
    ko: {
      button: 'PDF 보기', panel: '한국어 문서',
      product_overview: ['제품 개요', 'ODRE PQC의 제품 범위와 핵심 구조를 설명합니다.'],
      whitepaper: ['공개 기술백서', '보안 경계와 기술 구조를 설명합니다.'],
      release_evidence: ['릴리스 검증자료', '공개 가능한 릴리스 검증 결과를 확인합니다.'],
      trial: ['14일 무료체험 가이드', '설치부터 Trial 시작·운영까지 안내합니다.'],
      installation: ['설치·라이선스 활성화·운영 가이드', '설치, 활성화, 운영 절차를 안내합니다.']
    },
    ja: {
      button: 'PDFを見る', panel: '日本語ドキュメント',
      product_overview: ['製品概要', 'ODRE PQCの製品範囲と中核構造を説明します。'],
      whitepaper: ['公開技術白書', 'セキュリティ境界と技術構成を説明します。'],
      release_evidence: ['リリース検証資料', '公開可能なリリース検証結果を確認します。'],
      trial: ['14日間無料トライアルガイド', 'インストールからTrial開始・運用までを案内します。'],
      installation: ['インストール・ライセンス有効化・運用ガイド', 'インストール、有効化、運用手順を案内します。']
    },
    de: {
      button: 'PDF ansehen', panel: 'Deutsche Dokumente',
      product_overview: ['Produktübersicht', 'Beschreibt Produktumfang und Kernarchitektur von ODRE PQC.'],
      whitepaper: ['Öffentliches technisches Whitepaper', 'Beschreibt Sicherheitsgrenze und technische Architektur.'],
      release_evidence: ['Release-Nachweise', 'Zeigt die öffentlich verfügbaren Ergebnisse der Release-Verifikation.'],
      trial: ['Leitfaden zum 14-Tage-Trial', 'Anleitung von der Installation bis zum Start und Betrieb des Trials.'],
      installation: ['Installation, Lizenzaktivierung und Betrieb', 'Anleitung für Installation, Aktivierung und Betrieb.']
    },
    es: {
      button: 'Ver PDF', panel: 'Documentos en español',
      product_overview: ['Resumen del producto', 'Explica el alcance y la arquitectura principal de ODRE PQC.'],
      whitepaper: ['Libro blanco técnico público', 'Explica el límite de seguridad y la arquitectura técnica.'],
      release_evidence: ['Evidencia de la versión', 'Muestra los resultados públicos de verificación de la versión.'],
      trial: ['Guía de prueba gratuita de 14 días', 'Guía de instalación, inicio y operación de la prueba.'],
      installation: ['Instalación, activación de licencia y operaciones', 'Guía de instalación, activación y operación.']
    }
  };
  var canonical = {
    product_overview: 'Product Overview',
    whitepaper: 'Public Technical Whitepaper',
    release_evidence: 'Release Evidence',
    trial: '14-Day Free Trial Guide',
    installation: 'Installation & License Activation / Operations Guide'
  };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-doc-language]'));
  var list = document.querySelector('[data-doc-list]');
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-doc-type]'));
  if (!tabs.length || !list || rows.length !== 5) return;

  var manuallySelected = false;
  var current = 'en';

  function normalizedLanguage(value) {
    var code = String(value || '').slice(0, 2).toLowerCase();
    return supported.indexOf(code) >= 0 ? code : 'en';
  }

  function render(code, manual) {
    code = normalizedLanguage(code);
    current = code;
    if (manual) manuallySelected = true;
    tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-doc-language') === code;
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    list.setAttribute('aria-label', copy[code].panel);
    rows.forEach(function (row) {
      var type = row.getAttribute('data-doc-type');
      var title = row.querySelector('h3');
      var subtitle = row.querySelector('.docs-pdf-subtitle');
      var description = row.querySelector('.docs-pdf-description');
      var link = row.querySelector('.docs-pdf-button');
      title.textContent = copy[code][type][0];
      subtitle.textContent = canonical[type];
      subtitle.hidden = code === 'en';
      description.textContent = copy[code][type][1];
      link.href = files[code][type];
      link.hreflang = code;
      link.textContent = copy[code].button;
      link.setAttribute('aria-label', copy[code].button + ': ' + copy[code][type][0] + ' (' + languageNames[code] + ')');
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      render(tab.getAttribute('data-doc-language'), true);
    });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      var next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      render(tabs[next].getAttribute('data-doc-language'), true);
    });
  });

  document.addEventListener('odre:language', function (event) {
    if (!manuallySelected) render(event.detail && event.detail.language, false);
  });

  render(document.documentElement.lang, false);
}());
