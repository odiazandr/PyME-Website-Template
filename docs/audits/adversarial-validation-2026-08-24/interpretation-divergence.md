# Interpretation-divergence report

Three independent Luna agents received different limited context.

| Topic | README-only model | Agent-entry model | Operator/security model | Divergence |
|---|---|---|---|---|
| Purpose | Documentation-first website foundation | Template-mode foundation with canonical retrieval | Future deployable system with security boundaries | Aligned |
| Implementation status | Explicitly no runtime or commands | Correctly treated data owners as planned | Some planned controls were assessed as if launch-ready | Moderate |
| Source of truth | Index locates owners | Constitution → index → runbook/spec | Security/deployment specifications | Aligned |
| Location workflow | Not visible without following pointers | Correctly found add-location and related specs | Not assessed | Expected context gap |
| Configured checks | Potentially unclear from onboarding | Correctly identified one configured test and unverified empty checks | Expected production gates not yet executable | Moderate |
| Recovery | No concrete general recovery from root docs | Not part of task model | Rollback relies on unspecified stored evidence and access | High operational gap |
| Security reporting | No concrete private channel | Not part of task model | Same missing channel plus incident sequencing gaps | Strong convergence |
| Ownership | Canonical routing implied | Correctly avoided Working Set as authority | Project 1/2 observation permissions underspecified | Moderate |

The entry-point architecture successfully guided a fresh agent. The largest plausible misunderstanding is treating future specifications as implemented controls. The repository repeatedly says the runtime is absent, but operational documents use imperative language without always labeling their steps unavailable in the current phase.
