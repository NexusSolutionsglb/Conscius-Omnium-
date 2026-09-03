export function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-serif text-sm font-semibold tracking-[0.18em] text-neutral-900">
        CONSCIOUS OMNIUM
      </p>
      <h1 className="mt-4 font-serif text-3xl text-neutral-900">Connect the studio backend</h1>
      <p className="mt-4 leading-relaxed text-neutral-600">
        The public site is already live using the portfolio content bundled with
        the codebase. To manage that content here — works, collections,
        exhibitions, the timeline, enquiries and media — connect a Supabase
        project.
      </p>

      <ol className="mt-8 space-y-4 text-[13px] text-neutral-700">
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
          <li key={i} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="font-medium text-neutral-900">
              {i + 1}. {title}
            </p>
            <p className="mt-1 text-neutral-600">{body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-[12px] text-neutral-400">
        Full instructions are in <code className="rounded bg-neutral-200 px-1">README.md</code>.
        The site keeps working throughout — Supabase only takes over once its
        tables contain rows.
      </p>

      <div className="mt-12 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
        <p className="leading-relaxed">
          <strong className="font-semibold text-neutral-700">Disclaimer:</strong> This website is a sample/demo created solely for presentation and demonstration purposes for the client. It is not intended for reuse or deployment as a production-level website. All designs, visuals, and creative elements presented on this website are copyrighted by Nexus Solutions and may not be reproduced, reused, or distributed without prior written permission.
        </p>
        <p className="mt-2 font-bold tracking-[0.1em] text-neutral-800">
          Owned by Nexus Solutions
        </p>
      </div>
    </div>
  );
}
