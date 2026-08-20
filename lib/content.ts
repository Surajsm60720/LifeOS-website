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
