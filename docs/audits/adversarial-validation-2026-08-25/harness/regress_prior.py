"""Regression harness: re-run the 2026-08-24 campaign's confirmed findings
against the current hardened validator.

Each mutation SHOULD now be rejected (nonzero exit). A zero exit means the
prior finding is still open.

Usage: python regress_prior.py <sandbox-root>
"""

import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(sys.argv[1])
PRISTINE = ROOT.parent / (ROOT.name + "-pristine")

# Files a mutation may touch; restored from the pristine snapshot each time.
TOUCHED = [
    "memory.toml",
    "docs/INDEX.md",
    "docs/spec/seo.md",
    "docs/spec/security.md",
    "PROJECT.md",
]


def snapshot() -> None:
    if PRISTINE.exists():
        shutil.rmtree(PRISTINE, ignore_errors=True)
    PRISTINE.mkdir(parents=True)
    for rel in TOUCHED:
        src = ROOT / rel
        if src.exists():
            dst = PRISTINE / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)


def restore() -> None:
    for rel in TOUCHED:
        src, dst = PRISTINE / rel, ROOT / rel
        if src.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
        elif dst.exists():
            dst.unlink()


def write(rel: str, text: str) -> None:
    (ROOT / rel).write_text(text, encoding="utf-8", newline="\n")


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def validator() -> tuple[int, str]:
    proc = subprocess.run(
        [sys.executable, "ops/memory_health.py", "--scope", "contracts"],
        cwd=ROOT, capture_output=True, text=True, timeout=300,
        encoding="utf-8", errors="replace",
    )
    return proc.returncode, (proc.stdout + proc.stderr)


# --- mutations -------------------------------------------------------------

def m_bogus_mode() -> None:
    write("memory.toml", read("memory.toml").replace('mode = "template"', 'mode = "bogus"'))


def m_missing_mode() -> None:
    write("memory.toml", "\n".join(
        line for line in read("memory.toml").splitlines() if not line.startswith("mode")
    ) + "\n")


def m_delete_indexed_doc() -> None:
    (ROOT / "docs/spec/seo.md").unlink()


def m_duplicate_index_entry() -> None:
    text = read("docs/INDEX.md")
    row = "| T2 | `docs/spec/seo.md` | Metadata, canonicalization, sitemap, and schema |"
    assert row in text, "index row not found"
    write("docs/INDEX.md", text.replace(row, row + "\n" + row, 1))


def m_invalid_authority() -> None:
    text = read("docs/spec/seo.md")
    write("docs/spec/seo.md", text.replace("authority: canonical", "authority: banana", 1))


def m_invalid_status() -> None:
    text = read("docs/spec/seo.md")
    write("docs/spec/seo.md", text.replace("status: active", "status: imaginary", 1))


def m_scalar_answers() -> None:
    text = read("docs/spec/seo.md")
    start = text.index("answers:")
    end = text.index("\n---", start)
    write("docs/spec/seo.md", text[:start] + 'answers: "just one string"' + text[end:])


def m_unindexed_doc() -> None:
    write("docs/spec/orphan-contract.md", (
        "---\nowner: docs/spec/orphan-contract.md\nauthority: canonical\n"
        "status: active\nanswers: [\"What is an orphan contract?\"]\n---\n"
        "# Orphan\n\nThis document is not listed in the index.\n"
    ))


def m_duplicate_ownership_question() -> None:
    text = read("docs/spec/security.md")
    seo = read("docs/spec/seo.md")
    start = seo.index("answers:")
    end = seo.index("\n", start)
    stolen = seo[start:end]
    s = text.index("answers:")
    e = text.index("\n", s)
    write("docs/spec/security.md", text[:s] + stolen + text[e:])


def m_malformed_toml() -> None:
    write("memory.toml", 'schema_version = 1\nmode = "template\n[checks\n')


def m_unknown_config_key() -> None:
    write("memory.toml", read("memory.toml") + '\nrogue_key = "surprise"\n')


def m_project_mode_self_reject() -> None:
    # AV-002: does project mode still reject PROJECT.md's own explanation?
    write("memory.toml", read("memory.toml").replace('mode = "template"', 'mode = "project"'))


def m_invalid_utf8() -> None:
    (ROOT / "docs/spec/seo.md").write_bytes(b"---\nowner: docs/spec/seo.md\n\xff\xfe invalid\n")


MUTATIONS = [
    ("AV-001a", "bogus memory mode", m_bogus_mode, "reject"),
    ("AV-001b", "missing memory mode", m_missing_mode, "reject"),
    ("AV-003", "deleted indexed document", m_delete_indexed_doc, "reject"),
    ("AV-005", "duplicate index entry", m_duplicate_index_entry, "reject"),
    ("AV-004a", "invalid authority value", m_invalid_authority, "reject"),
    ("AV-004b", "invalid status value", m_invalid_status, "reject"),
    ("AV-004c", "scalar answers field", m_scalar_answers, "reject"),
    ("AV-003b", "active doc missing from index", m_unindexed_doc, "reject"),
    ("AV-011", "duplicate ownership question", m_duplicate_ownership_question, "reject"),
    ("AV-008a", "malformed TOML", m_malformed_toml, "reject"),
    ("AV-008b", "unknown config key", m_unknown_config_key, "reject"),
    ("AV-008c", "invalid UTF-8 in knowledge doc", m_invalid_utf8, "reject"),
    ("AV-002", "project mode on canonical template", m_project_mode_self_reject, "accept"),
]


def main() -> int:
    snapshot()
    code, out = validator()
    print(f"pristine baseline: exit={code} {'OK' if code == 0 else 'UNEXPECTED'}")
    print()

    results = []
    for ident, label, mutate, expectation in MUTATIONS:
        restore()
        for extra in ["docs/spec/orphan-contract.md"]:
            p = ROOT / extra
            if p.exists():
                p.unlink()
        try:
            mutate()
        except Exception as exc:  # mutation itself could not be applied
            results.append({"id": ident, "label": label, "outcome": "MUTATION_ERROR", "detail": str(exc)})
            print(f"{ident:<9} {label:<38} MUTATION_ERROR {exc}")
            continue
        code, out = validator()
        rejected = code != 0
        want_reject = expectation == "reject"
        ok = rejected == want_reject
        outcome = "CLOSED" if ok else "STILL_OPEN"
        crashed = "Traceback" in out
        if crashed:
            outcome = "CRASH"
        results.append({
            "id": ident, "label": label, "expectation": expectation,
            "exit": code, "rejected": rejected, "outcome": outcome,
            "traceback": crashed,
            "output": out.strip()[:400],
        })
        print(f"{ident:<9} {label:<38} exit={code} want={expectation:<7} {outcome}")

    restore()
    for extra in ["docs/spec/orphan-contract.md"]:
        p = ROOT / extra
        if p.exists():
            p.unlink()
    code, _ = validator()
    print(f"\npost-restore baseline: exit={code} {'OK' if code == 0 else 'DIRTY'}")

    out_path = ROOT.parent.parent / "evidence" / "regression-prior-findings.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8", newline="\n")
    print(f"\nwrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
