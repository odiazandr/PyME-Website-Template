#!/usr/bin/env python3
"""Deterministic health checks for repository-native project knowledge."""

from __future__ import annotations

import re
import sys
import tomllib
from pathlib import Path, PurePosixPath
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
INDEX = DOCS / "INDEX.md"
KNOWLEDGE_DIRS = ("spec", "runbooks", "explain", "decisions")
REQUIRED = ("owner", "authority", "status", "answers")
CONFIG_KEYS = frozenset({"schema_version", "mode", "checks", "placeholders", "working_set"})
CHECK_NAMES = ("build", "test", "lint", "secret_scan")
WORKING_SET_KEYS = frozenset({"enabled", "directory", "maximum_pointers", "maximum_reason_length"})
PLACEHOLDER_KEY = re.compile(r"^[A-Z][A-Z0-9_]*$")
SHELL_EXECUTABLES = frozenset({"sh", "bash", "zsh", "fish", "cmd", "cmd.exe", "powershell", "powershell.exe", "pwsh", "pwsh.exe"})
SHELL_METATOKENS = frozenset({"|", "||", "&&", ";", "<", ">", ">>", "1>", "1>>", "2>", "2>>", "&>"})


def error(code: str, path: str | None, message: str) -> dict[str, str | None]:
    return {"code": code, "path": path, "message": message}


def safe_relative_posix(value: object) -> bool:
    if (
        not isinstance(value, str)
        or not value
        or "\\" in value
        or ":" in value
        or any(character in value for character in "*?[]")
        or value.startswith("/")
        or value.endswith("/")
        or any(ord(character) < 32 for character in value)
    ):
        return False
    raw_parts = value.split("/")
    if any(part in {"", ".", ".."} or part.endswith((".", " ")) for part in raw_parts):
        return False
    path = PurePosixPath(value)
    return not path.is_absolute() and list(path.parts) == raw_parts


