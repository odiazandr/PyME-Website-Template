---
owner: docs/runbooks/create-client-site.md
authority: canonical
status: active
answers: ["How is a new client repository initialized?"]
---
# Create a client site

Create a private repository from the template, then initialize it. Provisioning external accounts is outside this repository.

## 1. Write the input document

Collect the verified business facts into one JSON file kept outside the repository. Its contract is `src/schemas/client-init.ts`: unknown fields, non-HTTPS canonical URLs, and malformed phone or email values are rejected.

```json
{
  "schemaVersion": 1,
  "site": { "canonicalUrl": "https://tallernopal.mx" },
  "business": {
    "schemaVersion": 1,
    "publicName": "Taller Nopal",
    "legalName": "Taller Nopal S.A. de C.V.",
    "description": "Carpinteria local especializada en muebles a medida.",
    "primaryPhone": { "display": "+52 222 123 4567", "e164": "+522221234567" },
    "email": "hola@tallernopal.mx",
    "whatsapp": { "enabled": false, "number": null }
  }
}
```

`site.siteId` and `site.titleTemplate` are optional. A missing site ID is generated on first adoption and preserved automatically on later runs, because `src/config/site.ts` owns it; pass `--new-identity` only when a deliberately different site is intended. A missing title template becomes the public name.

## 2. Run the initializer

```
npm run init:client -- ../taller-nopal.json --dry-run
npm run init:client -- ../taller-nopal.json
```

The command rewrites `src/config/site.ts`, `src/data/business.json`, and the memory mode in `memory.toml`. It refuses to run when the repository is already in project mode unless `--force` is passed, when the recorded template version has drifted from `package.json`, and when the result would still fail production validation for any reason it controls. Nothing is written unless every check passes.

Delete the input document afterward. Its facts now belong to their canonical owners, and a second copy is a duplicate authority.

## 3. Complete the remaining human steps

The initializer reports what it deliberately left outstanding, and none of it may be self-authorized by an agent:

- Replace `src/content/legal/aviso-de-privacidad.md` with the client's approved notice.
- Populate services, locations, team, testimonials, and social accounts, setting `approvedForPublication` on each record only after a person has confirmed it.
- Customize brand and information architecture.
- Set each flag in `src/data/production.json` only after the verification it records has actually happened.

Then use previews and the production gate owned by `docs/spec/website-validation.md`.
