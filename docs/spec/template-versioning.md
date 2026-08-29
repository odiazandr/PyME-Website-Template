---
owner: docs/spec/template-versioning.md
authority: canonical
status: active
answers: ["How is the foundation versioned?", "How are client migrations performed?"]
---
# Template versioning

The canonical foundation uses semantic versioning. Patch releases fix compatible defects; minor releases add compatible capabilities; major releases change architectural contracts.

Each client stores a stable site UUID and adopted template version. Ordinary client changes do not alter the template version. Foundation updates are reviewed, documented, released, and applied to clients through explicit migration branches and previewed diffs—never blind mass synchronization.

Repositories created from the template are independent projects. They should not add the canonical template as a live upstream that is pulled automatically into production. Template improvements move into a client repository only through an intentional migration branch with reviewed client-specific diffs.

The public `/.well-known/pyme-site.json` surface contains only schema version, site ID, template version, and canonical URL.
