# Website scripts

The scripts implement data, project, production-source, placeholder, asset, built-artifact, internal-link, and public-output validation. Run the complete development or production sequence through the package scripts; use individual commands only to diagnose a failed stage. The canonical contract and ordering are documented in `docs/spec/website-validation.md`.

`serve-dist.ts` is a localhost-only, foreground static server for Playwright's built-artifact tests. It exists so browser runs always start from the current `dist/` tree and cannot silently reuse a stale development server. It is not a production server or a Netlify substitute.

Client initialization remains planned for its later implementation phase.
