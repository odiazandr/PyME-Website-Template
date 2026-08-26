---
owner: docs/decisions/0111-file-driven-client-initialization.md
authority: canonical
status: active
answers: ["Why does client initialization read a reviewed input file?"]
---
# 0111 — File-driven client initialization

## Decision

`scripts/init-client.ts` reads one strict JSON input document and rewrites the canonical owners of client identity. It never prompts interactively and never infers a business fact.

The input contract is `src/schemas/client-init.ts`, which embeds the existing business contract rather than restating it. Only three files change: `src/config/site.ts`, `src/data/business.json`, and the memory mode in `memory.toml`. Site identity is read back from its canonical owner. When the input omits `siteId`, the initializer reuses the identity already recorded in `src/config/site.ts` rather than minting a new one, because that file owns the fact and asking the input document to repeat it would create a second copy. A new identity is issued only for a repository still carrying the sample identity, or when `--new-identity` is passed deliberately. `docs/decisions/0112-per-record-publication-approval.md` records the surrounding content contracts.

Initialization is refused unless the resulting source would satisfy `scripts/validate-production.ts` for every reason inside the command's control. The initializer therefore owns no second copy of the sample-value, canonical-domain, or project-mode rules; it projects the real production validator over its own planned result and stops on any finding it is responsible for.

Production findings the initializer does not own are deliberately left outstanding: the three approval flags in `src/data/production.json`, the unapproved privacy notice, and per-record review of locations and services. The command reports them as remaining human verification.

## Consequences

Initialization is reviewable before it runs, replayable in continuous integration, and diffable afterward, because its whole input is a file rather than a terminal transcript. `--dry-run` reports the plan without writing, and `--force` is required to overwrite a repository already in project mode.

An agent cannot complete a client launch alone. Business facts, domain ownership, and legal text remain human attestations, so passing initialization never implies production approval. Adding a sample sentinel or a new production rule to `scripts/validate-production.ts` automatically tightens initialization without a second edit; removing one automatically loosens it, which makes that file the single place to review these rules.

Generated files are written through Prettier using the repository configuration, so initialization cannot break `npm run format:check`. Data objects are serialized without indentation before formatting because Prettier preserves an object the author already expanded.
