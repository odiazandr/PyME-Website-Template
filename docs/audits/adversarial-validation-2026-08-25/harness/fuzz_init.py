"""Adversarial input fuzzing for scripts/init-client.ts.

Every case must produce a clean structured finding or a clean success.
A Node traceback, a written file that fails a later gate, or a silent
accept of a dangerous value is a defect.

Usage: python fuzz_init.py <sandbox-root>
"""

import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(sys.argv[1])
PRISTINE = ROOT.parent / (ROOT.name + "-pristine")
MUTABLE = ["memory.toml", "src/config/site.ts", "src/data/business.json"]


def snapshot():
    for rel in MUTABLE:
        dst = PRISTINE / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, dst)


def restore():
    for rel in MUTABLE:
        shutil.copy2(PRISTINE / rel, ROOT / rel)


def base(**over):
    doc = {
        "schemaVersion": 1,
        "site": {"canonicalUrl": "https://ferreteriasanmiguel.mx"},
        "business": {
            "schemaVersion": 1,
            "publicName": "Ferreteria San Miguel",
            "legalName": None,
            "description": "Ferreteria con servicio verificado en la region.",
            "primaryPhone": {"display": "+52 222 345 6789", "e164": "+522223456789"},
            "email": "contacto@ferreteriasanmiguel.mx",
            "whatsapp": {"enabled": False, "number": None},
        },
    }
    for key, value in over.items():
        if key == "site":
            doc["site"].update(value)
        elif key == "business":
            doc["business"].update(value)
        else:
            doc[key] = value
    return doc


CASES = [
    ("url_with_credentials", base(site={"canonicalUrl": "https://admin:hunter2@ferreteriasanmiguel.mx"}), "should_reject"),
    ("url_with_path_query", base(site={"canonicalUrl": "https://ferreteriasanmiguel.mx/a?b=c#d"}), "observe"),
    ("url_punycode_lookalike", base(site={"canonicalUrl": "https://xn--frretera-p1a.mx"}), "observe"),
    ("url_ip_literal", base(site={"canonicalUrl": "https://203.0.113.10"}), "observe"),
    ("url_port", base(site={"canonicalUrl": "https://ferreteriasanmiguel.mx:8443"}), "observe"),
    ("uuid_v1_not_v4", base(site={"siteId": "d9428888-122b-11e1-b85c-61cd3cbb3210"}), "observe"),
    ("uuid_nil", base(site={"siteId": "00000000-0000-0000-0000-000000000000"}), "observe"),
    ("name_with_newline", base(business={"publicName": "Ferreteria\nSan Miguel"}), "observe"),
    ("name_with_quote_brace", base(business={"publicName": 'Fe"rre}); evil("'}), "observe"),
    ("name_with_backtick_template", base(business={"publicName": "Ferreteria ${process.env.HOME}"}), "observe"),
    ("name_with_percent_s", base(business={"publicName": "100%s Calidad"}), "observe"),
    ("name_very_long", base(business={"publicName": "A" * 10000}), "observe"),
    ("name_rtl_override", base(business={"publicName": "Ferreteria ‮gnitset‬"}), "observe"),
    ("name_only_whitespace", base(business={"publicName": "   "}), "should_reject"),
    ("name_sample_uppercase", base(business={"publicName": "NEGOCIO DE EJEMPLO"}), "should_reject"),
    ("desc_sample_mixed_case", base(business={"description": "Contenido PENDIENTE DE VERIFICACIÓN aun."}), "should_reject"),
    ("email_unicode", base(business={"email": "contacto@ferreteríasanmiguel.mx"}), "observe"),
    ("phone_e164_too_long", base(business={"primaryPhone": {"display": "x", "e164": "+5222234567890123456"}}), "should_reject"),
    ("whatsapp_enabled_no_number", base(business={"whatsapp": {"enabled": True, "number": None}}), "should_reject"),
    ("proto_pollution", base(**{"__proto__": {"polluted": True}}), "observe"),
    ("unknown_top_key", base(**{"extra": 1}), "should_reject"),
    ("wrong_schema_version", base(schemaVersion=2), "should_reject"),
    ("site_missing", {"schemaVersion": 1, "business": base()["business"]}, "should_reject"),
    ("null_document", None, "should_reject"),
    ("array_document", [1, 2, 3], "should_reject"),
    ("deeply_nested", base(business={"legalName": None}) | {"deep": {"a": {"b": {"c": {"d": {"e": 1}}}}}}, "should_reject"),
]

RAW_CASES = [
    ("empty_file", ""),
    ("whitespace_only", "   \n\t "),
    ("bom_prefixed", "﻿" + json.dumps(base())),
    ("trailing_garbage", json.dumps(base()) + "}}}"),
    ("nul_byte", json.dumps(base()).replace("Ferreteria", "Ferre\x00teria")),
    ("json5_comment", "// comment\n" + json.dumps(base())),
]


def run(path: pathlib.Path, extra=None):
    cmd = ["node", "scripts/init-client.ts", str(path)] + (extra or [])
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
                          timeout=180, encoding="utf-8", errors="replace")
    return proc.returncode, proc.stdout + proc.stderr


def classify(code, out):
    if "Error" in out and ("at " in out and "node:" in out or "Stack" in out):
        return "CRASH"
    if "\n    at " in out:
        return "CRASH"
    if code == 0:
        return "ACCEPTED"
    if "CLIENT INITIALIZATION: FAILED" in out:
        return "REJECTED_CLEAN"
    return "REJECTED_UNCLEAR"


def main() -> int:
    snapshot()
    inp = ROOT / "fuzz-input.json"
    rows = []

    for name, doc, expectation in CASES:
        restore()
        inp.write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8", newline="\n")
        code, out = run(inp)
        verdict = classify(code, out)
        rows.append({"case": name, "expectation": expectation, "exit": code,
                     "verdict": verdict, "output": out.strip()[:300]})
        flag = ""
        if verdict == "CRASH":
            flag = "  <-- CRASH"
        elif expectation == "should_reject" and verdict == "ACCEPTED":
            flag = "  <-- ACCEPTED BUT SHOULD REJECT"
        print(f"{name:<28} {verdict:<18} exit={code}{flag}")

    for name, raw in RAW_CASES:
        restore()
        inp.write_bytes(raw.encode("utf-8", errors="surrogatepass"))
        code, out = run(inp)
        verdict = classify(code, out)
        rows.append({"case": name, "expectation": "should_reject", "exit": code,
                     "verdict": verdict, "output": out.strip()[:300]})
        flag = "  <-- CRASH" if verdict == "CRASH" else ("  <-- ACCEPTED BUT SHOULD REJECT" if verdict == "ACCEPTED" else "")
        print(f"{name:<28} {verdict:<18} exit={code}{flag}")

    restore()
    if inp.exists():
        inp.unlink()
    out_path = ROOT.parent.parent / "evidence" / "fuzz-init-results.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8", newline="\n")
    crashes = [r for r in rows if r["verdict"] == "CRASH"]
    wrong = [r for r in rows if r["expectation"] == "should_reject" and r["verdict"] == "ACCEPTED"]
    print(f"\ncases={len(rows)} crashes={len(crashes)} accepted-but-should-reject={len(wrong)}")
    for r in wrong:
        print(f"  ACCEPTED: {r['case']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
