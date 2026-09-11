# Paddle Live preparation — 2026-09-08

## ODRE PQC v0.3.0 public opening — 2026-09-12 (current state)

The owner approved the public opening on the morning of 2026-09-12 after the
v0.3.0 customer distribution was published. The regular monthly and annual
License-page checkout is open; Paddle.js initialization must succeed before a
customer can press either checkout button.

- Customer archive: `ODRE_PQC_PRODUCTION_0.3.0_CUSTOMER_DELIVERY.zip`
- Published SHA-256: `00DC788B5ECAAAC08C53ACBAD009DC296185149A9917124FF0F16C0EDAABC182`
- Archive size: 56,730,320 bytes; no ZIP password is required.
- The archive was refreshed on 2026-09-12 after targeted N-1/N-3 audit
  remediation added native pre-execution integrity enforcement and a Python
  3.12 runtime floor. The recorded Core and Native binary identities did not
  change.
- Monthly and annual prices remain USD 250 and USD 2,700 per Unit for 1–1,000
  Units. Opening the archive download does not start a Trial or subscription.
- The separate unlisted USD 1 Live test page remains closed after its completed
  verification. Reopening the regular checkout does not reopen that test page.
- No Paddle account, backend, Production DB, Gateway, Core or server process was
  changed by this website publication.

The older pause records below are retained as historical operational evidence;
they do not describe the current public checkout state.

## Operator checkout pause — 2026-09-09 (historical state)

The owner requested that checkout remain closed until the distribution package
is complete. This section supersedes earlier statements that the unlisted USD 1
page is open; historical verification below is retained.

- Monthly and annual website checkout remain disabled. Pricing and the 1–1,000
  Unit policy are unchanged.
- The unlisted USD 1 page is also disabled in HTML and JavaScript. With the
  shipped fixed pause, it does not load Paddle.js, initialize Paddle, register
  payment click handlers or call Checkout.open. There is no query, storage,
  clock-based or automatic reopening switch.
- Five-language notices explain that distribution-package readiness and explicit
  reopening approval are required. An ordinary source/deployment review is
  required to reopen checkout; this is not an automatic scheduled task.
- License activation, payment confirmation/recovery, existing subscriptions,
  Paddle price/product status, webhooks and backend services are unchanged.
- This is a WEBSITE checkout pause, not a Paddle-account-wide restriction. It
  cannot revoke an already open checkout, cached older page or other external
  Paddle checkout link. No subscription cancellation or refund was requested or
  performed. Account-side price restriction, if required, needs separate action.
- Offline pause tests use the shipped source, including preloaded mock SDK and
  URL variations. Prior checkout-behavior tests use an explicitly enabled
  **in-memory-only** source copy and mock Paddle; they never place real orders.

## Subsequent Live dashboard verification and Unit policy — 2026-09-09

The earlier connection audit above records the initial frontend-only step; it is not the current dashboard verification result.

The operator subsequently authorized direct use of the logged-in Live dashboard. Read-only dashboard inspection confirmed ODRE AI, the supplied product and three price IDs, the approved pqc.odreai.com domain, and the existing Active Platform webhook with 10 subscribed events. Live/Sandbox MCP account calls remain NOT_RUN in this session; no callable Paddle MCP tools are registered here.

- Normal monthly: USD 250 per Unit, monthly recurrence, quantity 1–1,000.
- Normal annual: USD 2,700 per Unit, annual recurrence, quantity 1–1,000.
- Both normal prices were already correct and were not modified.
- All three prices have no Paddle trial, automatic-location tax, and no country-specific prices.
- The dedicated USD 1/month TEST price maximum was changed from 999,999 to **1**, saved, reopened, and confirmed. Its minimum remains 1.
- Existing checkout discount field is disabled. No other checkout or webhook setting was changed.
- All public quantity controls and five-language copy now use the approved 1–1,000 range for both normal plans. Unit prices do not decrease with quantity.
- At the user's explicit request, the Enterprise page, sections/cards, menu/footer links, localized inquiry copy and sitemap entry are removed. Ordinary customer, license and technical support remain.
- Normal public checkout remains CLOSED pending Live end-to-end verification and release approval. The USD 1 test page remains unlisted (not access-controlled), quantity one, with no actual checkout or payment performed by this agent.

Existing webhook subscriptions were inspected without changing them: transaction.completed, transaction.past_due, transaction.payment_failed, subscription.activated, subscription.canceled, subscription.created, subscription.past_due, subscription.paused, subscription.resumed, subscription.updated. No secret value was logged, copied, saved or included here.

### Unresolved default-payment-link gate

