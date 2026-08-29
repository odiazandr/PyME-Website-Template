#!/usr/bin/env python3
"""Small, local, redaction-safe scan for high-confidence secret signatures."""

from __future__ import annotations

import argparse
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MAX_FILE_BYTES = 1_048_576
EXCLUDED_DIRECTORIES = frozenset(
    {
        ".astro",
        ".cache",
        ".git",
        "__pycache__",
        "build",
        "cache",
        "coverage",
        "dist",
        "fixtures",
        "generated",
        "node_modules",
        "tests",
    }
)
EXCLUDED_PREFIXES = (Path("docs/archive"), Path("docs/audits"), Path("docs/migrations"))

# Construct sensitive-looking literals in pieces so this scanner does not flag
# its own signature definitions. Findings report only a path and rule code.
PATTERNS = (
    ("AWS_ACCESS_KEY", re.compile(b"A" + b"KIA" + rb"[0-9A-Z]{16}")),
    ("GITHUB_TOKEN", re.compile(b"gh" + rb"[pousr]_" + rb"[A-Za-z0-9]{36,}")),
    ("STRIPE_LIVE_KEY", re.compile(b"sk" + b"_live_" + rb"[A-Za-z0-9]{16,}")),
    ("SLACK_TOKEN", re.compile(b"xox" + rb"[baprs]-[A-Za-z0-9-]{20,}")),
    (
        "PRIVATE_KEY",
        re.compile(b"-----" + b"BEGIN" + rb"(?: [A-Z]+)? PRIVATE KEY-----"),
    ),
)


def is_scannable(path: Path, root: Path) -> bool:
    relative = path.relative_to(root)
    if any(relative.is_relative_to(prefix) for prefix in EXCLUDED_PREFIXES):
        return False
    return not any(part in EXCLUDED_DIRECTORIES for part in relative.parts)


def scan(root: Path) -> list[tuple[str, str]]:
    findings: list[tuple[str, str]] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or not is_scannable(path, root):
            continue
        try:
            if path.stat().st_size > MAX_FILE_BYTES:
                continue
            contents = path.read_bytes()
        except OSError:
            continue
        for code, pattern in PATTERNS:
            if pattern.search(contents):
                findings.append((path.relative_to(root).as_posix(), code))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    root = args.root.resolve()
    findings = scan(root)
    if findings:
        print("SECRET SCAN: FAILED")
        for path, code in findings:
            print(f"- {path}: {code}")
        return 1
    print("SECRET SCAN: PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
