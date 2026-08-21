import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "styles/tokens.css"), "utf-8");

describe("design tokens", () => {
  it.each([
    ["--canvas", "#0F0F12"],
    ["--void", "#06060D"],
    ["--elevated", "#1C1C1F"],
    ["--soft", "#9EA1A6"],
    ["--accent", "#C7CCD6"],
    ["--irl", "#8C9EB3"],
    ["--game", "#9E9994"],
    ["--ent", "#9494A3"],
    ["--gi", "#94A3AD"],
    ["--hsr", "#9999AD"],
    ["--wuwa", "#8CA8A3"],
    ["--coral", "#F0876E"],
    ["--cream", "#FEF3E0"],
    ["--gold", "#F0D8A8"],
    ["--violet", "#A08CDC"],
    ["--mint", "#8CC8B4"],
    ["--ink", "#3E52B5"],
    ["--ink-light", "#9CACE8"],
  ])("defines %s as %s", (varName, hex) => {
    expect(css).toMatch(new RegExp(`${varName}\\s*:\\s*${hex}`, "i"));
  });
});
