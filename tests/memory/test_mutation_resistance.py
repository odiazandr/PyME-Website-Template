from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class MutationResistanceTests(unittest.TestCase):
    MUTATIONS = {
        "invalid mode enforcement": (
            'if not isinstance(mode, str) or mode not in {"template", "project"}:',
            'if False and (not isinstance(mode, str) or mode not in {"template", "project"}):',
        ),
        "duplicate index enforcement": (
            "elif count > 1:",
            "elif False and count > 1:",
        ),
        "malformed marker enforcement": (
            "if UNRESOLVED_STEM in remainder:",
            "if False and UNRESOLVED_STEM in remainder:",
        ),
        "nonzero check enforcement": (
            "elif exit_code == 0:",
            "elif True or exit_code == 0:",
        ),
        "configured check dispatch": (
            "checks = execute_checks(root, configured, timeout_seconds)",
            "checks = []",
        ),
    }

    def test_each_disabled_contract_is_caught_by_the_ordinary_suite(self) -> None:
        for name, (original, mutant) in self.MUTATIONS.items():
            with self.subTest(mutation=name), tempfile.TemporaryDirectory(prefix="pyme-memory-mutant-") as raw:
                fixture = Path(raw) / "repo"
                shutil.copytree(
                    ROOT,
                    fixture,
                    ignore=shutil.ignore_patterns(".git", "__pycache__", "audits"),
                )
                validator = fixture / "ops" / "memory_health.py"
                source = validator.read_text(encoding="utf-8")
                self.assertEqual(source.count(original), 1, f"mutation anchor drifted: {name}")
                validator.write_text(source.replace(original, mutant, 1), encoding="utf-8")
                completed = subprocess.run(
                    [sys.executable, "-m", "unittest", "tests.memory.test_memory_health"],
                    cwd=fixture,
                    capture_output=True,
                    timeout=30,
                    check=False,
                )
                evidence = (completed.stdout + completed.stderr).decode("utf-8", errors="replace")
                self.assertNotEqual(completed.returncode, 0, f"ordinary tests survived mutant '{name}':\n{evidence}")


if __name__ == "__main__":
    unittest.main()
