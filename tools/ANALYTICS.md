# First-party PQC website analytics

`assets/js/site.js` asynchronously loads `assets/js/analytics.js` once. All 17
public pages already use the common file. The tracker only runs at
`https://pqc.odreai.com` and on the explicit public-path allowlist. Local QA uses
loopback fixture copies of the tracker origin/endpoint and a non-forwarding
local proxy. Native lifecycle Beacons also terminate at the loopback collector;
request interception alone is not a sufficient unload-network isolation boundary.

The existing authenticated admin UI provides a site-inspection link ending in
`#odre-analytics-off`. The tracker handles that exact control marker before any
collection, stores only a boolean opt-out in tab sessionStorage, strips the
marker from the URL and skips onward-page tracking in that tab. Operators should
use this link for routine inspection. This requires sessionStorage to persist
the tab preference; unknown public visitors are never assumed to be admins.

The isolated collection routes are `POST
https://odreai.com/odre-pqc/analytics/v1/visit` and `/activity`. Both accept bounded
JSON in `text/plain` for unload-safe `sendBeacon`. Requests carry no API secret.
Fetch omits credentials and referrer. Server Origin validation, authenticated
statistics access, strict field validation, rate limits and SQL binding remain
server responsibilities. Do not include request bodies or query strings in
analytics access/error logs.

## Counting and duration

- UUIDv4 visitor and session IDs are random and stored only in tab
  `sessionStorage`. No browser fingerprint or persistent visitor cookie exists.
- Session ID rotates on a new page after 30 minutes without recorded activity;
  the random visitor ID lasts for the tab storage lifetime. Browsers may copy
  sessionStorage when duplicating a tab, so this is an estimate, not verified
  people or verified browser instances. Clearing storage also changes identity.
- A pageview UUID is generated once per document. Language changes, heartbeat,
  repeated script execution, hide/pagehide and back-forward cache restoration
  do not create a second pageview for that document.
- Visible page time is cumulative milliseconds measured by `performance.now()`.
  Background time is excluded. A heartbeat runs every 60 seconds while visible.
  Each observed interval is capped at 90 seconds to avoid counting suspended
  computer time; the value is therefore estimated visible dwell, not attention.
  Hide/pagehide sends a cumulative Beacon; monotonic server upserts deduplicate.
- The server records timestamps in UTC, counts days in Asia/Seoul, and derives
  daily visitor hashes. Client wall clock is only used to expire tab storage.
- Country is an approximate server-local network-address lookup. Clients do
  not submit country and no visitor IP is sent to an external lookup service.

## Language provenance

The established priority remains supported `?lang=`, saved language,
supported browser primary language, then English. The existing
`odre-pqc-lang` preference is preserved. A separate
`odre-pqc-language-provenance` record now records the selection source.

`manual` and `selected_language` are only set by explicit selector interaction
(or the existing explicit `ODRE_SITE.setLanguage` API). Initial browser choice
uses `browser`; unsupported browser language with English uses `fallback`.
Existing saved preferences and language query overrides without trustworthy
provenance use `unknown`, with null selected language. This avoids inventing
historical manual actions. Admin label: `기존 선택·출처 미확인`.
If the browser language changes and an earlier automatic preference no longer
matches it, that saved preference is preserved but its source becomes unknown.

`odre:language` retains its original `detail.language` field and adds the
analytics language fields. Existing payment and translation listeners keep
their existing behavior. Query strings are read only by the existing language
selector; analytics sends `location.pathname` from the allowlist, never search
or hash. Referrers are reduced to hostname and an allowed internal pathname.

## Privacy and retention

The privacy page includes English static text and five-language disclosure of
the actual fields, coarse screen dimensions, tab-scoped IDs, approximate country,
restricted administrator access and unresolved retention. Purge remains disabled
until an approved retention configuration exists. No arbitrary duration is
promised and analytics code cannot read forms, tokens, license data or keystrokes.

Run `node tools/analytics-qa.cjs` for the offline contract suite. Existing website,
language and payment QA must also pass before publishing.

`node tools/analytics-browser-qa.cjs` verifies all public pages, five languages,
mobile privacy layout and native lifecycle collection. It rewrites the tracker
constants and the payment page's matching CSP destination only in served test
copies; production sources are unchanged. It reports received event counts and
blocked proxy requests instead of asserting an unmeasured zero-contact constant.
