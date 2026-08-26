# Branch rulesets

`main-protection.json` is an importable GitHub ruleset for the default branch. It
is version-controlled so the same protection can be applied to every client
repository rather than reconstructed from memory each time.

GitHub does not read this file. Import it under **Settings → Rules → Rulesets →
New ruleset → Import a ruleset**, or reproduce it through the form.

Because the import is manual, the file and the enforced configuration can diverge
silently, and the import itself adds platform defaults this file never declared.
`check-drift.py` closes that gap: run `npm run check:ruleset` to compare the two.
It reports only on fields this file declares, so platform defaults do not become
permanent noise, and it derives the repository from the git remote so it works
unchanged in a client repository.

It is deliberately not part of `npm run quality` or `npm run quality:production`.
It depends on an external service, and a gate that fails because a network is
down is not a deterministic gate. Run it when repository control changes.

## Why each rule is set the way it is

**Required status check contexts are job display names, not workflow names.** The
contexts are `Quality and contracts` (the `quality` job in `ci.yml`) and
`Chromium and WebKit` (the `browser` job in `browser-qa.yml`). Entering the
workflow names `CI` and `Browser QA` is the common mistake: nothing would ever
report those contexts, so pull requests would wait forever on checks that cannot
arrive. These two strings were read back from the check runs GitHub recorded on
commit `b8b4bca`, not inferred from the workflow files.

**`required_approving_review_count` is 0, deliberately.** GitHub does not allow
anyone to approve their own pull request. On a single-maintainer repository,
requiring one approval makes every pull request unmergeable by the only person
who can merge it. The protection here comes from requiring a pull request at all,
which is what causes both workflows to run before anything reaches the default
branch. Raise this to 1 as soon as a second reviewer exists.

**`bypass_actors` is empty.** `docs/spec/deployment.md` calls for an intentional
emergency-bypass policy, and an empty list is a decision rather than an
oversight: nothing bypasses the checks. A repository administrator can still
disable or edit the ruleset if the default branch ever needs emergency repair,
which is a deliberate and visible act rather than a silent exception. Add a
bypass actor only if that visibility becomes a real obstacle.

**Merge commits are excluded.** `required_linear_history` is enabled to match the
repository's existing linear history, so `allowed_merge_methods` lists only
`squash` and `rebase`. Leaving `merge` enabled alongside linear history produces
merges that the ruleset then rejects.

**`strict_required_status_checks_policy` requires branches to be current.** A
branch must be up to date with the default branch before merging, so checks pass
against the code that will actually exist afterwards rather than against a stale
base. This is what makes a green check meaningful; it also means dependency
branches need a rebase before they can merge.

**`~DEFAULT_BRANCH` rather than a literal name.** The ruleset applies unchanged in
a client repository whatever its default branch is called.

## Workflow triggers this depends on

Both workflows run on `pull_request` for any branch and on `push` only to the
default branch. A branch push alone therefore triggers nothing, which is why a
required pull request is the mechanism that gets the checks to run before a merge
rather than after it.
