---
owner: docs/spec/validation.md
authority: canonical
status: active
answers: ["What are template and project modes?", "How are check results reported?"]
---
# Memory validation

## Implementation state

This document is the accepted Phase 1.1 contract. The current validator is partial and is not compliant with the full contract until the negative suite and final adversarial gate pass. During that transition, a successful legacy CLI result proves only the checks implemented by that revision.

## Configuration contract

`memory.toml` is UTF-8 TOML with exactly the required top-level keys `schema_version`, `mode`, `checks`, `placeholders`, and `working_set`; unknown top-level keys fail. Schema version `1` is the only supported version until a later migration explicitly adds another. Mode is exactly `template` or `project`; missing or unknown values fail.

The `checks` table has exactly the supported keys `build`, `test`, `lint`, and `secret_scan`. Each value is an array of strings representing one executable and its arguments. An empty array means `NOT_CONFIGURED`; the first element of a configured array must be non-empty. Unknown keys, shell command strings, nested shell syntax, redirection, and non-string arguments fail configuration validation.

Configured commands execute without a shell, from the repository root, with the validator process environment inherited. The runner does not print environment values. Output capture is limited to 65,536 characters per stream and execution to 300 seconds per check. Exit code zero is `PASSED`; a nonzero exit or timeout is `FAILED`; an executable that cannot be started is `UNVERIFIED`; an empty array is `NOT_CONFIGURED`. Every supported check appears in output and cannot silently disappear. Memory-contract validation remains distinct from configured project-check execution so callers can choose the appropriate scope without misleading output.

The `placeholders` table contains exactly `allow`, an array of strings. Each entry has the exact form `<repository-relative POSIX path>::<KEY>` and authorizes that key only at that exact file in template mode; wildcards, traversal, absolute paths, backslashes, duplicate entries, and malformed keys fail. Project mode ignores the allowlist and rejects every active marker. The initial allowlist is empty.

The `working_set` table contains exactly `enabled` (boolean), `directory` (safe repository-relative POSIX path), `maximum_pointers` (positive integer), and `maximum_reason_length` (positive integer). Unknown or mistyped fields fail.

Malformed TOML, missing configuration, unsupported schema versions, invalid types, unreadable files, and invalid UTF-8 produce structured validation failures rather than tracebacks.

## Knowledge-document contract

Active knowledge discovery is recursive within `docs/spec/`, `docs/runbooks/`, `docs/explain/`, and `docs/decisions/`, plus `docs/INDEX.md` and `docs/GLOSSARY.md`. `docs/archive/`, `docs/audits/`, `docs/migrations/`, and machinery README files outside those active roots are excluded unless a future contract explicitly includes them.

Every discovered active document must satisfy `docs/spec/frontmatter.md` and appear exactly once as a file entry in the documentation index. Every indexed active-document entry must resolve to an existing included document. Prose mentions and machinery-table entries do not satisfy active-document index cardinality.

## Ownership questions

Canonical ownership questions are normalized with Unicode-aware behavior suitable for Spanish. Empty normalized keys fail. Exact normalized duplicates among canonical owners fail. Derived and scratch documents may answer a routed question only when they point to its canonical owner; semantic overlap still requires human review.

## Unresolved client-work markers

The active unresolved-token syntax is `@@PYME_UNRESOLVED:<KEY>@@`, where `<KEY>` uses uppercase ASCII letters, digits, and underscores and begins with a letter. A token means verified client-specific work remains incomplete.

Template mode permits a valid unresolved token only when `<actual file path>::<KEY>` appears exactly once in `memory.toml`'s `placeholders.allow`. Project mode rejects every valid unresolved token in scanned production-relevant paths. Literal examples belong in excluded fixtures or use an escaped/non-active representation documented by tests.

The initial repository-memory scan includes `PROJECT.md`, `README.md`, active knowledge documents, `src/`, and `public/`. It excludes `.git/`, `docs/archive/`, `docs/audits/`, `docs/migrations/`, test fixtures, caches, generated dependency directories, and binary files. Runtime production validation later extends the same contract to active client configuration, content, legal documents, and `dist/`.

## Result contract

Memory validation JSON is an object with integer `schema_version` (`1`), string `scope`, string `overall_status`, array `errors`, and array `checks`. Errors contain string `code`, nullable string `path`, and string `message`. Errors sort by path, code, then message.

Check results appear in the fixed order `build`, `test`, `lint`, `secret_scan` and contain string `name`, string `status`, nullable integer `exit_code`, nullable string `code`, string `diagnostic`, string `stdout`, string `stderr`, and boolean `stdout_truncated`/`stderr_truncated`. Captured streams are truncated to at most 65,536 characters including a terminal `...[TRUNCATED]` marker; truncation does not change the command's status or exit code.

Supported scopes are `contracts` and `all`. The library contract-validation API uses `contracts` and returns an empty `checks` array. The default CLI uses `all` and runs configured checks only after memory contracts pass. If contracts fail, every configured check is reported `UNVERIFIED` with code `CONTRACTS_FAILED`, while empty commands remain `NOT_CONFIGURED`.

`overall_status` is `PASSED` only when contracts pass and every configured check passes. It is `FAILED` when a contract or executed check fails, and `UNVERIFIED` when no failure occurred but at least one configured check could not start. `NOT_CONFIGURED` applies to individual checks, not the overall result.

Check codes are null for `PASSED`/`NOT_CONFIGURED`; `NONZERO_EXIT` for ordinary nonzero or signal termination; `TIMEOUT` for timeout with null exit code; `EXECUTABLE_NOT_FOUND` for a missing executable with null exit code; `START_ERROR` for another start failure with null exit code; and `CONTRACTS_FAILED` when execution is skipped. Timeout and nonzero execution are `FAILED`; start failures and contract-skipped configured checks are `UNVERIFIED` at the check level.

The CLI exits `0` for overall `PASSED`, `1` for `FAILED`, and `2` for `UNVERIFIED`; it emits a concise human report by default and supports JSON output for automation. A failing or unverified configured check never becomes success through omission.
