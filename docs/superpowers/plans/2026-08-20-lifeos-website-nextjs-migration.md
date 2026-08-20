# LifeOS Website Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the LifeOS marketing site as a typed, componentized Next.js app that is behaviorally and visually identical to the v1 single-file `index.html` build, while fixing the sixteen documented rough edges (P1–P4) inline as part of the rebuild.

**Architecture:** Next.js 15 App Router, TypeScript, CSS Modules for component styles plus a small global stylesheet for design tokens. The 3D pad scene is React Three Fiber (`three` + `@react-three/fiber` + `@react-three/drei`). Pure logic (easing math, scroll-progress math, the cover/flip state machine, the 3D→screen projection) lives in framework-free `lib/` modules with real unit tests; presentational components are verified by type-check + build + manual dev-server check, since this is a single-page site with no case for visual-regression tooling. One Playwright suite covers the end-to-end interaction (including a `prefers-reduced-motion` run and an automated accessibility scan) as the project's only e2e layer.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), CSS Modules, `three` + `@react-three/fiber` + `@react-three/drei`, Vitest + Testing Library (unit), Playwright + `@axe-core/playwright` (e2e/a11y), ESLint (Next's default config), deployed to Vercel.

**Spec:** `docs/superpowers/specs/2026-08-20-lifeos-website-nextjs-migration-design.md` — this plan implements that spec section-by-section; read both together. Source copy is transcribed verbatim from `~/Downloads/index.html` (the v1.0.2-verified build) — do not paraphrase or invent copy in any task below.

## Global Constraints

- No feature claim beyond what's transcribed from the v1 build in this plan (spec §0, §7). Do not add, reword, or expand copy without re-checking the LifeOS README v1.0.2 status table.
- No App Store / TestFlight / download CTA anywhere on the site (spec §0).
- Dark theme only — no `prefers-color-scheme: light` branch (spec §0, Global Constraint).
- `prefers-reduced-motion: reduce` must collapse every transition/animation to ~0ms and the flip interaction must still fully function with motion off (spec §0).
- Design tokens (colors) are copied verbatim — exact hex values from spec §2, never approximated.
- Warm accent colors (`--coral`, `--cream`, `--gold`, `--violet`, `--mint`) are signature-only: pad rim light, wordmark "OS", opened page, spiral rings, feature-card dots. Never backgrounds, buttons, or large surfaces (spec §2.3, §0).
- Caveat (handwriting font) is used in exactly one place (`.scrawl` on the gate page). If a task is ever tempted to add a second use, remove the first instead.
- Single route, no CMS, no API routes, no database (spec §10 non-goals).
- No screenshots/recordings added in this pass — `MediaSlot` ships as an empty, styled placeholder (spec §8, §10).

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc.json` (or `eslint.config.mjs`, whatever `create-next-app` emits), `app/layout.tsx` (placeholder), `app/page.tsx` (placeholder), `app/globals.css` (placeholder)
- Modify: none (empty repo)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a running Next.js dev server on `localhost:3000`, an `npm run build` that succeeds — every later task builds on this scaffold

- [ ] **Step 1: Scaffold with create-next-app**

Run from the repo root (`/Users/surajmenon/codes/LifeOS-website`, already `git init`'d and containing only `docs/`):

```bash
npx create-next-app@latest . --typescript --eslint --app --no-tailwind --no-src-dir --import-alias "@/*" --use-npm
```

Answer prompts if any appear (should be none given the flags). This scaffolds `app/`, `public/`, `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc.json` (or flat config), `.gitignore`.

- [ ] **Step 2: Verify the dev server boots**

Run: `npm run dev` (in background or a separate terminal), then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: `200`
Stop the dev server after confirming.

- [ ] **Step 3: Verify the production build succeeds**

Run: `npm run build`
Expected: exits 0, prints a route summary including `/`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project"
```

---

## Task 2: Testing tooling (Vitest + Testing Library, Playwright + axe)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `lib/sanity.test.ts` (throwaway, deleted at end of this task), `e2e/sanity.spec.ts` (throwaway, deleted at end of this task)
- Modify: `package.json` (scripts + devDependencies)

**Interfaces:**
- Consumes: Task 1's scaffold
- Produces: `npm test` (Vitest unit tests), `npm run e2e` (Playwright) — every later task's test steps assume these commands exist and work

- [ ] **Step 1: Install unit-test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom @testing-library/dom
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Add unit-test scripts to package.json**

Add to `package.json`'s `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a throwaway sanity test and confirm it fails then passes**

Create `lib/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("is wrong on purpose", () => {
    expect(1 + 1).toBe(3);
  });
});
```

Run: `npm test`
Expected: FAIL (`expected 2 to be 3`)

Change the assertion to `expect(1 + 1).toBe(2)`.

Run: `npm test`
Expected: PASS

Delete `lib/sanity.test.ts`.

- [ ] **Step 5: Install Playwright + axe**

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium
```

- [ ] **Step 6: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 7: Add e2e script to package.json**

Add to `"scripts"`:

```json
"e2e": "playwright test"
```

- [ ] **Step 8: Write a throwaway e2e sanity test and confirm it fails then passes**

Create `e2e/sanity.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("sanity", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/nonexistent-title-xyz/);
});
```

Run: `npm run e2e`
Expected: FAIL (title mismatch)

Change the assertion to match Next's default scaffold title (whatever `create-next-app` set, e.g. `/Create Next App/`).

Run: `npm run e2e`
Expected: PASS

Delete `e2e/sanity.spec.ts`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: add Vitest and Playwright test tooling"
```

---

## Task 3: Scroll math and shared constants

**Files:**
- Create: `lib/constants.ts`, `lib/scroll-math.ts`, `lib/scroll-math.test.ts`

**Interfaces:**
- Consumes: nothing beyond Task 1/2 tooling
- Produces: `RUNWAY_MULTIPLIER_DESKTOP`, `RUNWAY_MULTIPLIER_NARROW`, `NARROW_BREAKPOINT_PX`, `SCROLL_DAMPING`, `COVER_OPEN_THRESHOLD`, `COVER_CLOSE_THRESHOLD`, `PAGE_FLIP_STAGGER_MS`, `COVER_OPEN_GATE_DELAY_MS`, `PAGE_COUNT`, `MOTE_COUNT_HIGH`, `MOTE_COUNT_LOW`, `DPR_CAP_HIGH`, `DPR_CAP_LOW`, `LOW_END_HARDWARE_CONCURRENCY_THRESHOLD` (all from `lib/constants.ts`); `ease(t: number): number`, `lerp(current: number, target: number, factor: number): number`, `isNarrowViewport(viewportWidthPx: number): boolean`, `computeRunwayHeightPx(viewportHeightPx: number, narrow: boolean): number`, `computeScrollProgress(scrollY: number, runwayHeightPx: number): number` (all from `lib/scroll-math.ts`) — consumed by Tasks 10, 11, 15, 17

- [ ] **Step 1: Write constants**

Create `lib/constants.ts`:

```ts
// Layout/animation constants ported 1:1 from the v1 index.html build.
// Single source of truth — nothing here may be duplicated as a literal
// elsewhere (v1 rough edge P2 #4: these were previously duplicated
// between inline <style> and inline <script> and could silently desync).

export const RUNWAY_MULTIPLIER_DESKTOP = 1.9;
export const RUNWAY_MULTIPLIER_NARROW = 1.5;
export const NARROW_BREAKPOINT_PX = 880;

export const SCROLL_DAMPING = 0.075;

export const COVER_OPEN_THRESHOLD = 0.86;
export const COVER_CLOSE_THRESHOLD = 0.78;

export const PAGE_COUNT = 4;
export const PAGE_FLIP_STAGGER_MS = 135;
export const COVER_OPEN_GATE_DELAY_MS = 420;

export const MOTE_COUNT_HIGH = 140;
export const MOTE_COUNT_LOW = 60;
export const DPR_CAP_HIGH = 2;
export const DPR_CAP_LOW = 1;
export const LOW_END_HARDWARE_CONCURRENCY_THRESHOLD = 4;
```

- [ ] **Step 2: Write the failing tests for the pure math functions**

Create `lib/scroll-math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  ease,
  lerp,
  isNarrowViewport,
  computeRunwayHeightPx,
  computeScrollProgress,
} from "./scroll-math";

describe("ease", () => {
  it("returns 0 at t=0 and 1 at t=1", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });
  it("is close to 0.5 at the midpoint", () => {
    expect(ease(0.5)).toBeCloseTo(0.5, 5);
  });
});

describe("lerp", () => {
  it("moves current toward target by factor", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });
});

describe("isNarrowViewport", () => {
  it("is true below the breakpoint and false at/above it", () => {
    expect(isNarrowViewport(879)).toBe(true);
    expect(isNarrowViewport(880)).toBe(false);
    expect(isNarrowViewport(1200)).toBe(false);
  });
});

describe("computeRunwayHeightPx", () => {
  it("uses the desktop multiplier when not narrow", () => {
    expect(computeRunwayHeightPx(1000, false)).toBeCloseTo(1900, 5);
  });
  it("uses the narrow multiplier when narrow", () => {
    expect(computeRunwayHeightPx(1000, true)).toBeCloseTo(1500, 5);
  });
});

describe("computeScrollProgress", () => {
  it("clamps to [0,1] and scales linearly with scrollY / runway height", () => {
    expect(computeScrollProgress(0, 1900)).toBe(0);
    expect(computeScrollProgress(950, 1900)).toBeCloseTo(0.5, 5);
    expect(computeScrollProgress(1900, 1900)).toBe(1);
    expect(computeScrollProgress(3000, 1900)).toBe(1);
    expect(computeScrollProgress(-100, 1900)).toBe(0);
  });
  it("returns 0 when runway height is 0 (avoids divide-by-zero)", () => {
    expect(computeScrollProgress(500, 0)).toBe(0);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- lib/scroll-math.test.ts`
Expected: FAIL with "Cannot find module './scroll-math'" (file doesn't exist yet)

- [ ] **Step 4: Implement the math functions**

Create `lib/scroll-math.ts`:

```ts
import {
  RUNWAY_MULTIPLIER_DESKTOP,
  RUNWAY_MULTIPLIER_NARROW,
  NARROW_BREAKPOINT_PX,
} from "./constants";

/** Cubic in-out easing, ported verbatim from the v1 build. */
export function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Exponential-damping step toward a target value. */
export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function isNarrowViewport(viewportWidthPx: number): boolean {
  return viewportWidthPx < NARROW_BREAKPOINT_PX;
}

export function computeRunwayHeightPx(viewportHeightPx: number, narrow: boolean): number {
  return viewportHeightPx * (narrow ? RUNWAY_MULTIPLIER_NARROW : RUNWAY_MULTIPLIER_DESKTOP);
}

export function computeScrollProgress(scrollY: number, runwayHeightPx: number): number {
  if (runwayHeightPx <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / runwayHeightPx));
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- lib/scroll-math.test.ts`
Expected: PASS, all assertions green

- [ ] **Step 6: Commit**

```bash
git add lib/constants.ts lib/scroll-math.ts lib/scroll-math.test.ts
git commit -m "feat: add shared layout constants and scroll math"
```

---

## Task 4: Typed content (feature copy)

**Files:**
- Create: `lib/content.ts`, `lib/content.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `heroChips`, `heroEyebrow`, `heroLede`, `scrollCueText`, `gateScrawl`, `gateHeading`, `gateBody`, `featureSections: FeatureSection[]`, `specRows: SpecRow[]`, `specSectionEyebrow`, `specSectionHeading`, `deliberatelyAbsent: string[]`, `deliberatelyAbsentEyebrow`, `deliberatelyAbsentHeading`, `deliberatelyAbsentLede`, `footerCopy` (types `FeatureCard`, `FeatureSection`, `SpecRow`, `SpecSegment`, `ChipSegment`) — consumed by Tasks 13, 14, 18, 19

- [ ] **Step 1: Write the failing content-integrity tests**

Create `lib/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  heroChips,
  featureSections,
  specRows,
  deliberatelyAbsent,
} from "./content";

