import { describe, it, expect } from "vitest";
import { heroChips, featureSections, contentPages } from "./content";

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

  it("every card with a sketch also has the handwritten caption that goes under it", () => {
    // The two are typed independently but rendered together, so a sketch
    // without its caption ships an empty line of Caveat under the drawing.
    for (const section of featureSections) {
      for (const card of section.cards) {
        if (!card.sketch) continue;
        expect(card.sketchCaption?.trim().length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("the App Lock entry draws Face ID rather than reserving a photo slot", () => {
    const appLock = featureSections.flatMap((s) => s.cards).find((c) => c.tag === "App Lock");
    expect(appLock?.sketch).toBe("faceid");
  });
});

describe("content pages", () => {
  it("has exactly 3 pages, matching the pad's 4 physical pages minus the removed spec/absent page", () => {
    expect(contentPages).toHaveLength(3);
  });

  it("every featureSections entry appears in exactly one page, in order, with none dropped or duplicated", () => {
    const referenced = contentPages.flatMap((page) => page.sections);
    expect(referenced).toEqual(featureSections);
  });

  it("no page is empty", () => {
    for (const page of contentPages) {
      expect(page.sections.length).toBeGreaterThan(0);
      expect(page.label.trim().length).toBeGreaterThan(0);
    }
  });
});
