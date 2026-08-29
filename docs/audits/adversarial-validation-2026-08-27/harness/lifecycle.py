"""End-to-end client lifecycle: template -> initializer -> human steps -> gate.

`project-state.json` recorded `lifecycleTest` as `planned` from the moment the
capability list was written. This is the run that closed it. It exercises every
step of `npm run quality:production` against a repository that has actually been
initialized and populated, which is the claim README.md makes and which nothing
had previously executed.

Usage: python lifecycle.py <repository-root> <sandbox-root>

Creates a disposable copy, junctions node_modules, initializes a client, applies
the human steps `docs/runbooks/create-client-site.md` prescribes, then runs the
fourteen production-gate steps in their declared order and stops at the first
failure, exactly as `quality:production` does.

The canonical repository is never modified. Every write lands in the sandbox.

Windows note: node_modules is reached through a directory junction to avoid
copying it. `npm run <script>` cannot resolve node_modules/.bin from a deep
temporary path, so binaries are invoked through `npx --no-install` and scripts
through `node` directly. Unlink the junction before deleting the sandbox or the
deletion follows it into the real node_modules.
"""

import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(sys.argv[1]).resolve()
SANDBOX = pathlib.Path(sys.argv[2]).resolve()

CLIENT = {
    "schemaVersion": 1,
    "site": {"canonicalUrl": "https://tallernopal.mx"},
    "business": {
        "schemaVersion": 1,
        "publicName": "Taller Nopal",
        "legalName": "Taller Nopal S.A. de C.V.",
        "description": "Carpinteria local especializada en muebles a medida.",
        "primaryPhone": {"display": "+52 222 123 4567", "e164": "+522221234567"},
        "email": "hola@tallernopal.mx",
        "whatsapp": {"enabled": False, "number": None},
    },
}

LOCATIONS = [
    {
        "id": "taller-centro",
        "name": "Taller Nopal Centro",
        "street": "Avenida Juarez 1420",
        "locality": "Puebla",
        "region": "Puebla",
        "postalCode": "72160",
        "country": "MX",
        "phone": "+522221234567",
        "mapUrl": None,
        "geo": {"latitude": None, "longitude": None},
        "hours": [
            {"day": d, "closed": False, "opens": "09:00", "closes": "18:00"}
            for d in ("monday", "tuesday", "wednesday", "thursday", "friday")
        ]
        + [
            {"day": "saturday", "closed": False, "opens": "10:00", "closes": "14:00"},
            {"day": "sunday", "closed": True, "opens": None, "closes": None},
        ],
        "approvedForPublication": True,
    }
]

SERVICES = [
    {
        "id": "muebles-a-medida",
        "name": "Muebles a medida",
        "shortDescription": "Diseno y fabricacion de muebles de madera a medida.",
        "featured": True,
        "detailPage": False,
        "approvedForPublication": True,
    }
]

PRIVACY = """## Aviso de privacidad

Taller Nopal S.A. de C.V., con domicilio en Avenida Juarez 1420, Puebla, Puebla,
es responsable del tratamiento de sus datos personales.

Los datos que usted proporciona mediante el formulario de contacto se utilizan
unicamente para responder su solicitud.

Para ejercer sus derechos ARCO, escriba a hola@tallernopal.mx.
"""

# The declared order of npm run quality:production. Each entry is a label and an
# argv; the run stops at the first non-zero exit, as the real gate does.
FORMAT_TARGETS = [
    "src", "scripts", "tests/data", "tests/site", "tests/artifacts",
    "tests/production", "tests/browser", ".github", "package.json",
    "astro.config.ts", "tsconfig.json", "playwright.config.ts",
    "prettier.config.mjs",
]

