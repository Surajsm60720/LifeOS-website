import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RevealProvider, useReveal } from "./RevealProvider";

function Probe() {
  const {
    revealed,
    contentVisible,
    visualCoverOpen,
    notebookReached,
    setNotebookReached,
    padState,
    dispatchScroll,
    flip,
    skipToRevealed,
  } = useReveal();
  return (
    <>
      <span data-testid="state">{revealed ? "revealed" : "hidden"}</span>
      <span data-testid="content">{contentVisible ? "visible" : "hidden"}</span>
      <span data-testid="coverOpen">{padState.coverOpen ? "open" : "closed"}</span>
      <span data-testid="visualCoverOpen">{visualCoverOpen ? "open" : "closed"}</span>
      <span data-testid="notebookReached">{notebookReached ? "visible" : "hidden"}</span>
      <span data-testid="pageTargets">{padState.pageTargets.join(",")}</span>
      <button onClick={() => dispatchScroll(0.9)}>scroll-in</button>
      <button onClick={() => dispatchScroll(0.5)}>scroll-back</button>
      <button onClick={flip}>flip</button>
      <button onClick={skipToRevealed}>skip</button>
      <button onClick={() => setNotebookReached(true)}>notebook-in</button>
      <button onClick={() => setNotebookReached(false)}>notebook-out</button>
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

  it("flip reveals `revealed` instantly, but content stays hidden until the visitor's own scroll actually reaches the notebook", () => {
    vi.useFakeTimers();
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => fireEvent.click(screen.getByText("scroll-in")));
    act(() => fireEvent.click(screen.getByText("flip")));
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
    // The content crossfade must not start on flip() alone, even after
    // plenty of time passes — flip() is now purely the pad's own 3D
    // animation. Otherwise a visitor who pauses scrolling right after
    // the cover opens would see the pad vanish with nothing revealed
    // behind it yet (the notebook only becomes visible once its own
    // section is actually scrolled to).
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("hidden");
    // Only once the visitor's scroll genuinely arrives does it reveal.
    act(() => fireEvent.click(screen.getByText("notebook-in")));
    expect(screen.getByTestId("content")).toHaveTextContent("visible");
  });

  it("auto-flips the pad open on its own once the cover opens — no click needed", () => {
    vi.useFakeTimers();
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => fireEvent.click(screen.getByText("scroll-in")));
    // Immediately after crossing the threshold, nothing has flipped yet
    // — there's a deliberate beat so it doesn't race the cover's own
    // opening swing.
    expect(screen.getByTestId("state")).toHaveTextContent("hidden");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // No "flip" click anywhere in this test — scrolling in alone did it.
    expect(screen.getByTestId("state")).toHaveTextContent("revealed");
    expect(screen.getByTestId("pageTargets").textContent?.split(",").every((v) => v !== "0")).toBe(true);
  });

  it("cancels the pending auto-flip if scroll leaves the cover-open range before it fires", () => {
    vi.useFakeTimers();
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => fireEvent.click(screen.getByText("scroll-in")));
    act(() => fireEvent.click(screen.getByText("scroll-back")));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // The auto-flip timer scheduled by the first click must have been
    // cancelled, not merely delayed — otherwise it fires late, after the
    // visitor has already scrolled back out.
    expect(screen.getByTestId("state")).toHaveTextContent("hidden");
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

  it("closing staggers pageTargets back to 0 one at a time, not all in the same tick", () => {
    vi.useFakeTimers();
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => fireEvent.click(screen.getByText("skip"))); // instant full-open, all 4 pages non-zero
    const openTargets = screen.getByTestId("pageTargets").textContent;
    expect(openTargets?.split(",").every((v) => v !== "0")).toBe(true);

    act(() => fireEvent.click(screen.getByText("scroll-back")));
    // coverOpen/flipped/content reset immediately...
    expect(screen.getByTestId("coverOpen")).toHaveTextContent("closed");
    // ...but the pages must NOT have all snapped to 0 in this same tick —
    // that's the exact bug being fixed (closing was too fast to see).
    expect(screen.getByTestId("pageTargets").textContent).toBe(openTargets);

    // Advance past the full stagger — now every page should be closed.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("pageTargets")).toHaveTextContent("0,0,0,0");
  });

  it("holds the 3D cover visually open until the page stagger finishes, so it doesn't slam shut and hide it", () => {
    vi.useFakeTimers();
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    act(() => fireEvent.click(screen.getByText("skip")));
    expect(screen.getByTestId("visualCoverOpen")).toHaveTextContent("open");

    act(() => fireEvent.click(screen.getByText("scroll-back")));
    // padState.coverOpen (Gate's signal) is already closed...
    expect(screen.getByTestId("coverOpen")).toHaveTextContent("closed");
    // ...but the 3D cover must still be held open while pages stagger shut.
    expect(screen.getByTestId("visualCoverOpen")).toHaveTextContent("open");

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("visualCoverOpen")).toHaveTextContent("closed");
  });

  it("closes the cover immediately if it was never flipped open — nothing to stagger", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    fireEvent.click(screen.getByText("scroll-in"));
    expect(screen.getByTestId("visualCoverOpen")).toHaveTextContent("open");
    fireEvent.click(screen.getByText("scroll-back"));
    expect(screen.getByTestId("visualCoverOpen")).toHaveTextContent("closed");
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

  it("starts with notebookReached false, and reports it independently of whether the pad was ever flipped", () => {
    render(
      <RevealProvider>
        <Probe />
      </RevealProvider>
    );
    expect(screen.getByTestId("notebookReached")).toHaveTextContent("hidden");
    // Never flipped, never even scrolled — MainReveal's own IntersectionObserver
    // is the only thing that sets this, independent of padState entirely.
    fireEvent.click(screen.getByText("notebook-in"));
    expect(screen.getByTestId("notebookReached")).toHaveTextContent("visible");
    fireEvent.click(screen.getByText("notebook-out"));
    expect(screen.getByTestId("notebookReached")).toHaveTextContent("hidden");
  });

  it("throws if useReveal is used outside the provider", () => {
    function Bare() {
      useReveal();
      return null;
    }
    expect(() => render(<Bare />)).toThrow();
  });
});
