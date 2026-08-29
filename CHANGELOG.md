# Changelog

All notable template changes will be recorded here.

## Unreleased

- Made `src/config/navigation.ts` the canonical owner of the public route registry, deriving the sitemap filter, robots directive, form action, page links, required-artifact list and every route-aware test from it, so an adopted client repository can rename a route without failing its own required check and production build.
- Stopped asserting adopter-owned configuration as invariants in the security suite.
- Added a client production gate to CI that runs `quality:production` whenever memory mode is `project`, and gave the launch runbook literal commands.
- Reported structured findings rather than tracebacks from every command that imports the canonical data barrel.
- Widened the fabrication invariant to name address, contact and location facts, and recorded the outstanding dependency compatibility decisions with their CI evidence.
- Executed the client lifecycle end to end for the first time: initializer, human content steps, and all fourteen steps of `quality:production`, re-runnable as an archived harness.
- Implemented read-only GitHub quality and cross-browser workflows, structured contribution forms, review ownership, and monthly dependency maintenance configuration.
- Verified deterministic CI and the complete Chromium/WebKit browser matrix on GitHub-hosted Ubuntu.
- Established the Project 1 constitution and repository-native memory architecture.
- Added canonical specifications, decisions, runbooks, and reserved paths.
- Accepted the Phase 1.1 memory-validator hardening contract and the transition from planned architecture to verified implementation.
- Implemented and adversarially verified the Phase 1.1 memory contracts, configured-check runner, bounded output capture, and mutation-resistance gate.
- Added strictly validated machine-readable repository implementation state for Phase 1.2.
- Bootstrapped the pinned Node 24, Astro 7, TypeScript 6, npm, formatting, checking, and static-build foundation for Phase 2.
- Added strict canonical Zod contracts, bounded business-data domains, validation commands, and negative contract tests for Phase 3.
- Implemented and visually reviewed the neutral design-token foundation, CSS layers, reusable UI primitives, and responsive reference composition for Phase 4.
- Built and verified the shared layout, navigation, core and section components, and seven explicit static reference pages for Phase 5.
- Added verified metadata, sitemap and robots output, safe structured data, a canonical privacy-content surface, and a no-JavaScript Netlify contact form for Phase 6.
- Enabled Astro-generated CSP hashes, repository-owned Netlify security headers, immutable asset caching, and deterministic security configuration tests for Phase 7.
- Added the strict source-and-artifact production validation pipeline and public site manifest contract for Phase 8.
- Added Playwright critical-journey and Axe-assisted accessibility coverage for desktop, mobile, and narrow Chromium, configured WebKit coverage, and corrected skip-link focus transfer.
- Implemented file-driven client initialization with identity read back from its canonical owner.
- Added an importable default-branch ruleset carrying the verified required-check contexts.
- Added drift detection between the committed ruleset and the configuration GitHub enforces.
- Replaced dated repository-control and dependency snapshots with durable rules and a live verification command.
- Hardened the business-content layer: per-record publication approval for locations and services, production scanning across every canonical data domain, rejection of a published location closed all week, a bare-origin canonical URL contract, non-empty navigation, a standing template-version check, and a content-contract mutation-resistance suite.
- Implemented file-driven client initialization for Phase 12, which rewrites client identity and memory mode from one reviewed input document, refuses any result that production validation would reject for reasons it controls, and leaves human approvals outstanding.
