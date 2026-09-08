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
Fetch omits referrer and rejects redirects. Fetch and native Beacon both allow
the browser to send existing first-party HttpOnly admin cookies; the server uses
them only to exclude authenticated administrators. No analytics cookie is set,
and the script never reads, copies or stores authentication cookies. Credentialed
CORS is restricted to the exact website Origin and the two collection routes,
not administrator APIs. The same boundary also covers `/download-click`.
An explicit `202 {"accepted":false}` stops collection
for the current document, including queued retries and lifecycle handlers.
Malformed responses and network failures are not treated as acceptance.
Server Origin validation, authenticated
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

## Public PDF clicks

The download section now links five v1.2.1 installation/license activation guides
in EN/KO/JA/DE/ES. Their original PDF bytes are published unchanged. These five
links are not counted until matching document IDs are approved in the server
registry; do not map them to old whitepaper IDs or assume new IDs are accepted.
No server or analytics runtime configuration is changed by this PDF update.

Four links on the security, trust and releases pages reference the existing
v0.2.9 overview/security architecture and technical whitepaper. The two security
page buttons follow the selected page language (EN/KO/JA/DE/ES); trust and release
references remain English. All ten documents already have registered IDs, so the
current href resolves to the correct language-specific ID without a server change.
The original documents and their existing analytics allowlist are retained.
A trusted click or middle-button activation of an exact allowlisted pathname
emits one `download-click` event. Keyboard Enter and touch use the normal click
event. Right-click/context-menu actions, scripted clicks, external links and the
`/docs/#downloads` menu shortcut are not counted. Navigation is never cancelled
or delayed, including for the untracked installation guides.

The payload contains random event/session/pageview/visitor IDs, source pathname,
fixed versioned PDF ID, coarse device and current screen language. Never send
href, query/hash, link text or file contents. The server derives document type,
version and PDF language from its registry. Screen language and PDF language
can differ. A fallback retry reuses the same event ID; a later deliberate click
uses a new ID. Sending/queuing does not prove delivery, completion or file save.

Clicks have their own server-time snapshots and never alter pageviews, sessions
or dwell. They can arrive before a pageview and are retained independently;
existing pageview/session ownership is checked when available. Dates use the
Seoul click date, not original session-start date. Filters use the click-time
country/device/screen-language/path snapshots. Distinct clicking sessions are
not verified people and must not be summed across document rows. Administrator,
bot, Origin, size and rate-limit exclusions also apply to clicks. No historical
clicks are fabricated before collection starts.

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
