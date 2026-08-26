"""Test oracle: run every locally-runnable gate and record structured results.

Usage: python oracle.py <sandbox-path> [out.json]
"""

import json
import subprocess
import sys
import pathlib

CHECKS = [
    ("memory_contracts", [sys.executable, "ops/memory_health.py", "--scope", "contracts"]),
    ("memory_full", [sys.executable, "ops/memory_health.py"]),
    ("validate_data", ["node", "scripts/validate-data.ts"]),
    ("validate_project", ["node", "scripts/validate-project.ts"]),
    ("validate_production", ["node", "scripts/validate-production.ts"]),
    ("check_placeholders", ["node", "scripts/check-placeholders.ts"]),
    ("check_assets", ["node", "scripts/check-assets.ts"]),
    ("test_memory", [sys.executable, "-m", "unittest", "discover", "-s", "tests/memory"]),
    ("test_security", [sys.executable, "-m", "unittest", "discover", "-s", "tests/security"]),
    ("test_data", ["npm.cmd", "run", "test:data"]),
    ("test_site", ["npm.cmd", "run", "test:site"]),
    ("format_check", ["npm.cmd", "run", "format:check"]),
]


def run(root: pathlib.Path, name: str, cmd: list[str]) -> dict:
    try:
        proc = subprocess.run(
            cmd, cwd=root, capture_output=True, text=True, timeout=300,
            encoding="utf-8", errors="replace", shell=False,
        )
        out, err, code = proc.stdout, proc.stderr, proc.returncode
    except subprocess.TimeoutExpired:
        return {"check": name, "exit": None, "status": "TIMEOUT", "stdout": "", "stderr": ""}
    except FileNotFoundError as exc:
        return {"check": name, "exit": None, "status": "NOT_RUNNABLE", "stdout": "", "stderr": str(exc)}
    return {
        "check": name,
        "exit": code,
        "status": "PASSED" if code == 0 else "FAILED",
        "stdout": out[-4000:],
        "stderr": err[-4000:],
    }


def main() -> int:
    root = pathlib.Path(sys.argv[1])
    results = [run(root, name, cmd) for name, cmd in CHECKS]
    payload = {"root": str(root), "results": results}
    if len(sys.argv) > 2:
        pathlib.Path(sys.argv[2]).write_text(
            json.dumps(payload, indent=2), encoding="utf-8", newline="\n"
        )
    for r in results:
        print(f"{r['check']:<22} {r['status']:<12} exit={r['exit']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
