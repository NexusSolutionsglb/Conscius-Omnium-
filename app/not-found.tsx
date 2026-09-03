import Link from "next/link";

/**
 * Rendered inside the root layout for URLs that match no route.
 * Route-level `notFound()` calls inside `(site)` use the group's own
 * not-found (with full site chrome).
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-[clamp(4rem,10vw,9rem)] font-light leading-none text-ink-faint/50">
        404
      </p>
      <h1 className="mt-3 font-display text-[1.7rem] font-light text-ink">
        This page has dissolved.
      </h1>
      <p className="mt-4 max-w-sm text-[0.9rem] text-ink-mute">
        The page you&rsquo;re looking for isn&rsquo;t here.
      </p>
      <Link href="/" className="u-btn mt-8">
        Return home
      </Link>
    </div>
  );
}
