---
owner: docs/spec/template-versioning.md
authority: canonical
status: active
answers: ["How is the foundation versioned?", "How are client migrations performed?"]
---
# Template versioning

The canonical foundation uses semantic versioning. Patch releases fix compatible defects; minor releases add compatible capabilities; major releases change architectural contracts.

Each client stores a stable site UUID and adopted template version. Ordinary client changes do not alter the template version. Foundation updates are reviewed, documented, released, and applied to clients through explicit migration branches and previewed diffs—never blind mass synchronization.

The public `/.well-known/pyme-site.json` surface contains only schema version, site ID, template version, and canonical URL.