describe("hero chips", () => {
  it("has exactly 5 chips, matching the v1.0.2 hero", () => {
    expect(heroChips).toHaveLength(5);
  });
  it("has no empty chip text", () => {
    for (const chip of heroChips) {
      for (const segment of chip) {
        expect(segment.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("feature sections", () => {
  it("has 5 card-grid sections (features, time, notifications, places, data)", () => {
    expect(featureSections).toHaveLength(5);
  });
  it("has no empty title/body/tag on any card", () => {
    for (const section of featureSections) {
      expect(section.eyebrow.trim().length).toBeGreaterThan(0);
      expect(section.heading.trim().length).toBeGreaterThan(0);
      for (const card of section.cards) {
        expect(card.tag.trim().length).toBeGreaterThan(0);
        expect(card.title.trim().length).toBeGreaterThan(0);
        expect(card.body.trim().length).toBeGreaterThan(0);
        expect(card.dotVar.startsWith("--")).toBe(true);
      }
    }
  });
  it("the first section has id 'features' for the post-flip scroll target", () => {
    expect(featureSections[0].id).toBe("features");
  });
});

describe("spec rows", () => {
  it("has exactly 7 rows, matching the v1.0.2 'under the hood' table", () => {
    expect(specRows).toHaveLength(7);
  });
});

describe("deliberately absent", () => {
  it("has exactly 8 items, matching the v1.0.2 list", () => {
    expect(deliberatelyAbsent).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/content.test.ts`
Expected: FAIL with "Cannot find module './content'"

- [ ] **Step 3: Implement the typed content module**

Create `lib/content.ts`:

```ts
// All copy below is transcribed verbatim from the v1.0.2-verified
// index.html build. Do not add, reword, or expand any entry without
// re-checking it against the LifeOS README v1.0.2 status table
// (see the design spec, §0).

export type ChipSegment = { text: string; bold?: boolean };
export type FeatureCard = { tag: string; dotVar: string; title: string; body: string };
export type FeatureSection = {
  id?: string;
  eyebrow: string;
  heading: string;
  lede?: string;
  columns: 2 | 3;
  cards: FeatureCard[];
};
export type SpecSegment = { text: string; code?: boolean };
export type SpecRow = { term: string; definition: SpecSegment[] };

export const heroEyebrow = "Version 1.0.2 · 17 Aug 2026";
export const heroLede =
  "A calendar that holds your real life, your game cadence, and everything you're part-way through reading — in one entry model, on one device, with no account behind it.";
export const scrollCueText = "Scroll to open";

export const heroChips: ChipSegment[][] = [
  [{ text: "iOS 18+", bold: true }],
  [{ text: "SwiftUI · SwiftData" }],
  [{ text: "Local-only" }],
  [{ text: "Dark theme" }],
  [{ text: "75", bold: true }, { text: " unit tests" }],
];

export const gateScrawl = "planned on paper first —";
export const gateHeading = "Want to see what's actually inside?";
export const gateBody =
  "Every feature listed past this page is built and shipping in 1.0.2. Nothing aspirational.";
export const gateFlipLabel = "Turn the page →";
export const gateSourceLabel = "View the source";
export const repoUrl = "https://github.com/Surajsm60720/LifeOS";

export const featureSections: FeatureSection[] = [
  {
    id: "features",
    eyebrow: "One model, three lives",
    heading: "Everything is an entry.",
    lede:
      "A dinner, a banner window and chapter 402 are the same object with different capabilities switched on — so the calendar, the reminders and the recap never disagree with each other.",
    columns: 3,
    cards: [
      {
        tag: "IRL",
        dotVar: "--irl",
        title: "Plans that behave like plans",
        body: "All-day or timed, minutes through 365 days, with an end date. Multi-stop locations, and an expense ledger when the evening costs something.",
      },
      {
        tag: "Games",
        dotVar: "--game",
        title: "Cadence you can actually see",
        body: "Dailies, weeklies, banners, patches, livestreams, in-game events — typed per title for Genshin, Star Rail and Wuthering Waves. Other games get a session log instead.",
      },
      {
        tag: "Entertainment",
        dotVar: "--ent",
        title: "Progress without nagging",
        body: "Episodes, chapters and pages with optional per-session targets. Deliberately notification-free — it shows up on the calendar, it never chases you.",
      },
    ],
  },
  {
    eyebrow: "Time, four ways",
    heading: "Day, week, month, year.",
    columns: 2,
    cards: [
      {
        tag: "Calendar",
        dotVar: "--coral",
        title: "Pick your default",
        body: "Four views, a configurable landing view, and swipe-to-complete or delete straight from Day, Week and Month rows.",
      },
      {
        tag: "Heat",
        dotVar: "--coral",
        title: "A year at a glance",
        body: "Month heat grids and year-long mini-month contribution maps — count-based, so a dense week reads as dense.",
      },
      {
        tag: "Ongoing",
        dotVar: "--mint",
        title: "Windows, not just start dates",
        body: "A dedicated tab for anything spanning 24 hours or more: Active Now, Starting Soon, and collapsible Recently Ended, with progress and days remaining.",
      },
      {
        tag: "Cycles",
        dotVar: "--mint",
        title: "This occurrence to the next",
        body: "Weekly and monthly cadence shows as a live cycle — 16 Aug → 16 Sep, not a calendar-month approximation. Dailies stay out, so the tab never floods.",
      },
    ],
  },
  {
    eyebrow: "Reminders",
    heading: "Notifications that know their limits.",
    lede:
      "iOS allows 64 pending local notifications per app. LifeOS treats that as a budget you can see, not a wall you hit silently.",
    columns: 3,
    cards: [
      {
        tag: "Rules",
        dotVar: "--violet",
        title: "Built like Shortcuts",
        body: "Fixed time, relative to start, relative to end, a specific date, or only if it's still not done — with editable message text.",
      },
      {
        tag: "Budget",
        dotVar: "--violet",
        title: "Scheduled, remaining, firing today",
        body: "A live count of where you stand against the cap, plus presets for end-of-day check-ins, morning dailies and last-day reminders.",
      },
      {
        tag: "Live Activity",
        dotVar: "--violet",
        title: "Today, in the Dynamic Island",
        body: "A count badge in the Island and up to three events on the Lock Screen, re-synced whenever you open the app.",
      },
    ],
  },
  {
    eyebrow: "Places & money",
    heading: "Where you went, what it cost.",
    columns: 2,
    cards: [
      {
        tag: "Map-first",
        dotVar: "--gi",
        title: "Search, drop a pin, or use where you are",
        body: "Reverse-geocoding fills the name after a pin drop, and rows show a live MapKit thumbnail. Only a name and coordinates are ever stored.",
      },
      {
        tag: "Hangout ledger",
        dotVar: "--gi",
        title: "Split the evening, not the app",
        body: "Line items with a running total, an equal split across freestyle names, who-owes-you balances, and a settlement summary you can share or copy.",
      },
    ],
  },
  {
    eyebrow: "Your data",
    heading: "It stays on the phone.",
    columns: 3,
    cards: [
      {
        tag: "Backup",
        dotVar: "--gold",
        title: "JSON, replace or merge",
        body: "Full-library export and import as a file you own. Older backups stay importable; only newer-version files are refused, with a reason.",
      },
      {
        tag: "Recap",
        dotVar: "--gold",
        title: "Markdown built for summarising",
        body: "A date-ranged export with pre-computed stats, written to be pasted into an LLM by hand — the app never calls one itself.",
      },
      {
        tag: "App Lock",
        dotVar: "--gold",
        title: "Face ID on return",
        body: "Optional biometric or passcode lock that covers sheets too, plus a recovery mode that degrades gracefully instead of crash-looping if the store fails to open.",
      },
    ],
  },
];

export const specSectionEyebrow = "Under the hood";
export const specSectionHeading = "Native, and only native.";

export const specRows: SpecRow[] = [
  { term: "Language / UI", definition: [{ text: "Swift · SwiftUI, dark theme only" }] },
  { term: "Persistence", definition: [{ text: "SwiftData, on-device" }] },
  {
    term: "Recurrence",
    definition: [
      { text: "Custom " },
      { text: "Calendar", code: true },
      { text: " / " },
      { text: "DateComponents", code: true },
      { text: " engine — deliberately not EventKit, so the app never asks for your system calendar" },
    ],
  },
  { term: "Notifications", definition: [{ text: "UserNotifications, 64-request budget aware" }] },
  { term: "Live Activities", definition: [{ text: "ActivityKit · WidgetKit extension" }] },
  { term: "Places", definition: [{ text: "MapKit search and map picker" }] },
  {
    term: "Project",
    definition: [
      { text: "XcodeGen from " },
      { text: "project.yml", code: true },
      { text: " · 75 unit tests" },
    ],
  },
];

export const deliberatelyAbsentEyebrow = "Deliberately absent";
export const deliberatelyAbsentHeading = "Things it will not do.";
export const deliberatelyAbsentLede =
  "Scope kept small on purpose. These aren't roadmap items being hinted at — they're decisions.";
export const deliberatelyAbsent: string[] = [
  "CloudKit sync",
  "Home-screen widgets",
  "Charts",
  "Accounts or login",
  "Third-party trackers",
  "Unofficial game APIs",
  "Light theme",
  "In-app LLM calls",
];

export const footerEyebrow = "Build it yourself";
export const footerBody =
  "A personal project, not an App Store release. Clone the repo, open it in Xcode with your own signing team, and run it.";
export const footerSmallLines = ["LifeOS v1.0.2", "Swift · SwiftUI · SwiftData", "Local-first by design"];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts lib/content.test.ts
git commit -m "feat: add typed v1.0.2 site copy"
```

---

## Task 5: Design tokens

**Files:**
- Create: `styles/tokens.css`, `styles/tokens.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: the `:root` CSS custom properties (`--canvas`, `--void`, `--elevated`, `--stroke`, `--stroke-2`, `--soft`, `--accent`, `--irl`, `--game`, `--ent`, `--gi`, `--hsr`, `--wuwa`, `--coral`, `--cream`, `--gold`, `--violet`, `--mint`, `--ink`, `--ui`, `--mono`, `--hand`, `--gut`, `--max`) — imported by Task 6's `app/globals.css` and referenced by every component's CSS Module from Task 13 onward

- [ ] **Step 1: Write the failing token-integrity test**

Create `styles/tokens.test.ts`:

```ts
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
  ])("defines %s as %s", (varName, hex) => {
    expect(css).toMatch(new RegExp(`${varName}\\s*:\\s*${hex}`, "i"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- styles/tokens.test.ts`
Expected: FAIL — `styles/tokens.css` doesn't exist (ENOENT)

- [ ] **Step 3: Write the tokens file**

Create `styles/tokens.css`:

```css
:root {
  /* Pulled verbatim from LifeOS/Utilities/LifeOSTheme.swift */
  --canvas: #0F0F12;
  --void: #06060D;
  --elevated: #1C1C1F;
  --stroke: rgba(255, 255, 255, .07);
  --stroke-2: rgba(255, 255, 255, .12);
  --soft: #9EA1A6;
  --accent: #C7CCD6;
  --irl: #8C9EB3;
  --game: #9E9994;
  --ent: #9494A3;

  /* GameIdentity.swift */
  --gi: #94A3AD;
  --hsr: #9999AD;
  --wuwa: #8CA8A3;

  /* sampled from AppIcon-Dark.png — signature accents only, see spec §2.3 */
  --coral: #F0876E;
  --cream: #FEF3E0;
  --gold: #F0D8A8;
  --violet: #A08CDC;
  --mint: #8CC8B4;
  --ink: #3E52B5;

  --ui: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  --mono: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  --hand: var(--font-hand), cursive;

  --gut: clamp(20px, 5vw, 64px);
  --max: 1180px;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- styles/tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add styles/tokens.css styles/tokens.test.ts
git commit -m "feat: add design tokens verbatim from LifeOSTheme.swift"
```

---

## Task 6: Root layout — fonts, metadata, global styles

**Files:**
- Create: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `styles/tokens.css` (Task 5)
- Produces: `<html>`/`<body>` with `--font-mono`/`--font-hand` CSS variables applied, page `<title>`/meta description/theme-color set — every component task from here on assumes these are in place

- [ ] **Step 1: Write globals.css**

Create `app/globals.css`:

```css
@import "../styles/tokens.css";

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  background: var(--canvas);
  color: var(--accent);
  font-family: var(--ui);
  font-synthesis-weight: none;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  line-height: 1.55;
}
::selection { background: rgba(240, 135, 110, .28); color: #fff; }
:focus-visible { outline: 2px solid var(--coral); outline-offset: 3px; border-radius: 6px; }

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(120vw 80vh at 78% -10%, rgba(240, 135, 110, .10), transparent 62%),
    radial-gradient(90vw 70vh at 8% 12%, rgba(140, 200, 180, .055), transparent 60%),
    radial-gradient(100vw 90vh at 50% 108%, rgba(160, 140, 220, .07), transparent 65%);
}

.wrap { max-width: var(--max); margin-inline: auto; padding-inline: var(--gut); }

h1, h2, h3 { letter-spacing: -.03em; line-height: 1.04; color: #fff; font-weight: 600; }
h2 { font-size: clamp(1.85rem, 4.4vw, 3rem); letter-spacing: -.035em; }
h3 { font-size: 1.06rem; letter-spacing: -.015em; font-weight: 590; }
p { color: var(--soft); }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
}
```

- [ ] **Step 2: Write the root layout with fonts and metadata**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeOS — a calendar for your whole life, on your device",
  description:
    "LifeOS is a local-first iOS calendar for day-to-day plans, gacha-game cadence, and reading progress. No accounts, no sync, no trackers.",
  themeColor: "#0F0F12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the build succeeds and metadata renders**

Run: `npm run build && npm run start &`
Run: `curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>'`
Expected: `<title>LifeOS — a calendar for your whole life, on your device</title>`
Stop the server (`kill %1` or equivalent).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: wire fonts, metadata, and global styles into root layout"
```

---

## Task 7: Icon assets (favicon + OG image)

**Files:**
- Create: `public/icon-source.png`, `app/icon.png`, `app/opengraph-image.png`

**Interfaces:**
- Consumes: the base64 JPEG embedded in `~/Downloads/index.html` (the `#fallback` `<img>` src, and the `ICON` variable used by `TextureLoader` in the original script)
- Produces: `public/icon-source.png` — the real icon asset consumed by Task 16's `Cover.tsx` texture loader

- [ ] **Step 1: Extract the embedded icon to a real file**

The v1 HTML embeds the icon twice as identical base64 JPEG data: once as `#fallback`'s `<img src="data:image/jpeg;base64,...">`, once as the `ICON` JS variable. Extract it with a one-off Node script (deleted after use):

```bash
node -e '
const fs = require("fs");
const html = fs.readFileSync(process.env.HOME + "/Downloads/index.html", "utf-8");
const match = html.match(/id="fallback" src="data:image\/jpeg;base64,([^"]+)"/);
if (!match) { console.error("icon data URI not found"); process.exit(1); }
fs.writeFileSync("public/icon-source.jpg", Buffer.from(match[1], "base64"));
console.log("wrote public/icon-source.jpg,", Buffer.from(match[1], "base64").length, "bytes");
'
```

- [ ] **Step 2: Convert to PNG for crisper flat-color reproduction**

The spec (P4 #13) calls out the q88 JPEG's artifacting on the icon's flat cream areas as a defect to fix now that the single-file size constraint no longer applies. Convert to PNG using `sips` (macOS built-in):

```bash
sips -s format png public/icon-source.jpg --out public/icon-source.png
rm public/icon-source.jpg
```

- [ ] **Step 3: Verify the asset looks correct**

Run: `file public/icon-source.png`
Expected: reports a PNG image, roughly 512×512 (the size the v1 script loaded at)

- [ ] **Step 4: Add the favicon and OG image using Next's static file conventions**

Next.js auto-detects `app/icon.png` as the favicon and `app/opengraph-image.png` as the OG/Twitter card image with zero extra code — copy the source icon into both:

```bash
cp public/icon-source.png app/icon.png
cp public/icon-source.png app/opengraph-image.png
```

(These are square 512×512 crops — not the standard 1200×630 OG aspect ratio. That's an acceptable default per the design spec §6/§8: it gets link-sharing previews working now, and can be swapped for dedicated OG art in a later pass without touching any code, since it's a static file.)

- [ ] **Step 5: Verify Next picks them up**

Run: `npm run build && npm run start &`
Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/icon.png` — expect `200`
Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/opengraph-image.png` — expect `200`
Run: `curl -s http://localhost:3000 | grep -o '<link rel="icon"[^>]*>'` — expect a tag referencing `/icon.png` (Next appends a content hash)
Stop the server.

- [ ] **Step 6: Commit**

```bash
git add public/icon-source.png app/icon.png app/opengraph-image.png
git commit -m "feat: add real icon asset, favicon, and OG image"
```

---

## Task 8: Reveal state (RevealProvider)

**Files:**
- Create: `components/RevealProvider.tsx`, `components/RevealProvider.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<RevealProvider>` (client component, wraps `app/page.tsx`'s content) and `useReveal(): { revealed: boolean; reveal: () => void }` — consumed by Task 13 (Hero's skip-intro link), Task 17 (ExperienceStage's flip handler), Task 18 (MainReveal)

- [ ] **Step 1: Write the failing test**

Create `components/RevealProvider.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RevealProvider, useReveal } from "./RevealProvider";

function Probe() {
  const { revealed, reveal } = useReveal();
  return (
    <>
      <span data-testid="state">{revealed ? "revealed" : "hidden"}</span>
      <button onClick={reveal}>reveal</button>
    </>
  );
}

describe("RevealProvider", () => {
  it("starts hidden and flips to revealed exactly once", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("hidden");
    fireEvent.click(screen.getByText("reveal"));
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
    fireEvent.click(screen.getByText("reveal"));
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
  });

  it("throws if useReveal is used outside the provider", () => {
    function Bare() {
      useReveal();
      return null;
    }
    expect(() => render(<Bare />)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- components/RevealProvider.test.tsx`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement RevealProvider**

Create `components/RevealProvider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useState } from "react";

type RevealContextValue = { revealed: boolean; reveal: () => void };

const RevealContext = createContext<RevealContextValue | null>(null);

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const reveal = useCallback(() => setRevealed(true), []);
  return (
    <RevealContext.Provider value={{ revealed, reveal }}>
      {children}
    </RevealContext.Provider>
  );
}

export function useReveal(): RevealContextValue {
  const ctx = useContext(RevealContext);
  if (!ctx) throw new Error("useReveal must be used within a RevealProvider");
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- components/RevealProvider.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/RevealProvider.tsx components/RevealProvider.test.tsx
git commit -m "feat: add RevealProvider for post-flip content reveal state"
```

---

## Task 9: Reduced-motion hook

**Files:**
- Create: `hooks/useReducedMotion.ts`, `hooks/useReducedMotion.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `useReducedMotion(): boolean` — consumed by Task 11 (`useScrollProgress`), Task 17 (`ExperienceStage`/`Scene`/`Pad` animation timing)

- [ ] **Step 1: Write the failing test**

Create `hooks/useReducedMotion.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

function mockMatchMedia(initialMatches: boolean) {
  let changeListener: ((e: MediaQueryListEvent) => void) | null = null;
  const mql = {
    matches: initialMatches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      changeListener = cb;
    },
    removeEventListener: () => {
      changeListener = null;
    },
  };
  vi.stubGlobal("matchMedia", () => mql);
  return {
    triggerChange: (matches: boolean) => {
      mql.matches = matches;
      changeListener?.({ matches } as MediaQueryListEvent);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useReducedMotion", () => {
  it("returns the initial matchMedia state", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when the media query change fires", () => {
    const { triggerChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => triggerChange(true));
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- hooks/useReducedMotion.test.ts`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement the hook**

Create `hooks/useReducedMotion.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- hooks/useReducedMotion.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useReducedMotion.ts hooks/useReducedMotion.test.ts
git commit -m "feat: add useReducedMotion hook"
```

---

## Task 10: Cover/flip state machine

**Files:**
- Create: `lib/pad-state.ts`, `lib/pad-state.test.ts`

**Interfaces:**
- Consumes: `COVER_OPEN_THRESHOLD`, `COVER_CLOSE_THRESHOLD`, `PAGE_COUNT` (Task 3)
- Produces: `PadState`, `PadAction`, `initialPadState: PadState`, `padStateReducer(state: PadState, action: PadAction): PadState` — consumed by Task 17 (`ExperienceStage`)

- [ ] **Step 1: Write the failing tests**

Create `lib/pad-state.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { initialPadState, padStateReducer } from "./pad-state";

describe("padStateReducer", () => {
  it("starts closed and unflipped with all page targets at 0", () => {
    expect(initialPadState.coverOpen).toBe(false);
    expect(initialPadState.flipped).toBe(false);
    expect(initialPadState.pageTargets).toEqual([0, 0, 0, 0]);
  });

  it("opens the cover once scroll progress crosses the open threshold", () => {
    const next = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    expect(next.coverOpen).toBe(true);
  });

  it("does not open below the open threshold", () => {
    const next = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(next.coverOpen).toBe(false);
  });

  it("closes once scroll progress drops to/below the close threshold", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const closed = padStateReducer(open, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(closed.coverOpen).toBe(false);
  });

  it("holds open state inside the hysteresis band (between close and open thresholds)", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const stillOpen = padStateReducer(open, { type: "SCROLL_PROGRESS", progress: 0.8 });
    expect(stillOpen.coverOpen).toBe(true);
  });

  it("FLIP sets flipped true and leaves coverOpen as-is", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    expect(flipped.flipped).toBe(true);
    expect(flipped.coverOpen).toBe(true);
  });

  it("once flipped, further SCROLL_PROGRESS actions never reopen or close the gate", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    const afterScrollUp = padStateReducer(flipped, { type: "SCROLL_PROGRESS", progress: 0.1 });
    expect(afterScrollUp).toEqual(flipped);
  });

  it("SET_PAGE_TARGET updates only the targeted page index", () => {
    const next = padStateReducer(initialPadState, { type: "SET_PAGE_TARGET", index: 2, value: -3 });
    expect(next.pageTargets).toEqual([0, 0, -3, 0]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/pad-state.test.ts`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement the reducer**

Create `lib/pad-state.ts`:

```ts
import { COVER_OPEN_THRESHOLD, COVER_CLOSE_THRESHOLD, PAGE_COUNT } from "./constants";

export type PadState = {
  coverOpen: boolean;
  flipped: boolean;
  pageTargets: number[];
};

export type PadAction =
  | { type: "SCROLL_PROGRESS"; progress: number }
  | { type: "FLIP" }
  | { type: "SET_PAGE_TARGET"; index: number; value: number };

export const initialPadState: PadState = {
  coverOpen: false,
  flipped: false,
  pageTargets: new Array(PAGE_COUNT).fill(0),
};

export function padStateReducer(state: PadState, action: PadAction): PadState {
  switch (action.type) {
    case "SCROLL_PROGRESS": {
      // Once the pages have been flipped, scrolling back up must never
      // re-show the gate or reset the cover (v1 rough edge P2 #7 — this
      // migration resolves the "undefined-feeling" state explicitly by
      // freezing pad state after the flip).
      if (state.flipped) return state;

      if (!state.coverOpen && action.progress >= COVER_OPEN_THRESHOLD) {
        return { ...state, coverOpen: true };
      }
      if (state.coverOpen && action.progress <= COVER_CLOSE_THRESHOLD) {
        return { ...state, coverOpen: false };
      }
      return state;
    }
    case "FLIP": {
      if (state.flipped) return state;
      return { ...state, flipped: true };
    }
    case "SET_PAGE_TARGET": {
      const pageTargets = state.pageTargets.slice();
      pageTargets[action.index] = action.value;
      return { ...state, pageTargets };
    }
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/pad-state.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/pad-state.ts lib/pad-state.test.ts
git commit -m "feat: add cover/flip state machine with hysteresis"
```

---

## Task 11: Scroll progress hook

**Files:**
- Create: `hooks/useScrollProgress.ts`, `hooks/useScrollProgress.test.ts`

**Interfaces:**
- Consumes: `ease`, `lerp`, `isNarrowViewport`, `computeRunwayHeightPx`, `computeScrollProgress` (Task 3), `SCROLL_DAMPING` (Task 3)
- Produces: `useScrollProgress(): { progress: number; easedProgress: number; narrow: boolean }` — consumed by Task 17 (`ExperienceStage`)

- [ ] **Step 1: Write the failing test**

Create `hooks/useScrollProgress.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollProgress } from "./useScrollProgress";

let rafCallbacks: FrameRequestCallback[] = [];

function flushFrame(time = 16) {
  const callbacks = rafCallbacks;
  rafCallbacks = [];
  callbacks.forEach((cb) => cb(time));
}

beforeEach(() => {
  rafCallbacks = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 1000, writable: true });
  Object.defineProperty(window, "scrollY", { value: 0, writable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useScrollProgress", () => {
  it("starts at progress 0", () => {
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current.progress).toBe(0);
  });

  it("damps toward the target progress as scrollY changes and frames advance", () => {
    const { result } = renderHook(() => useScrollProgress());
    // desktop runway height = 1000 * 1.9 = 1900; scrolling to 1900 => target 1
    Object.defineProperty(window, "scrollY", { value: 1900, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      for (let i = 0; i < 200; i++) flushFrame();
    });
    expect(result.current.progress).toBeGreaterThan(0.99);
  });

  it("reports narrow correctly from viewport width", () => {
    Object.defineProperty(window, "innerWidth", { value: 600, writable: true });
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current.narrow).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- hooks/useScrollProgress.test.ts`
Expected: FAIL — module doesn't exist

- [ ] **Step 3: Implement the hook**

Create `hooks/useScrollProgress.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ease,
  lerp,
  isNarrowViewport,
  computeRunwayHeightPx,
  computeScrollProgress,
} from "@/lib/scroll-math";
import { SCROLL_DAMPING } from "@/lib/constants";

export function useScrollProgress(): { progress: number; easedProgress: number; narrow: boolean } {
  const [progress, setProgress] = useState(0);
  const [narrow, setNarrow] = useState(false);

  const targetRef = useRef(0);
  const progRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function recomputeTarget() {
      const isNarrow = isNarrowViewport(window.innerWidth);
      setNarrow(isNarrow);
      const runway = computeRunwayHeightPx(window.innerHeight, isNarrow);
      targetRef.current = computeScrollProgress(window.scrollY, runway);
    }

    recomputeTarget();
    window.addEventListener("scroll", recomputeTarget, { passive: true });
    window.addEventListener("resize", recomputeTarget);

    function frame() {
      progRef.current = lerp(progRef.current, targetRef.current, SCROLL_DAMPING);
      setProgress(progRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("scroll", recomputeTarget);
      window.removeEventListener("resize", recomputeTarget);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { progress, easedProgress: ease(progress), narrow };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- hooks/useScrollProgress.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add hooks/useScrollProgress.ts hooks/useScrollProgress.test.ts
git commit -m "feat: add damped scroll progress hook"
```

---

## Task 12: 3D→screen projection and pad anchor hook

**Files:**
- Create: `lib/project-to-screen.ts`, `lib/project-to-screen.test.ts`, `hooks/usePadAnchor.ts`

**Interfaces:**
- Consumes: `three` (npm package, installed in Task 16)
- Produces: `projectToScreenPx(worldPosition: THREE.Vector3, camera: THREE.Camera, viewportWidthPx: number, viewportHeightPx: number): { xPx: number; yPx: number }` (from `lib/project-to-screen.ts`); `usePadAnchor(padRef: RefObject<THREE.Object3D | null>, targetElRef: RefObject<HTMLElement | null>): void` (from `hooks/usePadAnchor.ts`, must be called from a component rendered inside `<Canvas>`) — consumed by Task 17 (`Pad.tsx`)

- [ ] **Step 1: Install three.js**

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

- [ ] **Step 2: Write the failing test for the projection function**

Create `lib/project-to-screen.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { projectToScreenPx } from "./project-to-screen";

function makeCamera() {
  const camera = new THREE.PerspectiveCamera(40, 1200 / 1000, 0.1, 100);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

describe("projectToScreenPx", () => {
  it("projects the world origin to the viewport center when the camera looks straight at it", () => {
    const camera = makeCamera();
    const { xPx, yPx } = projectToScreenPx(new THREE.Vector3(0, 0, 0), camera, 1200, 1000);
    expect(xPx).toBeCloseTo(600, 0);
    expect(yPx).toBeCloseTo(500, 0);
  });

  it("moves right on screen as world x increases", () => {
    const camera = makeCamera();
    const center = projectToScreenPx(new THREE.Vector3(0, 0, 0), camera, 1200, 1000);
    const right = projectToScreenPx(new THREE.Vector3(1, 0, 0), camera, 1200, 1000);
    expect(right.xPx).toBeGreaterThan(center.xPx);
  });

  it("moves up on screen (smaller yPx) as world y increases", () => {
    const camera = makeCamera();
    const center = projectToScreenPx(new THREE.Vector3(0, 0, 0), camera, 1200, 1000);
    const up = projectToScreenPx(new THREE.Vector3(0, 1, 0), camera, 1200, 1000);
    expect(up.yPx).toBeLessThan(center.yPx);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- lib/project-to-screen.test.ts`
Expected: FAIL — module doesn't exist

- [ ] **Step 4: Implement the projection function**

Create `lib/project-to-screen.ts`:

```ts
import type * as THREE from "three";

/**
 * Projects a world-space position through a camera to CSS pixel
 * coordinates. Used to anchor the DOM-based #gate overlay to the 3D
 * pad's actual on-screen position (v1 rough edge P2 #5 — v1 positioned
 * the gate with fixed percentage offsets that drifted on unusual
 * aspect ratios).
 */
export function projectToScreenPx(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera,
  viewportWidthPx: number,
  viewportHeightPx: number
): { xPx: number; yPx: number } {
  const ndc = worldPosition.clone().project(camera);
  const xPx = (ndc.x * 0.5 + 0.5) * viewportWidthPx;
  const yPx = (-ndc.y * 0.5 + 0.5) * viewportHeightPx;
  return { xPx, yPx };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- lib/project-to-screen.test.ts`
Expected: PASS

- [ ] **Step 6: Implement the R3F-side hook**

This hook must run inside `<Canvas>` (it uses `@react-three/fiber`'s `useThree`/`useFrame`), so it is not independently unit-testable without a Canvas context — it's a thin wrapper verified by Task 17's build/visual check. Create `hooks/usePadAnchor.ts`:

```ts
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { RefObject } from "react";
import type * as THREE from "three";
import { projectToScreenPx } from "@/lib/project-to-screen";

/**
 * Writes the projected screen position of `padRef.current` directly to
 * `targetElRef.current`'s inline style each frame, bypassing React
 * state so the DOM-positioned gate overlay can track the 3D pad at 60fps
 * without triggering a React re-render per frame.
 */
export function usePadAnchor(
  padRef: RefObject<THREE.Object3D | null>,
  targetElRef: RefObject<HTMLElement | null>
): void {
  const { camera, size } = useThree();

  useFrame(() => {
    const pad = padRef.current;
    const el = targetElRef.current;
    if (!pad || !el) return;
    const worldPosition = pad.getWorldPosition(TMP_VECTOR);
    const { xPx, yPx } = projectToScreenPx(worldPosition, camera, size.width, size.height);
    el.style.setProperty("--gate-x", `${xPx}px`);
    el.style.setProperty("--gate-y", `${yPx}px`);
  });
}

// Reused across frames to avoid allocating a new Vector3 60 times/sec.
import { Vector3 } from "three";
const TMP_VECTOR = new Vector3();
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json lib/project-to-screen.ts lib/project-to-screen.test.ts hooks/usePadAnchor.ts
git commit -m "feat: add 3D-to-screen projection and pad anchor hook"
```

---

## Task 13: Hero component

**Files:**
- Create: `components/Hero.tsx`, `components/Hero.module.css`, `lib/focus-features.ts`

**Interfaces:**
- Consumes: `heroEyebrow`, `heroLede`, `heroChips`, `scrollCueText` (Task 4), `useReveal` (Task 8)
- Produces: `<Hero />`; `focusFeatures(behavior?: ScrollBehavior): void` (from `lib/focus-features.ts`) — consumed by Task 17 (`ExperienceStage`'s flip handler) and Task 20 (`app/page.tsx`)

- [ ] **Step 1: Implement the shared focus-management utility**

Create `lib/focus-features.ts`:

```ts
/**
 * Moves focus to the #features heading and scrolls it into view.
 * Shared by the hero's "skip intro" link and the gate's flip button so
 * both interaction paths land in the same place (v1 rough edge P1 #2 —
 * v1 lost focus to <body> after the flip with no recovery).
 */
export function focusFeatures(behavior: ScrollBehavior = "smooth"): void {
  const el = document.getElementById("features");
  if (!el) return;
  el.scrollIntoView({ behavior, block: "start" });
  el.focus({ preventScroll: true });
}
```

- [ ] **Step 2: Implement Hero.module.css**

Create `components/Hero.module.css` (styles ported verbatim from the v1 `<style>` block's hero/wordmark/chips/scroll-cue rules, plus a new `.skip` rule):

```css
.hero {
  position: relative;
  z-index: 2;
  min-height: 100svh;
  display: flex;
  align-items: center;
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, .85fr);
  gap: 3rem;
  align-items: center;
  width: 100%;
}
.eyebrow {
  font-family: var(--mono);
  font-size: .7rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--soft);
  display: flex;
  align-items: center;
  gap: .6rem;
}
.eyebrow::before { content: ""; width: 22px; height: 1px; background: var(--stroke-2); }
.wordmark {
  font-size: clamp(3.4rem, 11.5vw, 8.2rem);
  font-weight: 680;
  letter-spacing: -.055em;
  line-height: .86;
  color: #fff;
  margin: 1.4rem 0 1.1rem;
}
.wordmark em { font-style: normal; color: var(--coral); }
.lede { font-size: clamp(1rem, 1.65vw, 1.2rem); line-height: 1.6; max-width: 46ch; color: var(--soft); }
.chips { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: 1.8rem; }
.chip {
  font-family: var(--mono);
  font-size: .685rem;
  letter-spacing: .03em;
  padding: .4rem .7rem;
  border: 1px solid var(--stroke);
  border-radius: 999px;
  background: rgba(255, 255, 255, .025);
  color: var(--soft);
  white-space: nowrap;
}
.chipBold { color: var(--accent); font-weight: 400; }
.scrollCue {
  margin-top: 2.6rem;
  font-family: var(--mono);
  font-size: .68rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--soft);
  display: flex;
  align-items: center;
  gap: .6rem;
}
.scrollCueMark {
  width: 15px;
  height: 24px;
  border: 1px solid var(--stroke-2);
  border-radius: 999px;
  position: relative;
  flex: none;
}
.scrollCueMark::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 5px;
  width: 2px;
  height: 5px;
  border-radius: 2px;
  background: var(--coral);
  transform: translateX(-50%);
  animation: cue 1.9s ease-in-out infinite;
}
@keyframes cue {
  0%, 100% { opacity: 0; transform: translate(-50%, 0); }
  35% { opacity: 1; }
  70% { opacity: 0; transform: translate(-50%, 8px); }
}

.skip {
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: 10;
  background: var(--elevated);
  color: var(--accent);
  font-family: var(--mono);
  font-size: .75rem;
  padding: .6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--stroke-2);
  text-decoration: none;
  transition: top .2s ease;
}
.skip:focus-visible { top: 1rem; }

@media (max-width: 880px) {
  .grid { grid-template-columns: 1fr; }
  .hero { align-items: flex-end; padding-bottom: 14svh; min-height: 96svh; }
}
```

- [ ] **Step 3: Implement Hero.tsx**

Create `components/Hero.tsx`:

```tsx
"use client";

import styles from "./Hero.module.css";
import { heroEyebrow, heroLede, heroChips, scrollCueText } from "@/lib/content";
import { useReveal } from "./RevealProvider";
import { focusFeatures } from "@/lib/focus-features";

export function Hero() {
  const { reveal } = useReveal();

  function handleSkip(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    reveal();
    focusFeatures("auto");
  }

  return (
    <header className={styles.hero}>
      {/*
        Full keyboard path to the content with zero interaction with the
        3D piece (v1 rough edge P1 #1 — v1 had no way to reach the
        feature content without clicking "Turn the page").
      */}
      <a href="#features" className={styles.skip} onClick={handleSkip}>
        Skip intro — jump to features
      </a>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>{heroEyebrow}</p>
          <h1 className={styles.wordmark}>
            Life<em>OS</em>
          </h1>
          <p className={styles.lede}>{heroLede}</p>
          <div className={styles.chips}>
            {heroChips.map((chip, i) => (
              <span className={styles.chip} key={i}>
                {chip.map((segment, j) =>
                  segment.bold ? (
                    <b className={styles.chipBold} key={j}>
                      {segment.text}
                    </b>
                  ) : (
                    <span key={j}>{segment.text}</span>
                  )
                )}
              </span>
            ))}
          </div>
          <p className={styles.scrollCue}>
            <span className={styles.scrollCueMark} /> {scrollCueText}
          </p>
        </div>
        <div aria-hidden="true" />
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Verify types and build**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add components/Hero.tsx components/Hero.module.css lib/focus-features.ts
git commit -m "feat: add Hero component with skip-intro accessibility path"
```

---

## Task 14: Gate component (presentational)

**Files:**
- Create: `components/Gate.tsx`, `components/Gate.module.css`

**Interfaces:**
- Consumes: `gateScrawl`, `gateHeading`, `gateBody`, `gateFlipLabel`, `gateSourceLabel`, `repoUrl` (Task 4); receives `coverOpen: boolean`, `flipped: boolean`, `anchorElRef: RefObject<HTMLDivElement | null>`, `onFlipClick: () => void` as props (wired by Task 17)
- Produces: `<Gate coverOpen flipped anchorElRef onFlipClick />` — consumed by Task 17 (`ExperienceStage`)

- [ ] **Step 1: Implement Gate.module.css**

Create `components/Gate.module.css` (ported verbatim from v1's `#gate`/`.page`/`.scrawl`/`.gate-actions`/`.btn*` rules, positioned via the `--gate-x`/`--gate-y` custom properties written by `usePadAnchor` instead of v1's fixed percentage transform):

```css
.gate {
  position: fixed;
  z-index: 3;
  left: var(--gate-x, 50%);
  top: var(--gate-y, 42%);
  transform: translate(-50%, -50%) scale(.94);
  width: min(90vw, 372px);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity .55s ease, transform .55s cubic-bezier(.2, .8, .25, 1), visibility .55s;
}
.gate.on {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, -50%) scale(1);
}
.gate.gone {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, -66%) scale(.96);
}
.page {
  background: linear-gradient(175deg, var(--cream), #F2E4CC);
  border-radius: 10px;
  padding: 1.9rem 1.6rem 1.6rem;
  color: #2A2622;
  box-shadow: 0 30px 70px -22px rgba(0, 0, 0, .85), 0 1px 0 rgba(255, 255, 255, .5) inset;
  position: relative;
}
.page::before {
  content: "";
  position: absolute;
  inset: 3.2rem .9rem 3.4rem;
  pointer-events: none;
  opacity: .5;
  background: repeating-linear-gradient(transparent 0 25px, rgba(62, 82, 181, .16) 25px 26px);
}
.page h2 { font-size: 1.28rem; color: #241F1A; letter-spacing: -.02em; line-height: 1.25; position: relative; }
.page p { color: #6A6055; font-size: .87rem; margin-top: .5rem; position: relative; }
.scrawl {
  font-family: var(--hand);
  font-size: 1.24rem;
  color: var(--ink);
  transform: rotate(-2.4deg);
  display: inline-block;
  margin-bottom: .15rem;
}
.actions { display: flex; flex-direction: column; gap: .55rem; margin-top: 1.5rem; position: relative; }
.btn {
  font: inherit;
  font-size: .86rem;
  font-weight: 560;
  cursor: pointer;
  border: 0;
  padding: .78rem 1.1rem;
  border-radius: 9px;
  text-align: center;
  text-decoration: none;
  transition: transform .18s ease, filter .18s ease;
  display: block;
}
.btn:hover { transform: translateY(-1px); filter: brightness(1.07); }
.btn:active { transform: translateY(0); }
.primary { background: #241F1A; color: var(--cream); }
.ghost { background: transparent; color: #5A5148; border: 1px solid rgba(42, 38, 34, .24); }
```

- [ ] **Step 2: Implement Gate.tsx**

Create `components/Gate.tsx`:

```tsx
"use client";

import type { RefObject } from "react";
import styles from "./Gate.module.css";
import { gateScrawl, gateHeading, gateBody, gateFlipLabel, gateSourceLabel, repoUrl } from "@/lib/content";

type GateProps = {
  coverOpen: boolean;
  flipped: boolean;
  anchorElRef: RefObject<HTMLDivElement | null>;
  onFlipClick: () => void;
};

export function Gate({ coverOpen, flipped, anchorElRef, onFlipClick }: GateProps) {
  const stateClass = flipped ? styles.gone : coverOpen ? styles.on : "";
  return (
    <div ref={anchorElRef} className={`${styles.gate} ${stateClass}`}>
      <div className={styles.page}>
        <span className={styles.scrawl}>{gateScrawl}</span>
        <h2>{gateHeading}</h2>
        <p>{gateBody}</p>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={onFlipClick}>
            {gateFlipLabel}
          </button>
          <a
            className={`${styles.btn} ${styles.ghost}`}
            href={repoUrl}
            target="_blank"
            rel="noopener"
          >
            {gateSourceLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/Gate.tsx components/Gate.module.css
git commit -m "feat: add presentational Gate component"
```

---

## Task 15: Scene dressing — Lights, Rings, Motes

**Files:**
- Create: `components/scene/Lights.tsx`, `components/scene/Rings.tsx`, `components/scene/Motes.tsx`

**Interfaces:**
- Consumes: `MOTE_COUNT_HIGH`, `MOTE_COUNT_LOW`, `LOW_END_HARDWARE_CONCURRENCY_THRESHOLD` (Task 3)
- Produces: `<Lights />`, `<Rings />`, `<Motes />` — consumed by Task 17 (`Pad.tsx`/`Scene.tsx`)

- [ ] **Step 1: Implement Lights.tsx**

Create `components/scene/Lights.tsx` (values ported verbatim from v1's lighting rig — ambient 0.62, cool key `#dfe4ec`, coral rim `#F0876E`, mint fill `#8CC8B4`):

```tsx
export function Lights() {
  return (
    <>
      <ambientLight intensity={0.62} />
      <directionalLight color={0xdfe4ec} intensity={1.05} position={[3, 5, 6]} />
      <pointLight color={0xf0876e} intensity={0.95} distance={26} position={[-5, -1.5, 4]} />
      <pointLight color={0x8cc8b4} intensity={0.42} distance={24} position={[5, 3, -3]} />
    </>
  );
}
```

- [ ] **Step 2: Implement Rings.tsx**

Create `components/scene/Rings.tsx` (7-ring spiral binding, alternating coral/mint, geometry/positions ported verbatim):

```tsx
import { useMemo } from "react";
import * as THREE from "three";

const RING_COUNT = 7;
const W = 3.05;
const H = 3.85;

export function Rings() {
  const geometry = useMemo(() => new THREE.TorusGeometry(0.115, 0.032, 10, 26), []);
  const materialCoral = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xf0876e, roughness: 0.42, metalness: 0.15 }),
    []
  );
  const materialMint = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x8cc8b4, roughness: 0.42, metalness: 0.15 }),
    []
  );

  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, r) => ({
        key: r,
        material: r % 2 ? materialMint : materialCoral,
        position: [-W / 2 + 0.34 + r * ((W - 0.68) / 6), H / 2 - 0.29, 0.05] as [number, number, number],
      })),
    [materialCoral, materialMint]
  );

  return (
    <>
      {rings.map((ring) => (
        <mesh
          key={ring.key}
          geometry={geometry}
          material={ring.material}
          position={ring.position}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: Implement Motes.tsx**

Create `components/scene/Motes.tsx` (drifting starfield, device-tiered count — new vs. v1, fixes P3 #10):

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MOTE_COUNT_HIGH, MOTE_COUNT_LOW, LOW_END_HARDWARE_CONCURRENCY_THRESHOLD } from "@/lib/constants";

function getMoteCount(): number {
  if (typeof navigator === "undefined") return MOTE_COUNT_HIGH;
  const cores = navigator.hardwareConcurrency ?? MOTE_COUNT_HIGH;
  return cores < LOW_END_HARDWARE_CONCURRENCY_THRESHOLD ? MOTE_COUNT_LOW : MOTE_COUNT_HIGH;
}

export function Motes() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = getMoteCount();
    const positions = new Float32Array(count * 3);
    for (let m = 0; m < count; m++) {
      positions[m * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[m * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[m * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xc7ccd6,
        size: 0.035,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.014;
    pointsRef.current.position.y = Math.sin(t * 0.25) * 0.25;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
```

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add components/scene/Lights.tsx components/scene/Rings.tsx components/scene/Motes.tsx
git commit -m "feat: add scene lighting, spiral rings, and device-tiered motes"
```

---

## Task 16: Scene geometry — Pages, Cover

**Files:**
- Create: `components/scene/Pages.tsx`, `components/scene/Cover.tsx`

**Interfaces:**
- Consumes: `PAGE_COUNT` (Task 3), `public/icon-source.png` (Task 7)
- Produces: `<Pages targetsRef={RefObject<number[]>} />`, `<Cover targetRef={RefObject<number>} onLoaded={() => void} />` — consumed by Task 17 (`Pad.tsx`)

- [ ] **Step 1: Implement Pages.tsx**

Create `components/scene/Pages.tsx` (4 hinged paper sheets, shades ported verbatim `#FEF3E0 → #EBDBC4`; each page's hinge rotates toward its entry in `targetsRef.current`, written by the pad-state reducer via Task 17):

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PAGE_COUNT } from "@/lib/constants";

const W = 3.05;
const H = 3.85;
const SHADES = [0xfef3e0, 0xf7e9d4, 0xf1e2cc, 0xebdbc4];
const DAMPING = 0.1;

type PagesProps = {
  /** Current per-page rotation targets (radians), updated externally by the pad-state reducer. */
  targetsRef: React.RefObject<number[]>;
  /** When true (prefers-reduced-motion), snap instead of damp. */
  reduced: boolean;
};

export function Pages({ targetsRef, reduced }: PagesProps) {
  const hingeRefs = useRef<(THREE.Object3D | null)[]>([]);

  const materials = useMemo(
    () => SHADES.map((shade) => new THREE.MeshStandardMaterial({ color: shade, roughness: 0.95, side: THREE.DoubleSide })),
    []
  );
  const geometry = useMemo(() => new THREE.PlaneGeometry(W - 0.22, H - 0.62), []);

  useFrame(() => {
    const targets = targetsRef.current;
    hingeRefs.current.forEach((hinge, i) => {
      if (!hinge) return;
      const target = targets[i] ?? 0;
      hinge.rotation.x = reduced ? target : hinge.rotation.x + (target - hinge.rotation.x) * DAMPING;
    });
  });

  return (
    <>
      {Array.from({ length: PAGE_COUNT }, (_, i) => (
        <object3D
          key={i}
          ref={(el) => {
            hingeRefs.current[i] = el;
          }}
          position={[0, H / 2 - 0.3, 0.02 + (3 - i) * 0.022]}
        >
          <mesh geometry={geometry} material={materials[i]} position={[0, -(H - 0.62) / 2, 0]} />
        </object3D>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Implement Cover.tsx**

Create `components/scene/Cover.tsx` (hinged app-icon cover; texture loads from the real `public/icon-source.png` asset via `useTexture`, replacing v1's base64 JPEG embed — fixes P4 #13):

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const W = 3.05;
const H = 3.85;
const DAMPING = 0.11;

type CoverProps = {
  /** Current target rotation (radians), updated externally by the pad-state reducer. */
  targetRef: React.RefObject<number>;
  reduced: boolean;
  onLoaded: () => void;
  /** Ref to the hinge Object3D — consumed by usePadAnchor in Pad.tsx to anchor the DOM gate. */
  hingeRef: React.RefObject<THREE.Object3D | null>;
};

export function Cover({ targetRef, reduced, onLoaded, hingeRef }: CoverProps) {
  const texture = useTexture("/icon-source.png", () => onLoaded());
  texture.colorSpace = THREE.SRGBColorSpace;

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const hinge = hingeRef.current;
    if (!hinge) return;
    const target = targetRef.current ?? 0;
    hinge.rotation.x = reduced ? target : hinge.rotation.x + (target - hinge.rotation.x) * DAMPING;
  });

  return (
    <object3D ref={hingeRef} position={[0, H / 2 - 0.3, 0.115]}>
      <mesh position={[0, -(W - 0.2) / 2 - 0.06, 0]}>
        <planeGeometry args={[W - 0.2, W - 0.2]} />
        <meshStandardMaterial ref={materialRef} map={texture} roughness={0.66} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
    </object3D>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/scene/Pages.tsx components/scene/Cover.tsx
git commit -m "feat: add hinged Pages and Cover scene geometry"
```

---

## Task 17: Pad, Scene, and ExperienceStage (composition)

**Files:**
- Create: `components/scene/Pad.tsx`, `components/scene/Scene.tsx`, `components/scene/Scene.module.css`, `components/ExperienceStage.tsx`, `components/ExperienceStage.module.css`

**Interfaces:**
- Consumes: `Lights`, `Rings`, `Motes` (Task 15); `Pages`, `Cover` (Task 16); `usePadAnchor` (Task 12); `useScrollProgress` (Task 11); `useReducedMotion` (Task 9); `padStateReducer`, `initialPadState` (Task 10); `Gate` (Task 14); `useReveal` (Task 8); `focusFeatures` (Task 13); `DPR_CAP_HIGH`, `DPR_CAP_LOW`, `LOW_END_HARDWARE_CONCURRENCY_THRESHOLD`, `PAGE_FLIP_STAGGER_MS`, `COVER_OPEN_GATE_DELAY_MS`, `PAGE_COUNT` (Task 3)
- Produces: `<ExperienceStage />` — a single client component rendering both the `<Canvas>` (via `Scene`) and the DOM `Gate`, sharing one `padStateReducer` instance between them — consumed by Task 20 (`app/page.tsx`)

- [ ] **Step 1: Implement Pad.tsx**

Create `components/scene/Pad.tsx` (the board + pages + cover + rings, camera dolly and idle float driven by scroll progress — ported verbatim from v1's `frame()` loop):

```tsx
"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Pages } from "./Pages";
import { Cover } from "./Cover";
import { Rings } from "./Rings";
import { usePadAnchor } from "@/hooks/usePadAnchor";

const W = 3.05;
const H = 3.85;

type PadProps = {
  easedProgress: number;
  narrow: boolean;
  reduced: boolean;
  pageTargetsRef: React.RefObject<number[]>;
  coverTargetRef: React.RefObject<number>;
  onCoverLoaded: () => void;
  gateAnchorElRef: React.RefObject<HTMLDivElement | null>;
};

export function Pad({
  easedProgress,
  narrow,
  reduced,
  pageTargetsRef,
  coverTargetRef,
  onCoverLoaded,
  gateAnchorElRef,
}: PadProps) {
  const { camera } = useThree();
  const padRef = useRef<THREE.Group>(null);
  const coverHingeRef = useRef<THREE.Object3D>(null);
  const pointerRef = useRef({ tx: 0, ty: 0, px: 0, py: 0 });

  const boardMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x1c1c1f, roughness: 0.88, metalness: 0.05 }), []);
  const boardGeometry = useMemo(() => new THREE.BoxGeometry(W, H, 0.16), []);

  usePadAnchor(padRef, gateAnchorElRef);

  useFrame(({ clock }, _delta, xrFrame) => {
    void xrFrame;
    const pad = padRef.current;
    if (!pad) return;
    const t = clock.getElapsedTime();
    const e = easedProgress;

    camera.position.z = 9 - e * 3.7;
    pad.position.x = (narrow ? 0 : 1.55) * (1 - e);
    pad.position.y = -0.15 * e;
    pad.rotation.y = -0.52 * (1 - e) + pointerRef.current.px * 0.16;
    pad.rotation.x = 0.2 * (1 - e) + pointerRef.current.py * 0.1;

    if (!reduced) {
      pad.position.y += Math.sin(t * 0.9) * 0.045;
      pad.rotation.z = Math.sin(t * 0.6) * 0.012;
    }

    pointerRef.current.px += (pointerRef.current.tx - pointerRef.current.px) * 0.05;
    pointerRef.current.py += (pointerRef.current.ty - pointerRef.current.py) * 0.05;
  });

  return (
    <group
      ref={padRef}
      onPointerMove={(event) => {
        pointerRef.current.tx = event.pointer.x * 0.5;
        pointerRef.current.ty = -event.pointer.y * 0.5;
      }}
    >
      <mesh geometry={boardGeometry} material={boardMaterial} position={[0, 0, -0.09]} />
      <Pages targetsRef={pageTargetsRef} reduced={reduced} />
      <Cover targetRef={coverTargetRef} reduced={reduced} onLoaded={onCoverLoaded} hingeRef={coverHingeRef} />
      <Rings />
    </group>
  );
}
```

- [ ] **Step 2: Implement Scene.module.css**

Create `components/scene/Scene.module.css` (the stage fade-in v1 used once the icon texture finished loading — `#stage{opacity:0;transition:opacity .9s ease .25s} #stage.ready{opacity:1}` — plus the static-image fallback shown when WebGL is unavailable, replacing v1's `.nogl`/`#fallback` handling):

```css
.stage {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity .9s ease .25s;
}
.stage.ready { opacity: 1; }

.fallback {
  position: fixed;
  z-index: 1;
  top: 50%;
  right: 8vw;
  transform: translateY(-50%);
  width: min(38vw, 330px);
  border-radius: 26%;
  box-shadow: 0 40px 90px -30px rgba(0, 0, 0, .9), 0 0 0 1px var(--stroke);
}
@media (max-width: 880px) {
  .fallback { right: 50%; transform: translate(50%, -50%); width: 60vw; }
}
```

- [ ] **Step 3: Implement Scene.tsx**

Create `components/scene/Scene.tsx` (the `<Canvas>` root, device-tiered `dpr`, render-loop pause via `IntersectionObserver` + `document.visibilityState` — fixes P3 #9; a WebGL feature check that swaps in the static icon image on failure — ports v1's `bail()`/`.nogl` path; and the `ready`-class fade-in wired to the cover texture's load callback):

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import styles from "./Scene.module.css";
import { Lights } from "./Lights";
import { Motes } from "./Motes";
import { Pad } from "./Pad";
import { DPR_CAP_HIGH, DPR_CAP_LOW, LOW_END_HARDWARE_CONCURRENCY_THRESHOLD } from "@/lib/constants";

type SceneProps = {
  easedProgress: number;
  narrow: boolean;
  reduced: boolean;
  pageTargetsRef: React.RefObject<number[]>;
  coverTargetRef: React.RefObject<number>;
  gateAnchorElRef: React.RefObject<HTMLDivElement | null>;
};

function getDprCap(): number {
  if (typeof navigator === "undefined") return DPR_CAP_HIGH;
  const cores = navigator.hardwareConcurrency ?? DPR_CAP_HIGH;
  return cores < LOW_END_HARDWARE_CONCURRENCY_THRESHOLD ? DPR_CAP_LOW : DPR_CAP_HIGH;
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function Scene(props: SceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setWebglOk(supportsWebGL());
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && document.visibilityState === "visible"),
      { threshold: 0 }
    );
    io.observe(el);

    function onVisibilityChange() {
      setActive(document.visibilityState === "visible");
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!webglOk) {
    // eslint-disable-next-line @next/next/no-img-element -- static fallback, no need for next/image's runtime optimization here
    return <img className={styles.fallback} src="/icon-source.png" alt="LifeOS app icon" />;
  }

  return (
    <div ref={wrapperRef} className={`${styles.stage} ${ready ? styles.ready : ""}`}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={getDprCap()}
        camera={{ fov: 40, near: 0.1, far: 100, position: [0, 0, 9] }}
        gl={{ antialias: true, alpha: true }}
      >
        <Lights />
        <Motes />
        <Pad
          easedProgress={props.easedProgress}
          narrow={props.narrow}
          reduced={props.reduced}
          pageTargetsRef={props.pageTargetsRef}
          coverTargetRef={props.coverTargetRef}
          onCoverLoaded={() => setReady(true)}
          gateAnchorElRef={props.gateAnchorElRef}
        />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 4: Implement ExperienceStage.module.css**

Create `components/ExperienceStage.module.css`:

```css
.runway {
  height: 190svh;
  position: relative;
  z-index: 2;
  pointer-events: none;
}
@media (max-width: 880px) {
  .runway { height: 150svh; }
}
```

- [ ] **Step 5: Implement ExperienceStage.tsx**

Create `components/ExperienceStage.tsx` (owns the shared `padStateReducer`, wires scroll progress into it, wires the flip button to dispatch `FLIP`, stagger the page-flip timers, reveal main content, and move focus — this is the composition root replacing v1's monolithic inline `<script>`):

```tsx
"use client";

import { useEffect, useReducer, useRef } from "react";
import styles from "./ExperienceStage.module.css";
import { Scene } from "./scene/Scene";
import { Gate } from "./Gate";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { padStateReducer, initialPadState } from "@/lib/pad-state";
import { useReveal } from "./RevealProvider";
import { focusFeatures } from "@/lib/focus-features";
import { PAGE_FLIP_STAGGER_MS, COVER_OPEN_GATE_DELAY_MS, PAGE_COUNT } from "@/lib/constants";

export function ExperienceStage() {
  const { progress, easedProgress, narrow } = useScrollProgress();
  const reduced = useReducedMotion();
  const { reveal } = useReveal();
  const [padState, dispatch] = useReducer(padStateReducer, initialPadState);

  const gateAnchorElRef = useRef<HTMLDivElement>(null);
  const pageTargetsRef = useRef<number[]>(padState.pageTargets);
  const coverTargetRef = useRef<number>(0);

  // Keep the mutable refs Pad/Pages/Cover read every frame in sync with
  // reducer state, without forcing the R3F tree to re-render each tick.
  useEffect(() => {
    pageTargetsRef.current = padState.pageTargets;
    coverTargetRef.current = padState.coverOpen ? -Math.PI * 0.98 : 0;
  }, [padState.pageTargets, padState.coverOpen]);

  useEffect(() => {
    dispatch({ type: "SCROLL_PROGRESS", progress });
  }, [progress]);

  function handleFlipClick() {
    dispatch({ type: "FLIP" });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = reduced ? 0 : i * PAGE_FLIP_STAGGER_MS;
      setTimeout(() => dispatch({ type: "SET_PAGE_TARGET", index: i, value: -Math.PI * 0.97 }), delay);
    }
    reveal();
    const revealDelay = reduced ? 0 : PAGE_COUNT * PAGE_FLIP_STAGGER_MS + 200;
    setTimeout(() => focusFeatures(reduced ? "auto" : "smooth"), revealDelay);
  }

  return (
    <>
      <div className={styles.runway} aria-hidden="true" />
      <Scene
        easedProgress={easedProgress}
        narrow={narrow}
        reduced={reduced}
        pageTargetsRef={pageTargetsRef}
        coverTargetRef={coverTargetRef}
        gateAnchorElRef={gateAnchorElRef}
      />
      <Gate
        coverOpen={padState.coverOpen}
        flipped={padState.flipped}
        anchorElRef={gateAnchorElRef}
        onFlipClick={handleFlipClick}
      />
    </>
  );
}
```

Note: `COVER_OPEN_GATE_DELAY_MS` (the 420ms v1 used to mitigate — not eliminate — flicker) is superseded by the hysteresis band in `padStateReducer` (Task 10) and is intentionally unused here; it stays exported from `lib/constants.ts` for documentation/parity but Task 22's final pass should confirm no dead-code lint warning fires, or remove the constant if the linter flags it.

- [ ] **Step 6: Verify types and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors (this task can't fully mount yet — `app/page.tsx` hasn't been wired up until Task 20 — so this step confirms compile-time correctness only)

- [ ] **Step 7: Commit**

```bash
git add components/scene/Pad.tsx components/scene/Scene.tsx components/scene/Scene.module.css components/ExperienceStage.tsx components/ExperienceStage.module.css
git commit -m "feat: compose Pad, Scene, and ExperienceStage"
```

---

## Task 18: Feature/spec section components + MainReveal

**Files:**
- Create: `components/FeatureSection.tsx`, `components/FeatureSection.module.css`, `components/MediaSlot.tsx`, `components/MediaSlot.module.css`, `components/SpecList.tsx`, `components/SpecList.module.css`, `components/DeliberatelyAbsent.tsx`, `components/DeliberatelyAbsent.module.css`, `components/MainReveal.tsx`, `components/MainReveal.module.css`

**Interfaces:**
- Consumes: `FeatureSection` type + `featureSections`, `specRows`, `specSectionEyebrow`, `specSectionHeading`, `deliberatelyAbsent*` (Task 4); `useReveal` (Task 8)
- Produces: `<FeatureSection section={FeatureSection} />`, `<MediaSlot />`, `<SpecList />`, `<DeliberatelyAbsent />`, `<MainReveal>{children}</MainReveal>` — consumed by Task 20 (`app/page.tsx`)

- [ ] **Step 1: Implement MediaSlot (placeholder reserved for future screenshots)**

Create `components/MediaSlot.module.css`:

```css
.slot {
  border: 1px dashed var(--stroke-2);
  border-radius: 12px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soft);
  font-family: var(--mono);
  font-size: .68rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-top: 1rem;
}
```

Create `components/MediaSlot.tsx`:

```tsx
import styles from "./MediaSlot.module.css";

/**
 * Reserved layout slot for a future screenshot/recording per feature
 * section (spec §8 — no real assets exist yet, so this ships empty
 * rather than with a fabricated placeholder image).
 */
export function MediaSlot() {
  return <div className={styles.slot} aria-hidden="true" />;
}
```

- [ ] **Step 2: Implement FeatureSection**

Create `components/FeatureSection.module.css` (grid/cell rules ported verbatim from v1):

```css
.section { padding-block: clamp(4rem, 9vw, 7.5rem); }
.head { max-width: 60ch; margin-bottom: 2.6rem; }
.head h2 { margin: .85rem 0 .7rem; }
.grid {
  display: grid;
  gap: 1px;
  background: var(--stroke);
  border: 1px solid var(--stroke);
  border-radius: 16px;
  overflow: hidden;
}
.g2 { grid-template-columns: repeat(2, 1fr); }
.g3 { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 880px) {
  .g2, .g3 { grid-template-columns: 1fr; }
}
.cell {
  background: var(--elevated);
  padding: 1.6rem 1.45rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  transition: background .3s ease;
}
.cell:hover { background: #212125; }
.tag {
  font-family: var(--mono);
  font-size: .63rem;
  letter-spacing: .13em;
  text-transform: uppercase;
  color: var(--soft);
  display: flex;
  align-items: center;
  gap: .45rem;
}
.dot { width: 6px; height: 6px; border-radius: 50%; flex: none; }
.cell p { font-size: .875rem; line-height: 1.6; }
```

Create `components/FeatureSection.tsx`:

```tsx
import styles from "./FeatureSection.module.css";
import type { FeatureSection as FeatureSectionData } from "@/lib/content";
import { MediaSlot } from "./MediaSlot";

export function FeatureSection({ section }: { section: FeatureSectionData }) {
  return (
    <section className={`wrap ${styles.section}`} id={section.id}>
      <div className={styles.head}>
        <p className={styles.tag}>{section.eyebrow}</p>
        <h2>{section.heading}</h2>
        {section.lede && <p>{section.lede}</p>}
      </div>
      <div className={`${styles.grid} ${section.columns === 3 ? styles.g3 : styles.g2}`}>
        {section.cards.map((card) => (
          <div className={styles.cell} key={card.title}>
            <span className={styles.tag}>
              <i className={styles.dot} style={{ background: `var(${card.dotVar})` }} />
              {card.tag}
            </span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <MediaSlot />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Implement SpecList (the "under the hood" table)**

Create `components/SpecList.module.css`:

```css
.section { padding-block: clamp(4rem, 9vw, 7.5rem); }
.head { max-width: 60ch; margin-bottom: 2.6rem; }
.head h2 { margin: .85rem 0 .7rem; }
.spec { border-top: 1px solid var(--stroke); }
.row {
  display: grid;
  grid-template-columns: minmax(0, .42fr) minmax(0, 1fr);
  gap: 1.2rem;
  padding: 1.15rem 0;
  border-bottom: 1px solid var(--stroke);
  align-items: baseline;
}
@media (max-width: 880px) {
  .row { grid-template-columns: 1fr; gap: .25rem; }
}
.row dt {
  font-family: var(--mono);
  font-size: .73rem;
  letter-spacing: .06em;
  color: var(--soft);
  text-transform: uppercase;
}
.row dd { color: var(--accent); font-size: .93rem; }
.row code {
  font-family: var(--mono);
  background: rgba(255, 255, 255, .06);
  padding: .1rem .35rem;
  border-radius: 4px;
}
```

Create `components/SpecList.tsx`:

```tsx
import styles from "./SpecList.module.css";
import { specSectionEyebrow, specSectionHeading, specRows } from "@/lib/content";

export function SpecList() {
  return (
    <section className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <p className={styles.tag}>{specSectionEyebrow}</p>
        <h2>{specSectionHeading}</h2>
      </div>
      <dl className={styles.spec}>
        {specRows.map((row) => (
          <div className={styles.row} key={row.term}>
            <dt>{row.term}</dt>
            <dd>
              {row.definition.map((segment, i) =>
                segment.code ? <code key={i}>{segment.text}</code> : <span key={i}>{segment.text}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Implement DeliberatelyAbsent**

Create `components/DeliberatelyAbsent.module.css`:

```css
.section { padding-block: clamp(4rem, 9vw, 7.5rem); }
.out {
  border: 1px dashed var(--stroke-2);
  border-radius: 16px;
  padding: 1.8rem 1.6rem;
  background: rgba(255, 255, 255, .015);
}
.out h2 { font-size: clamp(1.4rem, 3vw, 2rem); margin: .8rem 0 .5rem; }
.list { list-style: none; display: flex; flex-wrap: wrap; gap: .45rem; margin-top: 1.1rem; padding: 0; }
.list li {
  font-family: var(--mono);
  font-size: .7rem;
  color: var(--soft);
  border: 1px solid var(--stroke);
  border-radius: 999px;
  padding: .38rem .72rem;
}
.list li::before { content: "— "; opacity: .55; }
```

Create `components/DeliberatelyAbsent.tsx`:

```tsx
import styles from "./DeliberatelyAbsent.module.css";
import {
  deliberatelyAbsentEyebrow,
  deliberatelyAbsentHeading,
  deliberatelyAbsentLede,
  deliberatelyAbsent,
} from "@/lib/content";

export function DeliberatelyAbsent() {
  return (
    <section className={`wrap ${styles.section}`}>
      <div className={styles.out}>
        <p className={styles.tag}>{deliberatelyAbsentEyebrow}</p>
        <h2 className={styles.out}>{deliberatelyAbsentHeading}</h2>
        <p>{deliberatelyAbsentLede}</p>
        <ul className={styles.list}>
          {deliberatelyAbsent.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement MainReveal**

Create `components/MainReveal.module.css` (the fix for v1 rough edge P1 #1 — content stays in the DOM at all times, gated by opacity/pointer-events, never the `hidden` attribute):

```css
.main {
  position: relative;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity .8s ease;
}
.revealed {
  opacity: 1;
  pointer-events: auto;
}
```

Create `components/MainReveal.tsx`:

```tsx
"use client";

import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";

export function MainReveal({ children }: { children: React.ReactNode }) {
  const { revealed } = useReveal();
  return <main className={`${styles.main} ${revealed ? styles.revealed : ""}`}>{children}</main>;
}
```

- [ ] **Step 6: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add components/FeatureSection.tsx components/FeatureSection.module.css \
  components/MediaSlot.tsx components/MediaSlot.module.css \
  components/SpecList.tsx components/SpecList.module.css \
  components/DeliberatelyAbsent.tsx components/DeliberatelyAbsent.module.css \
  components/MainReveal.tsx components/MainReveal.module.css
git commit -m "feat: add feature/spec section components and MainReveal"
```

---

## Task 19: Footer

**Files:**
- Create: `components/Footer.tsx`, `components/Footer.module.css`

**Interfaces:**
- Consumes: `footerEyebrow`, `footerBody`, `footerSmallLines`, `repoUrl` (Task 4)
- Produces: `<Footer />` — consumed by Task 20 (`app/page.tsx`)

- [ ] **Step 1: Implement Footer.module.css**

Create `components/Footer.module.css` (ported verbatim from v1's `footer`/`.foot` rules):

```css
.footer {
  position: relative;
  z-index: 2;
  border-top: 1px solid var(--stroke);
  padding-block: 3rem 4rem;
  margin-top: 2rem;
}
.inner { display: flex; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; align-items: flex-end; }
.eyebrow {
  font-family: var(--mono);
  font-size: .7rem;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--soft);
  margin-bottom: .9rem;
}
.body { max-width: 42ch; font-size: .9rem; }
.link { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--stroke-2); padding-bottom: 2px; margin-top: 1rem; display: inline-block; }
.link:hover { color: var(--coral); border-color: var(--coral); }
.small {
  font-family: var(--mono);
  font-size: .68rem;
  color: var(--soft);
  letter-spacing: .04em;
  line-height: 1.9;
}
```

- [ ] **Step 2: Implement Footer.tsx**

Create `components/Footer.tsx`:

```tsx
import styles from "./Footer.module.css";
import { footerEyebrow, footerBody, footerSmallLines, repoUrl } from "@/lib/content";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div>
          <p className={styles.eyebrow}>{footerEyebrow}</p>
          <p className={styles.body}>{footerBody}</p>
          <a className={styles.link} href={repoUrl} target="_blank" rel="noopener">
            {repoUrl.replace("https://", "")}
          </a>
        </div>
        <small className={styles.small}>
          {footerSmallLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < footerSmallLines.length - 1 && <br />}
            </span>
          ))}
        </small>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx components/Footer.module.css
git commit -m "feat: add Footer component"
```

---

## Task 20: Page composition and focus management

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: everything from Tasks 8, 13, 14, 17, 18, 19
- Produces: the complete rendered page — consumed by Task 21 (Playwright)

- [ ] **Step 1: Compose the page**

Replace `app/page.tsx`:

```tsx
import { RevealProvider } from "@/components/RevealProvider";
import { Hero } from "@/components/Hero";
import { ExperienceStage } from "@/components/ExperienceStage";
import { MainReveal } from "@/components/MainReveal";
import { FeatureSection } from "@/components/FeatureSection";
import { SpecList } from "@/components/SpecList";
import { DeliberatelyAbsent } from "@/components/DeliberatelyAbsent";
import { Footer } from "@/components/Footer";
import { featureSections } from "@/lib/content";

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      <ExperienceStage />
      <MainReveal>
        {featureSections.map((section) => (
          <FeatureSection section={section} key={section.heading} />
        ))}
        <SpecList />
        <DeliberatelyAbsent />
      </MainReveal>
      <Footer />
    </RevealProvider>
  );
}
```

Note: `#features` (the first `FeatureSection`, via `featureSections[0].id`) needs `tabIndex={-1}` to be focusable via `focusFeatures()` (Task 13). Add it in `components/FeatureSection.tsx` (Task 18) rather than here — open `components/FeatureSection.tsx` and change the `<section>` tag to:

```tsx
<section className={`wrap ${styles.section}`} id={section.id} tabIndex={section.id ? -1 : undefined}>
```

- [ ] **Step 2: Verify the dev server renders the full page**

Run: `npm run dev &`
Run: `curl -s http://localhost:3000 | grep -o 'Everything is an entry\.'`
Expected: prints the match — confirms feature content is present in the initial server-rendered HTML (v1 rough edge P1 #1 fixed)
Stop the server.

- [ ] **Step 3: Verify the production build succeeds**

Run: `npm run build`
Expected: exits 0

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000` in a browser. Confirm:
- Hero renders with wordmark, lede, chips, scroll cue
- Scrolling down dollies the 3D pad toward center and opens the cover near the bottom of the runway
- Clicking "Turn the page →" flips the pages, reveals the feature sections below, and visibly moves focus to the "Everything is an entry." heading
- The "Skip intro" link appears when Tab is pressed from page load, and activating it jumps straight to the features section
- Toggle "prefers-reduced-motion: reduce" in devtools, reload, and confirm the flip still works with the pages/cover snapping instead of animating

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/FeatureSection.tsx
git commit -m "feat: compose full page and wire focus management"
```

---

## Task 21: End-to-end smoke test

**Files:**
- Create: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: the full running app (Task 20)
- Produces: `npm run e2e` passing — the project's final verification layer

- [ ] **Step 1: Write the smoke test**

Create `e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("LifeOS site", () => {
  test("feature content is present in the DOM before any interaction", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Everything is an entry." })).toBeAttached();
  });

  test("skip-intro link reveals and focuses the features section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /skip intro/i }).click();
    const heading = page.getByRole("heading", { name: "Everything is an entry." });
    await expect(heading).toBeVisible();
    const focusedText = await page.evaluate(() => document.activeElement?.closest("section")?.querySelector("h2")?.textContent);
    expect(focusedText).toBe("Everything is an entry.");
  });

  test("no accessibility violations after reveal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /skip intro/i }).click();
    await expect(page.getByRole("heading", { name: "Everything is an entry." })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("LifeOS site — reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("skip-intro still reveals and focuses features with motion off", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /skip intro/i }).click();
    await expect(page.getByRole("heading", { name: "Everything is an entry." })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the suite**

Run: `npm run e2e`
Expected: all 4 tests PASS. If the axe scan reports violations, fix the underlying markup (most likely a color-contrast or heading-order issue — this is the "audit heading order with a screen reader" check from spec §6 item 3/P1 #4, now automated) and re-run until clean.

- [ ] **Step 3: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test: add end-to-end smoke suite with accessibility scan"
```

---

## Task 22: Final verification and README

**Files:**
- Create: `README.md`
- Modify: none

**Interfaces:**
- Consumes: the entire project
- Produces: a documented, fully verified repository ready to connect to Vercel

- [ ] **Step 1: Run the full verification pass**

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
npm run e2e
```

Expected: every command exits 0. Fix anything that doesn't before proceeding — do not skip or weaken a check to get a green run.

- [ ] **Step 2: Remove the now-unused COVER_OPEN_GATE_DELAY_MS if the linter flags it**

If `npm run lint` (or `tsc`) reports `COVER_OPEN_GATE_DELAY_MS` as unused, remove its export from `lib/constants.ts` (Task 17 noted it's superseded by the hysteresis band and only kept for documentation parity — an unused export is not worth a lint suppression).

- [ ] **Step 3: Write the README**

Create `README.md`:

```markdown
# LifeOS website

Marketing site for [LifeOS](https://github.com/Surajsm60720/LifeOS), rebuilt on Next.js from the original single-file `index.html` prototype.

## Stack

Next.js 15 (App Router) · TypeScript · CSS Modules · React Three Fiber

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test       # unit tests (Vitest)
npm run e2e    # end-to-end + accessibility (Playwright + axe)
\`\`\`

## Design & implementation docs

- `docs/superpowers/specs/2026-08-20-lifeos-website-nextjs-migration-design.md`
- `docs/superpowers/plans/2026-08-20-lifeos-website-nextjs-migration.md`

## Content policy

All feature copy is transcribed from the [LifeOS](https://github.com/Surajsm60720/LifeOS) README's status table at v1.0.2. Do not add or reword a feature claim without re-verifying it against that README — see the design spec §0.
```

- [ ] **Step 4: Commit**

```bash
git add README.md lib/constants.ts
git commit -m "docs: add README; final verification pass"
```

- [ ] **Step 5: Report remaining open items to the user**

Confirm with the user, out loud in the session (not a plan step to automate): the icon/OG image is a square 512×512 crop, not a proper 1200×630 OG card — flag it as a candidate for a dedicated OG-art pass later. Real screenshots/recordings (`MediaSlot`) are still empty placeholders per spec §8/§10 — flag that this is the single biggest remaining visual upgrade, same as the original spec called out, and ask whether the user now has assets to add.
