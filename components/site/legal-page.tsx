import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";

/** Single source of truth for the "last updated" line on both legal pages. */
export const LEGAL_UPDATED = "4 September 2026";

/**
 * The editorial shell both legal documents share — same rhythm and type scale
 * as the rest of the site, with a sticky contents rail on wide screens so a
 * long document stays navigable.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
  contactEmail,
  contactLocation,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { id: string; heading: string; body: React.ReactNode }[];
  contactEmail: string;
  contactLocation: string;
}) {
  return (
    <div className="u-container pb-24 pt-32 md:pb-32 md:pt-40">
      <nav aria-label="Breadcrumb" className="u-eyebrow">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden className="text-ink-faint">
            /
          </li>
          <li aria-current="page" className="text-ink-soft">
            {eyebrow}
          </li>
        </ol>
      </nav>

      <TextReveal
        as="h1"
        text={title}
        className="mt-6 max-w-3xl font-display text-[clamp(2.1rem,1.3rem+3.4vw,3.8rem)] font-light leading-[1.05]"
      />

      <Reveal delay={0.08} className="mt-7 max-w-2xl">
        <p className="u-lead">{intro}</p>
        <p className="u-eyebrow mt-6">Last updated — {LEGAL_UPDATED}</p>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-3">
          <nav aria-label="On this page" className="lg:sticky lg:top-28">
            <p className="u-eyebrow">Contents</p>
            <ol className="mt-4 flex flex-col gap-2.5 border-l border-line pl-4">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="u-tap block text-[0.82rem] leading-snug text-ink-mute transition-colors hover:text-ink"
                  >
                    <span className="mr-2 text-ink-faint tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="lg:col-span-9 lg:border-l lg:border-line lg:pl-16">
          <div className="u-legal">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className={i === 0 ? "!mt-0 font-display" : "font-display"}>
                  <span className="mr-3 text-[0.6em] align-middle text-ink-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.heading}
                </h2>
                {s.body}
              </section>
            ))}

            <section id="contact" className="scroll-mt-28">
              <h2 className="font-display">
                <span className="mr-3 text-[0.6em] align-middle text-ink-faint tabular-nums">
                  {String(sections.length + 1).padStart(2, "0")}
                </span>
                Contact
              </h2>
              <p>
                Questions about this document, or a request concerning your
                information, can be sent to{" "}
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. The studio
                is based in {contactLocation}.
              </p>
            </section>
          </div>

          <div className="mt-16 border-t border-line pt-8">
            <Link href="/contact" className="u-btn">
              Contact the studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
