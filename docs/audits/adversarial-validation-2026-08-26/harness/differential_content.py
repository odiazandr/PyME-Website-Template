"""Differential Monte Carlo against the content publication contract.

Campaign 2 measured how often the gate passed. This computes what the gate
SHOULD decide, independently of the gate, and reports every disagreement.
A disagreement is a defect in one of the two, which is the point.

Usage: python differential_content.py <sandbox-root> <samples> <seed>
"""

import csv
import json
import pathlib
import random
import shutil
import subprocess
import sys

ROOT = pathlib.Path(sys.argv[1])
SAMPLES = int(sys.argv[2]) if len(sys.argv) > 2 else 80
SEED = int(sys.argv[3]) if len(sys.argv) > 3 else 20260826
PRISTINE = ROOT.parent / (ROOT.name + "-content-pristine")

MUTABLE = [
    "memory.toml",
    "src/config/site.ts",
    "src/data/business.json",
    "src/data/production.json",
    "src/data/locations.json",
    "src/data/services.json",
    "src/data/team.json",
    "src/data/testimonials.json",
]

PLACEHOLDER_STREET = "Dirección pendiente"
PLACEHOLDER_SERVICE = "Contenido de referencia pendiente de sustituir con información verificada."

DIMENSIONS = {
    "loc_approved": [True, False],
    "loc_hours": ["normal_week", "all_closed", "one_day"],
    "loc_text": ["verified", "placeholder_street"],
    "svc_approved": [True, False],
    "svc_text": ["verified", "placeholder_desc"],
    "testimonial": ["none", "clean", "placeholder_quote"],
    "canonical": ["origin", "netlify"],
    "approvals": ["all_true", "one_false"],
}

WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def snapshot() -> None:
    if PRISTINE.exists():
        shutil.rmtree(PRISTINE, ignore_errors=True)
    for rel in MUTABLE:
        dst = PRISTINE / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, dst)


def restore() -> None:
    for rel in MUTABLE:
        shutil.copy2(PRISTINE / rel, ROOT / rel)


def w(rel: str, obj) -> None:
    text = obj if isinstance(obj, str) else json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    (ROOT / rel).write_text(text, encoding="utf-8", newline="\n")


def hours_for(kind: str):
    if kind == "all_closed":
        return [{"day": d, "closed": True, "opens": None, "closes": None} for d in WEEK]
    if kind == "one_day":
        return [
            {"day": d, "closed": d != "monday",
             "opens": "09:00" if d == "monday" else None,
             "closes": "14:00" if d == "monday" else None}
            for d in WEEK
        ]
    return [
        {"day": d, "closed": d == "sunday",
         "opens": None if d == "sunday" else "09:00",
         "closes": None if d == "sunday" else "18:00"}
        for d in WEEK
    ]


def apply(s: dict) -> None:
    w("memory.toml", (ROOT / "memory.toml").read_text(encoding="utf-8")
        .replace('mode = "template"', 'mode = "project"'))

    host = "https://ferreteriasanmiguel.mx" if s["canonical"] == "origin" else "https://fsm.netlify.app"
    w("src/config/site.ts",
      'import { SiteSchema } from "../schemas/site.ts";\n'
      "export const site = SiteSchema.parse({\n"
      "  schemaVersion: 1,\n"
      '  siteId: "3f2a1b7c-9d4e-4a1f-8c2b-6e5d4c3b2a19",\n'
      f'  canonicalUrl: "{host}",\n'
      '  defaultLocale: "es-MX",\n'
      '  titleTemplate: "%s | Ferreteria San Miguel",\n'
      "});\n")

    w("src/data/business.json", {
        "schemaVersion": 1, "publicName": "Ferreteria San Miguel", "legalName": None,
        "description": "Ferreteria con servicio verificado en la region.",
        "primaryPhone": {"display": "+52 222 345 6789", "e164": "+522223456789"},
        "email": "contacto@ferreteriasanmiguel.mx",
        "whatsapp": {"enabled": False, "number": None},
    })

    flags = (True, True, True) if s["approvals"] == "all_true" else (True, False, True)
    w("src/data/production.json", {
        "schemaVersion": 1, "businessFactsVerified": flags[0],
        "domainOwnershipVerified": flags[1], "privacyNoticeApproved": flags[2],
    })

    w("src/data/locations.json", [{
        "id": "sucursal-centro", "name": "Sucursal Centro",
        "street": PLACEHOLDER_STREET if s["loc_text"] == "placeholder_street" else "Avenida Reforma 145",
        "locality": "Puebla", "region": "Puebla", "postalCode": "72000", "country": "MX",
        "phone": None, "mapUrl": None, "geo": {"latitude": None, "longitude": None},
        "hours": hours_for(s["loc_hours"]),
        "approvedForPublication": s["loc_approved"],
    }])

    w("src/data/services.json", [{
        "id": "venta-herramienta", "name": "Venta de herramienta",
        "shortDescription": PLACEHOLDER_SERVICE if s["svc_text"] == "placeholder_desc"
                            else "Herramienta manual y electrica para obra y hogar.",
        "featured": True, "detailPage": False,
        "approvedForPublication": s["svc_approved"],
    }])

    if s["testimonial"] == "none":
        w("src/data/testimonials.json", [])
    else:
        quote = ("La dirección pendiente en su sitio me confundió."
                 if s["testimonial"] == "placeholder_quote"
                 else "Servicio rapido y atencion excelente.")
        w("src/data/testimonials.json", [{
            "id": "cliente-uno", "quote": quote, "displayName": "Cliente",
            "sourceUrl": None, "approvedForPublication": True,
        }])

    w("src/content/legal/aviso-de-privacidad.md",
      "## Aviso de privacidad\n\nTexto aprobado por la persona responsable.\n")


