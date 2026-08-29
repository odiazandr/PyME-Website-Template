import importlib.util
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("secret_scan", ROOT / "ops" / "secret_scan.py")
assert SPEC and SPEC.loader
SECRET_SCAN = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SECRET_SCAN)


class SecretScanTests(unittest.TestCase):
    def test_detects_a_high_confidence_signature_without_echoing_it(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            token = "ghp_" + "a" * 36
            (root / "config.txt").write_text(f"token={token}\n", encoding="utf-8")
            self.assertEqual(SECRET_SCAN.scan(root), [("config.txt", "GITHUB_TOKEN")])

    def test_excludes_test_and_audit_fixtures(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            token = "ghp_" + "a" * 36
            for relative in ("tests/fixture.txt", "docs/audits/evidence.txt"):
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(token, encoding="utf-8")
            self.assertEqual(SECRET_SCAN.scan(root), [])

