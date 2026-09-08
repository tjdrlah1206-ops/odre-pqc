# Paddle Live preparation — 2026-09-08

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
