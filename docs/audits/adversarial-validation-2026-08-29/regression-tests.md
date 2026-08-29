# Proposed minimal regression tests

No canonical source/test implementation was authorized in this discovery phase. These tests are specified so the repair phase can add them with a clear failing-before-fix oracle.

## RT-001 — production artifact has no reference state

- Fixture: initialized project, client identity/domain, all required approvals, approved privacy, verified canonical collections.
- Command: run the real `npm run quality:production`.
- Assertion: visible text extracted from every public HTML artifact contains none of the centrally owned reference/not-authorized/pending-verification sentinels.
- Before fix: fails on `SiteFooter`, `StatusRegister`, services/contact/about/thank-you presentation copy.
- Protected invariant: a strict green production artifact does not disclaim that it is unreal or unauthorized.

## RT-002 — initializer rolls back a final-write fault

- Inject a filesystem interface whose third write/commit returns an `EACCES`/`EPERM` failure.
- Assert nonzero structured result.
- Assert byte-identical content and metadata for `src/config/site.ts`, `src/data/business.json`, and `memory.toml`.
- Before fix: first two files change and memory remains template.
- Protected invariant: initialization is all-or-nothing.

## RT-003 — concurrent initialization has one winner

- Barrier-synchronize two subprocesses immediately before the atomic claim.
- Assert exactly one success and one `ALREADY_INITIALIZED` result.
- Assert all three final owners correspond to the successful fixture.
- Before fix: both return success.
- Protected invariant: the mode guard cannot be bypassed by concurrent starts.

## RT-004 — public URL protocols are semantic

- Table-test every public URL field with `https`, permitted `http` if deliberate, `javascript`, `data`, `file`, `vbscript`, protocol-relative, userinfo, path/query/fragment, Unicode host, IP, and port cases.
- Separately feed a disallowed `href` into a built artifact and assert the production output gate rejects it.
- Before fix: generic URL fields accept multiple non-web schemes and map URL reaches HTML.
- Protected invariant: browser navigation/asset sinks receive only explicitly permitted protocols.

## RT-005 — production owner script cannot become a no-op

- Parse `package.json` and compare `quality:production` with the single structured owner of the required ordered steps.
- Mutants: replace with exit 0; delete each step; reorder build/artifact steps; replace a production validator with development quality.
- Assert every mutant fails the contract.
- Run the unmodified owner against the passing project fixture.
- Protected invariant: CI invokes the complete strict gate, not merely a command with the expected name.

## RT-006 — directory is not a route without an index

- Cases: ordinary file, extension fallback, directory with `index.html`, directory without index, missing path, path escaping `dist`.
- Assert only the documented deployable targets pass.
- Before fix: directory without index passes.
- Protected invariant: every accepted internal link resolves to a served artifact.

## RT-007 — WebKit form payload uses a stable representation

- Submit URL-encoded fields containing spaces and non-ASCII text.
- Decode `postDataBuffer()` or a local test server's received bytes.
- Compare field values, not raw serializer formatting.
- Run repeatedly on WebKit and Chromium.
- Before fix: WebKit can expose empty `postData()` and produce a false failure despite correct bytes.
- Protected invariant: the test measures payload semantics across engines.

## RT-008 — skip link separates activation from traversal

- Test A: focus `.skip-link` directly, activate with Enter, assert the main target is focused.
- Test B: on hosts with supported sequential keyboard semantics, Tab from a known initial focus and assert the skip link is first; log `activeElement` on failure.
- Before fix: iPad WebKit emulation fails before activation and obscures what behavior is unverified.
- Protected invariant: product activation and environment keyboard traversal have separate evidence.

## RT-009 — configured secret scan is redaction safe

- Synthetic fixture contains a fake provider token with a known prefix and random body.
- Assert nonzero scan result, stable diagnostic code, and no full token body in stdout/stderr/report.
- Clean fixture contains documented public sample values and passes.
- Protected invariant: likely credentials cannot enter the repository unnoticed or leak through the scanner's own logs.

