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
        for value in ("C:foo", "C:/outside", "foo:bar", "foo//bar", "foo/./bar", "foo/../bar", "/foo", "foo/", "foo. /bar", "src/*.md", "src/file?.md", "src/[ab].md", "docs/spec/a`b.md", "docs/spec/a|b.md"):
            with self.subTest(value=value):
                self.assertFalse(MEMORY_HEALTH.safe_relative_posix(value))
        self.assertTrue(MEMORY_HEALTH.safe_relative_posix(".memory/working-sets"))


class FrontmatterTests(unittest.TestCase):
    def validate(self, content: str | bytes, relative: str = "docs/spec/example.md") -> tuple[dict[str, object] | None, set[str]]:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            path = root / Path(relative)
            path.parent.mkdir(parents=True)
            if isinstance(content, bytes):
                path.write_bytes(content)
            else:
                path.write_text(content, encoding="utf-8")
            metadata, errors = MEMORY_HEALTH.parse_frontmatter(path, root)
            return metadata, {str(item["code"]) for item in errors}

    def valid_inline(self) -> str:
        return '''---
owner: docs/spec/example.md
authority: canonical
status: active
answers: ["What does this example own?", "How is it validated?"]
---
# Example
'''

    def test_valid_inline_and_block_answers(self) -> None:
        metadata, codes = self.validate(self.valid_inline())
        self.assertEqual(codes, set())
        self.assertEqual(len(metadata["answers"]), 2)
        block = self.valid_inline().replace('answers: ["What does this example own?", "How is it validated?"]', 'answers:\n  - "What does this example own?"\n  - "How is it validated?"')
        _, block_codes = self.validate(block)
        self.assertEqual(block_codes, set())

    def test_missing_and_invalid_delimiters_fail(self) -> None:
        _, missing = self.validate("# No frontmatter\n")
        self.assertIn("FRONTMATTER_MISSING_OPEN", missing)
        _, close = self.validate("---\nowner: docs/spec/example.md\n")
        self.assertIn("FRONTMATTER_MISSING_CLOSE", close)
        _, malformed = self.validate(self.valid_inline().replace("\n---\n# Example", "\n--- trailing\n# Example"))
        self.assertIn("FRONTMATTER_INVALID_DELIMITER", malformed)

    def test_duplicate_unknown_and_missing_keys_fail(self) -> None:
        duplicate = self.valid_inline().replace("authority: canonical", "authority: canonical\nauthority: derived")
        self.assertIn("FRONTMATTER_DUPLICATE_KEY", self.validate(duplicate)[1])
        unknown = self.valid_inline().replace("authority: canonical", "extra: value\nauthority: canonical")
        self.assertIn("FRONTMATTER_UNKNOWN_KEY", self.validate(unknown)[1])
        missing = self.valid_inline().replace("status: active\n", "")
        self.assertIn("FRONTMATTER_MISSING_KEY", self.validate(missing)[1])

    def test_duplicate_key_is_reported_when_first_value_is_invalid(self) -> None:
        content = self.valid_inline().replace("authority: canonical", 'authority: "canonical"\nauthority: canonical')
        codes = self.validate(content)[1]
        self.assertIn("FRONTMATTER_INVALID_SCALAR", codes)
        self.assertIn("FRONTMATTER_DUPLICATE_KEY", codes)

    def test_answers_must_be_nonempty_quoted_lists(self) -> None:
        variants = {
            "scalar": "answers: one",
            "empty": "answers: []",
            "empty_string": 'answers: [""]',
            "unquoted_block": "answers:\n  - not-quoted",
        }
        original = 'answers: ["What does this example own?", "How is it validated?"]'
        for name, replacement in variants.items():
            with self.subTest(name=name):
                codes = self.validate(self.valid_inline().replace(original, replacement))[1]
                self.assertTrue({"FRONTMATTER_INVALID_ANSWERS", "FRONTMATTER_EMPTY_ANSWERS", "FRONTMATTER_INVALID_ANSWER"} & codes)

    def test_authority_status_and_owner_are_strict(self) -> None:
        self.assertIn("FRONTMATTER_INVALID_AUTHORITY", self.validate(self.valid_inline().replace("authority: canonical", "authority: banana"))[1])
        self.assertIn("FRONTMATTER_INVALID_STATUS", self.validate(self.valid_inline().replace("status: active", "status: imaginary"))[1])
        self.assertIn("FRONTMATTER_INACTIVE_IN_ACTIVE_ROOT", self.validate(self.valid_inline().replace("status: active", "status: archived"))[1])
        self.assertIn("FRONTMATTER_OWNER_MISMATCH", self.validate(self.valid_inline().replace("docs/spec/example.md", "docs/spec/other.md"))[1])
        self.assertIn("FRONTMATTER_INVALID_OWNER", self.validate(self.valid_inline().replace("docs/spec/example.md", "../outside.md"))[1])

    def test_bom_invalid_utf8_and_indentation_fail_gracefully(self) -> None:
        self.assertIn("FRONTMATTER_BOM", self.validate("\ufeff" + self.valid_inline())[1])
        self.assertIn("DOCUMENT_INVALID_UTF8", self.validate(b"\xff\xfe")[1])
        indented = self.valid_inline().replace("authority: canonical", " authority: canonical")
        self.assertIn("FRONTMATTER_INVALID_INDENTATION", self.validate(indented)[1])

    def test_invalid_document_answers_do_not_enter_ownership_checks(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            for directory in ("spec", "runbooks", "explain", "decisions"):
                (root / "docs" / directory).mkdir(parents=True)
            def document(owner: str, answers: str) -> str:
                return f"---\nowner: {owner}\nauthority: canonical\nstatus: active\nanswers: {answers}\n---\n# Test\n"

            index_content = document("docs/INDEX.md", '["Where is test knowledge indexed?"]') + "\n`docs/GLOSSARY.md`\n`docs/spec/example.md`\n`docs/spec/other.md`\n"
            (root / "docs" / "INDEX.md").write_text(index_content, encoding="utf-8")
            (root / "docs" / "GLOSSARY.md").write_text(document("docs/GLOSSARY.md", '["What test vocabulary exists?"]'), encoding="utf-8")
            first = document("docs/spec/example.md", '\n  - "Shared question?"\n  - invalid')
            second = document("docs/spec/other.md", '["Shared question?"]')
            (root / "docs" / "spec" / "example.md").write_text(first, encoding="utf-8")
            (root / "docs" / "spec" / "other.md").write_text(second, encoding="utf-8")
            (root / "PROJECT.md").write_text("# Project\n", encoding="utf-8")
            (root / "memory.toml").write_text(MemoryConfigTests().valid_config(), encoding="utf-8")
            failures = MEMORY_HEALTH.run(root)
        self.assertTrue(any("FRONTMATTER_INVALID_ANSWER" in item for item in failures))
        self.assertFalse(any("duplicate ownership question" in item for item in failures))


class MemoryStructureTests(unittest.TestCase):
    def document(self, owner: str, question: str, authority: str = "canonical") -> str:
        return f'---\nowner: {owner}\nauthority: {authority}\nstatus: active\nanswers: ["{question}"]\n---\n# Test\n'

    def repository(self) -> tempfile.TemporaryDirectory[str]:
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        for directory in ("spec", "runbooks", "explain", "decisions"):
            (root / "docs" / directory).mkdir(parents=True)
        (root / "docs" / "GLOSSARY.md").write_text(self.document("docs/GLOSSARY.md", "What vocabulary is tested?"), encoding="utf-8")
        rows = [
            "| Tier | File | Owns |",
            "|---|---|---|",
            "| T0 | `PROJECT.md` | Constitution |",
            "| T1 | `docs/INDEX.md` | Index |",
            "| T1 | `docs/GLOSSARY.md` | Vocabulary |",
        ]
        index = self.document("docs/INDEX.md", "Where is test knowledge indexed?") + "\n" + "\n".join(rows) + "\n"
        (root / "docs" / "INDEX.md").write_text(index, encoding="utf-8")
        (root / "PROJECT.md").write_text("# Project\n", encoding="utf-8")
        (root / "memory.toml").write_text(MemoryConfigTests().valid_config(), encoding="utf-8")
        return temporary

    def add_index_row(self, root: Path, row: str) -> None:
        path = root / "docs" / "INDEX.md"
        path.write_text(path.read_text(encoding="utf-8") + row + "\n", encoding="utf-8")

    def test_nested_active_document_is_discovered(self) -> None:
        temporary = self.repository()
        try:
            root = Path(temporary.name)
            path = root / "docs" / "spec" / "nested" / "example.md"
            path.parent.mkdir()
            path.write_text(self.document("docs/spec/nested/example.md", "What nested fact is tested?"), encoding="utf-8")
            failures = MEMORY_HEALTH.run(root)
            self.assertTrue(any("INDEX_ENTRY_MISSING" in item and "nested/example.md" in item for item in failures))
            self.add_index_row(root, "| T2 | `docs/spec/nested/example.md` | Nested |")
            self.assertFalse(any("nested/example.md" in item for item in MEMORY_HEALTH.run(root)))
        finally:
            temporary.cleanup()
    def config(self, mode: str = "template", allow: list[str] | None = None) -> dict[str, object]:
        return {"mode": mode, "placeholders": {"allow": allow or []}}

    def validate(self, files: dict[str, str | bytes], mode: str = "template", allow: list[str] | None = None) -> set[str]:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            documents: list[Path] = []
            for relative, content in files.items():
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                if isinstance(content, bytes):
                    path.write_bytes(content)
                else:
                    path.write_text(content, encoding="utf-8")
                if relative.startswith(("docs/spec/", "docs/runbooks/", "docs/explain/", "docs/decisions/")):
                    documents.append(path)
            for required in ("PROJECT.md", "README.md"):
                path = root / required
                if not path.exists():
                    path.write_text(f"# {required}\n", encoding="utf-8")
            errors = MEMORY_HEALTH.validate_placeholders(root, self.config(mode, allow), documents)
            return {str(item["code"]) for item in errors}

    def test_template_marker_requires_exact_allowlist_entry(self) -> None:
        marker = "@@PYME_UNRESOLVED:BUSINESS_NAME@@"
        self.assertIn("PLACEHOLDER_NOT_ALLOWLISTED", self.validate({"src/data.json": marker}))
        self.assertEqual(self.validate({"src/data.json": marker}, allow=["src/data.json::BUSINESS_NAME"]), set())

    def test_allowlist_is_exact_and_not_stale(self) -> None:
        marker = "@@PYME_UNRESOLVED:BUSINESS_NAME@@"
        duplicate_codes = self.validate({"src/data.json": f"{marker} {marker}"}, allow=["src/data.json::BUSINESS_NAME"])
        self.assertIn("PLACEHOLDER_CARDINALITY", duplicate_codes)
        self.assertIn("PLACEHOLDER_ALLOWLIST_STALE", self.validate({}, allow=["src/data.json::BUSINESS_NAME"]))

    def test_project_mode_rejects_tokens_and_nonempty_allowlist(self) -> None:
        marker = "@@PYME_UNRESOLVED:BUSINESS_NAME@@"
        codes = self.validate({"public/info.txt": marker}, mode="project", allow=["public/info.txt::BUSINESS_NAME"])
        self.assertIn("PLACEHOLDER_UNRESOLVED_PROJECT", codes)
        self.assertIn("PLACEHOLDER_PROJECT_ALLOWLIST_NOT_EMPTY", codes)

    def test_malformed_and_legacy_markers_fail_in_both_modes(self) -> None:
        for mode in ("template", "project"):
            with self.subTest(mode=mode):
                codes = self.validate({"README.md": "@@PYME_UNRESOLVED:bad-key@@\n@@PYME_UNRESOLVED_BAD@@\n@@PYME_UNRESOLVED\nTEMPLATE_PLACEHOLDER[OLD]"}, mode=mode)
                self.assertIn("PLACEHOLDER_MALFORMED_MARKER", codes)
                self.assertIn("PLACEHOLDER_LEGACY_MARKER", codes)

    def test_scan_scope_includes_root_active_src_and_public_but_excludes_audits_and_tests(self) -> None:
        marker = "@@PYME_UNRESOLVED:VALUE@@"
        files = {
            "PROJECT.md": marker,
            "README.md": marker,
            "docs/spec/active.md": marker,
            "src/nested/file.ts": marker,
            "public/check.txt": marker,
            "docs/audits/old.md": marker,
            "docs/archive/old.md": marker,
            "tests/fixture.md": marker,
            "src/node_modules/package/file.ts": marker,
            "src/.cache/file.json": marker,
            "src/dist/file.html": marker,
            "src/generated/file.ts": marker,
            "src/__tests__/file.ts": marker,
            "src/fixtures/file.json": marker,
            "public/build/file.html": marker,
            "public/coverage/file.txt": marker,
            "public/__fixtures__/file.json": marker,
        }
        allow = [
            "PROJECT.md::VALUE",
            "README.md::VALUE",
            "docs/spec/active.md::VALUE",
            "src/nested/file.ts::VALUE",
            "public/check.txt::VALUE",
        ]
        self.assertEqual(self.validate(files, allow=allow), set())

    def test_text_encoding_and_binary_extensions_follow_scope(self) -> None:
        self.assertIn("PLACEHOLDER_SCAN_INVALID_UTF8", self.validate({"src/bad.json": b"\xff\xfe"}))
        self.assertEqual(self.validate({"public/image.png": b"\xff\xfe@@PYME_UNRESOLVED:VALUE@@"}), set())

    def test_symlinked_roots_files_and_directories_are_rejected_without_following(self) -> None:
        temporary = self.repository()
        external = tempfile.TemporaryDirectory()
        try:
            root = Path(temporary.name)
            outside = Path(external.name)
            (outside / "README.md").write_text("@@PYME_UNRESOLVED:OUTSIDE@@", encoding="utf-8")
            (outside / "knowledge").mkdir()
            (outside / "knowledge" / "outside.md").write_text("outside", encoding="utf-8")
            (outside / "assets").mkdir()
            (outside / "assets" / "outside.txt").write_text("@@PYME_UNRESOLVED:OUTSIDE@@", encoding="utf-8")
            (outside / "INDEX.md").write_text("| T9 | `docs/spec/external.md` | external |", encoding="utf-8")
            (root / "README.md").unlink(missing_ok=True)
            (root / "docs" / "INDEX.md").unlink()
            try:
                (root / "README.md").symlink_to(outside / "README.md")
                (root / "docs" / "INDEX.md").symlink_to(outside / "INDEX.md")
                (root / "docs" / "spec" / "linked").symlink_to(outside / "knowledge", target_is_directory=True)
                (root / "src" / "linked").symlink_to(outside / "assets", target_is_directory=True)
            except OSError as exc:
                self.skipTest(f"symbolic links are unavailable in this environment: {exc}")
            failures = MEMORY_HEALTH.run(root)
            self.assertTrue(any("PLACEHOLDER_SCAN_SYMLINK" in item and "README.md" in item for item in failures))
            self.assertTrue(any("INDEX_SYMLINK" in item for item in failures))
            self.assertTrue(any("DOCUMENT_SYMLINK" in item and "docs/spec/linked" in item for item in failures))
            self.assertTrue(any("PLACEHOLDER_SCAN_SYMLINK" in item and "src/linked" in item for item in failures))
            self.assertFalse(any("PLACEHOLDER_NOT_ALLOWLISTED" in item and "outside" in item for item in failures))
            self.assertFalse(any("INDEX_MALFORMED_ROW" in item or "external.md" in item for item in failures))
        finally:
            temporary.cleanup()
            external.cleanup()

    def test_duplicate_stale_prose_only_and_wrong_tier_entries_fail(self) -> None:
        temporary = self.repository()
        try:
            root = Path(temporary.name)
            path = root / "docs" / "spec" / "example.md"
            path.write_text(self.document("docs/spec/example.md", "What indexed fact is tested?"), encoding="utf-8")
            index = root / "docs" / "INDEX.md"
            index.write_text(index.read_text(encoding="utf-8") + "\nMention `docs/spec/example.md` only.\n", encoding="utf-8")
            self.assertTrue(any("INDEX_ENTRY_MISSING" in item and "example.md" in item for item in MEMORY_HEALTH.run(root)))
            self.add_index_row(root, "| T1 | `docs/spec/example.md` | Wrong tier |")
            self.add_index_row(root, "| T1 | `docs/spec/example.md` | Duplicate |")
            self.add_index_row(root, "| T2 | `docs/spec/missing.md` | Stale |")
            failures = MEMORY_HEALTH.run(root)
            self.assertTrue(any("INDEX_ENTRY_DUPLICATE" in item for item in failures))
            self.assertTrue(any("INDEX_ENTRY_STALE" in item for item in failures))
            self.assertTrue(any("INDEX_TIER_MISMATCH" in item for item in failures))
            self.add_index_row(root, "| T9 | `docs/spec/ghost.md` | Invalid tier |")
            self.assertTrue(any("INDEX_MALFORMED_ROW" in item for item in MEMORY_HEALTH.run(root)))
        finally:
            temporary.cleanup()

    def test_unicode_question_normalization_is_stable(self) -> None:
        self.assertEqual(MEMORY_HEALTH.normalize_question("¿Qué información hay?"), "que informacion hay")
        self.assertEqual(MEMORY_HEALTH.normalize_question("Que informacion hay?"), "que informacion hay")
        self.assertEqual(MEMORY_HEALTH.normalize_question("AÑO"), "año")
        self.assertNotEqual(MEMORY_HEALTH.normalize_question("AÑO"), MEMORY_HEALTH.normalize_question("ano"))
        self.assertEqual(MEMORY_HEALTH.normalize_question("你好？"), "你好")
        self.assertNotEqual(MEMORY_HEALTH.normalize_question("क"), MEMORY_HEALTH.normalize_question("कि"))
        self.assertNotEqual(MEMORY_HEALTH.normalize_question("ب"), MEMORY_HEALTH.normalize_question("بَ"))
        self.assertEqual(MEMORY_HEALTH.normalize_question("???"), "")

    def test_derived_question_does_not_claim_canonical_ownership(self) -> None:
        temporary = self.repository()
        try:
            root = Path(temporary.name)
            canonical = root / "docs" / "spec" / "canonical.md"
            derived = root / "docs" / "explain" / "derived.md"
            canonical.write_text(self.document("docs/spec/canonical.md", "What shared fact exists?"), encoding="utf-8")
            derived.write_text(self.document("docs/explain/derived.md", "What shared fact exists?", authority="derived"), encoding="utf-8")
            self.add_index_row(root, "| T2 | `docs/spec/canonical.md` | Canonical |")
            self.add_index_row(root, "| T2 | `docs/explain/derived.md` | Derived |")
            self.assertFalse(any("OWNERSHIP_QUESTION_DUPLICATE" in item for item in MEMORY_HEALTH.run(root)))
        finally:
            temporary.cleanup()

    def test_run_errors_are_globally_deterministic(self) -> None:
        temporary = self.repository()
        try:
            root = Path(temporary.name)
            (root / "docs" / "spec" / "zeta.md").write_text("# Invalid\n", encoding="utf-8")
            (root / "docs" / "spec" / "alpha.md").write_text("# Invalid\n", encoding="utf-8")
            failures = MEMORY_HEALTH.run(root)
            self.assertEqual(failures, sorted(failures))
            self.assertEqual(failures, MEMORY_HEALTH.run(root))
        finally:
            temporary.cleanup()


if __name__ == "__main__":
    unittest.main()
