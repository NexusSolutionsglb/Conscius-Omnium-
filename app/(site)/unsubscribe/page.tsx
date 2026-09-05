import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeByToken } from "@/lib/actions/newsletter";
import { buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/primitives";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Unsubscribe",
    description: "Manage your subscription to the Conscius Omnium™ studio letter.",
    path: "/unsubscribe",
  }),
  robots: { index: false, follow: false },
};

const COPY = {
  unsubscribed: {
    eyebrow: "Unsubscribed",
    heading: "You've been removed from the list.",
    body: "You will not receive the studio letter again. Nothing else changes — any enquiry you have open with the studio is unaffected.",
  },
  already: {
    eyebrow: "Already unsubscribed",
    heading: "You're not on the list.",
    body: "This address was already removed. If letters are still arriving, they may be going to a different address.",
  },
  unknown: {
    eyebrow: "Link not recognised",
    heading: "That link has expired.",
    body: "The unsubscribe link couldn't be matched to a subscription. Write to info@consciusomnium.com and the studio will remove you by hand.",
  },
  unavailable: {
    eyebrow: "Temporarily unavailable",
    heading: "Something went wrong.",
    body: "The list couldn't be reached just now. Please try the link again shortly, or write to info@consciusomnium.com.",
  },
} as const;

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await unsubscribeByToken(token) : { outcome: "unknown" as const };
  const copy = COPY[result.outcome];
  const removed = result.outcome === "unsubscribed" || result.outcome === "already";

  return (
    <div className="u-container pb-28 pt-36 md:pb-36 md:pt-44">
      <div className="max-w-xl">
        <Reveal>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(2rem,1.3rem+2.6vw,3.2rem)] font-light leading-[1.08]">
            {copy.heading}
          </h1>
          <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-soft">{copy.body}</p>
          {"email" in result && result.email && (
            <p className="mt-3 text-[0.85rem] text-ink-mute">{result.email}</p>
          )}
        </Reveal>

        {removed && (
          <Reveal delay={0.1} className="mt-12 border-t border-line pt-10">
            <p className="u-eyebrow text-ink-faint">Changed your mind?</p>
            <p className="mt-3 max-w-md text-[0.85rem] leading-relaxed text-ink-soft">
              You can rejoin at any time — the same address works.
            </p>
            <div className="mt-6 max-w-sm">
              <NewsletterForm source="unsubscribe-page" compact />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15} className="mt-12">
          <Link href="/" className="u-btn">
            Return to the site
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
