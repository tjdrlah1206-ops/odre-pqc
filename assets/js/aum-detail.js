(function () {
  'use strict';
  var panel = document.getElementById('aum-detail-panel');
  var content = document.querySelector('[data-aum-detail-content]');
  var openButton = document.querySelector('.aum-detail-open');
  var closeButton = document.querySelector('.aum-detail-close');
  if (!panel || !content || !openButton || !closeButton) return;

  var translations = {
    en: {
      close:'Close', definition:'AUM — Automatic Update Management', definitionBody:"The configured RC2 customer updater checks approved local input every 15 seconds and passes it to local AUM after signature, integrity and compatibility verification. Current RC2 does not download new releases from a central update server.",
      sections:[
        ['AUM scope',"The configured RC2 customer updater checks approved local input every 15 seconds and passes it to local AUM after signature, integrity and compatibility verification. Current RC2 does not download new releases from a central update server."],
        ['AUM core principle','Unverified updates never apply. A filename or apparent recency is not authority, and a verification failure is never converted into success.'],
        ['FULL AUM definition',"FULL AUM describes the ODRE operating-server update lifecycle. Verification results apply only to the artifacts, environments and transactions documented in Trust Center."],
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
        ['Contract boundary',"Customer-facing update capability and contract remain AUM. FULL AUM describes the ODRE operating-server lifecycle; module presence in a delivery does not extend the customer contract. Current RC2 verification results are limited to the published artifacts, environments and transactions."]
        ,['AUM / FULL AUM difference',"AUM verifies approved local customer update input. FULL AUM describes the ODRE operating-server transaction lifecycle on the same signed verification foundation; the published evidence defines the verification scope."]
        ,['One-line summary',"AUM verifies approved local customer update input; FULL AUM describes ODRE server update transactions within the published verification scope."]
      ]
    },
    ko: {
      close:'닫기',definition:'AUM — Automatic Update Management',definitionBody:"설정된 RC2 고객 Updater는 승인된 로컬 입력을 15초마다 확인하고 서명·무결성·호환성 검증 후 로컬 AUM에 전달합니다. 현재 RC2는 중앙 업데이트 서버에서 새 릴리스를 다운로드하지 않습니다.",
      sections:[
        ['AUM 주요 범위',"설정된 RC2 고객 Updater는 승인된 로컬 입력을 15초마다 확인하고 서명·무결성·호환성 검증 후 로컬 AUM에 전달합니다. 현재 RC2는 중앙 업데이트 서버에서 새 릴리스를 다운로드하지 않습니다."],
        ['AUM 핵심 원칙','검증되지 않은 update는 적용하지 않습니다. 파일명이나 최신처럼 보이는 상태는 authority가 아니며 verification failure를 성공으로 변환하지 않습니다.'],
        ['FULL AUM 정의',"FULL AUM은 ODRE 운영 서버의 업데이트 lifecycle을 설명합니다. 검증 결과는 Trust Center에 기록된 artifact·환경·transaction 범위에 한정됩니다."],
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
        ['계약 경계',"고객에게 노출되는 업데이트 기능 및 계약은 AUM입니다. FULL AUM은 ODRE 운영 서버의 lifecycle을 설명하며 배포본에 관련 모듈이 존재해도 고객 계약이 확대되지는 않습니다. 현재 RC2 검증 결과는 공개된 artifact·환경·transaction 범위에 한정됩니다."]
        ,['AUM / FULL AUM 차이',"AUM은 승인된 고객 로컬 업데이트 입력을 검증합니다. FULL AUM은 동일한 서명 검증 기반의 ODRE 운영 서버 transaction lifecycle을 설명하며, 검증 범위는 공개 Evidence를 따릅니다."]
        ,['최종 한 줄 요약',"AUM은 승인된 고객 로컬 업데이트 입력을 검증하고, FULL AUM은 공개 검증 범위 내 ODRE 서버 업데이트 transaction을 설명합니다."]
      ]
    },
    ja: {
      close:'閉じる',definition:'AUM — Automatic Update Management',definitionBody:"設定済みのRC2顧客Updaterは承認済みローカル入力を15秒ごとに確認し、署名・完全性・互換性を検証してローカルAUMへ渡します。 現行RC2は中央更新サーバーから新しいリリースをダウンロードしません。",
      sections:[
        ['AUMの主要範囲',"設定済みのRC2顧客Updaterは承認済みローカル入力を15秒ごとに確認し、署名・完全性・互換性を検証してローカルAUMへ渡します。 現行RC2は中央更新サーバーから新しいリリースをダウンロードしません。"],
        ['AUMの基本原則','未検証updateは適用しません。ファイル名や新しさはauthorityではなく、verification failureを成功に変換しません。'],
        ['FULL AUMの定義',"FULL AUMはODRE運用サーバーの更新lifecycleを説明します。検証結果はTrust Centerに記録されたartifact・環境・transactionの範囲に限られます。"],
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
        ['契約境界',"顧客に公開される更新機能と契約はAUMです。FULL AUMはODRE運用サーバーのlifecycleを説明し、配布物に関連moduleが存在しても顧客契約は拡張されません。現行RC2の検証結果は公開されたartifact・環境・transactionの範囲に限られます。"]
        ,['AUM / FULL AUMの違い',"AUMは承認済みの顧客ローカル更新入力を検証します。FULL AUMは同じ署名検証基盤上のODRE運用サーバーtransaction lifecycleを説明し、検証範囲は公開Evidenceに従います。"]
        ,['一行要約',"AUMは承認済みの顧客ローカル更新入力を検証し、FULL AUMは公開検証範囲内のODREサーバー更新transactionを説明します。"]
      ]
    },
    de: {
      close:'Schließen',definition:'AUM — Automatic Update Management',definitionBody:"Der konfigurierte RC2-Kunden-Updater prüft freigegebene lokale Eingaben alle 15 Sekunden und übergibt sie nach Signatur-, Integritäts- und Kompatibilitätsprüfung an die lokale AUM. Die aktuelle RC2 lädt keine neuen Releases von einem zentralen Update-Server herunter.",
      sections:[
        ['AUM-Umfang',"Der konfigurierte RC2-Kunden-Updater prüft freigegebene lokale Eingaben alle 15 Sekunden und übergibt sie nach Signatur-, Integritäts- und Kompatibilitätsprüfung an die lokale AUM. Die aktuelle RC2 lädt keine neuen Releases von einem zentralen Update-Server herunter."],
        ['AUM-Kernprinzip','Unverifizierte Updates werden nicht angewendet. Dateiname oder scheinbare Aktualität sind keine Authority; Verification Failure wird nie zu Erfolg umgedeutet.'],
        ['FULL-AUM-Definition',"FULL AUM beschreibt den Update-Lifecycle des ODRE-Betriebsservers. Verifikationsergebnisse gelten nur für die im Trust Center dokumentierten Artefakte, Umgebungen und Transaktionen."],
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
        ['Vertragsgrenze',"Die kundenseitige Updatefunktion und der Vertrag bleiben AUM. FULL AUM beschreibt den Lifecycle des ODRE-Betriebsservers; enthaltene Module erweitern den Kundenvertrag nicht. Aktuelle RC2-Verifikationsergebnisse gelten nur für die veröffentlichten Artefakte, Umgebungen und Transaktionen."]
        ,['Unterschied AUM / FULL AUM',"AUM prüft freigegebene lokale Update-Eingaben des Kunden. FULL AUM beschreibt den Transaktions-Lifecycle des ODRE-Betriebsservers auf derselben signierten Verifikationsbasis; veröffentlichte Nachweise bestimmen den Verifikationsumfang."]
        ,['Zusammenfassung',"AUM prüft freigegebene lokale Kunden-Update-Eingaben; FULL AUM beschreibt ODRE-Server-Update-Transaktionen im veröffentlichten Verifikationsumfang."]
      ]
    },
    es: {
      close:'Cerrar',definition:'AUM — Automatic Update Management',definitionBody:"El Updater RC2 configurado comprueba entradas locales aprobadas cada 15 segundos y las entrega al AUM local tras verificar firma, integridad y compatibilidad. RC2 actual no descarga nuevas versiones desde un servidor central de actualizaciones.",
      sections:[
        ['Alcance de AUM',"El Updater RC2 configurado comprueba entradas locales aprobadas cada 15 segundos y las entrega al AUM local tras verificar firma, integridad y compatibilidad. RC2 actual no descarga nuevas versiones desde un servidor central de actualizaciones."],
        ['Principio esencial de AUM','Una actualización no verificada nunca se aplica. El nombre o la aparente novedad no son authority y un verification failure nunca se convierte en éxito.'],
        ['Definición de FULL AUM',"FULL AUM describe el ciclo de actualización del servidor operativo ODRE. Los resultados de verificación se limitan a los artefactos, entornos y transacciones documentados en Trust Center."],
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
        ['Límite contractual',"La función y el contrato de actualización del cliente siguen siendo AUM. FULL AUM describe el ciclo del servidor operativo ODRE; la presencia de módulos en una entrega no amplía el contrato del cliente. Los resultados de RC2 actual se limitan a los artefactos, entornos y transacciones publicados."]
        ,['Diferencia AUM / FULL AUM',"AUM verifica entradas locales aprobadas del cliente. FULL AUM describe el ciclo de transacciones del servidor operativo ODRE sobre la misma base de verificación firmada; la evidencia publicada define el alcance verificado."]
        ,['Resumen final',"AUM verifica entradas locales aprobadas del cliente; FULL AUM describe las transacciones de actualización del servidor ODRE dentro del alcance de verificación publicado."]
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
