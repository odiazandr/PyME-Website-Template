import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));

export type Finding = { code: string; path: string; message: string };

export const readUtf8 = (path: string): string => readFileSync(path, "utf8");

export const walkFiles = (directory: string): string[] => {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
};

export const displayPath = (path: string): string =>
  relative(ROOT, path).replaceAll("\\", "/");

export const isMain = (moduleUrl: string): boolean =>
  Boolean(
    process.argv[1] && resolve(process.argv[1]) === fileURLToPath(moduleUrl),
  );

export const textFiles = (directory: string): string[] => {
  const extensions = new Set([
    "",
    ".astro",
    ".css",
    ".html",
    ".htm",
    ".js",
    ".cjs",
    ".json",
    ".md",
    ".mjs",
    ".scss",
    ".svg",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
    ".toml",
    ".csv",
    ".webmanifest",
  ]);
  return walkFiles(directory).filter((path) => extensions.has(extname(path)));
};

export const report = (label: string, findings: Finding[]): void => {
  const ordered = [...findings].sort((a, b) =>
    `${a.path}:${a.code}:${a.message}`.localeCompare(
      `${b.path}:${b.code}:${b.message}`,
    ),
  );
  if (ordered.length === 0) {
    console.log(`${label}: PASSED`);
    return;
  }
  console.error(`${label}: FAILED`);
  for (const finding of ordered) {
    console.error(`- [${finding.code}] ${finding.path}: ${finding.message}`);
  }
  process.exitCode = 1;
};
