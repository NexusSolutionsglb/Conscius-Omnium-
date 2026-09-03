import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
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
  axes: ["SOFT", "opsz", "WONK"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  ...buildMetadata({ path: "/" }),
  applicationName: "Conscious Omnium",
  authors: [{ name: "Shivjeet Potdar" }],
  creator: "Shivjeet Potdar",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
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
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
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
        <Analytics />
      </body>
    </html>
  );
}
