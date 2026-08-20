# LifeOS Website — Next.js Migration Design

Status: approved by user, pending implementation plan.
Source material: `~/Downloads/index.html` (single-file v1 build, ~105 KB) + accompanying design/spec brief supplied in chat.

## 0. Prime directives (carried over, non-negotiable)

- Never add a feature claim that isn't shipping in the app. All feature copy traces to the `README.md` status table of `Surajsm60720/LifeOS` at v1.0.2. Any new/reworded feature card must be re-verified against that README.
- No App Store / TestFlight / "Download" CTA. Only CTA: GitHub repo + build-from-source instructions.
- Dark theme only. No `prefers-color-scheme` light variant.
- `prefers-reduced-motion` must remain fully respected — every transition/animation collapses to ~0ms, and the flip interaction still functions with motion off.
- Cool gray is the environment; warm (coral/cream/gold/violet/mint) is the signature accent only — never spread into backgrounds, buttons, or large surfaces (see §1 for the full palette rationale).
- Caveat (handwriting font) used exactly once, on `.scrawl`. If a second use is ever proposed, remove the first instead of adding a second.

## 1. What's changing vs. the v1 single-file build

The v1 build is one `index.html`: inline `<style>`, inline `<script>`, three.js r128 via CDN, app icon embedded as base64 JPEG. It works, but:
- All feature content is hidden (`hidden` attribute) until the user clicks "Turn the page" — invisible to a11y tree, crawlers, and find-in-page until interaction (P1 issue).
- Layout constants (runway height, breakpoint) are duplicated between CSS and inline JS and can silently desync (P2 issue).
- The `#gate` overlay is positioned by fixed percentage offsets, not anchored to the 3D pad's actual projected screen position (P2 issue).
- No favicon/OG image, no asset pipeline, no build step, no type safety.

This migration moves the site to Next.js while fixing the above as part of the rebuild (not deferred) — see §6 for the explicit fix list. It preserves the design system, copy, animation choreography, and 3D scene 1:1 in behavior and look; nothing here changes what the site says or how it feels to use.

## 2. Design tokens (verbatim, unchanged)

### 2.1 Core palette — from `LifeOS/Utilities/LifeOSTheme.swift`

| CSS var | Hex | Role |
|---|---|---|
| `--canvas` | `#0F0F12` | page background |
| `--void` | `#06060D` | icon backdrop |
| `--elevated` | `#1C1C1F` | cards, cells, 3D board |
| `--stroke` | `rgba(255,255,255,.07)` | hairlines |
| `--stroke-2` | `rgba(255,255,255,.12)` | stronger hairlines |
| `--soft` | `#9EA1A6` | body copy |
| `--accent` | `#C7CCD6` | primary text / UI accent |
| `--irl` | `#8C9EB3` | IRL category marker |
| `--game` | `#9E9994` | Games category marker |
| `--ent` | `#9494A3` | Entertainment marker |

### 2.2 Per-game accents — from `GameIdentity.swift`

| CSS var | Hex | Game |
|---|---|---|
| `--gi` | `#94A3AD` | Genshin Impact |
| `--hsr` | `#9999AD` | Honkai: Star Rail |
| `--wuwa` | `#8CA8A3` | Wuthering Waves |

### 2.3 Warm signature accents — sampled from `AppIcon-Dark.png`

| CSS var | Hex | Source |
|---|---|---|
| `--coral` | `#F0876E` | calendar top bar |
| `--cream` | `#FEF3E0` | icon paper page |
| `--gold` | `#F0D8A8` | crescent moon / centre sun |
| `--violet` | `#A08CDC` | purple day dot |
| `--mint` | `#8CC8B4` | green day dot / spiral ring |
| `--ink` | `#3E52B5` | not from icon — the blue pen the app was planned in |

Warm accents appear ONLY in: pad rim light, "OS" in wordmark, opened cream page, spiral rings, small category dots on feature cards. Never in backgrounds/buttons/large surfaces.

### 2.4 Typography

| Role | Face |
|---|---|
| Headings/body | system stack (`-apple-system`, SF Pro) |
| Utility (eyebrows, chips, spec labels) | JetBrains Mono 400/500 |
| Annotation (used exactly once) | Caveat 500/600 |

Headings: weight 600–680, letter-spacing -.03em to -.055em. Eyebrows: .7rem, letter-spacing .16em, uppercase, 22px leading hairline. `font-synthesis-weight: none`.

## 3. Architecture

**Stack:** Next.js 15 (App Router), TypeScript, CSS Modules for component styles + a global stylesheet for CSS custom properties (design tokens above). Single route — no CMS, no API routes, no database. Deploy target: Vercel (default build output, not static export, so `next/image` and the metadata-based favicon/OG generators work).

**3D layer:** React Three Fiber + `@react-three/drei`, `three` npm package (current version, not the CDN-pinned r128). Client component only — `Scene.tsx` is the sole `"use client"` boundary; everything else server-renders.

