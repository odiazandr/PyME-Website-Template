from __future__ import annotations

import importlib.util
import tempfile
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


class MemoryConfigTests(unittest.TestCase):
    def write_config(self, content: str | bytes) -> tuple[tempfile.TemporaryDirectory[str], Path]:
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        path = root / "memory.toml"
        if isinstance(content, bytes):
            path.write_bytes(content)
        else:
            path.write_text(content, encoding="utf-8")
        return temporary, root

    def valid_config(self) -> str:
        return '''schema_version = 1
mode = "template"

[checks]
build = []
test = ["python", "-m", "unittest"]
lint = []
secret_scan = []

[placeholders]
allow = []

[working_set]
enabled = true
directory = ".memory/working-sets"
maximum_pointers = 20
maximum_reason_length = 160
'''

    def codes_for(self, content: str | bytes) -> set[str]:
        temporary, root = self.write_config(content)
        try:
            _, errors = MEMORY_HEALTH.validate_config(root)
            return {str(item["code"]) for item in errors}
        finally:
            temporary.cleanup()

    def test_valid_configuration_passes(self) -> None:
        self.assertEqual(self.codes_for(self.valid_config()), set())

    def test_missing_configuration_is_structured(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            _, errors = MEMORY_HEALTH.validate_config(Path(raw))
        self.assertEqual(errors[0]["code"], "CONFIG_MISSING")

    def test_malformed_toml_is_structured(self) -> None:
        self.assertIn("CONFIG_MALFORMED_TOML", self.codes_for("schema_version = ["))

    def test_invalid_utf8_is_structured(self) -> None:
        self.assertIn("CONFIG_INVALID_UTF8", self.codes_for(b"\xff\xfe"))

    def test_schema_and_mode_are_strict(self) -> None:
        content = self.valid_config().replace("schema_version = 1", "schema_version = 2").replace('mode = "template"', 'mode = "banana"')
        codes = self.codes_for(content)
        self.assertIn("CONFIG_UNSUPPORTED_SCHEMA", codes)
        self.assertIn("CONFIG_INVALID_MODE", codes)

    def test_non_string_modes_are_structured_failures(self) -> None:
        for raw in ('["template"]', '{ value = "template" }', "true", "1"):
            with self.subTest(raw=raw):
                content = self.valid_config().replace('mode = "template"', f"mode = {raw}")
                self.assertIn("CONFIG_INVALID_MODE", self.codes_for(content))

    def test_unknown_top_level_and_check_keys_fail(self) -> None:
        content = self.valid_config().replace("[checks]", "extra = true\n\n[checks]").replace("build = []", "build = []\nunknown = []")
        codes = self.codes_for(content)
        self.assertIn("CONFIG_UNKNOWN_KEY", codes)
        self.assertIn("CONFIG_UNKNOWN_CHECK", codes)

    def test_check_commands_must_be_argv_arrays(self) -> None:
        content = self.valid_config().replace('test = ["python", "-m", "unittest"]', 'test = "python -m unittest"')
        self.assertIn("CONFIG_INVALID_CHECK_COMMAND", self.codes_for(content))

    def test_shell_wrappers_and_metatokens_are_rejected(self) -> None:
        commands = (
            '["sh", "-c", "echo ok"]',
            '["pwsh", "-Command", "Write-Output ok"]',
            '["python", ">", "out.txt"]',
            '["python", "&&", "other"]',
        )
        for command in commands:
            with self.subTest(command=command):
                content = self.valid_config().replace('test = ["python", "-m", "unittest"]', f"test = {command}")
                self.assertIn("CONFIG_UNSAFE_CHECK_COMMAND", self.codes_for(content))

    def test_placeholder_allowlist_rejects_unsafe_and_duplicate_entries(self) -> None:
        content = self.valid_config().replace("allow = []", 'allow = ["../src/file::NAME", "src/file::NAME", "src/file::NAME", "C:foo::KEY", "foo:bar::KEY", "foo//bar::KEY", "foo/./bar::KEY"]')
        codes = self.codes_for(content)
        self.assertIn("CONFIG_INVALID_PLACEHOLDER_ENTRY", codes)
        self.assertIn("CONFIG_DUPLICATE_PLACEHOLDER_ENTRY", codes)

    def test_working_set_contract_is_strict(self) -> None:
        content = self.valid_config().replace("enabled = true", 'enabled = "yes"').replace("maximum_pointers = 20", "maximum_pointers = 0")
        codes = self.codes_for(content)
        self.assertIn("CONFIG_INVALID_WORKING_SET_ENABLED", codes)
        self.assertIn("CONFIG_INVALID_WORKING_SET_LIMIT", codes)

    def test_safe_relative_posix_rejects_nonportable_spellings(self) -> None:
        for value in ("C:foo", "C:/outside", "foo:bar", "foo//bar", "foo/./bar", "foo/../bar", "/foo", "foo/", "foo. /bar", "src/*.md", "src/file?.md", "src/[ab].md"):
            with self.subTest(value=value):
                self.assertFalse(MEMORY_HEALTH.safe_relative_posix(value))
        self.assertTrue(MEMORY_HEALTH.safe_relative_posix(".memory/working-sets"))


if __name__ == "__main__":
    unittest.main()
