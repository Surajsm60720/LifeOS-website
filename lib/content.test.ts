import { describe, it, expect } from "vitest";
import {
  heroChips,
  featureSections,
  specRows,
  deliberatelyAbsent,
  contentPages,
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

describe("content pages", () => {
  it("has exactly 4 pages, matching the pad's 4 physical pages", () => {
    expect(contentPages).toHaveLength(4);
  });

  it("every featureSections entry appears in exactly one page, in order, with none dropped or duplicated", () => {
    const referenced = contentPages
      .flatMap((page) => page.blocks)
      .filter((block) => block.kind === "feature")
      .map((block) => block.section);
    expect(referenced).toEqual(featureSections);
  });

  it("has exactly one spec block and one absent block, both on the last page", () => {
    const allBlocks = contentPages.flatMap((page) => page.blocks);
    expect(allBlocks.filter((b) => b.kind === "spec")).toHaveLength(1);
    expect(allBlocks.filter((b) => b.kind === "absent")).toHaveLength(1);
    const lastPageKinds = contentPages[contentPages.length - 1].blocks.map((b) => b.kind);
    expect(lastPageKinds).toEqual(["spec", "absent"]);
  });

  it("no page is empty", () => {
    for (const page of contentPages) {
      expect(page.blocks.length).toBeGreaterThan(0);
      expect(page.label.trim().length).toBeGreaterThan(0);
    }
  });
});
