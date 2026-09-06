import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Questrial } from "next/font/google";
import { getProfile } from "@/lib/queries/profile";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata, personJsonLd, websiteJsonLd } from "@/lib/seo";
import { env } from "@/lib/env";
import { Analytics } from "@/components/site/analytics";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // Variable font — weight is fluid, so no `weight` array alongside `axes`.
  // Only `opsz` is kept: browsers apply it automatically via font-optical-sizing,
  // so display type gets the right cut. SOFT and WONK were declared but never
  // referenced by any font-variation-settings, so they were pure download cost.
  axes: ["opsz"],
  style: ["normal", "italic"],
});

// Inter is a variable font: asking for a weight list forces three static
// cuts and stops Next from emitting a preload link for the body face.
// Leaving `weight` off ships one variable file that covers 400–600.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

// Century Gothic is the house face but it is a licensed desktop font, so it
// can only be *used* where the reader already has it (Windows/Office, most
// Adobe installs). Questrial is the closest geometric Google face — same
// single-storey `a`, same circular bowls — and stands in everywhere else, so
// the site reads identically whether or not Century Gothic is present.
const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-questrial",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  ...buildMetadata({ path: "/" }),
  applicationName: "Conscius Omnium™",
  authors: [{ name: "Shivjeet Potdar" }],
  creator: "Shivjeet Potdar",
  icons: {
    // `app/apple-icon.tsx` supplies the PNG touch icon via the file convention.
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
  ...(env.googleSiteVerification
    ? { verification: { google: env.googleSiteVerification } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);

  return (
    <html lang="en" className={`${questrial.variable} ${fraunces.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="u-no-print sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd(profile), websiteJsonLd(settings)]),
          }}
        />
        <Analytics gaId={env.gaId} plausibleDomain={env.plausibleDomain} />
      </body>
    </html>
  );
}
