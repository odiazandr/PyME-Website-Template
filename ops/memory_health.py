#!/usr/bin/env python3
"""Deterministic health checks for repository-native project knowledge."""

from __future__ import annotations

import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
INDEX = DOCS / "INDEX.md"
KNOWLEDGE_DIRS = ("spec", "runbooks", "explain", "decisions")
REQUIRED = ("owner", "authority", "status", "answers")


def parse_frontmatter(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}
    data: dict[str, object] = {}
    current_list: str | None = None
    for line in text[4:end].splitlines():
        if line.startswith("  - ") and current_list:
            value = line[4:].strip().strip('"')
            cast = data.setdefault(current_list, [])
            if isinstance(cast, list):
                cast.append(value)
            continue
        match = re.match(r"^([a-z_]+):\s*(.*)$", line)
        if not match:
            continue
        key, raw = match.groups()
        current_list = key if raw == "" else None
        if raw == "":
            data[key] = []
        elif raw.startswith("[") and raw.endswith("]"):
            data[key] = [item.strip().strip('"') for item in raw[1:-1].split(",") if item.strip()]
        else:
            data[key] = raw.strip().strip('"')
    return data


def normalize_question(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def active_documents() -> list[Path]:
    paths = [INDEX, DOCS / "GLOSSARY.md"]
    for directory in KNOWLEDGE_DIRS:
        paths.extend(sorted((DOCS / directory).glob("*.md")))
    return paths


def run() -> list[str]:
    errors: list[str] = []
    index_text = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
    questions: dict[str, str] = {}

    for path in active_documents():
        relative = path.relative_to(ROOT).as_posix()
        metadata = parse_frontmatter(path)
        for field in REQUIRED:
            if not metadata.get(field):
                errors.append(f"{relative}: missing frontmatter field {field}")
        if metadata.get("owner") != relative:
            errors.append(f"{relative}: owner must equal repository path")
        if path != INDEX and f"`{relative}`" not in index_text:
            errors.append(f"{relative}: missing from docs/INDEX.md")
        answers = metadata.get("answers", [])
        if isinstance(answers, list):
            for answer in answers:
                key = normalize_question(str(answer))
                if key in questions:
                    errors.append(f"duplicate ownership question: {relative} and {questions[key]}")
                else:
                    questions[key] = relative

    config = tomllib.loads((ROOT / "memory.toml").read_text(encoding="utf-8"))
    if config.get("mode") == "project":
        for path in [ROOT / "PROJECT.md", *active_documents()]:
            if "TEMPLATE_PLACEHOLDER[" in path.read_text(encoding="utf-8"):
                errors.append(f"{path.relative_to(ROOT).as_posix()}: unresolved template placeholder")
    return errors


if __name__ == "__main__":
    failures = run()
    if failures:
        print("MEMORY HEALTH: FAILED")
        for failure in failures:
            print(f"- {failure}")
        sys.exit(1)
    print("MEMORY HEALTH: PASSED")
