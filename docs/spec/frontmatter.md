---
owner: docs/spec/frontmatter.md
authority: canonical
status: active
answers: ["What metadata must knowledge documents declare?"]
---
# Knowledge frontmatter

Active knowledge documents use a deliberately small, strict YAML-compatible frontmatter subset delimited by `---` lines. The validator does not claim support for arbitrary YAML.

Required keys occur exactly once:

- `owner`: repository-relative POSIX path equal to the document's actual path; absolute paths, traversal segments, backslashes, and duplicate keys fail.
- `authority`: exactly `canonical`, `derived`, or `scratch`.
- `status`: exactly `active`, `superseded`, or `archived`.
- `answers`: a non-empty list of non-empty quoted question strings.

Unknown keys fail for schema version 1. Duplicate keys, scalar `answers`, empty questions, malformed quoting, unsupported indentation, invalid UTF-8, a byte-order mark, missing delimiters, and trailing content on a delimiter produce structured failures.

Documents discovered in active roots must have status `active`. Superseded and archived knowledge moves through the lifecycle owned by `docs/spec/memory-system.md`; it does not remain disguised as active knowledge. Canonical documents own truth, derived documents point to canonical truth, and scratch documents cannot establish policy.