```
app/
  layout.tsx            — <html>, fonts, global CSS import, base <head> metadata
  page.tsx               — composes all sections, server component
  icon.tsx                — favicon, generated via Next metadata image convention
  opengraph-image.tsx     — OG/Twitter card, generated via Next metadata image convention
components/
  Hero/                    — wordmark, lede, chips, scroll cue, "skip intro" link
  Runway/                  — empty scroll-distance spacer
  Gate/                    — opened cream page overlay + CTA buttons
  FeatureSection/          — one component, data-driven per section (see lib/content.ts)
    MediaSlot.tsx           — placeholder slot reserved for future screenshots (§8)
  Footer/
  scene/
    Scene.tsx                — <Canvas> root, client component, owns render-loop gating
    Pad.tsx                  — board group, positions/rotation driven by scroll progress
    Pages.tsx                — 4 hinged paper sheets
    Cover.tsx                — hinged app-icon cover, texture via useTexture
    Rings.tsx                — 7-ring spiral binding, alternating coral/mint
    Motes.tsx                — 140-point drifting starfield
    Lights.tsx               — ambient + key + coral rim + mint fill
hooks/
  useScrollProgress.ts     — damped scroll progress (replaces onScroll+prog lerp)
  useReducedMotion.ts      — wraps matchMedia("(prefers-reduced-motion: reduce)")
  usePadAnchor.ts           — projects pad's 3D world position to screen-space CSS coords
lib/
  content.ts                — all feature copy, typed, single source (traces to README v1.0.2 per §0)
  constants.ts               — runway height multiplier, narrow breakpoint, damping factor, thresholds — single source, consumed by both CSS (via a generated custom property or JS-driven inline style) and the scene/hooks
public/
  icon-source.<ext>          — real app-icon asset file, replaces the base64 JPEG embed
styles/
  tokens.css                 — the --canvas/--coral/etc custom properties, global
```

## 4. Scroll choreography & state

`useScrollProgress` reads `window.scrollY` on a passive scroll listener, computes `target` from `constants.ts`'s runway multiplier (`1.9` desktop / `1.5` narrow, same as v1) and viewport height, and exposes a damped `progress` value updated every animation frame with the same `prog += (target - prog) * 0.075` lerp and cubic `ease()` used in v1. This value drives both the R3F pad's position/rotation and any DOM-side reveal logic.

Cover-open and page-flip state (`coverOpen`, `flipped`, per-page rotation targets) is a small reducer co-located with `Scene.tsx`. The open/close threshold gets hysteresis — opens at progress ≥ 0.86, closes at ≤ 0.78 — replacing v1's single-threshold + 420ms-timeout mitigation, to kill the fast-scroll flicker (v1 rough edge P2 #6).

