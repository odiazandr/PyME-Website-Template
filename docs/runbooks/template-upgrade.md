---
owner: docs/runbooks/template-upgrade.md
authority: canonical
status: active
answers: ["How is a client upgraded to a newer foundation release?"]
---
# Upgrade the template

Read release and migration notes, compare the client's recorded version and local drift, create a `migration/...` branch, apply only relevant changes, preserve client customization, run all checks, review a Deploy Preview, merge, deploy, then update the recorded template version. Never mass-update production sites blindly.
