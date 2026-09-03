import Link from "next/link";

/**
 * Rendered inside the root layout for URLs that match no route.
 * Route-level `notFound()` calls inside `(site)` use the group's own
 * not-found (with full site chrome).
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-between px-6 py-12 text-center">
      <div className="flex flex-1 flex-col items-center justify-center py-12">
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

      <div className="mx-auto max-w-3xl border-t border-line/60 pt-6 text-center">
        <p className="text-[0.72rem] leading-relaxed text-ink-mute">
          <strong className="font-semibold text-ink">Disclaimer:</strong> This website is a sample/demo created solely for presentation and demonstration purposes for the client. It is not intended for reuse or deployment as a production-level website. All designs, visuals, and creative elements presented on this website are copyrighted by Nexus Solutions and may not be reproduced, reused, or distributed without prior written permission.
        </p>
        <p className="mt-2 text-[0.72rem] font-bold tracking-[0.1em] text-ink">
          Owned by Nexus Solutions
        </p>
      </div>
    </div>
  );
}
