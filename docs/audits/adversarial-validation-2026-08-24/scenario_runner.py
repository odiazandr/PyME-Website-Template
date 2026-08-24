#!/usr/bin/env python3
"""Seeded disposable mutation campaign for the repository memory validator."""

from __future__ import annotations

import json
import random
import shutil
import subprocess
import tempfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SEED = 20260824
SAMPLES = 100

DIMENSIONS = {
    "mode": ["template", "project", "PROJECT", "missing", "malformed"],
    "document": ["intact", "delete_indexed", "add_unindexed", "missing_frontmatter"],
    "metadata": ["valid", "invalid_authority", "invalid_status", "duplicate_question"],
    "index": ["intact", "duplicate_row", "remove_row"],
    "placeholder": ["none", "project", "readme", "reserved_source"],
    "encoding": ["utf8", "utf8_bom", "invalid_utf8"],
}


def replace(path: Path, old: str, new: str) -> None:
    path.write_text(path.read_text(encoding="utf-8").replace(old, new), encoding="utf-8")


def run_scenario(identifier: int, params: dict[str, str]) -> dict[str, object]:
    with tempfile.TemporaryDirectory(prefix="pyme-mc-") as raw:
        fixture = Path(raw) / "repo"
        shutil.copytree(ROOT, fixture, ignore=shutil.ignore_patterns(".git", "__pycache__", "audits"))
        config = fixture / "memory.toml"
        project = fixture / "PROJECT.md"
        seo = fixture / "docs/spec/seo.md"
        index = fixture / "docs/INDEX.md"
        # Remove the literal marker used to explain policy so project mode can be tested independently.
        replace(project, "TEMPLATE_PLACEHOLDER[...]", "DISTRIBUTION_MARKER")

        mode = params["mode"]
        if mode == "project":
            replace(config, 'mode = "template"', 'mode = "project"')
        elif mode == "PROJECT":
            replace(config, 'mode = "template"', 'mode = "PROJECT"')
        elif mode == "missing":
            replace(config, 'mode = "template"\n', "")
        elif mode == "malformed":
            config.write_text('schema_version = [\nmode = "template"\n', encoding="utf-8")

        document = params["document"]
        if document == "delete_indexed":
            seo.unlink()
        elif document == "add_unindexed":
            (fixture / "docs/spec/adversarial-extra.md").write_text(
                "---\nowner: docs/spec/adversarial-extra.md\nauthority: canonical\nstatus: active\nanswers: [\"What is an adversarial extra?\"]\n---\n# Extra\n",
                encoding="utf-8",
            )
        elif document == "missing_frontmatter":
            seo.write_text("# SEO without metadata\n", encoding="utf-8")

        if seo.exists():
            metadata = params["metadata"]
            if metadata == "invalid_authority":
                replace(seo, "authority: canonical", "authority: banana")
            elif metadata == "invalid_status":
                replace(seo, "status: active", "status: imaginary")
            elif metadata == "duplicate_question":
                replace(seo, 'answers: ["What SEO output is required?", "How is structured data governed?"]', 'answers: ["What is the default locale?"]')

        index_mode = params["index"]
        if index_mode == "duplicate_row":
            index.write_text(index.read_text(encoding="utf-8") + "\n| T2 | `docs/spec/seo.md` | Duplicate |\n", encoding="utf-8")
        elif index_mode == "remove_row":
            lines = [line for line in index.read_text(encoding="utf-8").splitlines() if "docs/spec/seo.md" not in line]
            index.write_text("\n".join(lines) + "\n", encoding="utf-8")

        placeholder = params["placeholder"]
        target = {"project": project, "readme": fixture / "README.md", "reserved_source": fixture / "src/README.md"}.get(placeholder)
        if target:
            target.write_text(target.read_text(encoding="utf-8") + "\nTEMPLATE_PLACEHOLDER[MONTE_CARLO]\n", encoding="utf-8")

        encoding = params["encoding"]
        if encoding == "utf8_bom":
            seo.write_bytes(b"\xef\xbb\xbf" + seo.read_bytes()) if seo.exists() else None
        elif encoding == "invalid_utf8" and seo.exists():
            seo.write_bytes(b"\xff\xfe" + seo.read_bytes())

        result = subprocess.run(
            ["python", "ops/memory_health.py"], cwd=fixture, capture_output=True, text=True, errors="replace", timeout=10
        )
        output = (result.stdout + result.stderr).strip()
        if result.returncode == 0:
            signature = "accepted"
        elif "Traceback" in output:
            signature = "crash"
        else:
            messages = sorted(line[2:] for line in output.splitlines() if line.startswith("- "))
            signature = "rejected:" + "|".join(messages[:3])
        return {"id": f"MC-{identifier:03d}", "seed": SEED, "parameters": params, "exit_code": result.returncode, "signature": signature, "output": output[:2000]}


def main() -> None:
    rng = random.Random(SEED)
    results = []
    for index in range(1, SAMPLES + 1):
        params = {name: rng.choice(values) for name, values in DIMENSIONS.items()}
        results.append(run_scenario(index, params))

    signatures = Counter(item["signature"] for item in results)
    by_variable: dict[str, dict[str, dict[str, int]]] = defaultdict(lambda: defaultdict(lambda: {"samples": 0, "accepted": 0, "crashed": 0}))
    for item in results:
        for name, value in item["parameters"].items():
            bucket = by_variable[name][value]
            bucket["samples"] += 1
            bucket["accepted"] += item["signature"] == "accepted"
            bucket["crashed"] += item["signature"] == "crash"

    report = {
        "seed": SEED,
        "samples": SAMPLES,
        "dimensions": DIMENSIONS,
        "aggregate": {
            "accepted": sum(item["signature"] == "accepted" for item in results),
            "rejected": sum(item["signature"].startswith("rejected:") for item in results),
            "crashed": sum(item["signature"] == "crash" for item in results),
            "unique_signatures": len(signatures),
            "signatures": dict(signatures),
            "by_variable": by_variable,
        },
        "results": results,
    }
    output = Path(__file__).with_name("monte-carlo-results.json")
    output.write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")
    print(json.dumps(report["aggregate"], indent=2, default=dict))


if __name__ == "__main__":
    main()
