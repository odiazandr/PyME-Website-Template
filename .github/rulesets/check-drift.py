"""Compare the committed ruleset against what GitHub actually enforces.

GitHub does not read `main-protection.json`; it is a copy that must be imported.
The import applies platform defaults the committed file never declared, and
nothing otherwise detects a later divergence. This closes that gap.

Only fields the committed file declares are compared, so platform defaults do
not create permanent noise. A field the committed file declares and the live
ruleset contradicts is real drift and fails.

Reads only, and needs no credentials for a public repository. It is deliberately
NOT part of `npm run quality` or `npm run quality:production`: it depends on an
external service, and a gate that can fail because a network is down is not a
deterministic gate. Run it when repository control changes, or on a schedule.

Usage:
    python .github/rulesets/check-drift.py [--json] [owner/repo]
"""

import json
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.request

COMMITTED = pathlib.Path(__file__).with_name("main-protection.json")


def resolve_repository(argv: list[str]) -> str | None:
    """Prefer an explicit argument, else derive from the git origin remote."""
    positional = [a for a in argv if not a.startswith("--")]
    if positional:
        return positional[0]
    try:
        url = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=15, check=True,
        ).stdout.strip()
    except Exception:
        return None
    match = re.search(r"[:/]([^/:]+)/([^/]+?)(?:\.git)?$", url)
    return f"{match.group(1)}/{match.group(2)}" if match else None


def fetch(url: str):
    request = urllib.request.Request(
        url,
        headers={"Accept": "application/vnd.github+json", "User-Agent": "ruleset-drift-check"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def compare(committed: dict, live: dict) -> list[str]:
    findings: list[str] = []

    if live.get("enforcement") != "active":
        findings.append(f"enforcement is {live.get('enforcement')!r}, expected 'active'")

    want_ref = committed.get("conditions", {}).get("ref_name", {})
    got_ref = live.get("conditions", {}).get("ref_name", {})
    for key in ("include", "exclude"):
        if sorted(want_ref.get(key, [])) != sorted(got_ref.get(key, [])):
            findings.append(
                f"conditions.ref_name.{key}: committed {want_ref.get(key)!r} live {got_ref.get(key)!r}"
            )

    want_rules = {r["type"]: r.get("parameters", {}) for r in committed.get("rules", [])}
    got_rules = {r["type"]: r.get("parameters", {}) for r in live.get("rules", [])}

    for missing in sorted(set(want_rules) - set(got_rules)):
        findings.append(f"rule {missing!r} is committed but NOT enforced")
    for extra in sorted(set(got_rules) - set(want_rules)):
        findings.append(f"rule {extra!r} is enforced but NOT committed")

    for rule_type in sorted(set(want_rules) & set(got_rules)):
        want, got = want_rules[rule_type], got_rules[rule_type]
        for key, want_value in sorted(want.items()):
            if key not in got:
                findings.append(f"{rule_type}.{key}: committed {want_value!r}, absent from live")
                continue
            got_value = got[key]
            if key == "required_status_checks":
                want_contexts = sorted(c["context"] for c in want_value)
                got_contexts = sorted(c["context"] for c in got_value)
                if want_contexts != got_contexts:
                    findings.append(
                        f"{rule_type}.{key}: committed {want_contexts} live {got_contexts}"
                    )
            elif isinstance(want_value, list) and isinstance(got_value, list):
                if sorted(map(str, want_value)) != sorted(map(str, got_value)):
                    findings.append(f"{rule_type}.{key}: committed {want_value!r} live {got_value!r}")
            elif want_value != got_value:
                findings.append(f"{rule_type}.{key}: committed {want_value!r} live {got_value!r}")

    return findings


def main() -> int:
    repository = resolve_repository(sys.argv[1:])
    if repository is None:
        print("RULESET DRIFT: UNVERIFIED - could not determine owner/repo")
        return 2

    committed = json.loads(COMMITTED.read_text(encoding="utf-8"))
    api = f"https://api.github.com/repos/{repository}/rulesets"

    try:
        rulesets = fetch(api)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
        # Unreachable is unverified, never a pass and never a failure.
        print(f"RULESET DRIFT: UNVERIFIED - could not reach the API ({exc})")
        return 2

    matches = [r for r in rulesets if r.get("name") == committed.get("name")]
    if not matches:
        found = [r.get("name") for r in rulesets]
        print(
            f"RULESET DRIFT: FAILED - no live ruleset named {committed.get('name')!r} "
            f"on {repository}; found {found}"
        )
        return 1

    live = fetch(f"{api}/{matches[0]['id']}")
    findings = compare(committed, live)

    if "--json" in sys.argv:
        print(json.dumps(
            {"repository": repository, "ruleset_id": matches[0]["id"], "findings": findings},
            indent=2,
        ))
    elif findings:
        print("RULESET DRIFT: FAILED")
        for finding in findings:
            print(f"- {finding}")
    else:
        print("RULESET DRIFT: PASSED")
        print(f"- live ruleset {matches[0]['id']} matches every field the committed file declares")

    return 1 if findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
