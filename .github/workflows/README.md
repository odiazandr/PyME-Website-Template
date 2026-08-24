# Workflows

`ci.yml` owns deterministic quality, memory, build, and test evidence. `browser-qa.yml` owns Chromium and WebKit evidence, requires a report after successful browser execution, and retains any available Playwright report for review. Both workflows use read-only repository permissions, pin external actions to immutable commit SHAs, and cancel superseded runs for the same ref.

Repository rules must require these checks externally; committed workflow files cannot protect `main` by themselves.
