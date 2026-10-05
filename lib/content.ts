// All copy below is transcribed verbatim from the v1.0.2-verified
// index.html build. Do not add, reword, or expand any entry without
// re-checking it against the LifeOS README v1.0.2 status table
// (see the design spec, §0).

/** Every card gets a hand-drawn accent in place of a photo — one Sketch* component per kind, dispatched in FeatureSection. */
export type SketchKind =
  | "faceid"
  | "dynamicIsland"
  | "heatGrid"
  | "mapPin"
  | "swipeRow"
  | "durationBar"
  | "pulseRow"
  | "quietProgress"
  | "windowFill"
  | "loopMarker"
  | "blockStack"
  | "quotaRing"
  | "splitReceipt"
  | "fileArrow"
  | "markdownLines"
  | "gitBranch"
  | "terminal"
  | "noCloud";
export type FeatureCard = {
  tag: string;
  dotVar: string;
  title: string;
  body: string;
  sketch: SketchKind;
  /** Handwritten line under the sketch. */
  sketchCaption: string;
  /** Real, clickable — only the closing page's "Source" card uses this. */
  link?: { href: string; label: string };
};
export type FeatureSection = {
  id?: string;
  eyebrow: string;
  heading: string;
  lede?: string;
  cards: FeatureCard[];
};
/** Displayed LifeOS marketing version. The weekly sync may replace only this string. */
export const appVersion = "1.0.2";
export const heroEyebrow = `Version ${appVersion}`;
export const heroLede =
  "A calendar that holds your real life, your game cadence, and everything you're part-way through reading — in one entry model, on one device, with no account behind it.";
export const scrollCueText = "Scroll to open";

export const repoUrl = "https://github.com/Surajsm60720/LifeOS";

export const featureSections: FeatureSection[] = [
  {
    id: "features",
    eyebrow: "One model, three lives",
    heading: "Everything is an entry.",
    lede:
      "A dinner, a banner window and chapter 402 are the same object with different capabilities switched on — so the calendar, the reminders and the recap never disagree with each other.",
    cards: [
      {
        tag: "IRL",
        dotVar: "--irl",
        title: "Plans that behave like plans",
        body: "All-day or timed, minutes through 365 days, with an end date. Multi-stop locations, and an expense ledger when the evening costs something.",
        sketch: "durationBar",
        sketchCaption: "minutes to months —",
      },
      {
        tag: "Games",
        dotVar: "--game",
        title: "Cadence you can actually see",
        body: "Dailies, weeklies, banners, patches, livestreams, in-game events — typed per title for Genshin, Star Rail and Wuthering Waves. Other games get a session log instead.",
        sketch: "pulseRow",
        sketchCaption: "same time, every time —",
      },
      {
        tag: "Entertainment",
        dotVar: "--ent",
        title: "Progress without nagging",
        body: "Episodes, chapters and pages with optional per-session targets. Deliberately notification-free — it shows up on the calendar, it never chases you.",
        sketch: "quietProgress",
        sketchCaption: "no nagging —",
      },
    ],
  },
  {
    eyebrow: "Time, four ways",
    heading: "Day, week, month, year.",
    cards: [
      {
        tag: "Calendar",
        dotVar: "--coral",
        title: "Pick your default",
        body: "Four views, a configurable landing view, and swipe-to-complete or delete straight from Day, Week and Month rows.",
        sketch: "swipeRow",
        sketchCaption: "swipe it away —",
      },
      {
        tag: "Heat",
        dotVar: "--coral",
        title: "A year at a glance",
        body: "Month heat grids and year-long mini-month contribution maps — count-based, so a dense week reads as dense.",
        sketch: "heatGrid",
        sketchCaption: "a year, at a glance —",
      },
      {
        tag: "Ongoing",
        dotVar: "--mint",
        title: "Windows, not just start dates",
        body: "A dedicated tab for anything spanning 24 hours or more: Active Now, Starting Soon, and collapsible Recently Ended, with progress and days remaining.",
        sketch: "windowFill",
        sketchCaption: "still going —",
      },
      {
        tag: "Cycles",
        dotVar: "--mint",
        title: "This occurrence to the next",
        body: "Weekly and monthly cadence shows as a live cycle — 16 Aug → 16 Sep, not a calendar-month approximation. Dailies stay out, so the tab never floods.",
        sketch: "loopMarker",
        sketchCaption: "around again —",
      },
    ],
  },
  {
    eyebrow: "Reminders",
    heading: "Notifications that know their limits.",
    lede:
      "iOS allows 64 pending local notifications per app. LifeOS treats that as a budget you can see, not a wall you hit silently.",
    cards: [
      {
        tag: "Rules",
        dotVar: "--violet",
        title: "Built like Shortcuts",
        body: "Fixed time, relative to start, relative to end, a specific date, or only if it's still not done — with editable message text.",
        sketch: "blockStack",
        sketchCaption: "one step at a time —",
      },
      {
        tag: "Budget",
        dotVar: "--violet",
        title: "Scheduled, remaining, firing today",
        body: "A live count of where you stand against the cap, plus presets for end-of-day check-ins, morning dailies and last-day reminders.",
        sketch: "quotaRing",
        sketchCaption: "against the cap —",
      },
      {
        tag: "Live Activity",
        dotVar: "--violet",
        title: "Today, in the Dynamic Island",
        body: "A count badge in the Island and up to three events on the Lock Screen, re-synced whenever you open the app.",
        sketch: "dynamicIsland",
        sketchCaption: "today, right there —",
      },
    ],
  },
  {
    eyebrow: "Places & money",
    heading: "Where you went, what it cost.",
    cards: [
      {
        tag: "Map-first",
        dotVar: "--gi",
        title: "Search, drop a pin, or use where you are",
        body: "Reverse-geocoding fills the name after a pin drop, and rows show a live MapKit thumbnail. Only a name and coordinates are ever stored.",
        sketch: "mapPin",
        sketchCaption: "drop a pin —",
      },
      {
        tag: "Hangout ledger",
        dotVar: "--gi",
        title: "Split the evening, not the app",
        body: "Line items with a running total, an equal split across freestyle names, who-owes-you balances, and a settlement summary you can share or copy.",
        sketch: "splitReceipt",
        sketchCaption: "split three ways —",
      },
    ],
  },
  {
    eyebrow: "Your data",
    heading: "It stays on the phone.",
    cards: [
      {
        tag: "Backup",
        dotVar: "--gold",
        title: "JSON, replace or merge",
        body: "Full-library export and import as a file you own. Older backups stay importable; only newer-version files are refused, with a reason.",
        sketch: "fileArrow",
        sketchCaption: "yours either way —",
      },
      {
        tag: "Recap",
        dotVar: "--gold",
        title: "Markdown built for summarising",
        body: "A date-ranged export with pre-computed stats, written to be pasted into an LLM by hand — the app never calls one itself.",
        sketch: "markdownLines",
        sketchCaption: "written for you —",
      },
      {
        tag: "App Lock",
        dotVar: "--gold",
        title: "Face ID on return",
        body: "Optional biometric or passcode lock that covers sheets too, plus a recovery mode that degrades gracefully instead of crash-looping if the store fails to open.",
        sketch: "faceid",
        sketchCaption: "just your face —",
      },
    ],
  },
];

