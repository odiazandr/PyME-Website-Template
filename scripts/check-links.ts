import { existsSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import {
  ROOT,
  displayPath,
  isMain,
  readUtf8,
  report,
  walkFiles,
  type Finding,
} from "./lib/validation.ts";

const DIST_ROOT = resolve(ROOT, "dist");
const attributePattern = /\b(?:href|src|action)=(?:"([^"]+)"|'([^']+)')/g;
const srcsetPattern = /\bsrcset=(?:"([^"]+)"|'([^']+)')/g;
const cssUrlPattern = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/g;

export const extractReferences = (content: string): string[] => {
  const references = [...content.matchAll(attributePattern)].map(
    (match) => match[1] ?? match[2],
  );
  for (const match of content.matchAll(srcsetPattern)) {
    const value = match[1] ?? match[2];
    references.push(
      ...value
        .split(",")
        .map((candidate) => candidate.trim().split(/\s+/, 1)[0]),
    );
  }
  references.push(
    ...[...content.matchAll(cssUrlPattern)].map(
      (match) => match[1] ?? match[2] ?? match[3],
    ),
  );
  return references;
};

type Resolution = { target: string | null; error: string | null };

export const resolveReference = (value: string, source: string): Resolution => {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(value)) {
    return { target: null, error: null };
  }
  let clean: string;
  try {
    clean = decodeURIComponent(value.split(/[?#]/, 1)[0]).replaceAll("\\", "/");
  } catch {
    return { target: null, error: "contains malformed percent encoding" };
  }
  if (!clean) return { target: null, error: null };

  const base = value.startsWith("/")
    ? resolve(DIST_ROOT, `.${clean}`)
    : resolve(dirname(source), clean);
  const target = clean.endsWith("/")
    ? resolve(base, "index.html")
    : existsSync(base)
      ? base
      : resolve(base, "index.html");
  const outside = relative(DIST_ROOT, target);
  if (outside.startsWith("..") || isAbsolute(outside)) {
    return { target: null, error: "resolves outside dist/" };
  }
  return { target, error: null };
};

export const checkLinks = (): Finding[] => {
  const findings: Finding[] = [];
  const sources = walkFiles(DIST_ROOT).filter(
    (path) => path.endsWith(".html") || path.endsWith(".css"),
  );
  for (const source of sources) {
    for (const reference of extractReferences(readUtf8(source))) {
      const resolution = resolveReference(reference, source);
      if (
        resolution.error ||
        (resolution.target && !existsSync(resolution.target))
      ) {
        findings.push({
          code: resolution.error
            ? "INVALID_INTERNAL_LINK"
            : "BROKEN_INTERNAL_LINK",
          path: displayPath(source),
          message: `${reference} ${resolution.error ?? "does not resolve to a built artifact"}`,
        });
      }
    }
  }
  return findings;
};

if (isMain(import.meta.url)) {
  report("INTERNAL LINK CHECK", checkLinks());
}
