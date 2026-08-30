---
owner: docs/runbooks/create-client-site.md
authority: canonical
status: active
answers: ["How is a new client repository initialized?"]
---

# Create a client site

Create a private repository from the template, then initialize it. Provisioning external accounts is outside this repository.

Run these steps only inside the independent client repository. If the current Git remote is `https://github.com/odiazandr/PyME-Website-Template.git` and `memory.toml` is still in template mode, stop: create or switch to the client repository first.

## 1. Write the input document

Collect the verified business facts into one JSON file kept outside the repository. Its contract is `src/schemas/client-init.ts`: unknown fields, non-HTTPS canonical URLs, and malformed phone or email values are rejected.

```json
{
  "schemaVersion": 1,
  "deploymentContext": "production",
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

`deploymentContext` defaults to `production`. Set it to `rehearsal` only for an explicitly authorized hypothetical-business exercise; the site visibly identifies itself as a demonstration and the production gate will refuse it.

`site.siteId` and `site.titleTemplate` are optional. A missing site ID is generated on first adoption and preserved automatically on later runs, because `src/config/site.ts` owns it; pass `--new-identity` only when a deliberately different site is intended. A missing title template becomes the public name.

## 2. Run the initializer

```
npm run init:client -- ../taller-nopal.json --dry-run
npm run init:client -- ../taller-nopal.json
```

The command rewrites `src/config/site.ts`, `src/data/business.json`, and the memory mode in `memory.toml`. It refuses to run when the repository is already in project mode unless `--force` is passed, when the recorded template version has drifted from `package.json`, and when the result would still fail production validation for any reason it controls. It acquires an exclusive `.pyme-init.lock`, stages every replacement, and restores originals if staging or commit fails. Do not run two initializers at once. If a crash leaves the lock behind, first confirm no initializer process is running, preserve the three canonical files and any `.pyme-init-*` backup files, then remove only the stale lock before retrying.

Delete the input document afterward. Its facts now belong to their canonical owners, and a second copy is a duplicate authority.

## 3. Complete the remaining human steps

The initializer reports what it deliberately left outstanding, and none of it may be self-authorized by an agent:

- Replace `src/content/legal/aviso-de-privacidad.md` with the client's approved notice.
- Populate services, locations, team, testimonials, and social accounts, setting `approvedForPublication` on each record only after a person has confirmed it.
- Customize brand and information architecture.
- Set each flag in `src/data/production.json` only after the verification it records has actually happened.

Then use previews and the production gate owned by `docs/spec/website-validation.md`.

## 4. Rehearse with a hypothetical business

A hypothetical-business rehearsal still needs a real disposable client repository and a deployment target that are safe to publish. Do not use this canonical template repository or an unrelated existing Netlify project as the example.

Before starting the rehearsal, prepare:

- a synthetic business packet with no real person's private data;
- a new private GitHub client repository created from this template;
- a dedicated disposable/example Netlify site linked only to that client repository;
- explicit human approval to mark the synthetic facts, privacy notice, and domain ownership as verified for the rehearsal;
- a planned rollback check for the same disposable/example site.

Record `"deploymentContext": "rehearsal"` in the input document. It is an explicit public-status declaration, not a substitute for the separate human approvals.