def expected(s: dict) -> set:
    """Independently derived verdict, from the documented contract only."""
    codes = set()
    if not s["loc_approved"] or not s["svc_approved"]:
        codes.add("CONTENT_REVIEW_REQUIRED")
    if s["loc_approved"] and s["loc_hours"] == "all_closed":
        codes.add("LOCATION_NEVER_OPEN")
    # SAMPLE_VALUES is a substring scan over every canonical domain
    if (s["loc_text"] == "placeholder_street"
            or s["svc_text"] == "placeholder_desc"
            or s["testimonial"] == "placeholder_quote"):
        codes.add("SAMPLE_VALUE")
    if s["canonical"] == "netlify":
        codes.add("PROVIDER_CANONICAL")
    if s["approvals"] == "one_false":
        codes.add("PRODUCTION_APPROVAL_REQUIRED")
    return codes


def actual() -> tuple[set, str]:
    proc = subprocess.run(
        ["node", "scripts/validate-production.ts"], cwd=ROOT,
        capture_output=True, text=True, timeout=180, encoding="utf-8", errors="replace",
    )
    out = proc.stdout + proc.stderr
    if "Error" in out and "\n    at " in out:
        return set(), "CRASH"
    codes = set()
    for line in out.splitlines():
        if line.startswith("- ["):
            codes.add(line[3:line.index("]")])
    return codes, "OK"


def main() -> int:
    snapshot()
    rng = random.Random(SEED)
    rows, disagreements = [], []
    for i in range(SAMPLES):
        s = {k: rng.choice(v) for k, v in DIMENSIONS.items()}
        restore()
        apply(s)
        got, health = actual()
        want = expected(s)
        agree = (got == want) and health == "OK"
        row = {"id": f"DC-{i:04d}", **{k: str(v) for k, v in s.items()},
               "expected": "|".join(sorted(want)) or "PASS",
               "actual": "|".join(sorted(got)) or "PASS",
               "health": health, "agree": agree}
        rows.append(row)
        if not agree:
            disagreements.append(row)
        if (i + 1) % 20 == 0:
            print(f"  ...{i+1}/{SAMPLES}", flush=True)

    restore()
    ev = ROOT.parent.parent / "evidence"
    ev.mkdir(parents=True, exist_ok=True)
    (ev / "differential-content.json").write_text(
        json.dumps({"seed": SEED, "samples": SAMPLES, "dimensions":
                    {k: [str(x) for x in v] for k, v in DIMENSIONS.items()},
                    "rows": rows}, indent=2, ensure_ascii=False),
        encoding="utf-8", newline="\n")
    with (ev / "differential-content.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader(); writer.writerows(rows)

    print(f"\nsamples={len(rows)} seed={SEED}")
    print(f"gate agreed with the independent oracle: {len(rows)-len(disagreements)}/{len(rows)}")
    print(f"crashes: {sum(1 for r in rows if r['health']=='CRASH')}")
    if disagreements:
        print("\nDISAGREEMENTS (each is a defect in the gate or in the stated contract):")
        for r in disagreements[:12]:
            print(f"  {r['id']}  expected[{r['expected']}]  actual[{r['actual']}]")
            print(f"        {({k: r[k] for k in DIMENSIONS})}")
    else:
        print("\nno disagreements: the gate matched the independently derived contract on every sample")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