// The closing page of the notebook — same card-row shape as every
// feature section, so it turns like one of them rather than reading as
// a bolted-on footer. Kept separate from featureSections (not a real
// feature, and content.test.ts's per-section checks shouldn't have to
// account for a page with no eyebrow/tag semantics in common with them).
export const closingSection: FeatureSection = {
  eyebrow: "Build it yourself",
  heading: "Yours to clone and run.",
  lede: "A personal project, not an App Store release — open it in Xcode with your own signing team, and it's yours.",
  cards: [
    {
      tag: "Source",
      dotVar: "--coral",
      title: "Clone the repo",
      body: "Full source, no signing keys or backend to stand up first.",
      sketch: "gitBranch",
      sketchCaption: "fork it —",
      link: { href: repoUrl, label: repoUrl.replace("https://", "") },
    },
    {
      tag: "Stack",
      dotVar: "--mint",
      title: "Swift, SwiftUI, SwiftData",
      body: "iOS 18+, no third-party dependencies.",
      sketch: "terminal",
      sketchCaption: "built plainly —",
    },
    {
      tag: "Data",
      dotVar: "--violet",
      title: "Local-first by design",
      body: `v${appVersion} — no account, no server, nothing to sync.`,
      sketch: "noCloud",
      sketchCaption: "stays on the phone —",
    },
  ],
};

// One notebook page per section — previously pages 2 and 3 each carried
// two whole sections (7 and 5 cards) against page 1's 3, so the "book"
// read as badly unbalanced. One-per-page gives 3/4/3/2/3 cards a page,
// close enough to even that no page reads as the short one or the slog.
// The closing page rides along as a sixth page in the same pagination —
// there's no separate footer section any more, so nothing else needs to
// know where the "book" actually ends.
export type ContentPage = { label: string; sections: FeatureSection[] };

export const contentPages: ContentPage[] = [
  { label: "01", sections: [featureSections[0]] },
  { label: "02", sections: [featureSections[1]] },
  { label: "03", sections: [featureSections[2]] },
  { label: "04", sections: [featureSections[3]] },
  { label: "05", sections: [featureSections[4]] },
  { label: "06", sections: [closingSection] },
];
