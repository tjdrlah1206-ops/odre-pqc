/* Native portal candidate. Capabilities stay in memory; no browser storage. */
(() => {
  'use strict';
  const form = document.getElementById('nativeLicenseForm');
  if (!form) return;
  const root = document.getElementById('nativePortal');
  const $ = id => document.getElementById(id);
  const api = 'https://odreai.com/commercial/v1/native-registration/';
  const fields = ['title','intro','licenseId','licenseKey','deviceCode','verify','choose','newUnit','transfer','source','kind','normal','broken','confirm','check','verified','selected','support','waiting','committed','applied','failed','limit','expired','proof','unavailable','chooseRequired','trial'];
  const rows = {
    ko: ['Native 장치 등록 · 이전','새 서버에서 생성한 Device Code를 입력하세요. 계정이나 로그인은 필요하지 않습니다.','License ID','License Key','새 서버 Device Code','라이선스 확인','Unit 사용 방식 선택','새 Unit 사용','기존 Unit 이전','이전할 기존 설치','교체 사유','기존 장치에 접근 가능','기존 장치 접근 불가 · 고장','선택 확인','진행 상태 확인','라이선스를 확인했습니다. 사용할 방식을 직접 선택하세요.','선택을 저장했습니다. 새 서버 Native에서 같은 작업을 계속하세요.','고장 교체는 지원 승인을 기다립니다. 같은 요청을 유지하세요.','기존 Offline Lease 만료를 기다립니다. 기존 장치 키를 복사하지 마세요.','서버 처리가 확정됐습니다. Native의 검증·보호 저장 확인을 기다립니다.','Native의 Lease 저장을 확인했습니다. 설치본의 status와 Gateway → Core → Handler 점검을 완료하세요.','요청을 완료하지 못했습니다. 같은 작업의 상태를 확인하세요.','사용 가능한 Unit이 없습니다. 기존 Unit 이전 또는 추가 구매를 선택하세요.','등록 코드가 만료됐습니다. Native에서 기존 작업의 상태를 먼저 확인하세요.','장치 증명을 확인하지 못했습니다. 기존 identity를 지우지 말고 설치본을 확인하세요.','Native 등록 기능을 현재 사용할 수 없습니다. 설치 가이드나 지원을 확인하세요.','Unit 사용 방식과 필요한 설치·교체 사유를 선택하세요.','Trial 장치 이전은 지원하지 않습니다. 기존 Trial을 다시 등록하지 마세요.'],
    en: ['Native device registration and transfer','Enter the Device Code from the new server. No account or login is required.','License ID','License Key','New server Device Code','Verify license','Choose Unit usage','Use a new Unit','Transfer an existing Unit','Existing installation','Replacement reason','Old device is accessible','Old device is inaccessible or broken','Confirm selection','Check progress','License verified. Choose how to use your Unit.','Selection saved. Continue the same operation in Native on the new server.','Broken-device replacement awaits support approval. Keep the same request.','Waiting for the previous Offline Lease to expire. Do not copy device keys.','Server commit completed. Waiting for Native verification and protected storage.','Native confirmed local Lease storage. Complete status and Gateway → Core → Handler checks on the installation.','The request could not be completed. Check the same operation’s status.','No Unit is available. Choose an existing Unit transfer or purchase more capacity.','The code expired. Check the existing operation in Native first.','Device proof was rejected. Preserve the existing identity and check the installation.','Native registration is currently unavailable. Check the installation guide or contact support.','Choose Unit usage and the required installation and replacement reason.','Trial device transfer is unsupported. Do not register another Trial.'],
    ja: ['Native デバイス登録・移行','新しいサーバーの Device Code を入力してください。アカウントやログインは不要です。','License ID','License Key','新しいサーバーの Device Code','ライセンスを確認','Unit の使用方法','新しい Unit を使用','既存の Unit を移行','移行元のインストール','交換理由','旧デバイスにアクセス可能','旧デバイスにアクセス不可・故障','選択を確認','進行状況を確認','ライセンスを確認しました。Unit の使用方法を選んでください。','選択を保存しました。新しいサーバーの Native で同じ操作を続けてください。','故障交換はサポートの承認待ちです。同じリクエストを保持してください。','以前の Offline Lease の期限切れを待っています。デバイスキーをコピーしないでください。','サーバー処理を確定しました。Native の検証と保護ストレージへの保存を待っています。','Native の Lease 保存を確認しました。status と Gateway → Core → Handler を確認してください。','処理を完了できませんでした。同じ操作の状態を確認してください。','利用可能な Unit がありません。既存 Unit の移行か追加購入を選んでください。','コードの期限が切れました。まず Native の既存操作を確認してください。','デバイス証明を確認できません。既存 identity を保持し、インストールを確認してください。','Native 登録は現在利用できません。ガイドまたはサポートを確認してください。','Unit の使用方法と必要なインストール・交換理由を選んでください。','Trial のデバイス移行は未対応です。Trial を再登録しないでください。'],
    de: ['Native-Gerät registrieren oder übertragen','Geben Sie den Device Code des neuen Servers ein. Ein Konto oder Login ist nicht erforderlich.','License ID','License Key','Device Code des neuen Servers','Lizenz prüfen','Unit-Nutzung auswählen','Neue Unit verwenden','Bestehende Unit übertragen','Bisherige Installation','Grund des Wechsels','Altes Gerät ist erreichbar','Altes Gerät ist nicht erreichbar oder defekt','Auswahl bestätigen','Status prüfen','Lizenz bestätigt. Wählen Sie die Unit-Nutzung aus.','Auswahl gespeichert. Setzen Sie denselben Vorgang in Native auf dem neuen Server fort.','Der Ersatz des defekten Geräts wartet auf die Freigabe des Supports. Behalten Sie denselben Vorgang.','Die bisherige Offline Lease muss ablaufen. Kopieren Sie keine Geräteschlüssel.','Serverseitig bestätigt. Native muss die Prüfung und geschützte Speicherung bestätigen.','Native hat die Lease gespeichert. Prüfen Sie status und Gateway → Core → Handler in der Installation.','Die Anfrage konnte nicht abgeschlossen werden. Prüfen Sie denselben Vorgang.','Keine Unit verfügbar. Übertragen Sie eine bestehende Unit oder kaufen Sie zusätzliche Kapazität.','Der Code ist abgelaufen. Prüfen Sie zuerst den bestehenden Vorgang in Native.','Gerätenachweis abgelehnt. Behalten Sie die bestehende Identität und prüfen Sie die Installation.','Native-Registrierung derzeit nicht verfügbar. Prüfen Sie die Anleitung oder kontaktieren Sie den Support.','Wählen Sie Unit-Nutzung, Installation und Grund des Wechsels aus.','Trial-Geräteübertragung wird nicht unterstützt. Registrieren Sie keinen neuen Trial.'],
    es: ['Registro y traslado de dispositivo Native','Introduzca el Device Code del nuevo servidor. No se necesita cuenta ni inicio de sesión.','License ID','License Key','Device Code del nuevo servidor','Verificar licencia','Elegir uso de Unit','Usar una Unit nueva','Trasladar una Unit existente','Instalación anterior','Motivo del cambio','El dispositivo anterior está accesible','El dispositivo anterior está inaccesible o averiado','Confirmar selección','Consultar progreso','Licencia verificada. Elija cómo utilizar la Unit.','Selección guardada. Continúe la misma operación en Native en el nuevo servidor.','El cambio por avería espera aprobación del soporte. Mantenga la misma solicitud.','Esperando el vencimiento de la Offline Lease anterior. No copie claves de dispositivo.','Operación confirmada en el servidor. Esperando la verificación y el almacenamiento protegido de Native.','Native confirmó el almacenamiento de la Lease. Compruebe status y Gateway → Core → Handler en la instalación.','No se pudo completar la solicitud. Consulte el estado de la misma operación.','No hay Unit disponible. Traslade una Unit existente o compre capacidad adicional.','El código venció. Consulte primero la operación existente en Native.','Prueba del dispositivo rechazada. Conserve la identidad existente y compruebe la instalación.','El registro Native no está disponible. Consulte la guía o contacte con soporte.','Elija el uso de Unit, la instalación y el motivo necesarios.','El traslado de dispositivos Trial no está admitido. No registre otro Trial.']
  };
  fields.push('releaseInstruction','releaseDownload');
  const releaseText = {
    ko:['기존 장치의 신규 트래픽을 중지한 뒤, 요청 파일을 기존 서버의 transfer-release 작업에 사용하세요. Native는 drain 확인까지 실행 상태로 두세요. 이 파일에는 비밀키나 라이선스 키가 없습니다.','기존 장치 이전 요청 파일 받기'],
    en:['Stop incoming traffic on the old device, then use this request file with transfer-release on that server. Keep Native running until drain is confirmed. This file contains no private or license key.','Download old-device release request'],
    ja:['旧デバイスへの新規トラフィックを停止し、このファイルを旧サーバーの transfer-release に指定してください。drain 確認まで Native を実行したままにします。秘密鍵・ライセンスキーは含まれません。','旧デバイスの移行要求をダウンロード'],
    de:['Stoppen Sie neue Anfragen an das alte Gerät und verwenden Sie diese Datei dort mit transfer-release. Native muss bis zur bestätigten Entleerung weiterlaufen. Die Datei enthält keinen privaten Schlüssel oder Lizenzschlüssel.','Freigabeanfrage für das alte Gerät herunterladen'],
    es:['Detenga el tráfico entrante del dispositivo anterior y use este archivo con transfer-release en ese servidor. Mantenga Native en ejecución hasta confirmar el drenaje. El archivo no contiene claves privadas ni de licencia.','Descargar solicitud de liberación del dispositivo anterior']
  };
  for (const lang of Object.keys(rows)) rows[lang].push(...releaseText[lang]);
  fields.push('recoveryConfirm','recoverySubmit','recoveryWaiting');
  const recoveryText = {
    ko:['기존 장치에 접근할 수 없습니다. 같은 이전 요청으로 지원 승인을 요청하며 기존 Lease 만료까지 기다립니다.','접근불가 복구 요청','접근불가 복구를 요청했습니다. 새 서버 Native에서 같은 작업을 계속하여 동의를 확인한 뒤 지원 승인을 기다리세요.'],
    en:['I cannot access the old device. Request support approval for this same transfer and wait for the previous Lease to expire.','Request source recovery','Source recovery requested. Continue the same operation in Native on the new server to confirm consent, then await support approval.'],
    ja:['旧デバイスにアクセスできません。同じ移行のサポート承認を申請し、旧 Lease の期限切れを待ちます。','アクセス不可の復旧を申請','復旧を申請しました。新しいサーバーの Native で同じ操作を続けて同意を確認し、サポート承認を待ってください。'],
    de:['Ich kann das alte Gerät nicht erreichen. Für dieselbe Übertragung Supportfreigabe anfordern und den Ablauf der bisherigen Lease abwarten.','Wiederherstellung anfordern','Wiederherstellung angefordert. Bestätigen Sie denselben Vorgang in Native auf dem neuen Server und warten Sie auf die Supportfreigabe.'],
    es:['No puedo acceder al dispositivo anterior. Solicito aprobación del soporte para este mismo traslado y esperaré el vencimiento de la Lease anterior.','Solicitar recuperación','Recuperación solicitada. Continúe la misma operación en Native en el nuevo servidor para confirmar el consentimiento y espere la aprobación del soporte.']
  };
  for (const lang of Object.keys(rows)) rows[lang].push(...recoveryText[lang]);
  const oldRelease = document.createElement('section');
  oldRelease.id = 'nativeOldRelease'; oldRelease.hidden = true;
  const releaseInstruction = document.createElement('p'); releaseInstruction.dataset.native = 'releaseInstruction';
  const releaseDownload = document.createElement('button'); releaseDownload.type = 'button'; releaseDownload.dataset.native = 'releaseDownload';
  releaseDownload.id = 'nativeReleaseDownload';
  oldRelease.append(releaseInstruction, releaseDownload); root.append(oldRelease);
  const recoveryLabel = document.createElement('label');
  recoveryLabel.className = 'native-recovery-confirm';
  const recoveryCheck = document.createElement('input'); recoveryCheck.type = 'checkbox'; recoveryCheck.id = 'nativeSourceUnavailableConfirm';
  const recoveryDescription = document.createElement('span'); recoveryDescription.dataset.native = 'recoveryConfirm';
  recoveryLabel.append(recoveryCheck,recoveryDescription);
  const recoveryButton = document.createElement('button'); recoveryButton.type = 'button'; recoveryButton.id = 'nativeSourceRecovery'; recoveryButton.dataset.native = 'recoverySubmit';
  oldRelease.append(recoveryLabel,recoveryButton);
  let language = 'en', capability = null, fixedSelection = null, timer = null, checks = 0, activeMessage = null, busy = false, releaseRequest = null, pendingRecovery = null;
  const copy = key => rows[language][fields.indexOf(key)];
  const customerHelperCopy={
  "ko": {
    "intro": "새 서버에서 생성한 Device Code와 라이선스 정보를 입력하세요.",
    "licenseIdHint": "발급받은 라이선스 ID를 입력하세요.",
    "licenseKeyHint": "해당 라이선스의 키를 입력하세요.",
    "deviceCodeHint": "설치 가이드에 따라 새 서버에서 생성한 코드를 입력하세요.",
    "verified": "라이선스를 확인했습니다. 새 Unit 사용 또는 기존 Unit 이전을 선택해 주세요.",
    "selected": "선택을 저장했습니다. 새 서버의 프로그램에서 기존 요청을 이어서 진행해 주세요.",
    "waiting": "기존 서버의 오프라인 사용권 만료를 기다리고 있습니다. 만료 후 새 서버에서 보호 기능을 사용할 수 있습니다.",
    "committed": "서버 처리가 승인되었습니다. 새 서버 프로그램의 등록 완료 확인을 기다리고 있습니다.",
    "applied": "새 서버의 등록 내용을 저장했습니다. 설치 가이드에 따라 활성 상태와 정상 동작을 확인하세요.",
    "proof": "장치를 확인하지 못했습니다. 기존 설치 상태를 유지하고 설치 가이드 또는 지원 안내를 확인하세요.",
    "releaseInstruction": "기존 서버로 들어오는 새 요청을 중지하고, 설치 가이드에 따라 이 요청 파일로 이전을 확인하세요. 이전 확인이 끝날 때까지 Native 프로그램을 실행 상태로 유지해 주세요.",
    "recoveryConfirm": "기존 서버에 접근할 수 없습니다. 기존 이전 요청으로 지원 승인을 요청하고, 기존 오프라인 사용권이 남아 있다면 만료까지 기다립니다."
  },
  "en": {
    "intro": "Enter the Device Code generated on the new server and your license details.",
    "licenseIdHint": "Enter the License ID issued to you.",
    "licenseKeyHint": "Enter the key for this license.",
    "deviceCodeHint": "Enter the code generated on the new server using the installation guide.",
    "verified": "License verified. Choose a new Unit or transfer an existing Unit.",
    "selected": "Selection saved. Continue the existing request in the program on the new server.",
    "waiting": "Waiting for the previous server’s offline entitlement to expire. Protection on the new server becomes available afterwards.",
    "committed": "Server processing was approved. Waiting for the new server program to confirm registration is complete.",
    "applied": "Registration was saved on the new server. Follow the installation guide to confirm active status and normal operation.",
    "proof": "The device could not be verified. Preserve the existing installation and check the installation guide or support instructions.",
    "releaseInstruction": "Stop new requests to the previous server and follow the installation guide to confirm the transfer using this request file. Keep Native running until confirmation is complete.",
    "recoveryConfirm": "I cannot access the previous server. Request support approval for the existing transfer and wait for any remaining offline entitlement to expire."
  },
  "ja": {
    "intro": "新しいサーバーで生成したDevice Codeとライセンス情報を入力してください。",
    "licenseIdHint": "発行されたLicense IDを入力してください。",
    "licenseKeyHint": "このライセンスのキーを入力してください。",
    "deviceCodeHint": "インストールガイドに従い、新しいサーバーで生成したコードを入力してください。",
    "verified": "ライセンスを確認しました。新しいUnitの使用か既存Unitの移行を選んでください。",
    "selected": "選択を保存しました。新しいサーバーのプログラムで既存のリクエストを続けてください。",
    "waiting": "以前のサーバーのオフライン利用権の期限切れを待っています。期限が切れた後に新しいサーバーで保護機能を使用できます。",
    "committed": "サーバー側の処理が承認されました。新しいサーバーのプログラムによる登録完了の確認を待っています。",
    "applied": "新しいサーバーに登録内容を保存しました。インストールガイドに従い、有効な状態と正常動作を確認してください。",
    "proof": "デバイスを確認できませんでした。既存のインストールを保持し、インストールガイドまたはサポート案内を確認してください。",
    "releaseInstruction": "以前のサーバーへの新しいリクエストを停止し、インストールガイドに従ってこの要求ファイルで移行を確認してください。確認が完了するまでNativeを実行したままにしてください。",
    "recoveryConfirm": "以前のサーバーにアクセスできません。既存の移行のサポート承認を申請し、有効なオフライン利用権があれば期限切れまで待ちます。"
  },
  "de": {
    "intro": "Geben Sie den Device Code des neuen Servers und Ihre Lizenzdaten ein.",
    "licenseIdHint": "Geben Sie die ausgestellte License ID ein.",
    "licenseKeyHint": "Geben Sie den Schlüssel dieser Lizenz ein.",
    "deviceCodeHint": "Geben Sie den gemäß Installationsanleitung auf dem neuen Server erzeugten Code ein.",
    "verified": "Lizenz bestätigt. Wählen Sie eine neue Unit oder übertragen Sie eine bestehende Unit.",
    "selected": "Auswahl gespeichert. Setzen Sie die bestehende Anfrage im Programm auf dem neuen Server fort.",
    "waiting": "Die Offline-Nutzungsberechtigung des bisherigen Servers muss ablaufen. Danach ist der Schutz auf dem neuen Server verfügbar.",
    "committed": "Serverseitige Verarbeitung freigegeben. Das Programm auf dem neuen Server muss den Abschluss der Registrierung bestätigen.",
    "applied": "Die Registrierung wurde auf dem neuen Server gespeichert. Prüfen Sie aktiven Status und normalen Betrieb gemäß Installationsanleitung.",
    "proof": "Das Gerät konnte nicht bestätigt werden. Bewahren Sie die bestehende Installation und prüfen Sie die Installationsanleitung oder Supporthinweise.",
    "releaseInstruction": "Stoppen Sie neue Anfragen an den bisherigen Server und bestätigen Sie die Übertragung mit dieser Anfragedatei gemäß Installationsanleitung. Lassen Sie Native bis zur Bestätigung weiterlaufen.",
    "recoveryConfirm": "Ich kann den bisherigen Server nicht erreichen. Für die bestehende Übertragung Supportfreigabe anfordern und gegebenenfalls den Ablauf der Offline-Nutzungsberechtigung abwarten."
  },
  "es": {
    "intro": "Introduzca el Device Code generado en el servidor nuevo y los datos de su licencia.",
    "licenseIdHint": "Introduzca el License ID emitido.",
    "licenseKeyHint": "Introduzca la clave de esta licencia.",
    "deviceCodeHint": "Introduzca el código generado en el servidor nuevo siguiendo la guía de instalación.",
    "verified": "Licencia verificada. Elija una Unit nueva o traslade una existente.",
    "selected": "Selección guardada. Continúe la solicitud existente en el programa del servidor nuevo.",
    "waiting": "Esperando a que venza el derecho de uso sin conexión del servidor anterior. Después estará disponible la protección en el servidor nuevo.",
    "committed": "Procesamiento del servidor aprobado. Esperando que el programa del servidor nuevo confirme el registro completo.",
    "applied": "El registro se guardó en el servidor nuevo. Confirme el estado activo y el funcionamiento normal siguiendo la guía de instalación.",
    "proof": "No se pudo verificar el dispositivo. Conserve la instalación existente y consulte la guía de instalación o las instrucciones de soporte.",
    "releaseInstruction": "Detenga las solicitudes nuevas al servidor anterior y confirme el traslado con este archivo según la guía de instalación. Mantenga Native en ejecución hasta completar la confirmación.",
    "recoveryConfirm": "No puedo acceder al servidor anterior. Solicito aprobación de soporte para el traslado existente y esperaré a que venza cualquier derecho de uso sin conexión restante."
  }
};
  for(const key of ['licenseIdHint','licenseKeyHint','deviceCodeHint']) fields.push(key);
  for(const [lang,values] of Object.entries(customerHelperCopy)) for(const [key,value] of Object.entries(values)) rows[lang][fields.indexOf(key)]=value;
  function message(key, code = '') {
    activeMessage = [key, code];
    $('nativePortalMessage').textContent = copy(key) + (code ? ` (${code})` : '');
  }
  function translate() {
    const lang = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    language = rows[lang] ? lang : 'en';
    root.querySelectorAll('[data-native]').forEach(el => { el.textContent = copy(el.dataset.native); });
    if (activeMessage) message(...activeMessage);
  }
  function codeOf(data) {
    const code = data?.error?.code || data?.detail?.code || data?.code;
    return typeof code === 'string' && /^[A-Z][A-Z0-9_]{1,79}$/.test(code) ? code : 'REQUEST_FAILED';
  }
  function showError(code) {
    if (typeof code !== 'string' || !/^[A-Z][A-Z0-9_]{1,79}$/.test(code)) code = 'REQUEST_FAILED';
    const key = ({LICENSE_UNIT_LIMIT:'limit', DEVICE_CODE_EXPIRED:'expired', DEVICE_PROOF_REJECTED:'proof',
      TRIAL_TRANSFER_UNSUPPORTED:'trial', NATIVE_REGISTRATION_UNAVAILABLE:'unavailable'})[code] || 'failed';
    message(key, code);
  }
  async function post(route, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(api + route, {method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(body), credentials:'omit', cache:'no-store', redirect:'error', signal:controller.signal});
      const raw = await response.text();
      if (raw.length > 1048576) throw new Error('INVALID_RESPONSE');
      const data = JSON.parse(raw);
      if (!response.ok) throw new Error(codeOf(data));
      return data;
    } finally { clearTimeout(timeout); }
  }
  function showState(data) {
    const states = {LICENSE_VERIFIED:'verified',SELECTED:'selected',SUPPORT_PENDING:'support',WAITING_OLD_LEASE:'waiting',
      COMMITTED:'committed',APPLIED:'applied',EXPIRED:'expired',DENIED:'failed'};
    if (!capability || data.operation_id !== capability.operation_id || !states[data.state]) throw new Error('INVALID_RESPONSE');
    if (data.state === 'APPLIED' && data.local_apply_confirmed !== true) throw new Error('INVALID_RESPONSE');
    releaseRequest = null;
    if (data.old_device_release_request) {
      const request = data.old_device_release_request;
      if (data.state !== 'SELECTED' || request.operation_id !== capability.operation_id
          || typeof request.selection_hash !== 'string' || !/^[a-f0-9]{64}$/.test(request.selection_hash)
          || Object.keys(request).length !== 2) throw new Error('INVALID_RESPONSE');
      releaseRequest = {operation_id:request.operation_id,selection_hash:request.selection_hash};
    }
    oldRelease.hidden = !releaseRequest;
    if (data.source_recovery && (typeof data.source_recovery.request_id !== 'string'
        || !/^[0-9a-f-]{36}$/i.test(data.source_recovery.request_id) || typeof data.source_recovery.native_confirmed !== 'boolean')) throw new Error('INVALID_RESPONSE');
    message(data.source_recovery && data.state === 'SUPPORT_PENDING' ? 'recoveryWaiting' : states[data.state]);
    return ['APPLIED','EXPIRED','DENIED'].includes(data.state);
  }
  async function check() {
    clearTimeout(timer);
    if (!capability || busy) return;
    busy = true;
    try {
      const done = showState(await post('status', capability));
      checks += 1;
      if (!done && checks < 30) timer = setTimeout(check, 10000);
    } catch (e) { showError(e.message); }
    finally { busy = false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || fixedSelection) return;
    busy = true; clearTimeout(timer);
    $('nativeVerify').disabled = true;
    try {
      const code = $('nativeDeviceCode').value.replace(/\s/g,'').toUpperCase();
      if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) throw new Error('INVALID_DEVICE_CODE');
      const data = await post('verify', {license_id:$('nativeLicenseId').value.trim(),license_key:$('nativeLicenseKey').value.trim(),device_code:code});
      if (data.verified !== true || typeof data.operation_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(data.operation_id)
          || typeof data.portal_token !== 'string' || !/^[A-Za-z0-9_-]{43,128}$/.test(data.portal_token)
          || !Number.isInteger(data.available_units) || data.available_units < 0 || !Array.isArray(data.installations)) throw new Error('INVALID_RESPONSE');
      const options = [];
      for (const installation of data.installations) {
        if (typeof installation.installation_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(installation.installation_id)
            || !Number.isInteger(installation.unit_number) || installation.unit_number < 1
            || !/^[0-9a-f]{12}$/i.test(installation.device_fingerprint)) throw new Error('INVALID_RESPONSE');
        options.push(new Option(`Unit ${installation.unit_number} · ${installation.device_fingerprint}`, installation.installation_id));
      }
      capability = {operation_id:data.operation_id,portal_token:data.portal_token};
      $('nativeSource').replaceChildren(new Option('—',''), ...options);
      $('nativeAvailableUnits').textContent = String(data.available_units);
      $('nativeNewUnit').disabled = data.available_units === 0;
      $('nativeTransferUnit').disabled = options.length === 0;
      $('nativeChoices').hidden = false;
      $('nativeProgressCheck').hidden = false;
      if (data.confirmed_selection) {
        const choice = data.confirmed_selection;
        if (Object.keys(choice).length !== 3
            || !['TRANSFER_EXISTING','CONSUME_AVAILABLE'].includes(choice.unit_policy)
            || (choice.unit_policy === 'TRANSFER_EXISTING'
              ? (!['NORMAL','BROKEN'].includes(choice.replacement_kind) || !/^[0-9a-f-]{36}$/i.test(choice.source_installation_id || ''))
              : (choice.replacement_kind !== 'NEW' || choice.source_installation_id !== null))) throw new Error('INVALID_RESPONSE');
        fixedSelection = {...capability,...choice};
        $('nativeChoices').hidden = true;
        $('nativeChoiceInputs').disabled = true;
        showState(await post('status',capability));
        checks = 0; timer = setTimeout(check,10000);
      } else message('verified');
    } catch (e) { capability = null; $('nativeChoices').hidden = true; showError(e.message); }
    finally { $('nativeLicenseKey').value = ''; $('nativeVerify').disabled = false; busy = false; }
  });
  $('nativeChoiceForm').addEventListener('change', () => { $('nativeTransferFields').hidden = !$('nativeTransferUnit').checked; });
  $('nativeChoiceForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !capability) return;
    if (!fixedSelection) {
      const policy = root.querySelector('input[name="nativeUnitPolicy"]:checked')?.value;
      const kind = policy === 'CONSUME_AVAILABLE' ? 'NEW' : root.querySelector('input[name="nativeReplacementKind"]:checked')?.value;
      const source = policy === 'TRANSFER_EXISTING' ? $('nativeSource').value : null;
      if (!policy || !kind || (policy === 'TRANSFER_EXISTING' && !source)) { message('chooseRequired'); return; }
      fixedSelection = {...capability,unit_policy:policy,replacement_kind:kind,source_installation_id:source};
    }
    busy = true;
    $('nativeChoiceInputs').disabled = true;
    try {
      const data = await post('select', fixedSelection);
      showState(data.state === 'APPLIED' ? await post('status', capability) : data);
      checks = 0; timer = setTimeout(check, 10000);
    } catch (e) {
      if (e.message === 'LICENSE_UNIT_LIMIT') {
        fixedSelection = null;
        $('nativeChoiceInputs').disabled = false;
        $('nativeNewUnit').checked = false;
        $('nativeNewUnit').disabled = true;
        $('nativeAvailableUnits').textContent = '0';
      }
      showError(e.message);
    }
    finally { busy = false; }
  });
  $('nativeProgressCheck').addEventListener('click', () => { checks = 0; check(); });
  releaseDownload.addEventListener('click', () => {
    if (!releaseRequest) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(releaseRequest,null,2)+'\n'],{type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'odre-device-transfer-request.json';
    link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  });
  recoveryButton.addEventListener('click', async () => {
    if (busy || !capability || !releaseRequest || !recoveryCheck.checked) return;
    // Preserve the exact request after an ambiguous network failure. This does
    // not change the selected Unit, source installation or replacement choice.
    if (!pendingRecovery) pendingRecovery = {...capability,selection_hash:releaseRequest.selection_hash,confirm_source_unavailable:true};
    busy = true; recoveryButton.disabled = true; clearTimeout(timer);
    try {
      const data = await post('source-unavailable',pendingRecovery);
      if (data.operation_id !== capability.operation_id || typeof data.recovery_request_id !== 'string'
          || !/^[0-9a-f-]{36}$/i.test(data.recovery_request_id)) throw new Error('INVALID_RESPONSE');
      showState(await post('status',capability));
      checks = 0; timer = setTimeout(check,10000);
    } catch (e) { showError(e.message); }
    finally { busy = false; recoveryButton.disabled = false; }
  });
  document.addEventListener('odre:language', translate);
  new MutationObserver(translate).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  window.addEventListener('pagehide', () => { clearTimeout(timer); capability = null; fixedSelection = null; releaseRequest = null; pendingRecovery = null; $('nativeLicenseKey').value = ''; });
  translate();
})();
