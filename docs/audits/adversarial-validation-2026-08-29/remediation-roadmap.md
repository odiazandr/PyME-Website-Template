# Remediation roadmap

Ranking uses demonstrated impact first, then confidence, implementation cost, implementation risk, and dependency order. Discovery and repair remain separate: this campaign changed no canonical product source.

## Immediate containment

| Rank | Action | Finding | Impact | Evidence | Cost | Implementation risk | Dependency |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Do not interpret `quality:production` as launch approval until residual reference-state UI is removed or gate-owned. Add a manual built-output check for the enumerated phrases to the launch checklist meanwhile. | C5-001 | High | Confirmed end to end | Low containment | Low | None |
| 2 | Reject non-HTTP(S) values in all public navigation/asset URL fields; until fixed, manually inspect canonical URL-bearing data before production. | C5-003 | Medium | Confirmed schema, build, artifact, gate | Low | Low | Define each field's allowed protocols |
| 3 | Back up the three initializer-owned files before a real initialization and run only one initializer at a time. If it fails, restore all three together before retrying. | C5-002, C5-D01 | Medium | Confirmed fault and concurrency evidence | Low containment | Low | None |

## High-priority fixes

1. Centralize publication-state sentinels and production rendering. Project mode with approvals should render client-safe status, not distribution-template disclaimers. Make the production output validator reject every unresolved reference state. This closes `C5-001` and must precede any client launch.
2. Replace generic `z.url()` at public sinks with semantic schemas such as `HttpUrlSchema`, `HttpsAssetUrlSchema`, and any deliberately permitted contact protocol. Add defense-in-depth artifact scanning. This closes `C5-003`.
3. Make initialization transactional and recoverable. Prepare and validate all content first, write same-directory temporary files, acquire an atomic claim/lock, commit as a unit with rollback, and verify final hashes/state. This closes `C5-002` and can close accepted `AV2-006` at the same architectural boundary.
4. Protect the `quality:production` owner. Add a contract for required ordered steps and run it against a minimal passing project fixture. Mutation of the script to no-op, deletion, or reordering must fail. This closes `C5-004`.
5. Require a real artifact when resolving links. A directory is valid only when its documented index artifact exists. This closes `C5-005`.

## Documentation corrections

- Update `docs/spec/accessibility.md` and `docs/spec/browser-support.md`: current Windows WebKit launches, but the tablet project is not presently green/reliable. Keep historical Ubuntu evidence scoped to its recorded commit and host.
- State that the form trace proves browser-side POST construction, not provider-side capture, retention, notification, or privacy handling.
- Make the template/project lifecycle and remaining post-initialization approvals visible near first-run/deploy instructions.
- When a real provider/site exists, add authorized provider-specific rollback and incident appendices with exact evidence capture and stop conditions. Do not invent these procedures before ownership exists.

## Test improvements

- Add the deterministic regressions in `regression-tests.md`.
- Change WebKit form capture from `postData()` text to decoded buffer/server-received parameters.
- Split skip-link programmatic activation from hardware/sequential keyboard coverage and record `document.activeElement` on failure.
- Configure a pinned local/CI secret scanner using synthetic redacted-token tests (`C5-008`).
- Keep the conditioned `PPPP` scenario as a durable passing production fixture and one case per owned production diagnostic as negative fixtures.
- Add bounded mutation checks for production script steps, output sentinels, and artifact link resolution.

## Architecture improvements

- Treat publication readiness as typed state consumed by both rendering and validation. Avoid separately maintained prose sentinels as the primary control.
- Treat filesystem initialization as a transaction boundary, not a sequence of independent file writes.
- Distinguish URL syntax, navigation URL policy, asset URL policy, and canonical-origin policy with named schemas.
- Expose validator functions with injectable roots and filesystem interfaces so negative/fault tests do not require canonical mutation.
- Represent the production-gate step list in one structured owner that both npm orchestration and tests consume.

## Long-term hardening

- Run current Chromium, WebKit, and Firefox evidence on supported CI hosts; add real Safari/iPad manual evidence only when it is a declared support target.
- Verify live response headers, form capture, privacy behavior, deploy/rollback, and DNS only against an explicitly authorized disposable provider site.
- Add controlled filesystem fault injection for permission, disk-full, interruption, and rollback failures.
- Test clean installation and generated artifacts on Linux and macOS, including case-sensitive paths.
- Exercise supported upgrade/downgrade policy before changing the Node 24/Astro/TypeScript compatibility line.
- Periodically rerun the seeded scenario suite and compare machine-readable signatures, while adding deterministic tests for every confirmed root cause.

## Dependency order

`C5-001 containment` -> `publication-state owner` -> `passing production fixture` -> `production script mutation test` -> `provider launch evidence`

`URL protocol decision` -> `semantic schemas` -> `artifact defense-in-depth` -> `cross-platform URL fuzzing`

`initializer backup procedure` -> `transaction design` -> `fault tests` -> `optional concurrency support`