The dashboard default payment link is currently https://pqc.odreai.com. The homepage does not initialize Paddle.js and is not an implemented transaction-payment receiver. The unlisted test page intentionally rejects query parameters and must not be substituted as a default transaction-payment link. A verified receiver and the corresponding account setting remain a release integration gate; the dashboard value was not changed to a known-incompatible route.

No payment, cancellation, refund, backend secret rotation, server API, DB, Nginx, Core, business identity or bank-account change was performed. No LIVE_PRODUCTION_PASS is claimed.

Verification for this subsequent website change: price regression 9 quantity cases plus both stepper boundaries PASS; Unit policy 5 languages and 12 mocked future checkout boundary cases PASS; Live checkout 23/23 PASS; analytics 26/26 PASS; homepage copy five languages PASS; PDF-language 18 initial/7 switch cases PASS; five installation PDFs retain their original hashes. Static audit: 17 HTML pages, zero broken links/metadata/shared-layout/secret findings. JavaScript syntax and diff whitespace checks PASS. These are offline tests, not a Live payment or browser visual test. Only the retired Enterprise entry was removed from sitemap.xml; robots.txt and backend files were not changed. The deleted page remains recoverable from Git history.

This is a frontend configuration and offline regression change, not a completed payment or product release.

- The normal purchase page now holds the user-supplied Live product, monthly/yearly price IDs and public client-side token.
- Normal prices remain USD 250/month and USD 2,700/year per Unit. Existing quantity limits and legal terms were not changed by this patch.
- `publicCheckoutEnabled` remains false until Live E2E and product release approval. This UI switch is not server authorization or protection against someone using a public Paddle price ID separately.
- The user explicitly approved an **unlisted, publicly accessible** test page: no incoming menu/sitemap links, `noindex,nofollow,noarchive`, no login. Source and URL are discoverable in the public repository. No secret URL protection is claimed.
- The test page uses only the dedicated USD 1/month recurring price with quantity 1, no discount UI, an explicit real-charge acknowledgement and no automatic checkout on page load.
- Paddle.js is loaded only after an acknowledged manual click. Live uses the production default; the unsupported environment string `live` is not passed to the SDK.
- No email/customer information is collected by our test page; it is entered in Paddle Checkout. The test page does not load our analytics or persist checkout data.
- Frontend completion is informational only; it does not establish payment authenticity, License/Activation/Unit/Lease success or `LIVE_PRODUCTION_PASS`.

## Remaining server/operator gates

An authorized operator must perform the actual Live payment and verify the approved Live domain/default payment link, webhook signature, transaction/product/price/amount/currency contract, License issuance and email, activation/device proof, Unit and Lease, idempotency, and secret hygiene. The test price must be handled by an explicitly approved server-side test contract; never silently map it to a normal production plan.

The USD 1 test is recurring. Confirm cancellation and next-charge status after testing; this page does not cancel or refund anything.

API secrets, endpoint secrets, notification credentials and private keys are not frontend configuration. No backend, Paddle account, webhook, Nginx, DB, Core or Native artifact was modified by this website change.

Connection audit on this local Codex session: neither `paddle-live` nor `paddle-sandbox` was present in the callable tool catalog or the effective `codex mcp list --json` registration list. Live account reads: 0; Sandbox account reads: 0. The supplied product/price/token identifiers were not independently verified against either account. No account operation or successful MCP connection is claimed, and no secret was printed during the configuration check.

## Offline verification

Run `node tools/paddle-live-qa.cjs` and `node tools/pricing-qa.cjs`. Test doubles check Live IDs, the closed normal gate, five-language status messages, exact test price/quantity, acknowledgement, duplicate-click suppression, terminal failure, completion semantics and hostile URL parameter rejection. No real checkout or transaction is created by these tests.

Additional website regressions cover links/SEO, PDF downloads/languages, homepage copy and analytics. Real payment E2E and browser visual QA are not claimed by these saved test scripts.

Observed offline results for this change: checkout 23/23; analytics 26/26; price regression PASS; homepage five-language regression PASS; PDF links 18 initial-language and 7 manual-switch cases PASS; installation guide original hashes 5/5. Static audit covered 18 HTML pages with zero broken links, missing metadata/shared layout, stale-price or secret findings. JavaScript syntax checks passed. `robots.txt` and `sitemap.xml` were unchanged.

## Official integration references

- [Paddle Initialize](https://developer.paddle.com/paddle-js/methods/paddle-initialize/)
- [Environment: production is the default](https://developer.paddle.com/paddle-js/methods/paddle-environment-set/)
- [Checkout.open](https://developer.paddle.com/paddle-js/methods/paddle-checkout-open/)
- [Public client-side tokens, not API keys](https://developer.paddle.com/paddle-js/about/client-side-tokens/)
- [Live default payment link and approved domain](https://developer.paddle.com/build/transactions/default-payment-link/)
