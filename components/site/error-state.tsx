import Link from "next/link";

/**
 * Shared editorial empty / error state. No raw framework errors ever
 * reach a visitor.
 */
export function ErrorState({
  code,
  title,
  message,
  action,
}: {
  code?: string;
  title: string;
  message: string;
  action?: { label: string; href: string };
}) {
  return (
    <section className="u-container flex min-h-[70svh] flex-col items-center justify-center py-32 text-center">
      {code && (
        <p className="font-display text-[clamp(4rem,10vw,9rem)] font-light leading-none text-ink-faint/50">
          {code}
        </p>
      )}
      <h1 className="mt-4 font-display text-[clamp(1.6rem,1rem+2.4vw,2.6rem)] font-light text-ink">
        {title}
      </h1>
      <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-ink-mute">
        {message}
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href={action?.href ?? "/"} className="u-btn">
          {action?.label ?? "Return home"}
        </Link>
        {action && (
          <Link href="/work" className="u-btn u-btn--ghost">
            View the work
          </Link>
        )}
      </div>
    </section>
  );
}
