---
owner: docs/runbooks/rollback.md
authority: canonical
status: active
answers: ["How is a bad release or infrastructure change rolled back?"]
---
# Rollback

- Bad source: revert through Git and normal review.
- Bad deploy: restore the prior verified Netlify deploy while preparing the source correction.
- Bad DNS: restore recorded prior values and verify website and email.
- Broken integration: disable it or restore the prior narrow configuration.

Verify recovery from the user's path, then document cause and follow-up.
