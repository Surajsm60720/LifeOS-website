import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia. Default to "no preference" so any
// component that calls useReducedMotion() (e.g. RevealProvider) doesn't
// crash in tests that aren't specifically exercising that hook — those
// tests stub matchMedia themselves with the behavior they need.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
