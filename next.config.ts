import type { NextConfig } from "next";

// Every route on this site is static (no forms, no API routes, no
// external fetches) — the CSP below is written for that reality, not
// loosened defensively for capabilities the app doesn't use. Fonts are
// self-hosted via next/font (no runtime connection to Google's CDN),
// the R3F/Three.js canvas needs no worker or wasm allowance, and the
// only cross-origin reference anywhere in the codebase is a plain
// <a href> to GitHub, which CSP doesn't govern.
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is here for Next's own inline hydration/RSC
  // bootstrap scripts, not anything this app renders — confirmed by
  // testing script-src 'self' alone in a production build: React
  // hydration failed outright (error #412) because Next's inline
  // scripts got blocked. A nonce-based strict CSP is the alternative,
  // but that requires per-request middleware and forces this site out
  // of static rendering — real cost, for a site with no XSS injection
  // vector to defend against in the first place (no
  // dangerouslySetInnerHTML anywhere, no user input ever rendered as
  // HTML). The other directives below still do real work: no framing,
  // no plugin objects, no unexpected outbound connections.
  "script-src 'self' 'unsafe-inline'",
  // Inline `style` attributes are used throughout (per-card accent
  // colors, animation custom properties) — same reasoning as above.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt-and-suspenders with frame-ancestors above — older browsers
  // that don't honor CSP's frame-ancestors still respect this.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site touches any of these; deny them outright
  // rather than leaving the default (usually allow-if-same-origin).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Only takes effect over HTTPS (which is all Vercel serves in
  // production) — harmless to set unconditionally.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
