from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("memory_health", ROOT / "ops" / "memory_health.py")
assert SPEC and SPEC.loader
MEMORY_HEALTH = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MEMORY_HEALTH)


class MemoryHealthTests(unittest.TestCase):
    def test_repository_memory_is_healthy(self) -> None:
        self.assertEqual(MEMORY_HEALTH.run(), [])

    def test_question_normalization_is_deterministic(self) -> None:
        self.assertEqual(
            MEMORY_HEALTH.normalize_question("How is DNS changed?"),
            MEMORY_HEALTH.normalize_question("HOW is DNS changed!"),
        )


if __name__ == "__main__":
    unittest.main()
