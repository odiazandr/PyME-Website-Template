---
owner: docs/decisions/0103-typescript-policy.md
authority: canonical
status: active
answers: ["How is TypeScript version compatibility governed?"]
---
# ADR 0103: TypeScript policy

Status: accepted.

Document a tested compatibility line and pin the exact release in the package manifest and lockfile. Begin with the TypeScript 6 line required by the planned Astro checking workflow; upgrade deliberately when the toolchain is verified.
