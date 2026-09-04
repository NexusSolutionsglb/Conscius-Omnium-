import Link from "next/link";

export type ErrorStateLink = { label: string; href: string; hint?: string };

/**
 * Shared editorial empty / error state. No raw framework error ever reaches a
 * visitor; every dead end offers a way back into the work.
 */
export function ErrorState({
  code,
  title,
  message,
  action,
  suggestions,
  children,
}: {
  code?: string;
  title: string;
  message: string;
  action?: { label: string; href: string };
  /** Signposts rendered below the primary action — keeps a dead end navigable. */
  suggestions?: ErrorStateLink[];
  children?: React.ReactNode;
}) {
  return (
    <section className="u-container flex min-h-[70svh] flex-col items-center justify-center py-28 text-center md:py-32">
      {code && (
        <p
          aria-hidden
          className="font-display text-[clamp(4.5rem,12vw,10rem)] font-light leading-[0.85] tracking-[-0.03em] text-ink/10"
        >
          {code}
        </p>
      )}
      <h1 className="mt-6 font-display text-[clamp(1.7rem,1rem+2.4vw,2.7rem)] font-light text-ink">
        {title}
      </h1>
      <p className="u-lead mt-5 max-w-md text-ink-mute">{message}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href={action?.href ?? "/"} className="u-btn">
          {action?.label ?? "Return home"}
        </Link>
        <Link href="/work" className="u-btn u-btn--ghost">
          View the work
        </Link>
      </div>

      {suggestions && suggestions.length > 0 && (
        <nav
          aria-label="Suggested pages"
          className="mt-16 w-full max-w-2xl border-t border-line pt-10 text-left"
        >
          <p className="u-eyebrow text-center">Or continue from here</p>
          <ul className="mt-7 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.href} className="bg-paper">
                <Link
                  href={s.href}
                  className="group flex h-full flex-col justify-center gap-1 px-5 py-5 transition-colors hover:bg-paper-dim"
                >
                  <span className="font-display text-[1.05rem] text-ink">{s.label}</span>
                  {s.hint && (
                    <span className="text-[0.78rem] leading-relaxed text-ink-mute">{s.hint}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {children}
    </section>
  );
}

/** The signposts shown on every 404 — one entry per top-level destination. */
export const NOT_FOUND_SUGGESTIONS: ErrorStateLink[] = [
  { label: "Selected Work", href: "/work", hint: "Architecture, miniatures, photography, film" },
  { label: "About", href: "/about", hint: "The practice and the person behind it" },
  { label: "Studio & Process", href: "/studio", hint: "How the work is actually made" },
  { label: "Contact", href: "/contact", hint: "Commissions, collaborations, enquiries" },
];
