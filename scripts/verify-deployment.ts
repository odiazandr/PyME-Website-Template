/**
 * Read-only verification of the explicitly linked Netlify deployment.
 *
 * This is intentionally outside deterministic quality gates: an unavailable
 * provider or missing credential is UNVERIFIED, never a local build failure.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { site } from "../src/config/site.ts";
import { activeForms } from "../src/config/forms.ts";
import { ROOT, isMain } from "./lib/validation.ts";

const API_ROOT = "https://api.netlify.com/api/v1";
const REQUIRED_PUBLIC_STATUS = 200;

export type VerificationStatus = "passed" | "failed" | "unverified";
export type Verification = {
  name: string;
  status: VerificationStatus;
  message: string;
};

type Site = {
  id?: string;
  url?: string;
  ssl_url?: string;
  custom_domain?: string;
  domain_aliases?: string[];
  build_settings?: { cmd?: string; dir?: string };
  processing_settings?: { ignore_html_forms?: boolean };
  published_deploy?: { state?: string; commit_ref?: string };
};

type ProviderForm = {
  id?: string;
  name?: string;
  submission_count?: number;
};

type ProviderHook = {
  type?: string;
  event?: string;
  form_id?: string;
  form_name?: string;
};

export type DeploymentEvidence = {
  site: Site;
  forms: ProviderForm[];
  hooks: ProviderHook[];
  live: { status: number; headers: Headers };
  expectedCommit: string | null;
  expectedBuild: { command: string | null; publish: string | null };
  expectedHeaders: Record<string, string>;
};

const result = (
  name: string,
  status: VerificationStatus,
  message: string,
): Verification => ({ name, status, message });

const readQuotedValue = (source: string, key: string): string | null =>
  new RegExp(`^${key}\\s*=\\s*"([^"]*)"\\s*$`, "m").exec(source)?.[1] ?? null;

export const readNetlifyContract = (
  source: string,
): {
  build: { command: string | null; publish: string | null };
  headers: Record<string, string>;
} => {
  const buildStart = source.indexOf("[build]");
  const afterBuild = buildStart === -1 ? "" : source.slice(buildStart + 7);
  const nextSection = afterBuild.search(/\r?\n\[/);
  const build =
    nextSection === -1 ? afterBuild : afterBuild.slice(0, nextSection);
  const headers: Record<string, string> = {};

  for (const match of source.matchAll(
    /\[\[headers\]\]\s*for\s*=\s*"([^"]+)"\s*\[headers\.values\]\s*([\s\S]*?)(?=\n\[\[headers\]\]|\s*$)/g,
  )) {
    if (match[1] !== "/*") continue;
    for (const value of match[2].matchAll(/^([^=\s]+)\s*=\s*"([^"]*)"\s*$/gm)) {
      headers[value[1].toLowerCase()] = value[2];
    }
  }

  return {
    build: {
      command: readQuotedValue(build, "command"),
      publish: readQuotedValue(build, "publish"),
    },
    headers,
  };
};

export const evaluateDeployment = (
  evidence: DeploymentEvidence,
): Verification[] => {
  const checks: Verification[] = [];
  const canonicalHost = new URL(site.canonicalUrl).hostname;
  const configuredHosts = [
    evidence.site.custom_domain,
    ...(evidence.site.domain_aliases ?? []),
  ].filter((value): value is string => Boolean(value));

  checks.push(
    configuredHosts.includes(canonicalHost)
      ? result(
          "canonical domain",
          "passed",
          `${canonicalHost} belongs to the site`,
        )
      : result(
          "canonical domain",
          "failed",
          `${canonicalHost} is not configured on the linked Netlify site`,
        ),
  );

  const deploy = evidence.site.published_deploy;
  if (!deploy?.commit_ref) {
    checks.push(
      result(
        "production deploy",
        "failed",
        "no published production deploy is recorded",
      ),
    );
  } else if (evidence.expectedCommit === null) {
    checks.push(
      result(
        "production deploy source",
        "unverified",
        "could not resolve origin/main; pass --commit with the reviewed revision",
      ),
    );
  } else {
    checks.push(
      deploy.commit_ref === evidence.expectedCommit
        ? result(
            "production deploy source",
            "passed",
            "published deploy matches expected revision",
          )
        : result(
            "production deploy source",
            "failed",
            `published ${deploy.commit_ref}, expected ${evidence.expectedCommit}`,
          ),
    );
  }

  const liveHost = new URL(evidence.site.ssl_url ?? evidence.site.url ?? "")
    .hostname;
  checks.push(
    evidence.live.status === REQUIRED_PUBLIC_STATUS
      ? result(
          "public response",
          "passed",
          `${liveHost} returned ${REQUIRED_PUBLIC_STATUS}`,
        )
      : result(
          "public response",
          "failed",
          `${liveHost} returned ${evidence.live.status}`,
        ),
  );

  const { command, publish } = evidence.expectedBuild;
  if (command === null || publish === null) {
    checks.push(
      result(
        "build settings",
        "unverified",
        "could not read the [build] contract from netlify.toml",
      ),
    );
  } else {
    const liveBuild = evidence.site.build_settings;
    checks.push(
      liveBuild?.cmd === command && liveBuild.dir === publish
        ? result(
            "build settings",
            "passed",
            "live build command and publish directory match netlify.toml",
          )
        : result(
            "build settings",
            "failed",
            `live command ${JSON.stringify(liveBuild?.cmd)} and directory ${JSON.stringify(liveBuild?.dir)} do not match netlify.toml`,
          ),
    );
  }

  const formsIgnored = evidence.site.processing_settings?.ignore_html_forms;
  checks.push(
    formsIgnored === false
      ? result(
          "form detection",
          "passed",
          "Netlify HTML form detection is enabled",
        )
      : formsIgnored === true
        ? result(
            "form detection",
            "failed",
            "Netlify HTML form detection is disabled",
          )
        : result(
            "form detection",
            "unverified",
            "provider did not expose processing_settings.ignore_html_forms",
          ),
  );

  for (const form of activeForms) {
    const providerForm = evidence.forms.find(({ name }) => name === form.name);
    if (!providerForm) {
      checks.push(
        result(
          `form ${form.name}: registration`,
          "failed",
          "form is not registered by Netlify",
        ),
      );
      continue;
    }

    checks.push(
      result(
        `form ${form.name}: registration`,
        "passed",
        "form is registered by Netlify",
      ),
    );
    checks.push(
      (providerForm.submission_count ?? 0) > 0
        ? result(
            `form ${form.name}: stored submission`,
            "passed",
            `${providerForm.submission_count} verified submission(s) are stored`,
          )
        : result(
            `form ${form.name}: stored submission`,
            "unverified",
            "no verified submission is currently stored",
          ),
    );

    if (form.notificationRequired) {
      const hook = evidence.hooks.find(
        ({ event, form_id, form_name }) =>
          event === "submission_created" &&
          (form_id === providerForm.id || form_name === form.name),
      );
      checks.push(
        hook
          ? result(
              `form ${form.name}: notification`,
              "passed",
              `submission notification is configured as ${hook.type ?? "an unknown hook type"}`,
            )
          : result(
              `form ${form.name}: notification`,
              "failed",
              "no submission notification is configured",
            ),
      );
    }
  }

  for (const [name, expected] of Object.entries(evidence.expectedHeaders)) {
    const actual = evidence.live.headers.get(name);
    checks.push(
      actual === expected
        ? result(`header ${name}`, "passed", JSON.stringify(actual))
        : result(
            `header ${name}`,
            "failed",
            `received ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
          ),
    );
  }

  return checks;
};

const resolveSiteId = (argv: string[]): string | null => {
  const positional = argv.indexOf("--site-id");
  if (positional !== -1) return argv[positional + 1] ?? null;
  if (process.env.NETLIFY_SITE_ID) return process.env.NETLIFY_SITE_ID;

  const linkPath = `${ROOT}.netlify/state.json`;
  if (!existsSync(linkPath)) return null;
  try {
    const linked = JSON.parse(readFileSync(linkPath, "utf8"));
    return typeof linked.siteId === "string" ? linked.siteId : null;
  } catch {
    return null;
  }
};

const resolveExpectedCommit = (argv: string[]): string | null => {
  const positional = argv.indexOf("--commit");
  if (positional !== -1) return argv[positional + 1] ?? null;
  try {
    return execFileSync("git", ["rev-parse", "origin/main"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
};

const api = async <T>(token: string, path: string): Promise<T> => {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`Netlify API ${response.status} for ${path}`);
  return (await response.json()) as T;
};

const report = (checks: Verification[]): number => {
  const overall = checks.some(({ status }) => status === "failed")
    ? "FAILED"
    : checks.some(({ status }) => status === "unverified")
      ? "UNVERIFIED"
      : "PASSED";
  console.log(`DEPLOYMENT VERIFICATION: ${overall}`);
  for (const check of checks)
    console.log(
      `- [${check.status.toUpperCase()}] ${check.name}: ${check.message}`,
    );
  return overall === "PASSED" ? 0 : overall === "FAILED" ? 1 : 2;
};

const verify = async (argv: string[]): Promise<number> => {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const siteId = resolveSiteId(argv);
  if (!token || !siteId) {
    return report([
      result(
        "authenticated site context",
        "unverified",
        "set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID, or link this repository to the intended site",
      ),
    ]);
  }

  try {
    const [providerSite, forms, hooks] = await Promise.all([
      api<Site>(token, `/sites/${encodeURIComponent(siteId)}`),
      api<ProviderForm[]>(token, `/sites/${encodeURIComponent(siteId)}/forms`),
      api<ProviderHook[]>(
        token,
        `/hooks?site_id=${encodeURIComponent(siteId)}`,
      ),
    ]);
    const publicUrl = providerSite.ssl_url ?? providerSite.url;
    if (!publicUrl)
      return report([
        result(
          "public URL",
          "failed",
          "Netlify did not return a public URL for the site",
        ),
      ]);
    const live = await fetch(publicUrl, { redirect: "error" });
    const contract = readNetlifyContract(
      readFileSync(`${ROOT}netlify.toml`, "utf8"),
    );
    return report(
      evaluateDeployment({
        site: providerSite,
        forms,
        hooks,
        live: { status: live.status, headers: live.headers },
        expectedCommit: resolveExpectedCommit(argv),
        expectedBuild: contract.build,
        expectedHeaders: contract.headers,
      }),
    );
  } catch (error) {
    return report([
      result(
        "provider access",
        "unverified",
        error instanceof Error ? error.message : "Netlify could not be queried",
      ),
    ]);
  }
};

if (isMain(import.meta.url))
  process.exitCode = await verify(process.argv.slice(2));
