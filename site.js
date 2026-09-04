(function () {
  'use strict';

  const languages = ['en', 'ko', 'ja', 'de', 'es'];
  const translations = {
    en: {
      'nav.product': 'Product', 'nav.security': 'Security', 'nav.docs': 'Docs', 'nav.pricing': 'Pricing', 'nav.trust': 'Trust Center', 'nav.company': 'Company', 'nav.download': 'Download',
      'footer.summary': 'Post-quantum protection for supported production FastAPI services.', 'footer.product': 'Product', 'footer.security': 'Security', 'footer.docs': 'Documentation', 'footer.pricing': 'Pricing', 'footer.trust': 'Trust', 'footer.vulnerability': 'Vulnerability Reporting', 'footer.integrity': 'Release Integrity', 'footer.advisories': 'Security Advisories', 'footer.lifecycle': 'Support Lifecycle', 'footer.company': 'Company', 'footer.odre': 'ODRE AI', 'footer.contact': 'Contact', 'footer.enterprise': 'Enterprise Licensing', 'footer.licenseSupport': 'License Support', 'footer.legal': 'Legal', 'footer.terms': 'Terms', 'footer.privacy': 'Privacy', 'footer.refund': 'Refund Policy', 'footer.commercial': 'Commercial License Terms', 'footer.rights': '© 2026 ODRE AI. All rights reserved.',
      'home.eyebrow': 'ODRE PQC', 'home.title': 'Post-quantum protection for production FastAPI services.', 'home.intro': 'ODRE PQC adds a security boundary to protected application routes and blocks protected traffic when that protection cannot be verified.', 'home.trial': 'Start 14-Day Trial', 'home.architecture': 'View Security Architecture', 'home.release': 'Release at a glance', 'home.releaseIntro': 'The current public release and its published verification scope.', 'home.howTitle': 'A narrow integration boundary for protected routes.', 'home.howIntro': 'Public routes remain available. Protected routes run only after the ODRE PQC boundary accepts the request.', 'home.evidenceTitle': 'Technical detail without marketing claims.', 'home.evidenceIntro': 'Architecture, verification scope, integrity data and limitations are organized for security review.', 'home.priceTitle': 'Clear licensing for evaluation and deployment.', 'home.priceIntro': 'Start with a 14-day evaluation. Monthly and annual commercial subscriptions are priced per Unit.',
      'product.eyebrow': 'Product', 'product.title': 'Protect selected FastAPI routes without replacing your application.', 'product.intro': 'ODRE PQC installs inside a supported FastAPI service and places a fail-closed boundary in front of routes you designate as protected.',
      'security.eyebrow': 'Security', 'security.title': 'A defined security boundary with a defined verification scope.', 'security.intro': 'Review the cryptographic profile, request controls, trust assumptions and limitations of the current release.',
      'docs.eyebrow': 'Documentation', 'docs.title': 'Install, verify and operate ODRE PQC.', 'docs.intro': 'Start with the supported deployment baseline, then use the product diagnostics before allowing protected traffic.',
      'pricing.eyebrow': 'Pricing', 'pricing.title': 'Per-Unit licensing with monthly or annual renewal.', 'pricing.intro': 'Evaluate for 14 days, then license each independent production deployment. Commercial subscriptions include maintenance and security updates for supported versions.', 'pricing.trial': 'Start Trial', 'pricing.monthly': 'Buy Monthly', 'pricing.annual': 'Buy Annual', 'pricing.enterprise': 'Contact Sales',
      'trust.eyebrow': 'Trust Center', 'trust.title': 'Release, maintenance and disclosure information.', 'trust.intro': 'Evidence and operating policies are grouped here for technical, security and procurement review.',
      'contact.eyebrow': 'Company & Contact', 'contact.title': 'Talk with ODRE AI about deployment, licensing or security.', 'contact.intro': 'Use the contact route that matches your request. Do not send passwords, license keys or sensitive customer data by email.',
      'enterprise.eyebrow': 'Enterprise Licensing', 'enterprise.title': 'Planning a deployment of 21 Units or more?', 'enterprise.intro': 'Contact ODRE AI for volume licensing, deployment planning, procurement questions and pre-purchase technical review.',
      'download.eyebrow': 'Download & Trial', 'download.title': 'Start with a controlled 14-day evaluation.', 'download.intro': 'Trial delivery and license information are sent through the approved delivery process. The sealed product artifact is not published as an unrestricted public download.',
      'legal.eyebrow': 'Legal', 'legal.title': 'Policies for purchases, licensing and website use.', 'legal.intro': 'Review the terms that apply to ODRE PQC evaluations, subscriptions, licensing and data handling.',
      'payment.eyebrow': 'Order confirmation', 'payment.title': 'Payment received. We are confirming your order.', 'payment.intro': 'Your license information will be sent to the email address used for payment after the transaction is verified.',
      'register.eyebrow': 'License delivery', 'register.title': 'Confirm a purchase or recover license delivery.', 'register.intro': 'Use the transaction reference and the same email address used for payment. This page does not issue a license from the return URL alone.'
    },
    ko: {
      'nav.product': '제품', 'nav.security': '보안', 'nav.docs': '문서', 'nav.pricing': '가격', 'nav.trust': 'Trust Center', 'nav.company': '회사', 'nav.download': '다운로드',
      'footer.summary': '지원되는 프로덕션 FastAPI 서비스를 위한 포스트양자 보호.', 'footer.product': '제품', 'footer.security': '보안', 'footer.docs': '문서', 'footer.pricing': '가격', 'footer.trust': '신뢰', 'footer.vulnerability': '취약점 신고', 'footer.integrity': '릴리스 무결성', 'footer.advisories': '보안 공지', 'footer.lifecycle': '지원 수명주기', 'footer.company': '회사', 'footer.odre': 'ODRE AI', 'footer.contact': '문의', 'footer.enterprise': '엔터프라이즈 라이선스', 'footer.licenseSupport': '라이선스 지원', 'footer.legal': '법적 고지', 'footer.terms': '이용약관', 'footer.privacy': '개인정보 처리방침', 'footer.refund': '환불 정책', 'footer.commercial': '상용 라이선스 조건', 'footer.rights': '© 2026 ODRE AI. 모든 권리 보유.',
      'home.eyebrow': 'ODRE PQC', 'home.title': '프로덕션 FastAPI 서비스를 위한 포스트양자 보호.', 'home.intro': 'ODRE PQC는 보호 대상 애플리케이션 라우트 앞에 보안 경계를 추가하고, 보호 상태를 검증할 수 없으면 해당 트래픽을 차단합니다.', 'home.trial': '14일 평가 시작', 'home.architecture': '보안 아키텍처 보기', 'home.release': '현재 릴리스', 'home.releaseIntro': '현재 공개 릴리스와 공개된 검증 범위입니다.', 'home.howTitle': '보호 라우트 앞에 두는 명확한 통합 경계.', 'home.howIntro': '공개 라우트는 유지됩니다. 보호 라우트는 ODRE PQC 경계가 요청을 승인한 뒤에만 실행됩니다.', 'home.evidenceTitle': '과장 없이 확인하는 기술 자료.', 'home.evidenceIntro': '보안 검토에 필요한 아키텍처, 검증 범위, 무결성 정보와 한계를 정리했습니다.', 'home.priceTitle': '평가와 배포를 위한 명확한 라이선스.', 'home.priceIntro': '14일 평가 후 독립 프로덕션 설치본마다 월간 또는 연간 구독을 선택합니다.',
      'product.eyebrow': '제품', 'product.title': '애플리케이션을 교체하지 않고 선택한 FastAPI 라우트를 보호합니다.', 'product.intro': 'ODRE PQC는 지원되는 FastAPI 서비스 안에 설치되어, 보호 대상으로 지정한 라우트 앞에 fail-closed 경계를 둡니다.',
      'security.eyebrow': '보안', 'security.title': '범위가 명확한 보안 경계와 검증 자료.', 'security.intro': '현재 릴리스의 암호 프로파일, 요청 제어, 신뢰 가정과 한계를 확인할 수 있습니다.',
      'docs.eyebrow': '문서', 'docs.title': 'ODRE PQC 설치, 검증, 운영.', 'docs.intro': '지원되는 배포 기준선에서 시작하고, 보호 트래픽을 허용하기 전에 제품 진단을 실행합니다.',
      'pricing.eyebrow': '가격', 'pricing.title': '월간 또는 연간 갱신 방식의 Unit 라이선스.', 'pricing.intro': '14일 동안 평가한 뒤 독립 프로덕션 배포마다 라이선스를 적용합니다. 상용 구독에는 지원 버전의 유지보수와 보안 업데이트가 포함됩니다.', 'pricing.trial': '평가 시작', 'pricing.monthly': '월간 구매', 'pricing.annual': '연간 구매', 'pricing.enterprise': '영업 문의',
      'trust.eyebrow': 'Trust Center', 'trust.title': '릴리스, 유지보수, 취약점 신고 정보.', 'trust.intro': '기술·보안·구매 검토에 필요한 근거와 운영 정책을 한곳에 정리했습니다.',
      'contact.eyebrow': '회사 및 문의', 'contact.title': '배포, 라이선스 또는 보안에 관해 ODRE AI에 문의하세요.', 'contact.intro': '요청에 맞는 연락 경로를 이용해 주세요. 비밀번호, 라이선스 키, 민감한 고객 데이터는 이메일로 보내지 마세요.',
      'enterprise.eyebrow': '엔터프라이즈 라이선스', 'enterprise.title': '21 Units 이상 배포를 계획하고 있나요?', 'enterprise.intro': '볼륨 라이선스, 배포 계획, 구매 절차, 구매 전 기술 검토를 위해 ODRE AI에 문의하세요.',
      'download.eyebrow': '다운로드 및 평가', 'download.title': '통제된 14일 평가로 시작하세요.', 'download.intro': '평가판과 라이선스 정보는 승인된 전달 절차를 통해 제공됩니다. 봉인된 제품 산출물은 제한 없는 공개 다운로드로 배포하지 않습니다.',
      'legal.eyebrow': '법적 고지', 'legal.title': '구매, 라이선스, 웹사이트 이용 정책.', 'legal.intro': 'ODRE PQC 평가, 구독, 라이선스와 데이터 처리에 적용되는 조건을 확인하세요.',
      'payment.eyebrow': '주문 확인', 'payment.title': '결제가 접수되었습니다. 주문을 확인하고 있습니다.', 'payment.intro': '거래 확인 후 결제에 사용한 이메일 주소로 라이선스 정보를 보내드립니다.',
      'register.eyebrow': '라이선스 전달', 'register.title': '구매 확인 또는 라이선스 이메일 재발송.', 'register.intro': '거래 참조번호와 결제에 사용한 이메일 주소를 입력하세요. 복귀 URL 방문만으로 라이선스를 발급하지 않습니다.'
    },
    ja: {
      'nav.product': '製品', 'nav.security': 'セキュリティ', 'nav.docs': 'ドキュメント', 'nav.pricing': '価格', 'nav.trust': 'Trust Center', 'nav.company': '会社', 'nav.download': 'ダウンロード',
      'footer.summary': '対応する本番FastAPIサービス向けのポスト量子保護。', 'footer.product': '製品', 'footer.security': 'セキュリティ', 'footer.docs': 'ドキュメント', 'footer.pricing': '価格', 'footer.trust': '信頼情報', 'footer.vulnerability': '脆弱性報告', 'footer.integrity': 'リリース整合性', 'footer.advisories': 'セキュリティ情報', 'footer.lifecycle': 'サポート期間', 'footer.company': '会社', 'footer.odre': 'ODRE AI', 'footer.contact': 'お問い合わせ', 'footer.enterprise': 'エンタープライズ', 'footer.licenseSupport': 'ライセンスサポート', 'footer.legal': '法的情報', 'footer.terms': '利用規約', 'footer.privacy': 'プライバシー', 'footer.refund': '返金ポリシー', 'footer.commercial': '商用ライセンス条件', 'footer.rights': '© 2026 ODRE AI. All rights reserved.',
      'home.eyebrow': 'ODRE PQC', 'home.title': '本番FastAPIサービス向けのポスト量子保護。', 'home.intro': 'ODRE PQCは保護対象ルートにセキュリティ境界を追加し、保護を検証できない場合は対象トラフィックを遮断します。', 'home.trial': '14日間評価を開始', 'home.architecture': 'セキュリティ構成を見る', 'home.release': '現在のリリース', 'home.releaseIntro': '公開中のリリースと検証範囲です。', 'home.howTitle': '保護ルートに置く明確な統合境界。', 'home.howIntro': '公開ルートは維持され、保護ルートは境界が要求を承認した後にのみ実行されます。', 'home.evidenceTitle': '誇張のない技術情報。', 'home.evidenceIntro': 'アーキテクチャ、検証範囲、整合性情報、制限事項を確認できます。', 'home.priceTitle': '評価と導入のための明確なライセンス。', 'home.priceIntro': '14日間評価後、各本番導入に月間または年間契約を適用します。',
      'product.eyebrow': '製品', 'product.title': 'アプリケーションを置き換えずにFastAPIルートを保護。', 'product.intro': '対応するFastAPIサービス内に導入し、指定した保護ルートの前にfail-closed境界を配置します。',
      'security.eyebrow': 'セキュリティ', 'security.title': '範囲を明示したセキュリティ境界と検証情報。', 'security.intro': '暗号プロファイル、要求制御、信頼前提、現行リリースの制限を確認できます。',
      'docs.eyebrow': 'ドキュメント', 'docs.title': 'ODRE PQCの導入、検証、運用。', 'docs.intro': '対応する導入基準から開始し、保護トラフィックを許可する前に診断を実行します。',
      'pricing.eyebrow': '価格', 'pricing.title': '月間または年間更新のUnitライセンス。', 'pricing.intro': '14日間評価後、独立した本番導入ごとにライセンスを適用します。対応版の保守とセキュリティ更新を含みます。', 'pricing.trial': '評価を開始', 'pricing.monthly': '月間購入', 'pricing.annual': '年間購入', 'pricing.enterprise': '営業窓口',
      'trust.eyebrow': 'Trust Center', 'trust.title': 'リリース、保守、開示情報。', 'trust.intro': '技術・セキュリティ・調達審査に必要な根拠と運用方針です。',
      'contact.eyebrow': '会社・連絡先', 'contact.title': '導入、ライセンス、セキュリティについてご相談ください。', 'contact.intro': '依頼に合う窓口をご利用ください。パスワード、ライセンスキー、機密データは送信しないでください。',
      'enterprise.eyebrow': 'エンタープライズ', 'enterprise.title': '21 Units以上の導入をご検討ですか？', 'enterprise.intro': 'ボリュームライセンス、導入計画、調達、購入前の技術確認についてお問い合わせください。',
      'download.eyebrow': 'ダウンロード・評価', 'download.title': '管理された14日間評価を開始。', 'download.intro': '評価版とライセンス情報は承認された配布手順で提供します。封印された製品は無制限の公開ダウンロードでは配布しません。',
      'legal.eyebrow': '法的情報', 'legal.title': '購入、ライセンス、サイト利用に関するポリシー。', 'legal.intro': '評価、契約、ライセンス、データ取扱いに適用される条件をご確認ください。',
      'payment.eyebrow': '注文確認', 'payment.title': '支払いを受け付けました。注文を確認しています。', 'payment.intro': '取引確認後、支払いに使用したメールアドレスへライセンス情報を送信します。',
      'register.eyebrow': 'ライセンス配信', 'register.title': '購入確認またはライセンス配信の復旧。', 'register.intro': '取引参照番号と支払い時のメールアドレスを入力してください。戻りURLだけではライセンスを発行しません。'
    },
    de: {
      'nav.product': 'Produkt', 'nav.security': 'Sicherheit', 'nav.docs': 'Dokumentation', 'nav.pricing': 'Preise', 'nav.trust': 'Trust Center', 'nav.company': 'Unternehmen', 'nav.download': 'Download',
      'footer.summary': 'Post-Quanten-Schutz für unterstützte FastAPI-Produktionsdienste.', 'footer.product': 'Produkt', 'footer.security': 'Sicherheit', 'footer.docs': 'Dokumentation', 'footer.pricing': 'Preise', 'footer.trust': 'Vertrauen', 'footer.vulnerability': 'Schwachstellen melden', 'footer.integrity': 'Release-Integrität', 'footer.advisories': 'Sicherheitshinweise', 'footer.lifecycle': 'Support-Lebenszyklus', 'footer.company': 'Unternehmen', 'footer.odre': 'ODRE AI', 'footer.contact': 'Kontakt', 'footer.enterprise': 'Enterprise-Lizenzen', 'footer.licenseSupport': 'Lizenzsupport', 'footer.legal': 'Rechtliches', 'footer.terms': 'Bedingungen', 'footer.privacy': 'Datenschutz', 'footer.refund': 'Erstattung', 'footer.commercial': 'Kommerzielle Lizenzbedingungen', 'footer.rights': '© 2026 ODRE AI. Alle Rechte vorbehalten.',
      'home.eyebrow': 'ODRE PQC', 'home.title': 'Post-Quanten-Schutz für produktive FastAPI-Dienste.', 'home.intro': 'ODRE PQC setzt eine Sicherheitsgrenze vor geschützte Anwendungsrouten und blockiert den Zugriff, wenn der Schutz nicht verifiziert werden kann.', 'home.trial': '14-Tage-Test starten', 'home.architecture': 'Sicherheitsarchitektur', 'home.release': 'Aktuelles Release', 'home.releaseIntro': 'Das aktuelle öffentliche Release und sein veröffentlichter Prüfumfang.', 'home.howTitle': 'Eine klare Integrationsgrenze für geschützte Routen.', 'home.howIntro': 'Öffentliche Routen bleiben erreichbar. Geschützte Routen laufen erst nach Freigabe durch die ODRE-PQC-Grenze.', 'home.evidenceTitle': 'Technische Details ohne Werbeversprechen.', 'home.evidenceIntro': 'Architektur, Prüfumfang, Integrität und Grenzen für die Sicherheitsprüfung.', 'home.priceTitle': 'Klare Lizenzen für Test und Betrieb.', 'home.priceIntro': '14 Tage testen, danach monatlich oder jährlich pro Produktionsinstallation lizenzieren.',
      'product.eyebrow': 'Produkt', 'product.title': 'Ausgewählte FastAPI-Routen schützen, ohne die Anwendung zu ersetzen.', 'product.intro': 'ODRE PQC wird im unterstützten FastAPI-Dienst installiert und setzt eine Fail-Closed-Grenze vor geschützte Routen.',
      'security.eyebrow': 'Sicherheit', 'security.title': 'Definierte Sicherheitsgrenze und klarer Prüfumfang.', 'security.intro': 'Kryptoprofil, Anfragesteuerung, Vertrauensannahmen und Grenzen des aktuellen Releases.',
      'docs.eyebrow': 'Dokumentation', 'docs.title': 'ODRE PQC installieren, prüfen und betreiben.', 'docs.intro': 'Mit der unterstützten Basis beginnen und Diagnosen ausführen, bevor geschützter Verkehr zugelassen wird.',
      'pricing.eyebrow': 'Preise', 'pricing.title': 'Lizenzierung pro Unit mit monatlicher oder jährlicher Verlängerung.', 'pricing.intro': '14 Tage evaluieren, danach jede unabhängige Produktionsinstallation lizenzieren. Wartung und Sicherheitsupdates unterstützter Versionen sind enthalten.', 'pricing.trial': 'Test starten', 'pricing.monthly': 'Monatlich kaufen', 'pricing.annual': 'Jährlich kaufen', 'pricing.enterprise': 'Vertrieb kontaktieren',
      'trust.eyebrow': 'Trust Center', 'trust.title': 'Release-, Wartungs- und Offenlegungsinformationen.', 'trust.intro': 'Nachweise und Betriebsrichtlinien für Technik-, Sicherheits- und Beschaffungsprüfungen.',
      'contact.eyebrow': 'Unternehmen & Kontakt', 'contact.title': 'Sprechen Sie mit ODRE AI über Betrieb, Lizenzen oder Sicherheit.', 'contact.intro': 'Nutzen Sie den passenden Kontaktweg. Senden Sie keine Passwörter, Lizenzschlüssel oder sensiblen Kundendaten.',
      'enterprise.eyebrow': 'Enterprise-Lizenzen', 'enterprise.title': 'Planen Sie 21 Units oder mehr?', 'enterprise.intro': 'Kontaktieren Sie ODRE AI für Volumenlizenzen, Bereitstellungsplanung, Beschaffung und technische Vorabprüfung.',
      'download.eyebrow': 'Download & Test', 'download.title': 'Mit einer kontrollierten 14-Tage-Evaluierung beginnen.', 'download.intro': 'Testversion und Lizenzinformationen werden über den freigegebenen Bereitstellungsprozess versendet. Das versiegelte Artefakt ist kein unbeschränkter öffentlicher Download.',
      'legal.eyebrow': 'Rechtliches', 'legal.title': 'Richtlinien für Kauf, Lizenz und Website-Nutzung.', 'legal.intro': 'Bedingungen für Evaluierungen, Abonnements, Lizenzen und Datenverarbeitung.',
      'payment.eyebrow': 'Bestellbestätigung', 'payment.title': 'Zahlung eingegangen. Wir prüfen Ihre Bestellung.', 'payment.intro': 'Nach Prüfung werden die Lizenzinformationen an die beim Kauf verwendete E-Mail-Adresse gesendet.',
      'register.eyebrow': 'Lizenzbereitstellung', 'register.title': 'Kauf bestätigen oder Lizenzbereitstellung wiederherstellen.', 'register.intro': 'Geben Sie Transaktionsreferenz und Zahlungs-E-Mail ein. Die Rückkehr-URL allein stellt keine Lizenz aus.'
    },
    es: {
      'nav.product': 'Producto', 'nav.security': 'Seguridad', 'nav.docs': 'Documentación', 'nav.pricing': 'Precios', 'nav.trust': 'Trust Center', 'nav.company': 'Empresa', 'nav.download': 'Descargar',
      'footer.summary': 'Protección poscuántica para servicios FastAPI de producción compatibles.', 'footer.product': 'Producto', 'footer.security': 'Seguridad', 'footer.docs': 'Documentación', 'footer.pricing': 'Precios', 'footer.trust': 'Confianza', 'footer.vulnerability': 'Reportar vulnerabilidad', 'footer.integrity': 'Integridad de versión', 'footer.advisories': 'Avisos de seguridad', 'footer.lifecycle': 'Ciclo de soporte', 'footer.company': 'Empresa', 'footer.odre': 'ODRE AI', 'footer.contact': 'Contacto', 'footer.enterprise': 'Licencias Enterprise', 'footer.licenseSupport': 'Soporte de licencias', 'footer.legal': 'Legal', 'footer.terms': 'Términos', 'footer.privacy': 'Privacidad', 'footer.refund': 'Reembolsos', 'footer.commercial': 'Términos de licencia comercial', 'footer.rights': '© 2026 ODRE AI. Todos los derechos reservados.',
      'home.eyebrow': 'ODRE PQC', 'home.title': 'Protección poscuántica para servicios FastAPI en producción.', 'home.intro': 'ODRE PQC añade un límite de seguridad a las rutas protegidas y bloquea su tráfico cuando la protección no puede verificarse.', 'home.trial': 'Iniciar prueba de 14 días', 'home.architecture': 'Ver arquitectura', 'home.release': 'Versión actual', 'home.releaseIntro': 'La versión pública actual y su alcance de verificación publicado.', 'home.howTitle': 'Un límite de integración claro para rutas protegidas.', 'home.howIntro': 'Las rutas públicas siguen disponibles. Las protegidas se ejecutan tras la aprobación del límite ODRE PQC.', 'home.evidenceTitle': 'Detalle técnico sin afirmaciones publicitarias.', 'home.evidenceIntro': 'Arquitectura, alcance, integridad y límites para revisión de seguridad.', 'home.priceTitle': 'Licencias claras para evaluación y despliegue.', 'home.priceIntro': 'Evalúe 14 días y licencie cada despliegue con suscripción mensual o anual.',
      'product.eyebrow': 'Producto', 'product.title': 'Proteja rutas FastAPI seleccionadas sin sustituir su aplicación.', 'product.intro': 'ODRE PQC se instala dentro de un servicio compatible y coloca un límite fail-closed ante las rutas protegidas.',
      'security.eyebrow': 'Seguridad', 'security.title': 'Un límite de seguridad y un alcance de verificación definidos.', 'security.intro': 'Revise perfil criptográfico, controles, supuestos de confianza y límites de la versión actual.',
      'docs.eyebrow': 'Documentación', 'docs.title': 'Instalar, verificar y operar ODRE PQC.', 'docs.intro': 'Comience con la base compatible y ejecute diagnósticos antes de permitir tráfico protegido.',
      'pricing.eyebrow': 'Precios', 'pricing.title': 'Licencia por Unit con renovación mensual o anual.', 'pricing.intro': 'Evalúe durante 14 días y licencie cada despliegue independiente. Incluye mantenimiento y actualizaciones de seguridad de versiones compatibles.', 'pricing.trial': 'Iniciar prueba', 'pricing.monthly': 'Comprar mensual', 'pricing.annual': 'Comprar anual', 'pricing.enterprise': 'Contactar ventas',
      'trust.eyebrow': 'Trust Center', 'trust.title': 'Información de versiones, mantenimiento y divulgación.', 'trust.intro': 'Evidencias y políticas operativas para revisión técnica, de seguridad y compras.',
      'contact.eyebrow': 'Empresa y contacto', 'contact.title': 'Hable con ODRE AI sobre despliegue, licencias o seguridad.', 'contact.intro': 'Use el canal adecuado. No envíe contraseñas, claves de licencia ni datos sensibles por correo.',
      'enterprise.eyebrow': 'Licencias Enterprise', 'enterprise.title': '¿Planea desplegar 21 Units o más?', 'enterprise.intro': 'Contacte con ODRE AI para volumen, planificación, compras y revisión técnica previa.',
      'download.eyebrow': 'Descarga y prueba', 'download.title': 'Comience con una evaluación controlada de 14 días.', 'download.intro': 'La prueba y la licencia se entregan por el proceso aprobado. El artefacto sellado no se publica como descarga abierta.',
      'legal.eyebrow': 'Legal', 'legal.title': 'Políticas de compra, licencia y uso del sitio.', 'legal.intro': 'Revise los términos para evaluaciones, suscripciones, licencias y tratamiento de datos.',
      'payment.eyebrow': 'Confirmación de pedido', 'payment.title': 'Pago recibido. Estamos confirmando su pedido.', 'payment.intro': 'Tras verificar la transacción, enviaremos la licencia al correo utilizado en el pago.',
      'register.eyebrow': 'Entrega de licencia', 'register.title': 'Confirmar compra o recuperar entrega.', 'register.intro': 'Use la referencia de transacción y el correo de pago. La URL de retorno por sí sola no emite una licencia.'
    }
  };

  function detectLanguage() {
    let saved = '';
    try { saved = new URLSearchParams(location.search).get('lang') || localStorage.getItem('odre-pqc-lang') || ''; } catch (_) {}
    if (languages.includes(saved)) return saved;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return languages.includes(browser) ? browser : 'en';
  }

  function applyLanguage(code) {
    if (!languages.includes(code)) code = 'en';
    const strings = translations[code];
    document.documentElement.lang = code;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const value = strings[node.dataset.i18n];
      if (typeof value === 'string') node.textContent = value;
    });
    document.querySelectorAll('[data-language]').forEach((select) => { select.value = code; });
    try { localStorage.setItem('odre-pqc-lang', code); } catch (_) {}
  }

  const initialLanguage = detectLanguage();
  applyLanguage(initialLanguage);
  document.querySelectorAll('[data-language]').forEach((select) => select.addEventListener('change', (event) => applyLanguage(event.target.value)));

  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    const close = () => { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); document.body.classList.remove('menu-open'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
    addEventListener('resize', () => { if (innerWidth > 820) close(); });
  }

  const unitInput = document.querySelector('[data-unit-input]');
  if (unitInput) {
    const monthly = document.querySelector('[data-monthly-total]');
    const annual = document.querySelector('[data-annual-total]');
    const purchaseLinks = document.querySelectorAll('[data-purchase-plan]');
    const update = () => {
      const units = Math.max(1, Math.min(20, Number.parseInt(unitInput.value, 10) || 1));
      unitInput.value = String(units);
      if (monthly) monthly.textContent = `US$${(units * 120).toLocaleString('en-US')}`;
      if (annual) annual.textContent = `US$${(units * 1200).toLocaleString('en-US')}`;
      purchaseLinks.forEach((link) => {
        const plan = link.dataset.purchasePlan;
        link.href = `mailto:odreai2025@gmail.com?subject=${encodeURIComponent(`ODRE PQC ${plan} purchase — ${units} Unit${units > 1 ? 's' : ''}`)}`;
      });
    };
    unitInput.addEventListener('input', update);
    unitInput.addEventListener('change', update);
    update();
  }
})();