`usePadAnchor` reads the pad `Group`'s world position each frame and projects it through the active camera (`vector.project(camera)`) to normalized device coordinates, then to CSS `left`/`top` pixel values. The `Gate` component consumes this hook's output instead of v1's fixed `translate(-50%,-42%)` percentage offset — this is what fixes the gate drifting off the pad's opening on unusual aspect ratios (v1 rough edge P2 #5).

## 5. 3D scene

One-to-one geometric/material port of v1's scene:

| Object | Geometry (unchanged) | Notes |
|---|---|---|
| Board | `BoxGeometry(3.05, 3.85, 0.16)` | `#1C1C1F` |
| Pages ×4 | `PlaneGeometry`, `DoubleSide` | shades `#FEF3E0 → #EBDBC4`, each own hinge `Object3D` at top edge |
| Cover | `PlaneGeometry` + real icon texture (`useTexture`, not base64) | |
| Rings ×7 | `TorusGeometry(.115,.032,10,26)` | alternating coral/mint |
| Motes | `Points`, tiered count (see §6) | |

Lighting unchanged: ambient 0.62 + cool key `#DFE4EC` + coral point light `#F0876E` + mint fill `#8CC8B4`.

Hinge pattern unchanged: every flippable element is a child of an empty `Object3D` at the pad's top edge, mesh offset down by half its height; rotating the parent on X swings it up over the rings, matching the icon's spiral binding.

## 6. Explicit fix list (v1 rough edges resolved by this migration)

**P1 — correctness/accessibility**
1. Feature content ships in normal document flow at all times (`opacity:0` + `pointer-events:none` pre-reveal via CSS state, never the `hidden` attribute) — present to the a11y tree, crawlers, and find-in-page from first paint.
2. A "Skip intro" link in the hero, focus-visible (and optionally always visible, small), jumps to `#features` and sets reveal state true directly — a full keyboard path that never requires interacting with the 3D piece.
3. After the flip interaction, focus moves programmatically to `#features` (`tabindex="-1"` + `.focus()`).
4. Heading order (`h1` wordmark → gate `h2` → section `h2`s) gets one explicit screen-reader pass before this is called done; if the gate's `h2` creates ambiguity while overlaying revealed content, it gets `aria-hidden` toggled with its visibility state.

**P2 — layout fragility**
5. Runway height and narrow-breakpoint are defined once in `lib/constants.ts` and consumed by both the scroll hook and any CSS that needs them (via inline custom-property injection) — no duplicated literals between CSS and JS.
6. `Gate` positions itself from `usePadAnchor`'s projected screen coordinates, not fixed percentages (§4).
7. Cover open/close uses a hysteresis band (0.86 open / 0.78 close) instead of a single threshold + timeout mitigation (§4).
8. Scrolling back up after the flip: state machine explicitly defined — once `flipped` is true, scrolling back up does not re-show the gate or reset pages; `#stage` fades out once `main` content is revealed, matching the "decide and commit" resolution the v1 spec flagged as undecided.

**P3 — performance/portability**
9. `three` is a current npm version (not r128-pinned), so `outputColorSpace`/`SRGBColorSpace` are used natively — no deferred migration debt.
10. Render loop pauses when `#stage`'s wrapper leaves the viewport (`IntersectionObserver`) or the tab is hidden (`document.visibilityState`).
11. Mote count and `dpr` cap are tiered off `navigator.hardwareConcurrency`/`devicePixelRatio` — low-end devices get a lighter scene.
12. Pointer-parallax handler is rAF-throttled (a flag gates at most one update per frame).

**P4 — polish/assets**
13. Favicon and OG/Twitter image are generated via Next's metadata image conventions (`icon.tsx`, `opengraph-image.tsx`) from a real icon asset — link sharing gets a preview card.
14. The icon ships as a real `public/` asset file, loaded via `useTexture`, instead of a base64 JPEG at q88 — removes the close-camera artifacting on flat cream areas.
15. `MediaSlot` component reserved per feature section for future real screenshots/recordings — no assets available yet (confirmed with user), so this ships as an empty, styled placeholder slot, not a fabricated image.
16. Server-rendered content (§3) means a no-JS visit already sees the hero and all feature copy in the initial HTML — resolves the v1 "`<noscript>` shows nothing but the hero" gap as a side effect of the framework switch, no separate `<noscript>` block needed.

## 7. Content inventory (unchanged, v1.0.2-verified)

Carried over verbatim into `lib/content.ts` as typed data:

- Hero chips: iOS 18+, SwiftUI · SwiftData, Local-only, Dark theme, 75 unit tests
- Everything is an entry: unified model; all-day; minutes→365 days + end date; multi-stop locations; expense ledger; GI/HSR/WuWa typed events; Other = session log; entertainment progress + session targets
- Time, four ways: Day/Week/Month/Year; configurable default view; swipe complete/delete; month heat grid; year mini-month contribution maps; Ongoing tab (≥24h windows, Active Now/Starting Soon/Recently Ended); weekly-monthly cycle cadence; dailies excluded from Ongoing
- Notifications: fixed time / relative-to-start / relative-to-end / specific date / if-not-completed-by; editable message text; 64-cap budget (scheduled/remaining/firing today); presets; Live Activity count in Dynamic Island + up to 3 Lock Screen rows
- Places & money: map-first picker, search/pin-drop/current-location, reverse-geocode, live MapKit thumbnail, name+lat/long only; expense lines, running total, equal split, who-owes-you, settlement share/copy
- Your data: JSON backup replace-or-merge (backward-compatible), Markdown recap with pre-computed stats (no in-app LLM), App Lock Face ID/passcode, recovery mode
- Under the hood: Swift/SwiftUI dark; SwiftData; custom `Calendar`/`DateComponents` recurrence (deliberately not EventKit); UserNotifications; ActivityKit + WidgetKit extension; MapKit; XcodeGen; 75 tests
- Deliberately absent: CloudKit sync, widgets, charts, accounts/login, third-party trackers, unofficial game APIs, light theme, in-app LLM calls

Any edit to this data must be re-checked against the LifeOS README v1.0.2 status table per §0.

## 8. Open items / deferred

- Real screenshots/recordings (v1 rough edge P4 #14 in the original spec) — no assets available now. `MediaSlot` reserves the layout; content added in a later pass when assets exist.
- Source icon asset (`public/icon-source.<ext>`) needs to be supplied or extracted from the v1 file's embedded base64 during implementation.
- `git init` was run in `/Users/surajmenon/codes/LifeOS-website` as part of this design step (empty repo, no prior history to disturb) so this spec could be committed and so the Next.js scaffold has a repo to land in.

## 9. Testing

No heavy suite — this is a marketing/portfolio page, not the app itself.

- TypeScript strict mode + ESLint: catches the "duplicated constant" class of bug at compile time now that `lib/constants.ts` is the single source.
- One Playwright smoke test: load page → scroll through runway → click flip → assert `#features` is reachable and receives focus. Run a second time with `prefers-reduced-motion: reduce` emulated, asserting the same end state is reached with near-zero animation duration.
- No visual-regression tooling — not worth the setup cost for a single-page site.

## 10. Explicit non-goals (this migration)

- No CMS, no multi-page routing, no blog.
- No new feature claims — copy is a straight port of §7, unchanged.
- No light theme.
- No App Store/download CTA.
- Not adding real screenshots in this pass (§8).