def validate_config(root: Path = ROOT) -> tuple[dict[str, Any] | None, list[dict[str, str | None]]]:
    path = root / "memory.toml"
    relative = "memory.toml"
    errors: list[dict[str, str | None]] = []
    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None, [error("CONFIG_MISSING", relative, "required configuration file is missing")]
    except UnicodeError:
        return None, [error("CONFIG_INVALID_UTF8", relative, "configuration must be valid UTF-8")]
    except OSError as exc:
        return None, [error("CONFIG_UNREADABLE", relative, f"configuration could not be read: {exc.strerror or exc}")]

    try:
        config = tomllib.loads(raw)
    except tomllib.TOMLDecodeError as exc:
        return None, [error("CONFIG_MALFORMED_TOML", relative, f"invalid TOML: {exc}")]

    actual_keys = set(config)
    for key in sorted(CONFIG_KEYS - actual_keys):
        errors.append(error("CONFIG_MISSING_KEY", relative, f"missing top-level key: {key}"))
    for key in sorted(actual_keys - CONFIG_KEYS):
        errors.append(error("CONFIG_UNKNOWN_KEY", relative, f"unknown top-level key: {key}"))

    schema_version = config.get("schema_version")
    if type(schema_version) is not int:
        errors.append(error("CONFIG_INVALID_SCHEMA_TYPE", relative, "schema_version must be an integer"))
    elif schema_version != 1:
        errors.append(error("CONFIG_UNSUPPORTED_SCHEMA", relative, f"unsupported schema_version: {schema_version}"))

    mode = config.get("mode")
    if not isinstance(mode, str) or mode not in {"template", "project"}:
        errors.append(error("CONFIG_INVALID_MODE", relative, "mode must be exactly template or project"))

    checks = config.get("checks")
    if not isinstance(checks, dict):
        errors.append(error("CONFIG_INVALID_CHECKS", relative, "checks must be a table"))
    else:
        actual_checks = set(checks)
        for name in sorted(set(CHECK_NAMES) - actual_checks):
            errors.append(error("CONFIG_MISSING_CHECK", relative, f"missing check: {name}"))
        for name in sorted(actual_checks - set(CHECK_NAMES)):
            errors.append(error("CONFIG_UNKNOWN_CHECK", relative, f"unknown check: {name}"))
        for name in CHECK_NAMES:
            if name not in checks:
                continue
            command = checks[name]
            if not isinstance(command, list) or any(not isinstance(item, str) for item in command):
                errors.append(error("CONFIG_INVALID_CHECK_COMMAND", relative, f"check {name} must be an array of strings"))
            elif command and not command[0]:
                errors.append(error("CONFIG_EMPTY_EXECUTABLE", relative, f"check {name} has an empty executable"))
            elif command:
                executable = PurePosixPath(command[0].replace("\\", "/")).name.casefold()
                unsafe_argument = any(
                    item in SHELL_METATOKENS or "\n" in item or "\r" in item or "\x00" in item
                    for item in command
                )
                if executable in SHELL_EXECUTABLES or unsafe_argument:
                    errors.append(error("CONFIG_UNSAFE_CHECK_COMMAND", relative, f"check {name} contains forbidden shell syntax"))

    placeholders = config.get("placeholders")
    if not isinstance(placeholders, dict) or set(placeholders) != {"allow"}:
        errors.append(error("CONFIG_INVALID_PLACEHOLDERS", relative, "placeholders must be a table containing only allow"))
    else:
        allow = placeholders.get("allow")
        if not isinstance(allow, list) or any(not isinstance(item, str) for item in allow):
            errors.append(error("CONFIG_INVALID_PLACEHOLDER_ALLOWLIST", relative, "placeholders.allow must be an array of strings"))
        else:
            seen: set[str] = set()
            for entry in allow:
                parts = entry.split("::")
                if len(parts) != 2 or not safe_relative_posix(parts[0]) or not PLACEHOLDER_KEY.fullmatch(parts[1]):
                    errors.append(error("CONFIG_INVALID_PLACEHOLDER_ENTRY", relative, f"invalid placeholder allowlist entry: {entry}"))
                elif entry in seen:
                    errors.append(error("CONFIG_DUPLICATE_PLACEHOLDER_ENTRY", relative, f"duplicate placeholder allowlist entry: {entry}"))
                seen.add(entry)

    working_set = config.get("working_set")
    if not isinstance(working_set, dict):
        errors.append(error("CONFIG_INVALID_WORKING_SET", relative, "working_set must be a table"))
    else:
        actual = set(working_set)
        for key in sorted(WORKING_SET_KEYS - actual):
            errors.append(error("CONFIG_MISSING_WORKING_SET_KEY", relative, f"missing working_set key: {key}"))
        for key in sorted(actual - WORKING_SET_KEYS):
            errors.append(error("CONFIG_UNKNOWN_WORKING_SET_KEY", relative, f"unknown working_set key: {key}"))
        if type(working_set.get("enabled")) is not bool:
            errors.append(error("CONFIG_INVALID_WORKING_SET_ENABLED", relative, "working_set.enabled must be a boolean"))
        if not safe_relative_posix(working_set.get("directory")):
            errors.append(error("CONFIG_INVALID_WORKING_SET_DIRECTORY", relative, "working_set.directory must be a safe repository-relative POSIX path"))
        for key in ("maximum_pointers", "maximum_reason_length"):
            value = working_set.get(key)
            if type(value) is not int or value <= 0:
                errors.append(error("CONFIG_INVALID_WORKING_SET_LIMIT", relative, f"working_set.{key} must be a positive integer"))

    return config, errors


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


def run(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    docs = root / "docs"
    index = docs / "INDEX.md"
    index_text = index.read_text(encoding="utf-8") if index.exists() else ""
    questions: dict[str, str] = {}

    documents = active_documents() if root == ROOT else [index, docs / "GLOSSARY.md", *[path for directory in KNOWLEDGE_DIRS for path in sorted((docs / directory).glob("*.md"))]]
    for path in documents:
        relative = path.relative_to(root).as_posix()
        metadata = parse_frontmatter(path)
        for field in REQUIRED:
            if not metadata.get(field):
                errors.append(f"{relative}: missing frontmatter field {field}")
        if metadata.get("owner") != relative:
            errors.append(f"{relative}: owner must equal repository path")
        if path != index and f"`{relative}`" not in index_text:
            errors.append(f"{relative}: missing from docs/INDEX.md")
        answers = metadata.get("answers", [])
        if isinstance(answers, list):
            for answer in answers:
                key = normalize_question(str(answer))
                if key in questions:
                    errors.append(f"duplicate ownership question: {relative} and {questions[key]}")
                else:
                    questions[key] = relative

    config, config_errors = validate_config(root)
    errors.extend(f"{item['path']}: {item['code']}: {item['message']}" for item in config_errors)
    if config and not config_errors and config.get("mode") == "project":
        for path in [root / "PROJECT.md", *documents]:
            if "TEMPLATE_PLACEHOLDER[" in path.read_text(encoding="utf-8"):
                errors.append(f"{path.relative_to(root).as_posix()}: unresolved template placeholder")
    return errors


if __name__ == "__main__":
    failures = run()
    if failures:
        print("MEMORY HEALTH: FAILED")
        for failure in failures:
            print(f"- {failure}")
        sys.exit(1)
    print("MEMORY HEALTH: PASSED")
