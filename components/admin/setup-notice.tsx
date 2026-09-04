import Image from "next/image";

export function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <Image
        src="/logo/mark-black.png"
        alt="Conscius Omnium™"
        width={1600}
        height={381}
        className="h-6 w-auto object-contain"
      />
      <h1 className="mt-4 font-display text-3xl font-normal text-ink">Connect the studio backend</h1>
      <p className="mt-4 leading-relaxed text-ink-soft">
        The public site is already live using the portfolio content bundled with
        the codebase. To manage that content here — works, collections,
        exhibitions, the timeline, enquiries and media — connect a Supabase
        project.
      </p>

      <ol className="mt-8 space-y-4 text-[13px] text-ink-soft">
        {[
          [
            "Create a Supabase project",
            "supabase.com → New project. Copy the Project URL and the anon + service_role keys from Settings → API.",
          ],
          [
            "Add environment variables",
            "Copy .env.example to .env.local and fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
          ],
          [
            "Run the migration",
            "supabase link --project-ref <ref> then supabase db push — creates every table, RLS policy and storage bucket from supabase/migrations.",
          ],
          [
            "Seed the portfolio",
            "npm run seed — pushes the bundled content into the database so nothing is lost.",
          ],
          [
            "Create your admin login",
            "In Supabase → Authentication → Users, add a user with your email + a password. That account can sign in here.",
          ],
        ].map(([title, body], i) => (
          <li key={i} className="rounded-lg border border-line bg-paper p-4">
            <p className="font-medium text-ink">
              {i + 1}. {title}
            </p>
            <p className="mt-1 text-ink-soft">{body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-[12px] text-ink-faint">
        Full instructions are in <code className="rounded bg-paper-dim px-1">README.md</code>.
        The site keeps working throughout — Supabase only takes over once its
        tables contain rows.
      </p>

      <div className="mt-12 border-t border-line pt-6 flex justify-center">
        <a
          href="https://nexusolutions.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border-2 border-neutral-200 bg-white px-6 py-3.5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
        >
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Developed by
          </span>
          <div className="h-5 w-px bg-neutral-200" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nexus-logo-horizontal.png"
            alt="Nexus Solutions"
            className="h-10 w-auto object-contain"
          />
        </a>
      </div>
    </div>
  );
}
