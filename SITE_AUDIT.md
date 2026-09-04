# ODRE PQC site audit and renewal map

Audit basis: repository state at commit `53aef64`, plus the public v0.2.9 technical whitepapers and product-overview documents available in the project Drive materials.

## Protected scope

No sealed wheel or core, license-service implementation, production database, server configuration, runtime service, secret or product API is part of this change. The existing purchase-confirmation endpoint and its request fields remain unchanged.

## Existing public inventory

### Keep

- `CNAME` and the `pqc.odreai.com` canonical origin.
- All ten existing v0.2.9 public PDF paths across English, Korean, Japanese, German and Spanish.
- `/terms/`, `/privacy/`, `/refund/`, `/license/`, `/payment/success/` and `/payment/register/` public paths.
- Current release identity, artifact name, SHA-256, cryptographic profile and verified environments.
- Existing purchase-confirmation service URL and request semantics.

### Rewrite

- `/` product narrative, navigation, release summary and calls to action.
- Shared visual system, navigation, footer and responsive behavior.
- `/payment/success/` and `/payment/register/` customer-facing language and presentation.
- Legal-page presentation and current annual price reference.

### Move

- Full artifact hash and verification evidence from the home hero to Security and Trust Center.
- Detailed cryptographic, session, sequence and replay material to Security.
- Operational steps, diagnostics and troubleshooting to Documentation.
- Purchase, renewal and Unit explanations to Pricing.

### Remove

- Internal audit-style labels from customer-facing pages.
- Obsolete annual pricing and obsolete release references.
- Development-only checkout presentation and temporary implementation language.
- Duplicate home-page explanations and large integrity strings in the hero.

### Add

- `/product/`, `/security/`, `/docs/`, `/pricing/`, `/trust/`, `/contact/`, `/enterprise/`, `/download/` and `/legal/`.
- `/commercial-license/`, `/release-notes/`, `/support-lifecycle/`, `/security-advisories/`, `/responsible-disclosure/` and `/faq/`.
- Shared design tokens and components in `site.css`, with language, menu and pricing behavior in `site.js`.
- `sitemap.xml`, a complete `robots.txt`, per-page metadata, canonical URLs, hreflang and SoftwareApplication structured data.
- Automated static and browser QA scripts.

## URL policy

Existing public paths are preserved. `/license/` remains available as a compatibility path and directs customers to the current Pricing page. Existing PDF filenames and purchase-return paths are unchanged.

## Commercial facts used

- 14-day product evaluation.
- US$120 per Unit per month, recurring.
- US$1,200 per Unit per year, recurring.
- 1–20 Units through the standard purchase process; 21 or more through Enterprise Licensing.
- One Unit means one independent licensed production deployment or installation. Non-standard virtualized, containerized, cloned or autoscaling topology requires confirmation before purchase.

## Published technical scope used

- ODRE PQC v0.2.9.
- Windows Server 2022 AMD64 and Ubuntu 24.04 LTS AMD64 as published verified platforms.
- Python 3.12 and OpenSSL 3.5.8 baseline.
- ML-KEM-768 and ML-DSA-65.
- Protected-route fail-closed behavior, with no silent classical-only downgrade.
- Session, sequence and replay controls within the documented product boundary.
