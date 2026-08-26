"""Seeded Monte Carlo scenario sampler.

Samples combinations of repository-state dimensions, applies them to a
disposable sandbox, runs the source-level gate battery, and records which
dimensions actually determine the outcome.

Usage: python montecarlo.py <sandbox-root> <samples> <seed>
"""

import csv
import json
import pathlib
import random
import shutil
import subprocess
import sys

ROOT = pathlib.Path(sys.argv[1])
SAMPLES = int(sys.argv[2]) if len(sys.argv) > 2 else 100
SEED = int(sys.argv[3]) if len(sys.argv) > 3 else 20260825
PRISTINE = ROOT.parent / (ROOT.name + "-pristine")

MUTABLE = [
    "memory.toml",
    "src/config/site.ts",
    "src/data/business.json",
    "src/data/production.json",
    "src/data/locations.json",
    "src/data/services.json",
    "src/data/template.json",
    "src/config/navigation.ts",
    "src/content/legal/aviso-de-privacidad.md",
]

DIMENSIONS = {
    "mode": ["template", "project", "bogus", "missing"],
    "identity": ["client", "sample"],
    "canonical": ["client_domain", "netlify_app", "example_com"],
    "approvals": ["all_true", "partial", "all_false"],
    "privacy": ["approved", "reference_instruction"],
    "content": ["verified", "placeholder_retained", "empty_collections"],
    "navigation": ["intact", "empty", "dangling"],
    "template_version": ["matching", "drifted"],
}

GATES = [
    ("memory", [sys.executable, "ops/memory_health.py", "--scope", "contracts"]),
    ("data", ["node", "scripts/validate-data.ts"]),
    ("project", ["node", "scripts/validate-project.ts"]),
    ("production", ["node", "scripts/validate-production.ts"]),
]


def snapshot() -> None:
    if PRISTINE.exists():
        shutil.rmtree(PRISTINE, ignore_errors=True)
    for rel in MUTABLE:
        src = ROOT / rel
        dst = PRISTINE / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def restore() -> None:
    for rel in MUTABLE:
        shutil.copy2(PRISTINE / rel, ROOT / rel)


def w(rel: str, text: str) -> None:
    (ROOT / rel).write_text(text, encoding="utf-8", newline="\n")


def r(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def apply(scenario: dict) -> None:
    # mode
    mem = r("memory.toml")
    if scenario["mode"] == "missing":
        mem = "\n".join(l for l in mem.splitlines() if not l.startswith("mode")) + "\n"
    else:
        mem = mem.replace('mode = "template"', f'mode = "{scenario["mode"]}"')
    w("memory.toml", mem)

    # identity + canonical URL
    host = {
        "client_domain": "https://ferreteriasanmiguel.mx",
        "netlify_app": "https://ferreteria-sm.netlify.app",
        "example_com": "https://example.com",
    }[scenario["canonical"]]
    name = "Ferreteria San Miguel" if scenario["identity"] == "client" else "Negocio de ejemplo"
    site_id = (
        "3f2a1b7c-9d4e-4a1f-8c2b-6e5d4c3b2a19"
        if scenario["identity"] == "client"
        else "00000000-0000-4000-8000-000000000000"
    )
    w("src/config/site.ts", (
        'import { SiteSchema } from "../schemas/site.ts";\n'
        "export const site = SiteSchema.parse({\n"
        "  schemaVersion: 1,\n"
        f'  siteId: "{site_id}",\n'
        f'  canonicalUrl: "{host}",\n'
        '  defaultLocale: "es-MX",\n'
        f'  titleTemplate: "%s | {name}",\n'
        "});\n"
    ))
    desc = (
        "Ferreteria con servicio verificado en la region."
        if scenario["identity"] == "client"
        else "Descripcion pendiente de verificación para el negocio del cliente."
    )
    email = "contacto@ferreteriasanmiguel.mx" if scenario["identity"] == "client" else "contacto@example.com"
    w("src/data/business.json", json.dumps({
        "schemaVersion": 1,
        "publicName": name,
        "legalName": None,
        "description": desc,
        "primaryPhone": {"display": "+52 222 345 6789", "e164": "+522223456789"},
        "email": email,
        "whatsapp": {"enabled": False, "number": None},
    }, ensure_ascii=False, indent=2) + "\n")

    # approvals
    flags = {"all_true": (True, True, True), "partial": (True, False, True), "all_false": (False, False, False)}[
        scenario["approvals"]
    ]
    w("src/data/production.json", json.dumps({
        "schemaVersion": 1,
        "businessFactsVerified": flags[0],
        "domainOwnershipVerified": flags[1],
        "privacyNoticeApproved": flags[2],
    }, indent=2) + "\n")

    # privacy
    w("src/content/legal/aviso-de-privacidad.md", (
        "## Aviso de privacidad\n\nTexto aprobado por la persona responsable del negocio.\n"
        if scenario["privacy"] == "approved"
        else "## Revisión legal pendiente\n\nEste contenido no constituye asesoría legal.\n"
    ))

    # content domains
    if scenario["content"] == "empty_collections":
        w("src/data/locations.json", "[]\n")
        w("src/data/services.json", "[]\n")
    elif scenario["content"] == "verified":
        w("src/data/locations.json", json.dumps([{
            "id": "sucursal-centro", "name": "Sucursal Centro",
            "street": "Avenida Reforma 145", "locality": "Puebla", "region": "Puebla",
            "postalCode": "72000", "country": "MX", "phone": None, "mapUrl": None,
            "geo": {"latitude": None, "longitude": None},
            "hours": [
                {"day": d, "closed": False, "opens": "09:00", "closes": "18:00"}
                for d in ["monday", "tuesday", "wednesday", "thursday", "friday"]
            ] + [
                {"day": d, "closed": True, "opens": None, "closes": None}
                for d in ["saturday", "sunday"]
            ],
            "approvedForPublication": True,
        }], ensure_ascii=False, indent=2) + "\n")
        w("src/data/services.json", json.dumps([{
            "id": "venta-herramienta", "name": "Venta de herramienta",
            "shortDescription": "Herramienta manual y electrica para obra y hogar.",
            "featured": True, "detailPage": False,
            "approvedForPublication": True,
        }], ensure_ascii=False, indent=2) + "\n")
    # placeholder_retained: leave the shipped template fixtures untouched

    # navigation
    if scenario["navigation"] == "empty":
        w("src/config/navigation.ts",
          "export type NavigationItem = { href: string; label: string };\n"
          "export const navigation: NavigationItem[] = [];\n")
    elif scenario["navigation"] == "dangling":
        w("src/config/navigation.ts",
          "export const navigation = [\n"
          '  { href: "/", label: "Inicio" },\n'
          '  { href: "/no-existe/", label: "Fantasma" },\n'
          "] as const;\n")

    # template version
    if scenario["template_version"] == "drifted":
        w("src/data/template.json", json.dumps({"schemaVersion": 1, "templateVersion": "0.1.0"}, indent=2) + "\n")


def run_gates() -> dict:
    out = {}
    for name, cmd in GATES:
        try:
            proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
                                  timeout=180, encoding="utf-8", errors="replace")
            out[name] = proc.returncode
            if "Traceback" in (proc.stdout + proc.stderr):
                out[name] = 99  # crash rather than clean rejection
        except subprocess.TimeoutExpired:
            out[name] = 98
    return out


