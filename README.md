# Conscious Omnium

The digital identity of **Shivjeet Potdar** — architect, interior and production
designer, and filmmaker. A cross-disciplinary portfolio: built space, the
photographed miniature, the render and the screen.

Built as a production Next.js application with a full CMS. **It runs with zero
configuration** — the entire portfolio is bundled as typed content and served
immediately. Connect Supabase to manage everything through `/admin`; connect
Resend to deliver enquiry emails. Nothing breaks in between.

---

## Stack

| Area          | Choice                                                          |
| ------------- | ------------------------------------------------------------------ |
| Framework     | Next.js 15 (App Router, RSC, Route Handlers), React 19, TypeScript |
| Styling       | Tailwind CSS v4 (CSS-first `@theme` tokens)                        |
| Type          | Fraunces (variable display serif) + Inter, via `next/font`         |
| Motion        | `motion` (Framer Motion) · Lenis smooth scroll · GSAP where useful |
| Data          | Supabase (Postgres + Auth + Storage + RLS)                         |
| Email         | Resend (transactional enquiry emails)                              |
| WhatsApp      | `wa.me` **share links** — pre-filled messages, no Business API     |

### One content entity

Shivjeet's practice spans disciplines, so the site uses **one** primary entity —
`Work` — carrying a `discipline` (`architecture`, `production-design`, `film`,
`photography`, `experimental`, `graphic`, …) rather than separate "Artwork" and
"Project" models. Public routes stay `/work` and `/work/[slug]`.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the site runs without it
npm run dev
```

Open <http://localhost:3000>. The public site is fully populated from
`lib/content/`. `/admin` shows a setup checklist until Supabase is connected.

---

## Connecting the backend

### 1 · Supabase

1. Create a project at [supabase.com](https://supabase.com). From **Settings →
   API** copy the Project URL, the `anon` key and the `service_role` key.
2. Fill `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Run the migration — creates every table, index, RLS policy and the `media`
   storage bucket:

   ```bash
   npm i -g supabase
   supabase link --project-ref <your-ref>
   supabase db push
   ```

   (Or paste `supabase/migrations/0001_init.sql` into the Supabase SQL editor.)

4. Seed the portfolio into the database:

   ```bash
   npm run seed
   ```

5. Create your admin login: **Supabase → Authentication → Users → Add user**,
   with your email + a password. Sign-ups are disabled; only users you create
   can reach `/admin`.

The public site now reads from the database. Every query falls back to the
bundled content if a table is empty, so step 4 is what "turns on" the CMS.

### 2 · Resend (enquiry emails)

```
RESEND_API_KEY=re_...
RESEND_FROM="Conscious Omnium <studio@yourdomain.com>"
INQUIRY_NOTIFY_EMAIL=architectshivjeet@gmail.com
```

Verify your sending domain in Resend. Without this, enquiries are still stored
and still generate a WhatsApp link — they just don't email.

### 3 · WhatsApp

```
NEXT_PUBLIC_WHATSAPP_NUMBER=919972910950   # country code + number, digits only
```

Used to build `https://wa.me/<number>?text=<message>` links throughout the site.
The enquiry message is assembled **dynamically** from each work's record.

### 4 · Analytics (optional)

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=consciousomnium.com   # or
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Nothing loads unless one is set.

---

## The admin (`/admin`)

Supabase-authenticated. Clean CMS UI, distinct from the public site.

| Section       | Manages                                                             |
| ------------- | ------------------------------------------------------------------- |
| Dashboard     | Counts, recent enquiries, quick actions                             |
| Works         | Full editor — every field, drag-order images, cover, status, SEO, availability, pricing, related works, duplicate / publish / feature |
| Collections   | Series that group works                                             |
| Exhibitions   | Chronological archive                                               |
| Timeline      | "His story" — the 1995–2017 visual autobiography                    |
| Media         | Upload to Supabase Storage, filter, copy URL, delete                |
| Pages         | About / Studio / Contact body content and section blocks           |
| Profile       | Name, roles, bio, education, contact, socials, portrait             |
| Settings      | Identity, home hero, footer, contact copy, default SEO             |
| Enquiries     | Inbox with status workflow, internal notes, email / WhatsApp reply |

Edits call server actions that validate with Zod, write through RLS, and
`revalidatePath()` the affected public routes.

---

## Content & imagery

* `lib/content/` — the portfolio, transcribed from Shivjeet's 2019 monograph.
  **No exhibitions, prices, clients, press or dates are invented**; unknown
  fields are `null` for the admin to complete.
* `public/work/` — portfolio images extracted from the monograph. Kept as static
  assets even in DB mode. New images uploaded via the admin live in Supabase
  Storage (allowed in `next.config.ts` → `images.remotePatterns`).
* `lib/content/blur.ts` — generated blur placeholders. Regenerate after adding
  images: `python scripts/gen_blur.py` (needs `pip install pillow`).

---

## Scripts

| Command           | Does                                             |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Dev server                                       |
| `npm run build`   | Production build                                 |
| `npm run start`   | Serve the production build                       |
| `npm run lint`    | ESLint                                           |
| `npm run typecheck` | `tsc --noEmit`                                 |
| `npm run seed`    | Push bundled content into Supabase              |
| `npm run db:push` | `supabase db push`                              |

---

## Deployment

Deploy to **Vercel** (or any Next.js host):

1. Import the repo.
2. Add every variable from `.env.example` in the project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL.
4. In Supabase → Authentication → URL config, add
   `https://<domain>/admin/auth/callback` to the redirect allow-list.

`robots.txt`, `sitemap.xml`, per-work OpenGraph metadata and JSON-LD
(`Person`, `WebSite`, `VisualArtwork` / `CreativeWork`, `BreadcrumbList`) are
generated automatically.

---

## Notes on the build

* **Accessibility** — semantic landmarks, skip link, focus-visible rings,
  focus-trapped modals, `Esc` to close, `prefers-reduced-motion` honoured
  (Lenis, reveals and the custom cursor all disable).
* **Performance** — `next/image` everywhere with real `sizes`, AVIF/WebP, blur
  placeholders; motion libraries load only in the client components that use
  them; the timeline's pinned horizontal scroll is the one heavy interaction and
  it is desktop-only.
* **The custom cursor** is desktop + fine-pointer only and never uses blend
  modes.
