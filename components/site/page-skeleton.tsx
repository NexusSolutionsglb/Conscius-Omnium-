/**
 * The site's loading state. Deliberately quiet: a hairline that draws itself
 * across the page and the ghost of the layout underneath, so a slow route
 * reads as "still arriving" rather than "broken". No spinners.
 */
export function PageSkeleton({
  variant = "index",
}: {
  variant?: "index" | "detail";
}) {
  return (
    <div
      className="u-container pb-24 pt-32 md:pt-40"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>

      {/* Drawing hairline — the one moving element. */}
      <div className="h-px w-full overflow-hidden bg-line">
        <div className="u-skeleton-rule h-full w-1/3 bg-ink/25" />
      </div>

      <div aria-hidden className="u-skeleton mt-12">
        <div className="h-3 w-32 bg-paper-deep" />
        <div className="mt-6 h-[clamp(2.4rem,5vw,4.4rem)] w-[min(38rem,90%)] bg-paper-deep" />
        <div className="mt-4 h-[clamp(2.4rem,5vw,4.4rem)] w-[min(24rem,64%)] bg-paper-deep" />
        <div className="mt-9 h-3 w-[min(30rem,88%)] bg-paper-dim" />
        <div className="mt-3 h-3 w-[min(26rem,76%)] bg-paper-dim" />

        {variant === "detail" ? (
          <div className="mt-14 aspect-[16/9] w-full bg-paper-deep" />
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] w-full bg-paper-deep" />
                <div className="mt-4 h-3 w-2/3 bg-paper-dim" />
                <div className="mt-2 h-2.5 w-1/3 bg-paper-dim" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