GATE = [
    ("memory contracts", ["python", "ops/memory_health.py", "--scope", "contracts"]),
    ("format:check", ["npx", "--no-install", "prettier", "--check", *FORMAT_TARGETS]),
    ("astro check", ["npx", "--no-install", "astro", "check"]),
    ("validate:data", ["node", "scripts/validate-data.ts"]),
    ("test:security", ["python", "-m", "unittest", "discover", "-s", "tests/security"]),
    ("validate:project", ["node", "scripts/validate-project.ts"]),
    ("validate:production", ["node", "scripts/validate-production.ts"]),
    ("check:placeholders", ["node", "scripts/check-placeholders.ts"]),
    ("check:assets", ["node", "scripts/check-assets.ts"]),
    ("build", ["npx", "--no-install", "astro", "build"]),
    ("test:artifacts:built", ["node", "--test", "tests/artifacts/site-output.test.ts"]),
    ("verify:dist", ["node", "scripts/verify-dist.ts"]),
    ("check:links", ["node", "scripts/check-links.ts"]),
    ("check:public-output", ["node", "scripts/check-public-output.ts"]),
]


def run(argv, cwd, **kw):
    return subprocess.run(argv, cwd=cwd, capture_output=True, text=True, shell=True
                          if sys.platform == "win32" else False, **kw)


def build_sandbox() -> pathlib.Path:
    if SANDBOX.exists():
        junction = SANDBOX / "node_modules"
        if junction.exists():
            junction.rmdir()  # removes the junction, never its target
        shutil.rmtree(SANDBOX)
    SANDBOX.mkdir(parents=True)
    archive = subprocess.run(
        ["git", "archive", "HEAD"], cwd=ROOT, capture_output=True, check=True
    )
    tar = subprocess.run(["tar", "-x", "-C", str(SANDBOX)], input=archive.stdout,
                         capture_output=True)
    if tar.returncode != 0:
        raise SystemExit(f"could not extract tracked files: {tar.stderr!r}")
    subprocess.run(
        ["powershell.exe", "-NoProfile", "-Command",
         f"New-Item -ItemType Junction -Path '{SANDBOX / 'node_modules'}' "
         f"-Target '{ROOT / 'node_modules'}'"],
        capture_output=True,
    )
    return SANDBOX


def apply_human_steps(sb: pathlib.Path) -> None:
    """The steps docs/runbooks/create-client-site.md leaves to a person."""
    (sb / "src/data/locations.json").write_text(
        json.dumps(LOCATIONS, indent=2) + "\n", encoding="utf-8")
    (sb / "src/data/services.json").write_text(
        json.dumps(SERVICES, indent=2) + "\n", encoding="utf-8")
    (sb / "src/content/legal/aviso-de-privacidad.md").write_text(
        PRIVACY, encoding="utf-8")
    (sb / "src/data/production.json").write_text(
        json.dumps({"schemaVersion": 1, "businessFactsVerified": True,
                    "domainOwnershipVerified": True,
                    "privacyNoticeApproved": True}, indent=2) + "\n",
        encoding="utf-8")
    # Hand-written JSON is not Prettier-formatted; format:check is a real gate
    # step and reformatting here keeps the run measuring the repository rather
    # than this harness's output style.
    run(["npx", "--no-install", "prettier", "--write",
         "src/data/locations.json", "src/data/services.json",
         "src/data/production.json",
         "src/content/legal/aviso-de-privacidad.md"], cwd=sb)


def main() -> int:
    sb = build_sandbox()
    (sb.parent / "client-input.json").write_text(
        json.dumps(CLIENT, indent=2), encoding="utf-8")

    init = run(["node", "scripts/init-client.ts", "../client-input.json"], cwd=sb)
    print(f"init:client exit={init.returncode}")
    print(init.stdout.strip() or init.stderr.strip())
    if init.returncode != 0:
        return 1

    apply_human_steps(sb)

    results = []
    for index, (label, argv) in enumerate(GATE, start=1):
        outcome = run(argv, cwd=sb)
        ok = outcome.returncode == 0
        results.append({"step": index, "label": label, "exit": outcome.returncode})
        print(f"[{index:2d}/14] {label:22s} {'PASS' if ok else 'FAIL'}")
        if not ok:
            print((outcome.stdout + outcome.stderr).strip()[-1500:])
            break

    passed = sum(1 for r in results if r["exit"] == 0)
    print(f"\nquality:production {passed}/{len(GATE)} steps passed")
    (pathlib.Path.cwd() / "lifecycle-results.json").write_text(
        json.dumps({"steps": results, "passed": passed, "total": len(GATE)},
                   indent=2) + "\n", encoding="utf-8")
    return 0 if passed == len(GATE) else 1


if __name__ == "__main__":
    raise SystemExit(main())
