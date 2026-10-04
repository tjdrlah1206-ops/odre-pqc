(function(){
  'use strict';
  var copy={
  "en": {
    "nativeTitle": "Native installation & device replacement",
    "nativeBody": "Register a Paid device or explicitly transfer an existing Unit. An inaccessible device needs support approval; Trial transfer is not supported.",
    "nativeLink": "View Native guide",
    "verificationTitle": "Release 64 Windows verification",
    "verificationBody": "Windows Server 2022 is supported and verified. Review the Release pin, CMS signing authority and independent verifier procedure.",
    "verificationLink": "Verification & known limitation",
    "quickTitle": "Native Bundle quick start",
    "quickBody": "Use the verified Native Bundle for your operating system. Its commands and state are separate from the legacy Wheel client.",
    "quick1": "Verify the official delivery with the independent verifier and follow the included installation guide.",
    "quick2": "For an existing installation, preserve its identity and state; check status before continuing.",
    "quick3": "For a new Paid device, use register and the Native portal. Convert an existing Native Trial with paid on that same installation.",
    "quick4": "Confirm the valid signed Lease and test Gateway → Core → Protected Handler before opening production traffic.",
    "openNative": "Native activation & device transfer",
    "legacyTitle": "Existing Wheel installation guide",
    "docs": "Documentation",
    "support": "Support",
    "verify": "Release verification",
    "legacyScope": "The commands in this section apply to existing Wheel installations. For Native Bundle, follow the dedicated installation guide."
  },
  "ko": {
    "nativeTitle": "Native 설치 · 장치 이전",
    "nativeBody": "유료 장치를 등록하거나 기존 Unit 이전을 직접 선택하세요. 접근할 수 없는 장치는 지원 승인이 필요하며 Trial 이전은 지원하지 않습니다.",
    "nativeLink": "Native 가이드 보기",
    "verificationTitle": "Release 64 Windows 검증",
    "verificationBody": "Windows Server 2022는 지원·검증 PASS입니다. Release pin, CMS signing authority와 독립 verifier 절차를 확인하세요.",
    "verificationLink": "검증 방법 · 알려진 제한",
    "quickTitle": "Native Bundle 빠른 시작",
    "quickBody": "운영체제에 맞는 검증된 Native Bundle을 사용하세요. 기존 Wheel과는 실행 명령과 상태가 다릅니다.",
    "quick1": "독립 verifier로 공식 배포본을 검증하고 동봉 설치 가이드를 따르세요.",
    "quick2": "기존 설치본은 identity와 state를 보존하고 status를 먼저 확인하세요.",
    "quick3": "새 유료 장치는 register와 Native 화면을 사용하세요. 기존 Native Trial의 유료 전환은 같은 설치본에서 paid로 진행하세요.",
    "quick4": "유효한 signed Lease와 Gateway → Core → Protected Handler 경로를 확인한 뒤 운영 트래픽을 여세요.",
    "openNative": "Native 활성화 · 장치 이전",
    "legacyTitle": "기존 Wheel 설치본 안내",
    "docs": "문서",
    "support": "지원 문의",
    "verify": "릴리스 검증",
    "legacyScope": "이 절의 명령은 기존 Wheel 설치본 기준입니다. Native Bundle은 전용 설치 가이드를 따르세요."
  },
  "ja": {
    "nativeTitle": "Nativeのインストール・デバイス移行",
    "nativeBody": "有料デバイスの登録か既存Unitの移行を明示的に選択します。アクセス不可のデバイスにはサポート承認が必要です。Trial移行は未対応です。",
    "nativeLink": "Nativeガイドを見る",
    "verificationTitle": "Release 64 Windows検証",
    "verificationBody": "Windows Server 2022は対応・検証PASSです。Release pin、CMS signing authority、独立verifier手順を確認してください。",
    "verificationLink": "検証方法・既知の制限",
    "quickTitle": "Native Bundleクイックスタート",
    "quickBody": "OSに合った検証済みNative Bundleを使用します。従来のWheelとはコマンドと状態が異なります。",
    "quick1": "独立verifierで公式配布物を検証し、同梱のインストールガイドに従います。",
    "quick2": "既存インストールではidentityとstateを保持し、まずstatusを確認します。",
    "quick3": "新しい有料デバイスにはregisterとNative画面を使います。既存Native Trialの有料化には同じインストールのpaidを使います。",
    "quick4": "有効な署名済みLeaseとGateway → Core → Protected Handlerを確認してから本番トラフィックを開始します。",
    "openNative": "Native有効化・デバイス移行",
    "legacyTitle": "既存Wheelインストールのガイド",
    "docs": "ドキュメント",
    "support": "サポート",
    "verify": "リリース検証",
    "legacyScope": "この節のコマンドは既存Wheel向けです。Native Bundleには専用のインストールガイドを使用してください。"
  },
  "de": {
    "nativeTitle": "Native-Installation und Gerätewechsel",
    "nativeBody": "Registrieren Sie ein bezahltes Gerät oder übertragen Sie ausdrücklich eine bestehende Unit. Nicht erreichbare Geräte benötigen Supportfreigabe; Trial-Übertragung wird nicht unterstützt.",
    "nativeLink": "Native-Anleitung öffnen",
    "verificationTitle": "Release-64-Windows-Verifikation",
    "verificationBody": "Windows Server 2022 ist unterstützt und verifiziert. Prüfen Sie Release-Pin, CMS-Signaturinstanz und unabhängiges Verfahren.",
    "verificationLink": "Verifikation und bekannte Einschränkung",
    "quickTitle": "Native Bundle: Schnellstart",
    "quickBody": "Verwenden Sie das geprüfte Native Bundle für Ihr Betriebssystem. Befehle und Zustand unterscheiden sich vom bisherigen Wheel-Client.",
    "quick1": "Prüfen Sie die offizielle Lieferung mit dem unabhängigen Verifier und befolgen Sie die beiliegende Installationsanleitung.",
    "quick2": "Bewahren Sie bei bestehenden Installationen identity und state und prüfen Sie zuerst status.",
    "quick3": "Für ein neues bezahltes Gerät nutzen Sie register und das Native-Portal. Einen bestehenden Native Trial stellen Sie mit paid auf derselben Installation um.",
    "quick4": "Prüfen Sie die gültige signierte Lease und Gateway → Core → Protected Handler, bevor Produktionstraffic freigegeben wird.",
    "openNative": "Native-Aktivierung und Gerätewechsel",
    "legacyTitle": "Anleitung für bestehende Wheel-Installationen",
    "docs": "Dokumentation",
    "support": "Support",
    "verify": "Release-Verifikation",
    "legacyScope": "Die Befehle in diesem Abschnitt gelten für bestehende Wheel-Installationen. Nutzen Sie für Native Bundle die eigene Installationsanleitung."
  },
  "es": {
    "nativeTitle": "Instalación Native y cambio de dispositivo",
    "nativeBody": "Registre un dispositivo de pago o elija trasladar una Unit existente. Un dispositivo inaccesible necesita aprobación de soporte. No se admite trasladar Trial.",
    "nativeLink": "Ver guía Native",
    "verificationTitle": "Verificación de Release 64 en Windows",
    "verificationBody": "Windows Server 2022 es compatible y está verificado. Revise Release pin, autoridad CMS y verificador independiente.",
    "verificationLink": "Verificación y limitación conocida",
    "quickTitle": "Inicio rápido de Native Bundle",
    "quickBody": "Use el Native Bundle verificado para su sistema operativo. Sus comandos y estado son distintos a los del cliente Wheel anterior.",
    "quick1": "Verifique la entrega oficial con el verificador independiente y siga la guía de instalación incluida.",
    "quick2": "Conserve identity y state de las instalaciones existentes y compruebe primero status.",
    "quick3": "Para un nuevo dispositivo de pago, use register y el portal Native. Convierta un Native Trial existente con paid en esa misma instalación.",
    "quick4": "Confirme la Lease firmada válida y Gateway → Core → Protected Handler antes de abrir tráfico de producción.",
    "openNative": "Activación Native y traslado de dispositivo",
    "legacyTitle": "Guía para instalaciones Wheel existentes",
    "docs": "Documentación",
    "support": "Soporte",
    "verify": "Verificación de la versión",
    "legacyScope": "Los comandos de esta sección corresponden a instalaciones Wheel existentes. Para Native Bundle, siga su guía de instalación específica."
  }
};
  var rc2Copy={"en": {"verificationTitle": "RC2 release verification", "verificationBody": "Compare the complete ZIP SHA, then verify CMS, the pinned root and signer, signed CRL, publication manifest, inventory, envelope and policy-pin consistency.", "verificationLink": "RC2 release verification", "nativeTitle": "RC2 installation and Native commands", "nativeBody": "Verify the customer archive and the independently approved verifier kit first. Install into a new protected immutable directory, then follow the RC2 Native installation guide.", "nativeLink": "RC2 installation and Native commands", "quickTitle": "Installation, activation and runtime checks", "quickBody": "Verify the customer archive and the independently approved verifier kit first. Install into a new protected immutable directory, then follow the RC2 Native installation guide.", "quick1": "Compare the complete ZIP SHA, then verify CMS, the pinned root and signer, signed CRL, publication manifest, inventory, envelope and policy-pin consistency.", "quick2": "Preserve existing identity, License, Unit, Lease and device state. Do not reinitialize an existing installation or copy private material to another device.", "quick3": "Trial and Paid use the same ODRE PQC 0.3.1 / RC2 ZIP. Downloading starts neither a Trial nor a payment.", "quick4": "verify checks Core after existing Lease admission. Verify the actual Gateway → Core → Protected Handler path separately."}, "ko": {"verificationTitle": "RC2 릴리스 검증", "verificationBody": "전체 ZIP SHA를 대조한 뒤 CMS, pinned root·signer, signed CRL, publication manifest, inventory, envelope 및 policy-pin 일치를 검증하세요.", "verificationLink": "RC2 릴리스 검증", "nativeTitle": "RC2 설치·Native 명령", "nativeBody": "고객 ZIP과 독립적으로 승인된 verifier kit를 먼저 검증하세요. 새 보호된 immutable 디렉터리에 설치한 뒤 RC2 Native 설치 가이드를 따르세요.", "nativeLink": "RC2 설치·Native 명령", "quickTitle": "설치·활성화·runtime 확인", "quickBody": "고객 ZIP과 독립적으로 승인된 verifier kit를 먼저 검증하세요. 새 보호된 immutable 디렉터리에 설치한 뒤 RC2 Native 설치 가이드를 따르세요.", "quick1": "전체 ZIP SHA를 대조한 뒤 CMS, pinned root·signer, signed CRL, publication manifest, inventory, envelope 및 policy-pin 일치를 검증하세요.", "quick2": "기존 identity·License·Unit·Lease·device state를 보존하세요. 기존 설치본을 재초기화하거나 private material을 다른 장치에 복제하지 마세요.", "quick3": "Trial과 Paid는 동일한 ODRE PQC 0.3.1 / RC2 ZIP을 사용합니다. 다운로드만으로 Trial이나 결제가 시작되지 않습니다.", "quick4": "verify는 기존 Lease admission 이후 Core를 검사합니다. 실제 Gateway → Core → Protected Handler 경로는 별도로 확인하세요."}, "ja": {"verificationTitle": "RC2リリース検証", "verificationBody": "ZIP全体のSHAを比較し、CMS、pinned root・signer、signed CRL、publication manifest、inventory、envelope、policy-pin一致を検証します。", "verificationLink": "RC2リリース検証", "nativeTitle": "RC2導入・Nativeコマンド", "nativeBody": "顧客ZIPと独立して承認されたverifier kitを先に検証します。新しい保護されたimmutableディレクトリへ導入し、RC2 Nativeガイドを使用してください。", "nativeLink": "RC2導入・Nativeコマンド", "quickTitle": "導入・有効化・runtime確認", "quickBody": "顧客ZIPと独立して承認されたverifier kitを先に検証します。新しい保護されたimmutableディレクトリへ導入し、RC2 Nativeガイドを使用してください。", "quick1": "ZIP全体のSHAを比較し、CMS、pinned root・signer、signed CRL、publication manifest、inventory、envelope、policy-pin一致を検証します。", "quick2": "既存のidentity、License、Unit、Lease、device stateを保持してください。既存環境の再初期化やprivate materialの別デバイスへのコピーは禁止です。", "quick3": "TrialとPaidは同じODRE PQC 0.3.1 / RC2 ZIPを使用します。ダウンロードだけではTrialも決済も開始しません。", "quick4": "verifyは既存Lease admission後にCoreを検査します。実際のGateway → Core → Protected Handler経路は別途確認します。"}, "de": {"verificationTitle": "RC2-Release-Verifikation", "verificationBody": "Den vollständigen ZIP-SHA vergleichen, dann CMS, gepinnte Root und Signer, signierte CRL, Publication Manifest, Inventar, Envelope und Policy-Pin-Gleichlauf prüfen.", "verificationLink": "RC2-Release-Verifikation", "nativeTitle": "RC2-Installation und Native-Befehle", "nativeBody": "Zuerst Kunden-ZIP und unabhängig freigegebenes Verifier-Kit prüfen. In ein neues geschütztes unveränderliches Verzeichnis installieren und die RC2-Native-Anleitung befolgen.", "nativeLink": "RC2-Installation und Native-Befehle", "quickTitle": "Installation, Aktivierung und Laufzeitprüfung", "quickBody": "Zuerst Kunden-ZIP und unabhängig freigegebenes Verifier-Kit prüfen. In ein neues geschütztes unveränderliches Verzeichnis installieren und die RC2-Native-Anleitung befolgen.", "quick1": "Den vollständigen ZIP-SHA vergleichen, dann CMS, gepinnte Root und Signer, signierte CRL, Publication Manifest, Inventar, Envelope und Policy-Pin-Gleichlauf prüfen.", "quick2": "Bestehende Identity, License, Unit, Lease und Gerätezustände bewahren. Bestehende Installationen nicht neu initialisieren und privates Material nicht auf andere Geräte kopieren.", "quick3": "Trial und Paid verwenden dasselbe ODRE PQC 0.3.1 / RC2 ZIP. Ein Download startet weder Trial noch Zahlung.", "quick4": "verify prüft Core nach bestehender Lease-Zulassung. Den tatsächlichen Gateway → Core → Protected Handler-Pfad separat prüfen."}, "es": {"verificationTitle": "Verificación de RC2", "verificationBody": "Compare el SHA del ZIP completo y verifique CMS, root y signer fijados, CRL firmada, publication manifest, inventario, envelope y coincidencia policy-pin.", "verificationLink": "Verificación de RC2", "nativeTitle": "Instalación RC2 y comandos Native", "nativeBody": "Verifique primero el ZIP y el kit verificador aprobado por un canal independiente. Instale en un directorio nuevo, protegido e inmutable y siga la guía Native de RC2.", "nativeLink": "Instalación RC2 y comandos Native", "quickTitle": "Instalación, activación y comprobación runtime", "quickBody": "Verifique primero el ZIP y el kit verificador aprobado por un canal independiente. Instale en un directorio nuevo, protegido e inmutable y siga la guía Native de RC2.", "quick1": "Compare el SHA del ZIP completo y verifique CMS, root y signer fijados, CRL firmada, publication manifest, inventario, envelope y coincidencia policy-pin.", "quick2": "Conserve identity, License, Unit, Lease y estado del dispositivo. No reinicialice instalaciones existentes ni copie material privado a otro dispositivo.", "quick3": "Trial y Paid usan el mismo ZIP ODRE PQC 0.3.1 / RC2. Descargar no inicia Trial ni pago.", "quick4": "verify comprueba Core después de la admisión de una Lease existente. Verifique por separado Gateway → Core → Protected Handler."}};
  Object.keys(rc2Copy).forEach(function(lang){Object.assign(copy[lang],rc2Copy[lang]);});
  function render(){
    var lang=document.documentElement.lang,words=copy[lang]||copy.en;
    document.querySelectorAll('[data-guidance]').forEach(function(node){var key=node.getAttribute('data-guidance');if(words[key])node.textContent=words[key];});
    var suffix=lang==='en'?'':lang+'.html';
    document.querySelectorAll('[data-native-doc-link]').forEach(function(link){link.href='/docs/rc2/'+suffix;});
    document.querySelectorAll('[data-verification-link]').forEach(function(link){link.href='/verification/rc2/'+suffix;});
  }
  document.addEventListener('odre:language',render);render();
})();
