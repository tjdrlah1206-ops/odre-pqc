# ODRE PQC website

Static source for the ODRE PQC product website at `pqc.odreai.com`.

## Local review

Serve the repository root with any static HTTP server, then open the local URL in a browser. Root-relative links are used to match the production site structure.

Run the content and link checks with:

```text
npm run check
```

Browser QA is implemented in `scripts/visual-qa.cjs`. It checks Chrome and Edge at widths 360, 375, 390, 430, 768 and 1440 pixels.

## Content boundaries

The repository contains the public website and public PDF documents. It does not contain or modify the sealed product core, production license service, production database, payment secrets, service configuration or server configuration.

Product claims must stay within the scope published in the v0.2.9 technical material. Do not add customers, certifications, platform support, performance claims or compliance claims without approved evidence.
