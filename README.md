# LifeOS website

Marketing site for [LifeOS](https://github.com/Surajsm60720/LifeOS), rebuilt on Next.js from the original single-file `index.html` prototype.

## Stack

Next.js 16 (App Router) · TypeScript · CSS Modules · React Three Fiber

## Experience

- **Hero** — static intro, with a keyboard-accessible "skip intro" link straight to the feature content.
- **3D pad** (`ExperienceStage`) — a React Three Fiber calendar-pad that opens as you scroll. Once open, it flips its pages on its own after a short beat — no click required — and crossfades into the notebook.
- **Notebook** (`MainReveal`) — the feature list as a paginated, snap-scrolled notebook (six pages: five feature sections plus a closing page with the repo link, stack, and local-first note), turned with a hand-drawn page-curl animation on wheel, touch, or arrow keys.

All feature copy renders through a small hand-drawn "sketch" component per card (one `Sketch*.tsx` per `SketchKind` in `lib/content.ts`) rather than photos.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test       # unit tests (Vitest)
npm run e2e    # end-to-end + accessibility (Playwright + axe)
npm run lint   # ESLint
```

## Deployment

Static-only (no forms, no API routes, no external fetches) — deploys to Vercel with zero config. `next.config.ts` sets a strict Content-Security-Policy plus the usual security headers (frame-ancestors, nosniff, HSTS, etc.).

Optional: set `NEXT_PUBLIC_SITE_URL` to your custom domain if you use one. Without it, `metadataBase` (OG images, canonical URLs) falls back to Vercel's own auto-injected production URL, so it resolves correctly out of the box either way.

## Design & implementation docs

- `docs/superpowers/specs/2026-08-20-lifeos-website-nextjs-migration-design.md`
- `docs/superpowers/plans/2026-08-20-lifeos-website-nextjs-migration.md`

## Content policy

All feature copy is transcribed from the [LifeOS](https://github.com/Surajsm60720/LifeOS) README's status table at v1.0.2. Do not add or reword a feature claim without re-verifying it against that README — see the design spec §0.
