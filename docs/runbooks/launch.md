---
owner: docs/runbooks/launch.md
authority: canonical
status: active
answers: ["What must happen before production launch?"]
---
# Launch

Verify content truth, contact facts, client-approved privacy text, design and mobile QA, accessibility, SEO, forms, production canonical, placeholder removal, build and output validation, custom domain, DNS preservation, HTTPS, email, production smoke tests, client approval, and a known rollback path. A site is not launched merely because it looks correct locally.

## Commands

Run these from the client repository. The first is the gate that decides whether the site may be published; it stops at the first failure and each individual command in `docs/spec/website-validation.md` is available for diagnosis.

```
npm run quality:production
npm run test:browser:cross
npm run check:ruleset
```

`quality:production` also runs in CI as the `Client production gate` job whenever `memory.toml` records project mode, so a client repository does not depend on someone remembering to run it. Make that check required in the repository ruleset before launch; the template ships the contexts it needs in `.github/rulesets/main-protection.json`, and an adopted repository adds this one.

The approval flags in `src/data/production.json` and every `approvedForPublication` record are attestations that a person performed the verification. No agent may set them.

Steps no command covers: manual accessibility review, DNS cutover as owned by `docs/runbooks/dns-cutover.md`, form receipt confirmed in the provider, response headers observed on the live domain, and client sign-off.
