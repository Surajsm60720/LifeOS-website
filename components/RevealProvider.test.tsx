import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RevealProvider, useReveal } from "./RevealProvider";

function Probe() {
  const { revealed, contentVisible, padState, dispatchScroll, flip, skipToRevealed } = useReveal();
  return (
    <>
      <span data-testid="state">{revealed ? "revealed" : "hidden"}</span>
      <span data-testid="content">{contentVisible ? "visible" : "hidden"}</span>
      <span data-testid="coverOpen">{padState.coverOpen ? "open" : "closed"}</span>
      <button onClick={() => dispatchScroll(0.9)}>scroll-in</button>
      <button onClick={() => dispatchScroll(0.5)}>scroll-back</button>
      <button onClick={flip}>flip</button>
      <button onClick={skipToRevealed}>skip</button>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("RevealProvider", () => {
  it("starts hidden with the cover closed", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("hidden");
    expect(screen.getByTestId("coverOpen")).toHaveTextContent("closed");
  });

  it("scrolling in opens the cover, and flip reveals content", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    fireEvent.click(screen.getByText("scroll-in"));
    expect(screen.getByTestId("coverOpen")).toHaveTextContent("open");
    expect(screen.getByTestId("state")).toHaveTextContent("hidden");
    fireEvent.click(screen.getByText("flip"));
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
  });

  it("flip reveals `revealed` (Gate hides) instantly, but delays `contentVisible` until the page-flip animation finishes", () => {
    vi.useFakeTimers();
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => fireEvent.click(screen.getByText("scroll-in")));
    act(() => fireEvent.click(screen.getByText("flip")));
    // Gate must hide immediately — no waiting on the 3D animation.
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
    // But the content crossfade must not have started yet.
    expect(screen.getByTestId("content")).toHaveTextContent("hidden");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("visible");
  });

  it("scrolling back out after flip closes everything again — reversible", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    fireEvent.click(screen.getByText("scroll-in"));
    fireEvent.click(screen.getByText("flip"));
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
    fireEvent.click(screen.getByText("scroll-back"));
    expect(screen.getByTestId("state")).toHaveTextContent("hidden");
    expect(screen.getByTestId("content")).toHaveTextContent("hidden");
    expect(screen.getByTestId("coverOpen")).toHaveTextContent("closed");
  });

  it("skipToRevealed jumps straight to revealed and content-visible without needing scroll or a delay", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("skip"));
    });
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
    expect(screen.getByTestId("content")).toHaveTextContent("visible");
    expect(screen.getByTestId("coverOpen")).toHaveTextContent("open");
  });

  it("throws if useReveal is used outside the provider", () => {
    function Bare() {
      useReveal();
      return null;
    }
    expect(() => render(<Bare />)).toThrow();
  });
});
