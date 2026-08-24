---
owner: docs/spec/validation.md
authority: canonical
status: active
answers: ["What are template and project modes?", "How are check results reported?"]
---
# Memory validation

`memory.toml` declares `template` or `project` mode. Template mode permits only deliberately defined distribution placeholders. Project mode rejects unresolved template placeholders in active knowledge and, once implemented, website source and output.

Configured checks report `PASSED`, `FAILED`, or `UNVERIFIED`. An empty, missing, or unavailable command is never reported as passed.
