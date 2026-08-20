import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "LifeOS — a calendar for your whole life, on your device",
  description:
    "LifeOS is a local-first iOS calendar for day-to-day plans, gacha-game cadence, and reading progress. No accounts, no sync, no trackers.",
};

export const viewport: Viewport = {
  themeColor: "#0F0F12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
