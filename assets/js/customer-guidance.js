(function(){
  'use strict';
  var copy={
  "en": {
    "nativeTitle": "Native installation & device replacement",
    "nativeBody": "Register a Paid device or explicitly transfer an existing Unit. An inaccessible device needs support approval; Trial transfer is not supported.",
    "nativeLink": "View Native guide",
    "verificationTitle": "RC24 Windows verification",
    "verificationBody": "Public Authenticode trust is unavailable. Review the release pins and independent verification procedure before installation.",
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
    "verificationTitle": "RC24 Windows 검증",
    "verificationBody": "공인 Authenticode 신뢰는 제공되지 않습니다. 설치 전 릴리스 pin과 독립 검증 절차를 확인하세요.",
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
    "verificationTitle": "RC24 Windows検証",
    "verificationBody": "公開Authenticode信頼は提供されません。インストール前にrelease pinと独立検証手順を確認してください。",
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
    "verificationTitle": "RC24-Windows-Verifikation",
    "verificationBody": "Öffentliches Authenticode-Vertrauen wird nicht angeboten. Prüfen Sie vor der Installation die Release-Pins und das unabhängige Prüfverfahren.",
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
    "verificationTitle": "Verificación de RC24 en Windows",
    "verificationBody": "No se ofrece confianza pública de Authenticode. Revise los pins y la verificación independiente antes de instalar.",
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
  function render(){
    var lang=document.documentElement.lang,words=copy[lang]||copy.en;
    document.querySelectorAll('[data-guidance]').forEach(function(node){var key=node.getAttribute('data-guidance');if(words[key])node.textContent=words[key];});
    var suffix=lang==='en'?'':lang+'.html';
    document.querySelectorAll('[data-native-doc-link]').forEach(function(link){link.href='/docs/native-0.3.0/'+suffix;});
    document.querySelectorAll('[data-verification-link]').forEach(function(link){link.href='/verification/rc24/'+suffix;});
  }
  document.addEventListener('odre:language',render);render();
})();
