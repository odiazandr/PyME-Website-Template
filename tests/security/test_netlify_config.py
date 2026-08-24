import tomllib
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class NetlifyConfigTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (ROOT / "netlify.toml").open("rb") as stream:
            cls.config = tomllib.load(stream)

    def test_build_uses_the_verified_static_artifact(self) -> None:
        self.assertEqual(self.config["build"]["command"], "npm run quality")
        self.assertEqual(self.config["build"]["publish"], "dist")

    def test_stable_headers_are_explicit_and_hsts_is_deferred(self) -> None:
        headers = {entry["for"]: entry["values"] for entry in self.config["headers"]}
        root = headers["/*"]
        self.assertEqual(root["X-Content-Type-Options"], "nosniff")
        self.assertEqual(root["Referrer-Policy"], "strict-origin-when-cross-origin")
        self.assertEqual(root["X-Frame-Options"], "DENY")
        self.assertIn("camera=()", root["Permissions-Policy"])
        self.assertNotIn("Strict-Transport-Security", root)

    def test_hashed_assets_receive_immutable_caching(self) -> None:
        headers = {entry["for"]: entry["values"] for entry in self.config["headers"]}
        self.assertEqual(
            headers["/_astro/*"]["Cache-Control"],
            "public, max-age=31536000, immutable",
        )

    def test_public_cannot_shadow_the_reserved_astro_asset_directory(self) -> None:
        self.assertFalse(
            (ROOT / "public" / "_astro").exists(),
            "public/_astro is reserved for Astro's content-hashed build assets",
        )


if __name__ == "__main__":
    unittest.main()
