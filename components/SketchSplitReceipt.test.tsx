import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SketchSplitReceipt } from "./SketchSplitReceipt";

describe("SketchSplitReceipt", () => {
  it("the drawn total actually equals the sum of the drawn line items", () => {
    // Regression guard for the "$18 + $24 = $62" bug — a reader who can
    // do arithmetic notices a wrong total immediately, and reads it as
    // the app itself being unable to add.
    render(<SketchSplitReceipt caption="test" />);
    const amounts = screen.getAllByText(/^\$\d+$/).map((el) => Number(el.textContent!.slice(1)));
    const total = amounts.pop();
    expect(total).toBe(amounts.reduce((sum, n) => sum + n, 0));
  });
});
