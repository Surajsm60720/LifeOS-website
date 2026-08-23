import { describe, it, expect } from "vitest";
import { heroChips, featureSections, contentPages, closingSection, repoUrl } from "./content";

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

  it("every card has the handwritten caption that goes under its sketch", () => {
    // The two are typed independently but rendered together, so a card
    // missing its caption ships an empty line of Caveat under the drawing.
    for (const section of featureSections) {
      for (const card of section.cards) {
        expect(card.sketch.trim().length).toBeGreaterThan(0);
        expect(card.sketchCaption.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("no two cards share the same sketch — every entry gets its own drawing", () => {
    const kinds = featureSections.flatMap((s) => s.cards).map((c) => c.sketch);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it("the App Lock entry draws Face ID rather than reserving a photo slot", () => {
    const appLock = featureSections.flatMap((s) => s.cards).find((c) => c.tag === "App Lock");
    expect(appLock?.sketch).toBe("faceid");
  });
});

describe("content pages", () => {
  it("has one page per feature section, plus one closing page — no page carries more than one topic", () => {
    expect(contentPages).toHaveLength(featureSections.length + 1);
    for (const page of contentPages) {
      expect(page.sections).toHaveLength(1);
    }
  });

  it("every featureSections entry appears in exactly one page, in order, with none dropped or duplicated, followed by the closing page", () => {
    const referenced = contentPages.flatMap((page) => page.sections);
    expect(referenced.slice(0, featureSections.length)).toEqual(featureSections);
    expect(referenced[featureSections.length]).toBe(closingSection);
  });

  it("no page is empty", () => {
    for (const page of contentPages) {
      expect(page.sections.length).toBeGreaterThan(0);
      expect(page.label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("closing section", () => {
  it("has no empty title/body/tag on any card", () => {
    for (const card of closingSection.cards) {
      expect(card.tag.trim().length).toBeGreaterThan(0);
      expect(card.title.trim().length).toBeGreaterThan(0);
      expect(card.body.trim().length).toBeGreaterThan(0);
      expect(card.sketchCaption.trim().length).toBeGreaterThan(0);
    }
  });

  it("the Source card links to the real repo", () => {
    const source = closingSection.cards.find((c) => c.tag === "Source");
    expect(source?.link?.href).toBe(repoUrl);
    expect(source?.link?.label.length).toBeGreaterThan(0);
  });
});
