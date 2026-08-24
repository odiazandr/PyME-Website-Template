import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS = ROOT / ".github" / "workflows"
ACTION_REFERENCE = re.compile(r"^\s*uses:\s*([^\s#]+)", re.MULTILINE)
IMMUTABLE_ACTION = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+@[0-9a-f]{40}$")


class GitHubWorkflowPolicyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        paths = sorted(
            path
            for path in WORKFLOWS.iterdir()
            if path.is_file() and path.suffix in {".yml", ".yaml"}
        )
        cls.workflows = {
            path.name: path.read_text(encoding="utf-8")
            for path in paths
        }

    def test_expected_workflows_exist(self) -> None:
        self.assertEqual(set(self.workflows), {"browser-qa.yml", "ci.yml"})

    def test_workflows_use_read_only_repository_permissions(self) -> None:
        for name, source in self.workflows.items():
            with self.subTest(workflow=name):
                self.assertEqual(
                    len(re.findall(r"(?m)^permissions:\s*$", source)), 1
                )
                self.assertIn("permissions:\n  contents: read", source)
                self.assertNotRegex(source, r"(?m)^[ \t]+permissions\s*:")
                self.assertNotRegex(source, r"\bwrite\b")

    def test_untrusted_pull_request_target_is_not_used(self) -> None:
        for name, source in self.workflows.items():
            with self.subTest(workflow=name):
                self.assertNotIn("pull_request_target", source)

    def test_external_actions_are_pinned_to_commit_shas(self) -> None:
        for name, source in self.workflows.items():
            references = ACTION_REFERENCE.findall(source)
            with self.subTest(workflow=name):
                self.assertTrue(references)
                for reference in references:
                    self.assertRegex(reference, IMMUTABLE_ACTION)


if __name__ == "__main__":
    unittest.main()
