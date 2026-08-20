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
