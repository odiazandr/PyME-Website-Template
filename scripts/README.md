# Website scripts

The scripts implement data, project, production-source, placeholder, asset, built-artifact, internal-link, and public-output validation. Run the complete development or production sequence through the package scripts; use individual commands only to diagnose a failed stage. The canonical contract and ordering are documented in `docs/spec/website-validation.md`.

`verify-deployment.ts` is the deliberately separate, read-only Netlify provider verifier. Its authentication, input, and result contract are owned by `docs/spec/deployment.md`; it is not a deterministic quality gate.

`serve-dist.ts` is a localhost-only, foreground static server for Playwright's built-artifact tests. It exists so browser runs always start from the current `dist/` tree and cannot silently reuse a stale development server. It is not a production server or a Netlify substitute.

`init-client.ts` rewrites client identity and memory mode from one reviewed JSON input document. Its procedure is owned by `docs/runbooks/create-client-site.md` and its rationale by `docs/decisions/0111-file-driven-client-initialization.md`.
