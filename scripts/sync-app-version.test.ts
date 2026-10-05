import { describe, expect, it } from "vitest";
import { planSync } from "./sync-app-version.mjs";

const projectYml = `
targets:
  LifeOS:
    settings:
      base:
        MARKETING_VERSION: "1.0.3"
  LifeOSLiveActivityWidget:
    settings:
      base:
        MARKETING_VERSION: "1.0.3"
`;

const readme = `**Version 1.0.3** · Released September 25, 2026

## What's new in v1.0.3

### Pity counters

- Settings sheet for live pity tracking

## What's new in v1.0.2

### Map picker
`;

const siteAtPreviousVersion = `// transcribed from the v1.0.2-verified build
export const appVersion = "1.0.2";
export const heroEyebrow = \`Version \${appVersion}\`;
body: \`v\${appVersion} — no account, no server, nothing to sync.\`;
`;

describe("planSync", () => {
  it("replaces only the appVersion assignment", () => {
    const result = planSync({ projectYml, readme, content: siteAtPreviousVersion });

    expect(result.changed).toBe(true);
    expect(result.from).toBe("1.0.2");
    expect(result.to).toBe("1.0.3");
    expect(result.content).toContain('export const appVersion = "1.0.3";');
    expect(result.content).toContain("v1.0.2-verified");
    expect(result.content).toContain("heroEyebrow = `Version ${appVersion}`");
    expect(result.whatsNew).toContain("Pity counters");
    expect(result.whatsNew).not.toContain("Map picker");
  });

  it("leaves the file untouched when the site already matches", () => {
    const current = siteAtPreviousVersion.replace('export const appVersion = "1.0.2";', 'export const appVersion = "1.0.3";');
    const result = planSync({ projectYml, readme, content: current });

    expect(result.changed).toBe(false);
    expect(result.version).toBe("1.0.3");
    expect(result.content).toBe(current);
  });

  it("refuses to continue when project.yml and the README disagree", () => {
    const staleReadme = readme.replace("**Version 1.0.3**", "**Version 1.0.2**");

    expect(() => planSync({ projectYml, readme: staleReadme, content: siteAtPreviousVersion })).toThrow(
      /project.yml MARKETING_VERSION 1\.0\.3 does not match README version 1\.0\.2/,
    );
  });

  it("refuses when the two MARKETING_VERSION values disagree", () => {
    let seen = 0;
    const drifted = projectYml.replaceAll('MARKETING_VERSION: "1.0.3"', () => {
      seen += 1;
      return seen === 2 ? 'MARKETING_VERSION: "1.0.4"' : 'MARKETING_VERSION: "1.0.3"';
    });

    expect(() => planSync({ projectYml: drifted, readme, content: siteAtPreviousVersion })).toThrow(
      /MARKETING_VERSION values disagree/,
    );
  });

  it("refuses when the site does not have exactly one appVersion assignment", () => {
    expect(() => planSync({ projectYml, readme, content: 'export const heroEyebrow = "Version 1.0.2";' })).toThrow(
      /Expected exactly one appVersion assignment, found 0/,
    );
  });
});
