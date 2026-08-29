---
owner: docs/spec/security.md
authority: canonical
status: active
answers: ["What security boundaries govern the website?", "How are CSP and secrets handled?"]
---
# Security

The static default minimizes attack surface: no database, login, custom API, admin server, or SSH host. Anything shipped to a browser is public; private credentials require a deliberate server-side architecture change.

Astro's `security.csp` is the implemented owner of script/style policy and generates hashes for emitted page resources. The base meta policy restricts default, base, object, form, image, font, connection, media, and manifest sources without an unsafe-inline allowance. Safe JSON-LD serialization prevents client-controlled text from terminating its script element.

`netlify.toml` owns stable response headers and immutable caching for hashed Astro assets. It sets content-type sniffing, referrer, permissions, and framing policies; these response headers are locally configuration-tested but remain production-unverified until an actual deploy is inspected. HSTS is intentionally absent and remains a launch decision after domain and subdomain consequences are verified. Integrations receive the narrowest required origin allowances.

Dependencies remain minimal and reviewed. Repository access uses least privilege, private client repositories by default, protected production branches, and no shared credentials. `ops/secret_scan.py` is the configured local/CI baseline for high-confidence AWS, GitHub, Stripe, Slack, and private-key signatures. It scans active repository text without printing matched values, excludes cold audits/tests/generated output, and complements rather than replaces review or provider-side controls.
