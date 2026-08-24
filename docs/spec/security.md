---
owner: docs/spec/security.md
authority: canonical
status: active
answers: ["What security boundaries govern the website?", "How are CSP and secrets handled?"]
---
# Security

The static default minimizes attack surface: no database, login, custom API, admin server, or SSH host. Anything shipped to a browser is public; private credentials require a deliberate server-side architecture change.

Astro's CSP capability is the planned owner of script/style policy because it can account for generated resources. Netlify configuration owns stable response headers and caching. Integrations receive the narrowest required origin allowances. HSTS preload is a launch decision after domain and subdomain consequences are verified.

Dependencies remain minimal and reviewed. Repository access uses least privilege, private client repositories by default, protected production branches, and no shared credentials.
