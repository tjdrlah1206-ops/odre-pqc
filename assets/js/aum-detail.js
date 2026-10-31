(function () {
  'use strict';
  var panel = document.getElementById('aum-detail-panel');
  var content = document.querySelector('[data-aum-detail-content]');
  var openButton = document.querySelector('.aum-detail-open');
  var closeButton = document.querySelector('.aum-detail-close');
  if (!panel || !content || !openButton || !closeButton) return;

  var translations = {
    en: {
      close:'Close', definition:'AUM — Automatic Update Management', definitionBody:'AUM is the customer-facing update capability and contract. It discovers approved ODRE PQC Release candidates, verifies them against the existing signed authority, ordering and compatibility rules, and permits only validated updates. An incomplete, altered, duplicate or lower-generation candidate fails closed without changing the active customer product.',
      sections:[
        ['AUM scope','Discover an approved release; verify signature, manifest, inventory, SHA-256, envelope, release order and compatibility; reject partial, altered, duplicate and lower-generation candidates; and apply only an update allowed by the customer contract.'],
        ['AUM core principle','Unverified updates never apply. A filename or apparent recency is not authority, and a verification failure is never converted into success.'],
        ['FULL AUM definition','FULL AUM runs on the ODRE PQC operating server and extends the same signed verification foundation across preparation, atomic transition, post-switch verification, automatic rollback, crash recovery, restart recovery and durable lifecycle state. It is not a separate or weaker verification system.'],
        ['1. Release discovery and input stability','Only the approved update input is inspected. A candidate is not trusted because a ZIP exists or its size appears stable: signed manifest, envelope, inventory, expected SHA-256, Product Release and compatibility authority must all agree. A partially copied artifact is not applied.'],
        ['2. Single writer','Only one apply transaction may own the update lifecycle. Periodic checks, manual invocation and service restart cannot create duplicate writers; lock failure produces no apply and no active-product change.'],
        ['3. Pre-switch safety checks','Before staging or switching, FULL AUM verifies staging capacity, rollback capacity, current release authority, policy generation, consumer pin and previous known-good assets. Rollback material is never deleted to make room for a new candidate.'],
        ['4. Verified staging','Only a verified candidate is prepared in isolated staging. Every required file is compared with the signed inventory and hash authority; missing, unexpected, altered or signature-invalid content is rejected before the active release changes.'],
        ['5. Atomic switch','Product, policy and consumer pin move as one consistent authority. A customer cannot observe a partial combination, and COMMITTED is never written before the switch and its required checks are complete.'],
        ['6. Post-switch verification','The actual current release, version, policy generation, consumer pin, runtime identity, Native/Gateway readiness, health and protected-request path are checked. A simple listener or HTTP 200 is not expanded into a security PASS.'],
        ['7. Automatic rollback','If post-switch health, protected request, runtime identity or authority synchronization fails, commit is prohibited. FULL AUM restores the previous product, policy, consumer pin, runtime identity and rollback metadata, then rechecks readiness, health and the protected path before recording ROLLED_BACK.'],
        ['8. Automatic failure recovery','After interruption in VERIFYING, STAGING, PREPARED, SWITCHING, VERIFYING_HEALTH, COMMITTING or ROLLING_BACK, durable state, journal, filesystem pointers and runtime authority are compared. Recovery safely resumes a verified phase or restores the previous known-good release; partial state is never promoted to COMMITTED.'],
        ['9. PREPARE crash recovery','A release directory left between directory creation and the PREPARED record is inspected rather than rejected merely because it exists. A complete directory for the same verified candidate is recovered idempotently; partial or untrusted content fails closed under the existing isolation policy.'],
        ['10. Durable journal and atomic status','Transaction phases are durably journaled. Canonical status is written by atomic replacement so truncated or partial JSON, a COMMITTED status that contradicts the journal, or a stale COMMITTED status after rollback is not exposed. Status-write failure is not hidden.'],
        ['11. Post-commit durability','After process restart, current and previous release, committed floor, product version, policy generation, consumer-pin synchronization, runtime identity and rollback metadata are reconstructed and compared. A commit is retained only when the durable and active authorities agree.'],
        ['12. Periodic committed-artifact integrity','The committed ZIP or artifact, sidecar where applicable, canonical expected SHA-256, manifest, inventory and identity are periodically rechecked. Same-size byte tampering is detected by hash, and no new hash authority is invented.'],
        ['13. Rollback-asset protection','Previous release artifacts, policy, consumer pin, known-good runtime identity, rollback metadata, journal and failure evidence remain protected. New staging cannot consume or delete the assets required for recovery.'],
        ['14. Canonical lifecycle state','The lifecycle distinguishes IDLE, DISCOVERED, VERIFYING, REJECTED, STAGING, PREPARED, SWITCHING, VERIFYING_HEALTH, COMMITTING, COMMITTED, ROLLING_BACK, ROLLED_BACK, RECOVERING and RECOVERY_FAILED. The state represents durable transaction truth, not a raw log or an optimistic success message.'],
        ['15. Normal flow','DISCOVER → VERIFY INPUT STABILITY → VERIFY SIGNED AUTHORITY → CHECK RELEASE ORDER → ACQUIRE SINGLE-WRITER LOCK → CHECK CAPACITY → STAGE → PRE-SWITCH VERIFY → PREPARED → ATOMIC SWITCH → RUNTIME READINESS → HEALTH AND PROTECTED-REQUEST VERIFY → DURABLE COMMIT → RESTART RECOVERY CHECK → COMMITTED.'],
        ['16. Failure and rollback flow','DISCOVER → VERIFY → STAGE → ATOMIC SWITCH → REQUIRED CHECK FAIL → COMMIT PROHIBITED → ROLLING_BACK → RESTORE PREVIOUS PRODUCT/POLICY/PIN/RUNTIME → REVERIFY HEALTH AND PROTECTED REQUEST → ROLLED_BACK. The initial failure and corrective evidence are retained.'],
        ['17. Process-crash recovery flow','PROCESS RESTART → READ DURABLE JOURNAL → INSPECT ACTUAL POINTERS → COMPARE PRODUCT/POLICY/PIN/RUNTIME → DETERMINE TRANSACTION PHASE → SAFE RESUME OR AUTOMATIC ROLLBACK → REVERIFY HEALTH → REBUILD CANONICAL STATE → COMMITTED OR ROLLED_BACK.'],
        ['Contract boundary','FULL AUM-related modules may physically exist in the customer delivery. That does not change the contract: the customer is exposed to AUM, while the ODRE PQC operating server executes the complete FULL AUM lifecycle on the same signed verification foundation.']
        ,['AUM / FULL AUM difference','AUM is the customer-facing contract that selects, verifies and permits approved updates. FULL AUM is the ODRE operating-server transaction lifecycle that adds single-writer staging, atomic switch, verification, automatic rollback and durable recovery to the same verification base.']
        ,['One-line summary','AUM safely permits verified customer updates; FULL AUM completes and recovers the entire ODRE server update transaction.']
      ]
    },
    ko: {
      close:'닫기',definition:'AUM — Automatic Update Management',definitionBody:'AUM은 고객에게 노출되는 업데이트 기능 및 계약입니다. 승인된 ODRE PQC Release 후보를 발견하고 기존 signed authority, release ordering 및 compatibility 규칙으로 검증하여 허용된 업데이트만 적용합니다. 불완전·변조·중복·낮은 generation 후보는 활성 고객 제품을 변경하지 않고 Fail-Closed로 거부합니다.',
      sections:[
        ['AUM 주요 범위','승인된 Release 발견, signature·manifest·inventory·SHA-256·envelope·release ordering·compatibility 검증, partial·변조·중복·낮은 generation 거부와 고객 계약상 허용된 update 적용을 포함합니다.'],
        ['AUM 핵심 원칙','검증되지 않은 update는 적용하지 않습니다. 파일명이나 최신처럼 보이는 상태는 authority가 아니며 verification failure를 성공으로 변환하지 않습니다.'],
        ['FULL AUM 정의','FULL AUM은 ODRE PQC 운영 서버에서 동일 signed verification 기반을 준비, atomic transition, post-switch verification, automatic rollback, crash/restart recovery와 durable lifecycle state 전체로 확장합니다. 별도이거나 약화된 검증 시스템이 아닙니다.'],
        ['1. Release 발견 및 입력 안정성','승인된 update input만 조사합니다. ZIP 존재나 크기 안정성만으로 신뢰하지 않으며 signed manifest, envelope, inventory, expected SHA-256, Product Release와 compatibility authority가 모두 일치해야 합니다. 복사 중인 artifact는 적용하지 않습니다.'],
        ['2. Single Writer','실제 apply transaction은 하나만 lifecycle을 소유합니다. 주기 실행, 수동 실행과 service restart가 겹쳐도 중복 writer를 만들지 않으며 lock 실패 시 apply와 활성 제품 변경은 0입니다.'],
        ['3. Pre-Switch 안전 검사','staging 또는 switch 전에 staging·rollback 용량, current release authority, policy generation, consumer pin과 previous known-good 자산을 확인합니다. 새 candidate 공간을 위해 rollback 자산을 삭제하지 않습니다.'],
        ['4. Verified Staging','검증된 candidate만 격리 staging에 준비합니다. 필수 파일을 signed inventory와 hash authority에 대조하며 누락, 예상 밖 파일, 변조 또는 signature 실패는 active release 변경 전에 거부합니다.'],
        ['5. Atomic Switch','Product, Policy와 Consumer Pin을 하나의 일관된 authority로 전환합니다. 고객에게 부분 조합을 노출하지 않으며 switch와 필수 검증 완료 전에는 COMMITTED를 기록하지 않습니다.'],
        ['6. Post-Switch 검증','실제 current release, version, policy generation, consumer pin, runtime identity, Native/Gateway readiness, health와 protected request 경로를 확인합니다. listener 또는 HTTP 200만으로 보안 PASS를 확대하지 않습니다.'],
        ['7. 자동 롤백','switch 후 health, protected request, runtime identity 또는 authority 동기화가 실패하면 COMMIT을 금지합니다. 이전 Product, Policy, Consumer Pin, runtime identity와 rollback metadata를 복원하고 readiness, health, protected path를 재검증한 뒤 ROLLED_BACK을 기록합니다.'],
        ['8. 자동 장애 복구','VERIFYING, STAGING, PREPARED, SWITCHING, VERIFYING_HEALTH, COMMITTING 또는 ROLLING_BACK 중 중단되면 durable state, journal, filesystem pointer와 runtime authority를 비교합니다. 검증된 단계는 안전하게 재개하고 아니면 previous known-good release를 복원하며 partial state를 COMMITTED로 승격하지 않습니다.'],
        ['9. PREPARE Crash Recovery','directory 생성과 PREPARED 기록 사이에 남은 release directory는 존재 자체로 거부하지 않고 검사합니다. 동일 verified candidate의 완전한 directory는 idempotent recovery하고 partial/untrusted content는 기존 격리 정책으로 Fail-Closed 처리합니다.'],
        ['10. Durable Journal 및 Atomic Status','transaction 단계를 durable journal에 기록합니다. canonical status는 atomic replace로 기록하여 잘린 JSON, partial JSON, journal과 모순되는 COMMITTED 또는 rollback 후 남은 COMMITTED를 노출하지 않습니다. status write 실패도 숨기지 않습니다.'],
        ['11. Post-Commit Durability','process restart 후 current/previous release, committed floor, product version, policy generation, consumer-pin synchronization, runtime identity와 rollback metadata를 복원·대조합니다. durable authority와 active authority가 일치할 때만 COMMITTED를 유지합니다.'],
        ['12. Committed Artifact 주기적 무결성','committed ZIP 또는 artifact, 해당 sidecar, canonical expected SHA-256, manifest, inventory와 identity를 주기적으로 재확인합니다. 동일 크기 byte 변조도 hash로 검출하며 새로운 hash authority를 만들지 않습니다.'],
        ['13. Rollback 자산 보호','Previous Release artifact, Policy, Consumer Pin, known-good runtime identity, rollback metadata, journal과 최초 실패 Evidence를 보호합니다. 새 staging이 복구 자산을 사용하거나 삭제할 수 없습니다.'],
        ['14. Canonical Lifecycle State','IDLE, DISCOVERED, VERIFYING, REJECTED, STAGING, PREPARED, SWITCHING, VERIFYING_HEALTH, COMMITTING, COMMITTED, ROLLING_BACK, ROLLED_BACK, RECOVERING, RECOVERY_FAILED를 구분합니다. 상태는 raw log나 낙관적 성공 문구가 아니라 durable transaction 사실을 나타냅니다.'],
        ['15. 전체 정상 흐름','DISCOVER → VERIFY INPUT STABILITY → VERIFY SIGNED AUTHORITY → CHECK RELEASE ORDER → ACQUIRE SINGLE-WRITER LOCK → CHECK CAPACITY → STAGE → PRE-SWITCH VERIFY → PREPARED → ATOMIC SWITCH → RUNTIME READINESS → HEALTH/PROTECTED REQUEST VERIFY → DURABLE COMMIT → RESTART RECOVERY CHECK → COMMITTED.'],
        ['16. 실패 및 자동 롤백 흐름','DISCOVER → VERIFY → STAGE → ATOMIC SWITCH → 필수 검증 FAIL → COMMIT 금지 → ROLLING_BACK → 이전 PRODUCT/POLICY/PIN/RUNTIME 복원 → HEALTH/PROTECTED REQUEST 재검증 → ROLLED_BACK. 최초 실패와 수정 Evidence를 보존합니다.'],
        ['17. Process Crash 자동복구 흐름','PROCESS RESTART → DURABLE JOURNAL READ → ACTUAL POINTER 확인 → PRODUCT/POLICY/PIN/RUNTIME 비교 → TRANSACTION PHASE 판정 → 안전한 재개 또는 자동 롤백 → HEALTH 재검증 → CANONICAL STATE 재구성 → COMMITTED 또는 ROLLED_BACK.'],
        ['계약 경계','고객 배포본에 FULL AUM 관련 모듈이 물리적으로 포함될 수 있습니다. 그러나 계약은 변하지 않습니다. 고객에게 노출되는 업데이트 기능은 AUM이고, ODRE PQC 운영 서버는 동일 signed verification 기반에서 FULL AUM 전체 lifecycle을 실행합니다.']
        ,['AUM / FULL AUM 차이','AUM은 승인된 업데이트를 선택·검증·허용하는 고객 노출 계약입니다. FULL AUM은 같은 검증 기반에 single-writer staging, atomic switch, 사후 검증, automatic rollback과 durable recovery를 결합한 ODRE 운영 서버 transaction lifecycle입니다.']
        ,['최종 한 줄 요약','AUM은 검증된 고객 업데이트를 안전하게 허용하고, FULL AUM은 ODRE 서버 업데이트 transaction 전체를 완결하고 자동 복구합니다.']
      ]
    },
    ja: {
      close:'閉じる',definition:'AUM — Automatic Update Management',definitionBody:'AUMは顧客に公開される更新機能と契約です。承認済みODRE PQC Release候補を検出し、既存の署名authority、release ordering、compatibility規則で検証して許可された更新だけを適用します。不完全・改ざん・重複・低generationの候補は現行製品を変更せずFail-Closedで拒否します。',
      sections:[
        ['AUMの主要範囲','承認済みReleaseの検出、signature・manifest・inventory・SHA-256・envelope・release ordering・compatibility検証、partial・改ざん・重複・低generation拒否、顧客契約で許可されたupdate適用を含みます。'],
        ['AUMの基本原則','未検証updateは適用しません。ファイル名や新しさはauthorityではなく、verification failureを成功に変換しません。'],
        ['FULL AUMの定義','FULL AUMはODRE PQC運用サーバーで同じsigned verification基盤を準備、atomic transition、post-switch verification、automatic rollback、crash/restart recovery、durable lifecycle state全体へ拡張します。別の検証システムではありません。'],
        ['1. Release検出と入力安定性','承認済みinputだけを調査します。ZIPの存在やサイズ安定だけでは信頼せず、signed manifest、envelope、inventory、expected SHA-256、Product Release、compatibility authorityの全一致を要求し、コピー途中のartifactは適用しません。'],
        ['2. Single Writer','apply transactionのwriterは常に1つです。定期実行・手動実行・service restartが重なっても重複writerを作らず、lock失敗時はapplyも現行製品変更も行いません。'],
        ['3. Pre-Switch安全検査','staging/rollback容量、current release authority、policy generation、consumer pin、previous known-good資産をswitch前に確認し、新候補のためにrollback資産を削除しません。'],
        ['4. Verified Staging','検証済み候補だけを隔離stagingに準備します。必須ファイルをsigned inventoryとhash authorityに照合し、欠落・余分・改ざん・署名失敗をactive release変更前に拒否します。'],
        ['5. Atomic Switch','Product、Policy、Consumer Pinを一貫したauthorityとして同時に切り替えます。部分的な組合せを公開せず、switchと必須検証完了前にCOMMITTEDを記録しません。'],
        ['6. Post-Switch検証','current release、version、policy generation、consumer pin、runtime identity、Native/Gateway readiness、health、protected requestを確認します。listenerやHTTP 200だけをsecurity PASSに拡大しません。'],
        ['7. 自動Rollback','health、protected request、runtime identityまたはauthority同期が失敗すればCOMMITを禁止します。以前のProduct/Policy/Pin/runtime/metadataを復元し、readiness・health・protected pathを再検証してROLLED_BACKを記録します。'],
        ['8. 自動障害Recovery','各transaction段階で中断した場合、durable state、journal、filesystem pointer、runtime authorityを比較します。検証済み段階を安全に再開するかprevious known-goodへ戻し、partial stateをCOMMITTEDにしません。'],
        ['9. PREPARE Crash Recovery','PREPARED記録前に残ったrelease directoryを存在だけで拒否しません。同一verified candidateの完全なdirectoryはidempotent recoveryし、partial/untrusted内容は既存隔離契約でFail-Closedにします。'],
        ['10. Durable JournalとAtomic Status','段階をdurable journalへ記録し、canonical statusはatomic replaceします。破損JSON、journalと矛盾するCOMMITTED、rollback後の古いCOMMITTEDを公開せず、status write失敗も隠しません。'],
        ['11. Post-Commit Durability','process restart後にcurrent/previous release、committed floor、version、policy、pin、runtime identity、rollback metadataを復元・比較し、durable authorityとactive authorityが一致する場合だけCOMMITTEDを維持します。'],
        ['12. Committed Artifactの定期Integrity','artifact、sidecar、canonical SHA-256、manifest、inventory、identityを定期再検証します。同サイズ改ざんもhashで検出し、新しいhash authorityを作りません。'],
        ['13. Rollback資産保護','Previous Release、Policy、Pin、known-good runtime、rollback metadata、journal、失敗Evidenceを保護し、新stagingによる消費・削除を許可しません。'],
        ['14. Canonical Lifecycle State','IDLEからRECOVERY_FAILEDまで各状態を区別します。状態はraw logや楽観的成功表示ではなくdurable transactionの事実です。'],
        ['15. 正常フロー','DISCOVER → INPUT/SIGNED AUTHORITY/ORDER検証 → SINGLE-WRITER LOCK → CAPACITY → STAGE → PRE-SWITCH VERIFY → PREPARED → ATOMIC SWITCH → READINESS → HEALTH/PROTECTED REQUEST → DURABLE COMMIT → RESTART RECOVERY CHECK → COMMITTED。'],
        ['16. 失敗と自動Rollbackフロー','VERIFY/STAGE/SWITCH後の必須検証FAIL → COMMIT禁止 → ROLLING_BACK → 以前のPRODUCT/POLICY/PIN/RUNTIME復元 → HEALTH/PROTECTED REQUEST再検証 → ROLLED_BACK。初回失敗Evidenceを保持します。'],
        ['17. Process Crash自動Recoveryフロー','PROCESS RESTART → JOURNAL READ → POINTER確認 → PRODUCT/POLICY/PIN/RUNTIME比較 → PHASE判定 → 安全な再開または自動Rollback → HEALTH再検証 → STATE再構築 → COMMITTEDまたはROLLED_BACK。'],
        ['契約境界','顧客配布物にFULL AUM関連moduleが物理的に含まれる場合がありますが契約は変わりません。顧客公開機能はAUM、ODRE PQC運用serverは同じ署名検証基盤上でFULL AUM全lifecycleを実行します。']
        ,['AUM / FULL AUMの違い','AUMは承認済みupdateを選択・検証・許可する顧客向け契約です。FULL AUMは同じ検証基盤にsingle-writer staging、atomic switch、事後検証、automatic rollback、durable recoveryを加えたODRE運用server transaction lifecycleです。']
        ,['一行要約','AUMは検証済み顧客updateを安全に許可し、FULL AUMはODRE server update transaction全体を完結・自動復旧します。']
      ]
    },
    de: {
      close:'Schließen',definition:'AUM — Automatic Update Management',definitionBody:'AUM ist die kundenseitige Updatefunktion und der zugehörige Vertrag. Freigegebene ODRE-PQC-Release-Kandidaten werden anhand der bestehenden signierten Authority, Reihenfolge- und Kompatibilitätsregeln geprüft; nur zulässige Updates werden angewendet. Unvollständige, manipulierte, doppelte oder niedrigere Kandidaten werden ohne Änderung des aktiven Kundenprodukts fail-closed abgewiesen.',
      sections:[
        ['AUM-Umfang','Erkennung freigegebener Releases; Prüfung von Signature, Manifest, Inventory, SHA-256, Envelope, Release Ordering und Compatibility; Ablehnung partieller, manipulierter, doppelter und niedrigerer Kandidaten; Anwendung nur vertraglich zulässiger Updates.'],
        ['AUM-Kernprinzip','Unverifizierte Updates werden nicht angewendet. Dateiname oder scheinbare Aktualität sind keine Authority; Verification Failure wird nie zu Erfolg umgedeutet.'],
        ['FULL-AUM-Definition','FULL AUM erweitert auf dem ODRE-PQC-Betriebsserver dieselbe Signed-Verification-Basis um Vorbereitung, Atomic Transition, Post-Switch Verification, Automatic Rollback, Crash/Restart Recovery und Durable Lifecycle State. Es ist kein getrenntes Prüfsystem.'],
        ['1. Release-Erkennung und Eingangsstabilität','Nur der freigegebene Eingang wird geprüft. ZIP-Existenz oder stabile Größe reichen nicht: Signed Manifest, Envelope, Inventar, erwarteter SHA-256, Product Release und Compatibility Authority müssen übereinstimmen; teilweise kopierte Artefakte werden nicht angewendet.'],
        ['2. Single Writer','Genau ein Writer besitzt die Apply-Transaktion. Zeitplan, manueller Aufruf und Service-Neustart erzeugen keine Doppelanwendung; ein fehlgeschlagener Lock ändert das aktive Produkt nicht.'],
        ['3. Pre-Switch-Sicherheitsprüfung','Staging- und Rollback-Kapazität, aktuelle Authority, Policy Generation, Consumer Pin und Previous-known-good-Assets werden vorab geprüft. Rollback-Material wird nie für Staging-Platz gelöscht.'],
        ['4. Verifiziertes Staging','Nur verifizierte Kandidaten gelangen in isoliertes Staging. Pflichtdateien werden gegen signiertes Inventar und Hash-Authority geprüft; fehlende, zusätzliche, veränderte oder signaturungültige Inhalte werden vor Änderung des Active Release abgewiesen.'],
        ['5. Atomic Switch','Product, Policy und Consumer Pin wechseln als konsistente Authority. Teilzustände werden nicht sichtbar und COMMITTED wird erst nach Switch und Pflichtprüfungen geschrieben.'],
        ['6. Post-Switch-Verifikation','Current Release, Version, Policy, Pin, Runtime Identity, Native/Gateway Readiness, Health und Protected Request werden geprüft. Listener oder HTTP 200 allein werden nicht zum Security PASS erweitert.'],
        ['7. Automatischer Rollback','Bei Fehlern in Health, Protected Request, Runtime Identity oder Authority-Synchronität ist COMMIT verboten. Previous Product/Policy/Pin/Runtime/Metadata werden wiederhergestellt und Readiness, Health und Protected Path vor ROLLED_BACK erneut geprüft.'],
        ['8. Automatische Fehler-Recovery','Nach Unterbrechung einer Transaktionsphase werden Durable State, Journal, Pointer und Runtime Authority verglichen. Eine verifizierte Phase wird sicher fortgesetzt oder Previous Known-good wiederhergestellt; Partial State wird nie COMMITTED.'],
        ['9. PREPARE-Crash-Recovery','Ein vor PREPARED verbliebenes Release-Verzeichnis wird geprüft statt nur wegen seiner Existenz abgewiesen. Ein vollständiger gleicher Verified Candidate wird idempotent fortgesetzt; partielle oder nicht vertrauenswürdige Inhalte scheitern fail-closed.'],
        ['10. Durable Journal und Atomic Status','Phasen werden dauerhaft protokolliert und Canonical Status atomar ersetzt. Abgeschnittenes JSON, Widerspruch zum Journal oder veraltetes COMMITTED nach Rollback werden nicht veröffentlicht; Write-Fehler bleiben sichtbar.'],
        ['11. Post-Commit-Durability','Nach Process Restart werden Current/Previous Release, Committed Floor, Version, Policy, Pin, Runtime Identity und Rollback Metadata rekonstruiert. COMMITTED bleibt nur bei identischer durable und active Authority bestehen.'],
        ['12. Periodische Integritätsprüfung','Committed Artifact, Sidecar, erwarteter SHA-256, Manifest, Inventar und Identity werden regelmäßig geprüft. Gleich große Byte-Manipulation wird per Hash erkannt; keine neue Hash-Authority wird erfunden.'],
        ['13. Schutz der Rollback-Assets','Previous Release, Policy, Pin, Known-good Runtime, Rollback Metadata, Journal und Failure Evidence bleiben geschützt und dürfen nicht durch neues Staging verbraucht oder gelöscht werden.'],
        ['14. Canonical Lifecycle State','IDLE bis RECOVERY_FAILED werden eindeutig unterschieden. Der Status zeigt die dauerhafte Transaktionswahrheit, nicht Raw Logs oder optimistische Erfolgsmeldungen.'],
        ['15. Normaler Ablauf','DISCOVER → INPUT/SIGNED AUTHORITY/ORDER VERIFY → SINGLE-WRITER LOCK → CAPACITY → STAGE → PRE-SWITCH VERIFY → PREPARED → ATOMIC SWITCH → READINESS → HEALTH/PROTECTED REQUEST → DURABLE COMMIT → RESTART RECOVERY CHECK → COMMITTED.'],
        ['16. Fehler- und Rollback-Ablauf','Pflichtprüfung FAIL → COMMIT verboten → ROLLING_BACK → Previous PRODUCT/POLICY/PIN/RUNTIME wiederherstellen → HEALTH/PROTECTED REQUEST erneut prüfen → ROLLED_BACK. Initial Failure Evidence bleibt erhalten.'],
        ['17. Process-Crash-Recovery-Ablauf','PROCESS RESTART → JOURNAL READ → POINTER INSPECT → PRODUCT/POLICY/PIN/RUNTIME COMPARE → PHASE DETERMINE → SAFE RESUME oder AUTOMATIC ROLLBACK → HEALTH VERIFY → STATE REBUILD → COMMITTED oder ROLLED_BACK.'],
        ['Vertragsgrenze','FULL-AUM-Module dürfen physisch in der Kundenauslieferung enthalten sein. Der Vertrag bleibt: Kunden sehen AUM; der ODRE-PQC-Betriebsserver führt auf derselben signierten Verifikationsbasis den vollständigen FULL-AUM-Lifecycle aus.']
        ,['Unterschied AUM / FULL AUM','AUM ist der kundenseitige Vertrag für Auswahl, Prüfung und Zulassung freigegebener Updates. FULL AUM ist der ODRE-Betriebsserver-Transaction-Lifecycle mit Single-Writer Staging, Atomic Switch, Nachprüfung, Automatic Rollback und Durable Recovery auf derselben Basis.']
        ,['Zusammenfassung','AUM erlaubt verifizierte Kundenupdates sicher; FULL AUM vollendet und rekonstruiert die gesamte ODRE-Server-Update-Transaktion.']
      ]
    },
    es: {
      close:'Cerrar',definition:'AUM — Automatic Update Management',definitionBody:'AUM es la función y el contrato de actualización expuestos al cliente. Detecta Releases aprobadas de ODRE PQC, las verifica con la authority firmada y las reglas de orden y compatibilidad existentes, y permite solo actualizaciones válidas. Un candidato incompleto, alterado, duplicado o inferior se rechaza fail-closed sin cambiar el producto activo.',
      sections:[
        ['Alcance de AUM','Descubre Releases aprobadas; verifica signature, manifest, inventory, SHA-256, envelope, release ordering y compatibility; rechaza candidatos parciales, alterados, duplicados o inferiores; y aplica solo updates permitidos por el contrato.'],
        ['Principio esencial de AUM','Una actualización no verificada nunca se aplica. El nombre o la aparente novedad no son authority y un verification failure nunca se convierte en éxito.'],
        ['Definición de FULL AUM','FULL AUM extiende en el servidor operativo ODRE PQC la misma base signed verification a preparación, atomic transition, post-switch verification, automatic rollback, crash/restart recovery y durable lifecycle state. No es un sistema de verificación separado.'],
        ['1. Detección y estabilidad de entrada','Solo se inspecciona la entrada aprobada. La existencia o tamaño estable del ZIP no basta: signed manifest, envelope, inventory, SHA-256 esperado, Product Release y compatibility authority deben coincidir; un artefacto en copia no se aplica.'],
        ['2. Single Writer','Solo un writer posee la transacción apply. La ejecución periódica, manual y el reinicio del servicio no producen duplicados; si falla el lock no hay apply ni cambio del producto activo.'],
        ['3. Comprobación Pre-Switch','Antes del cambio se verifican capacidad de staging/rollback, authority actual, policy generation, consumer pin y assets previous known-good. Nunca se eliminan assets de rollback para crear espacio.'],
        ['4. Staging verificado','Solo un candidato verificado entra en staging aislado. Cada archivo se compara con inventory y hash authority firmados; faltantes, extras, alteraciones o firma inválida se rechazan antes de cambiar el release activo.'],
        ['5. Atomic Switch','Product, Policy y Consumer Pin cambian como una authority coherente. No se expone una combinación parcial ni se registra COMMITTED antes del cambio y las verificaciones obligatorias.'],
        ['6. Verificación Post-Switch','Se verifican current release, versión, policy, pin, runtime identity, Native/Gateway readiness, health y protected request. Un listener o HTTP 200 no se amplía a Security PASS.'],
        ['7. Rollback automático','Si falla health, protected request, runtime identity o sincronización de authority, COMMIT queda prohibido. Se restauran Product/Policy/Pin/Runtime/Metadata anteriores y se reverifican readiness, health y protected path antes de ROLLED_BACK.'],
        ['8. Recovery automático','Tras una interrupción se comparan durable state, journal, pointers y runtime authority. Se reanuda una fase verificada o se restaura previous known-good; un estado parcial nunca se convierte en COMMITTED.'],
        ['9. PREPARE Crash Recovery','Un directorio dejado antes de PREPARED se inspecciona. Si corresponde al mismo candidato verificado y está completo se recupera de forma idempotente; contenido parcial o no confiable se rechaza fail-closed.'],
        ['10. Durable Journal y Atomic Status','Las fases se registran de forma durable y el estado canónico se reemplaza atómicamente. No se exponen JSON parciales, COMMITTED contradictorio ni COMMITTED obsoleto tras rollback; los fallos de escritura no se ocultan.'],
        ['11. Durabilidad Post-Commit','Tras reiniciar se reconstruyen Current/Previous Release, Committed Floor, versión, policy, pin, runtime identity y rollback metadata. COMMITTED continúa solo si las authorities durable y activa coinciden.'],
        ['12. Integridad periódica','Artifact committed, sidecar, SHA-256 esperado, manifest, inventory e identity se revisan periódicamente. La alteración del mismo tamaño se detecta por hash y no se inventa una nueva authority.'],
        ['13. Protección de assets de rollback','Previous Release, Policy, Pin, runtime known-good, rollback metadata, journal y failure Evidence se protegen; el staging nuevo no puede consumirlos ni eliminarlos.'],
        ['14. Canonical Lifecycle State','Se distinguen IDLE, DISCOVERED, VERIFYING, REJECTED, STAGING, PREPARED, SWITCHING, VERIFYING_HEALTH, COMMITTING, COMMITTED, ROLLING_BACK, ROLLED_BACK, RECOVERING y RECOVERY_FAILED. Es verdad durable, no un log o éxito optimista.'],
        ['15. Flujo normal','DISCOVER → VERIFY INPUT/SIGNED AUTHORITY/ORDER → SINGLE-WRITER LOCK → CAPACITY → STAGE → PRE-SWITCH VERIFY → PREPARED → ATOMIC SWITCH → READINESS → HEALTH/PROTECTED REQUEST → DURABLE COMMIT → RESTART RECOVERY CHECK → COMMITTED.'],
        ['16. Flujo de fallo y rollback','Verificación obligatoria FAIL → COMMIT prohibido → ROLLING_BACK → restaurar PRODUCT/POLICY/PIN/RUNTIME anterior → reverificar HEALTH/PROTECTED REQUEST → ROLLED_BACK. Se conserva el Evidence del fallo inicial.'],
        ['17. Flujo de Process Crash Recovery','PROCESS RESTART → JOURNAL READ → POINTER INSPECT → PRODUCT/POLICY/PIN/RUNTIME COMPARE → PHASE DETERMINE → SAFE RESUME o AUTOMATIC ROLLBACK → HEALTH VERIFY → STATE REBUILD → COMMITTED o ROLLED_BACK.'],
        ['Límite contractual','Los módulos de FULL AUM pueden existir físicamente en la entrega al cliente. El contrato no cambia: el cliente ve AUM y el servidor operativo ODRE PQC ejecuta el lifecycle FULL AUM completo sobre la misma base de verificación firmada.']
        ,['Diferencia AUM / FULL AUM','AUM es el contrato del cliente que selecciona, verifica y permite updates aprobados. FULL AUM es el transaction lifecycle del servidor operativo ODRE con single-writer staging, atomic switch, verificación posterior, automatic rollback y durable recovery sobre la misma base.']
        ,['Resumen final','AUM permite de forma segura updates verificados del cliente; FULL AUM completa y recupera toda la transacción de actualización del servidor ODRE.']
      ]
    }
  };

  function language() {
    return window.ODRE_SITE && window.ODRE_SITE.language ? window.ODRE_SITE.language() : (document.documentElement.lang || 'en').slice(0,2);
  }
  function render() {
    var text = translations[language()] || translations.en;
    closeButton.setAttribute('aria-label', text.close);
    var html = '<section class="aum-detail-section"><h3>' + text.definition + '</h3><p>' + text.definitionBody + '</p></section>';
    text.sections.forEach(function (section) { html += '<section class="aum-detail-section"><h3>' + section[0] + '</h3><p>' + section[1] + '</p></section>'; });
    content.innerHTML = html;
  }
  function open() { render(); panel.showModal(); document.body.classList.add('aum-detail-open'); closeButton.focus(); }
  function close() { panel.close(); document.body.classList.remove('aum-detail-open'); openButton.focus(); }
  openButton.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  panel.addEventListener('click', function (event) { if (event.target === panel) close(); });
  panel.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
  document.addEventListener('odre:language', function () { if (panel.open) render(); });
}());