def main() -> int:
    snapshot()
    rng = random.Random(SEED)
    rows = []
    # Conditioned mode pins every dimension an operator following the runbook
    # would have satisfied, so sampling explores only what the gates claim to
    # protect afterwards. This is importance sampling, not a uniform prior.
    conditioned = len(sys.argv) > 4 and sys.argv[4] == "conditioned"
    PINNED = {
        "mode": "project", "identity": "client", "canonical": "client_domain",
        "approvals": "all_true", "privacy": "approved",
    }
    for i in range(SAMPLES):
        scenario = {k: rng.choice(v) for k, v in DIMENSIONS.items()}
        if conditioned:
            scenario.update(PINNED)
        restore()
        try:
            apply(scenario)
        except Exception as exc:
            rows.append({**scenario, "id": f"MC-{i:04d}", "error": str(exc)[:120]})
            continue
        gates = run_gates()
        signature = "".join(
            "P" if gates[n] == 0 else ("C" if gates[n] == 99 else "F") for n, _ in GATES
        )
        rows.append({
            "id": f"MC-{i:04d}", **scenario,
            **{f"gate_{n}": gates[n] for n, _ in GATES},
            "signature": signature,
            "all_pass": all(gates[n] == 0 for n, _ in GATES),
            "any_crash": any(gates[n] == 99 for n, _ in GATES),
        })
        if (i + 1) % 20 == 0:
            print(f"  ...{i + 1}/{SAMPLES}", flush=True)

    restore()
    evidence = ROOT.parent.parent / "evidence"
    evidence.mkdir(parents=True, exist_ok=True)
    tag = "-conditioned" if conditioned else ""
    (evidence / f"montecarlo-results{tag}.json").write_text(
        json.dumps({"seed": SEED, "samples": SAMPLES, "dimensions": DIMENSIONS, "rows": rows},
                   indent=2, ensure_ascii=False), encoding="utf-8", newline="\n")
    with (evidence / f"montecarlo-results{tag}.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    # aggregate
    ok = [r for r in rows if r.get("all_pass")]
    print(f"\nsamples={len(rows)} seed={SEED}")
    print(f"all gates pass: {len(ok)} ({100*len(ok)/len(rows):.0f}%)")
    print(f"any crash:      {sum(1 for r in rows if r.get('any_crash'))}")
    print("\nsignature frequency (memory,data,project,production):")
    sig = {}
    for r in rows:
        sig[r.get("signature", "ERR")] = sig.get(r.get("signature", "ERR"), 0) + 1
    for s, n in sorted(sig.items(), key=lambda kv: -kv[1]):
        print(f"  {s}  {n}")

    print("\nP(all gates pass | dimension = value):")
    for dim, values in DIMENSIONS.items():
        print(f"  {dim}:")
        for v in values:
            subset = [r for r in rows if r.get(dim) == v]
            if subset:
                p = sum(1 for r in subset if r.get("all_pass")) / len(subset)
                print(f"    {v:<22} n={len(subset):<4} P={p:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
