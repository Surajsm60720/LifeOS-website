import { appendFileSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const PROJECT_YML_URL = "https://raw.githubusercontent.com/Surajsm60720/LifeOS/main/project.yml";
const README_URL = "https://raw.githubusercontent.com/Surajsm60720/LifeOS/main/README.md";
const CONTENT_PATH = new URL("../lib/content.ts", import.meta.url);

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export function parseMarketingVersion(projectYml) {
  const matches = [...projectYml.matchAll(/^[ \t]*MARKETING_VERSION:\s*"([^"]+)"\s*$/gm)].map((match) => match[1]);
  if (matches.length < 2) {
    throw new Error(`Expected MARKETING_VERSION on the app and Live Activity targets, found ${matches.length}`);
  }
  const unique = [...new Set(matches)];
  if (unique.length !== 1) {
    throw new Error(`MARKETING_VERSION values disagree: ${unique.join(", ")}`);
  }
  const version = unique[0];
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`MARKETING_VERSION is not a dotted version: ${version}`);
  }
  return version;
}

export function parseReadmeVersion(readme) {
  const matches = [...readme.matchAll(/^\*\*Version (\d+\.\d+\.\d+)\*\*/gm)].map((match) => match[1]);
  if (matches.length !== 1) {
    throw new Error(`Expected one README version line, found ${matches.length}`);
  }
  return matches[0];
}

export function readSiteVersion(content) {
  const matches = [...content.matchAll(/export const appVersion = "(\d+\.\d+\.\d+)";/g)].map((match) => match[1]);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one appVersion assignment, found ${matches.length}`);
  }
  return matches[0];
}

export function replaceAppVersion(content, version) {
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Refusing version: ${version}`);
  }
  const current = readSiteVersion(content);
  if (current === version) {
    return { content, changed: false, from: current, to: version };
  }
  const next = content.replace(
    /export const appVersion = "\d+\.\d+\.\d+";/,
    `export const appVersion = "${version}";`,
  );
  if (readSiteVersion(next) !== version) {
    throw new Error("Replacement did not land on the requested version");
  }
  return { content: next, changed: true, from: current, to: version };
}

export function extractWhatsNew(readme, version) {
  const pattern = new RegExp(String.raw`^## What['’]s new in v${version.replaceAll(".", String.raw`\.`)}\s*$`, "m");
  const match = pattern.exec(readme);
  if (!match) return "";
  const rest = readme.slice(match.index);
  const following = rest.slice(match[0].length).search(/\n## [^#]/);
  const section = following === -1 ? rest : rest.slice(0, match[0].length + following);
  return section.trim();
}

export function buildPullRequestBody({ version, whatsNew }) {
  const notes = whatsNew.trim()
    ? whatsNew.trim()
    : `_No "What's new in v${version}" section was found in the LifeOS README._`;
  return [
    `Updates the version shown on the site to **${version}**.`,
    "",
    "Feature cards are not changed by this job. If this release added something visitors should see, add or edit those cards yourself before merging. Feature copy on the site stays the hand-checked transcription; this pull request only moves the displayed version.",
    "",
    notes,
    "",
  ].join("\n");
}

export function planSync({ projectYml, readme, content }) {
  const marketing = parseMarketingVersion(projectYml);
  const readmeVersion = parseReadmeVersion(readme);
  if (marketing !== readmeVersion) {
    throw new Error(`project.yml MARKETING_VERSION ${marketing} does not match README version ${readmeVersion}`);
  }
  const replaced = replaceAppVersion(content, marketing);
  return {
    ...replaced,
    version: marketing,
    whatsNew: extractWhatsNew(readme, marketing),
  };
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function isExecutedDirectly() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(realpathSync(entry)).href;
}

async function main() {
  const [projectYml, readme] = await Promise.all([fetchText(PROJECT_YML_URL), fetchText(README_URL)]);
  const content = readFileSync(CONTENT_PATH, "utf8");
  const result = planSync({ projectYml, readme, content });
  if (result.changed) {
    writeFileSync(CONTENT_PATH, result.content);
    if (process.env.PR_BODY_PATH) {
      writeFileSync(process.env.PR_BODY_PATH, buildPullRequestBody(result));
    }
  }
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result.changed}\nversion=${result.version}\n`);
  }
  console.log(
    result.changed ? `Updated app version ${result.from} -> ${result.version}` : `Site already shows ${result.version}`,
  );
}

if (isExecutedDirectly()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
