---
owner: docs/runbooks/dns-cutover.md
authority: canonical
status: active
answers: ["How is DNS changed without disrupting email?"]
---
# DNS cutover

Capture the complete existing zone. Identify website records, MX, SPF, DKIM, DMARC, verification records, and delegated subdomains. Plan and review only the required changes, apply them through authorized access, then verify DNS, HTTPS, the website, and email sending and receiving. Keep the recorded prior values for rollback.
