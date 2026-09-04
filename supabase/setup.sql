-- ═══════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM™ — one-shot setup
--  Paste this whole file into the Supabase SQL Editor and Run.
--  (schema 0001–0003 + RLS + storage + the current gallery content)
--  Composed from: migrations/0001_init.sql, 0002_page_content.sql,
--  0003_site_chrome.sql and seed.sql — regenerate seed.sql first with
--  `npx tsx scripts/gen-seed-sql.ts`.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — initial schema
--  Single-tenant studio site: any authenticated user is the admin.
--  The public (anon) role can read published content and create
--  enquiries, nothing else.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── helpers ──────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select auth.role() = 'authenticated';
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── profile (singleton) ──────────────────────────────────────────
create table public.profile (
  id          text primary key default 'default',
  name        text not null default 'Shivjeet Potdar',
  roles       jsonb not null default '[]'::jsonb,
  headline    text not null default '',
  statement   text not null default '',
  bio         jsonb not null default '[]'::jsonb,
  education   jsonb not null default '[]'::jsonb,
  email       text not null default '',
  phone       text not null default '',
  whatsapp    text not null default '',
  location    text not null default '',
  portrait    text,
  social      jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── site_settings (singleton) ────────────────────────────────────
create table public.site_settings (
  id            text primary key default 'default',
  brand         text not null default 'Conscius Omnium',
  brand_line    text not null default 'Shivjeet Potdar',
  tagline       text not null default '',
  nav           jsonb not null default '[]'::jsonb,
  hero          jsonb not null default '{}'::jsonb,
  footer_note   text not null default '',
  contact_copy  jsonb not null default '{}'::jsonb,
  seo           jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── collections ──────────────────────────────────────────────────
create table public.collections (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text not null default '',
  period       text,
  cover_image  text,
  featured     boolean not null default false,
  published    boolean not null default true,
  sort_order   integer not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── works ────────────────────────────────────────────────────────
create table public.works (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  year            text,
  year_sort       integer,
  discipline      text not null default 'other',
  kind            text,
  medium          text,
  dimensions      text,
  client          text,
  location        text,
  role            text,
  summary         text not null default '',
  description     jsonb not null default '[]'::jsonb,
  statement       text,
  concept         text,
  process         text,
  credits         jsonb not null default '[]'::jsonb,
  collection_slug text references public.collections(slug) on delete set null,
  status          text not null default 'draft'
                    check (status in ('draft','published','archived')),
  availability     text not null default 'enquire'
                    check (availability in ('available','sold','on-hold','not-for-sale','enquire')),
  price           numeric,
  currency        text not null default 'INR',
  price_visible   boolean not null default false,
  featured        boolean not null default false,
  sort_order      integer not null default 100,
  cover_image     text not null default '',
  accent          text,
  images          jsonb not null default '[]'::jsonb,
  related_slugs   jsonb not null default '[]'::jsonb,
  seo             jsonb not null default '{}'::jsonb,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index works_status_idx      on public.works (status);
create index works_discipline_idx  on public.works (discipline);
create index works_collection_idx  on public.works (collection_slug);
create index works_sort_idx        on public.works (sort_order);

-- Optional normalised image table (the app currently stores images on
-- works.images; this is here for teams who prefer a relation).
create table public.work_images (
  id          uuid primary key default gen_random_uuid(),
  work_id     uuid not null references public.works(id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  kind        text not null default 'gallery',
  caption     text,
  width       integer,
  height      integer,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index work_images_work_idx on public.work_images (work_id, sort_order);

-- ─── exhibitions ──────────────────────────────────────────────────
create table public.exhibitions (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  year           text not null,
  venue          text not null,
  city           text,
  country        text,
  type           text not null default 'exhibition',
  date_label     text,
  description    text,
  url            text,
  published      boolean not null default true,
  sort_order     integer not null default 100,
  related_slugs  jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index exhibitions_year_idx on public.exhibitions (year desc);

-- ─── timeline_entries ─────────────────────────────────────────────
create table public.timeline_entries (
  id           uuid primary key default gen_random_uuid(),
  year         text not null,
  title        text not null,
  description  text not null default '',
  image        text,
  category     text,
  sort_order   integer not null default 100,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index timeline_sort_idx on public.timeline_entries (sort_order);

-- ─── pages (managed body content) ─────────────────────────────────
create table public.pages (
  slug        text primary key,
  title       text not null default '',
  intro       text,
  sections    jsonb not null default '[]'::jsonb,
  seo         jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── inquiries ────────────────────────────────────────────────────
create table public.inquiries (
  id                 uuid primary key default gen_random_uuid(),
  ref                text not null unique,
  name               text not null,
  email              text not null,
  phone              text,
  country            text,
  type               text not null default 'general',
  message            text not null,
  budget             text,
  preferred_contact  text check (preferred_contact in ('email','phone','whatsapp')),
  work_slug          text,
  work_title         text,
  status             text not null default 'new'
                       check (status in ('new','read','in-progress','responded','closed','archived')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index inquiries_status_idx  on public.inquiries (status);
create index inquiries_created_idx on public.inquiries (created_at desc);

create table public.inquiry_notes (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid not null references public.inquiries(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at);

-- ─── media ────────────────────────────────────────────────────────
create table public.media (
  id            uuid primary key default gen_random_uuid(),
  bucket        text not null default 'media',
  path          text not null,
  url           text not null,
  alt           text,
  folder        text not null default 'works',
  width         integer,
  height        integer,
  size          integer,
  content_type  text,
  created_at    timestamptz not null default now()
);
create index media_folder_idx on public.media (folder, created_at desc);

-- ─── updated_at triggers ──────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profile','site_settings','collections','works','work_images',
    'exhibitions','timeline_entries','pages','inquiries'
  ]
  loop
    execute format(
      'create trigger %I_touch before update on public.%I
       for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════
alter table public.profile           enable row level security;
alter table public.site_settings     enable row level security;
alter table public.collections       enable row level security;
alter table public.works             enable row level security;
alter table public.work_images       enable row level security;
alter table public.exhibitions       enable row level security;
alter table public.timeline_entries  enable row level security;
alter table public.pages             enable row level security;
alter table public.inquiries         enable row level security;
alter table public.inquiry_notes     enable row level security;
alter table public.media             enable row level security;

-- profile / site_settings / pages — world-readable, admin-writable
create policy "profile read"   on public.profile       for select using (true);
create policy "profile write"  on public.profile       for all    using (public.is_admin()) with check (public.is_admin());
create policy "settings read"  on public.site_settings for select using (true);
create policy "settings write" on public.site_settings for all    using (public.is_admin()) with check (public.is_admin());
create policy "pages read"     on public.pages         for select using (true);
create policy "pages write"    on public.pages         for all    using (public.is_admin()) with check (public.is_admin());

-- collections — public sees published; admin sees + writes all
create policy "collections read published" on public.collections
  for select using (published or public.is_admin());
create policy "collections admin write" on public.collections
  for all using (public.is_admin()) with check (public.is_admin());

-- works — public sees published; admin all
create policy "works read published" on public.works
  for select using (status = 'published' or public.is_admin());
create policy "works admin write" on public.works
  for all using (public.is_admin()) with check (public.is_admin());

create policy "work_images read" on public.work_images
  for select using (
    public.is_admin() or exists (
      select 1 from public.works w
      where w.id = work_id and w.status = 'published'
    )
  );
create policy "work_images admin write" on public.work_images
  for all using (public.is_admin()) with check (public.is_admin());

-- exhibitions / timeline — public sees published
create policy "exhibitions read published" on public.exhibitions
  for select using (published or public.is_admin());
create policy "exhibitions admin write" on public.exhibitions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "timeline read published" on public.timeline_entries
  for select using (published or public.is_admin());
create policy "timeline admin write" on public.timeline_entries
  for all using (public.is_admin()) with check (public.is_admin());

-- inquiries — anon may INSERT only; admin reads / updates / deletes
create policy "inquiries public insert" on public.inquiries
  for insert with check (true);
create policy "inquiries admin read" on public.inquiries
  for select using (public.is_admin());
create policy "inquiries admin update" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());
create policy "inquiries admin delete" on public.inquiries
  for delete using (public.is_admin());

create policy "inquiry_notes admin all" on public.inquiry_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- media — world-readable metadata, admin-writable
create policy "media read"  on public.media for select using (true);
create policy "media write" on public.media for all using (public.is_admin()) with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  STORAGE
-- ═══════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media admin upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "media admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

create policy "media admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');


-- ═══════════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — 0002 · page content for the visual editor
--  Adds a typed `content` JSON blob to every managed page and ensures
--  a row exists for the pages that previously had no DB record
--  (home, work, exhibitions). RLS is unchanged: the existing
--  "pages read" (public) and "pages write" (admin) policies apply.
-- ═══════════════════════════════════════════════════════════════════

alter table public.pages
  add column if not exists content jsonb not null default '{}'::jsonb;

insert into public.pages (slug, title)
values
  ('home',        'Home'),
  ('work',        'Work'),
  ('exhibitions', 'Exhibitions')
on conflict (slug) do nothing;

-- Verify:
--   select slug, jsonb_typeof(content) as content_type from public.pages order by slug;
-- Expect rows for about, contact, exhibitions, home, studio, work — all 'object'.


-- ═══════════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — 0003 · theme + chrome for the visual editor
--  Adds editable theme tokens (colours / fonts / spacing) and gives
--  header + footer their own JSON blobs. All optional — an empty
--  object means "use the built-in defaults", so the site is unchanged
--  until something is published. RLS unchanged (admin write, public read).
-- ═══════════════════════════════════════════════════════════════════

alter table public.site_settings
  add column if not exists theme  jsonb not null default '{}'::jsonb,
  add column if not exists header jsonb not null default '{}'::jsonb,
  add column if not exists footer jsonb not null default '{}'::jsonb;

-- Verify:
--   select id, jsonb_typeof(theme), jsonb_typeof(header), jsonb_typeof(footer)
--   from public.site_settings;


-- ═══════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM — seed data (generated from lib/content)
--  Run AFTER 0001_init.sql. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

insert into public.profile (id, name, roles, headline, statement, bio, education, email, phone, whatsapp, location, portrait, social) values (
  'default', 'Shivjeet Potdar', '["Artist","Architect","Production Designer","Filmmaker"]'::jsonb, 'To turn attention inward through art.', 'Art is not simply an object to be seen. It is a space in which awareness can happen.',
  '["Shivjeet Potdar is an architect, filmmaker, and self-taught artist whose practice explores consciousness, perception, duality, and the relationship between the inner and outer worlds.","Trained in architecture at RV College of Architecture, Bengaluru, and in Production Design at the Film and Television Institute of India (FTII), Pune, Shivjeet approaches art through space, form, symbolism, and narrative.","His paintings often emerge from questions rather than answers — about identity, awareness, existence, and the nature of reality. Drawing from meditation, philosophy, geometry, and everyday human experience, he creates works that invite the viewer not merely to look, but to observe.","His practice moves between painting, sculpture, spatial design, and visual storytelling. Whether on canvas, an everyday object, or within a film set, the intention remains the same: to turn attention inward through art."]'::jsonb, '[{"qualification":"Bachelor of Architecture","institution":"RV College of Architecture, Bengaluru"},{"qualification":"Production Design","institution":"Film and Television Institute of India, Pune"}]'::jsonb, 'shivjeetpotdar@gmail.com', '+91 99729 10950',
  '919972910950', 'Bengaluru, India', '/profile/shivjeet-potdar.jpg', '[{"label":"Instagram","href":"https://instagram.com/conscius_omnium"},{"label":"YouTube","href":"https://youtube.com/@shivjeetpotdar"}]'::jsonb)
on conflict (id) do update set
  name = excluded.name, roles = excluded.roles, headline = excluded.headline, statement = excluded.statement,
  bio = excluded.bio, education = excluded.education, email = excluded.email, phone = excluded.phone,
  whatsapp = excluded.whatsapp, location = excluded.location, portrait = excluded.portrait, social = excluded.social;

insert into public.site_settings (id, brand, brand_line, tagline, nav, hero, footer_note, contact_copy, seo) values (
  'default', 'Conscius Omnium™', 'Shivjeet Potdar', 'Architect · Production Designer · Filmmaker', '[{"label":"About","href":"/about"},{"label":"Gallery","href":"/gallery"},{"label":"Studio","href":"/studio"},{"label":"Contact","href":"/contact"}]'::jsonb,
  '{"eyebrow":"Conscius Omnium™ — Shivjeet Potdar","heading":"Awareness through art","supporting":"by Shivjeet Potdar","ctaLabel":"Seek","ctaHref":"/contact#enquiry-form","workSlug":null,"image":null,"video":null,"showMeta":false}'::jsonb, 'Conscius Omnium™ is the studio of Shivjeet Potdar — architecture, interiors, production design and film.', '{"heading":"Let''s talk about the work.","supporting":"For collectors, collaborators, curators, institutions, production houses and commissions."}'::jsonb, '{"defaultTitle":"Conscius Omnium™ — Shivjeet Potdar","titleTemplate":"%s — Conscius Omnium™","description":"Conscius Omnium™ is the practice of Shivjeet Potdar — architect, interior and production designer, and filmmaker. Built space, miniatures, renders and screen work circling ruin, memory and the boundary between reality and fiction.","ogImage":"/gallery/states-of-attention/the-light-attracts-everything.jpg"}'::jsonb)
on conflict (id) do update set
  brand = excluded.brand, brand_line = excluded.brand_line, tagline = excluded.tagline, nav = excluded.nav,
  hero = excluded.hero, footer_note = excluded.footer_note, contact_copy = excluded.contact_copy, seo = excluded.seo;

DO $$
BEGIN
  UPDATE public.site_settings
  SET header = '{"logo":"/logo/mark-black.png","logoInverted":"/logo/mark-white.png"}'::jsonb
  WHERE id = 'default';
EXCEPTION WHEN undefined_column THEN
  RAISE NOTICE 'site_settings.header does not exist yet — run supabase/migrations/0003_site_chrome.sql, then re-run this block to pick up the logo.';
END $$;

insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'black-canvas', 'Black Canvas', 'Five works in oil pastel — and, for the last, acrylic and chalk powder — on black paper. Each begins the same way: a seated meditation on the breath, attention returning again and again to whatever the mind offers up along the way.', '2026', '/gallery/black-canvas/shape-of-belief.jpg', true, true, 1)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'states-of-attention', 'States of Attention', 'Five works made across consecutive early-morning sessions, each beginning in meditation and each returning to the same accidental subject — bees drawn to a terrace light at 3 a.m. — as observation moved from distraction toward stillness.', '2026', '/gallery/states-of-attention/the-light-attracts-everything.jpg', true, true, 2)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'duality', 'Duality', 'Paired opposites, worked in acrylic on ivory paper. On the first of these, The Burden of Goodness, the artist writes: “The painting ultimately asks: who are you beyond the need to be good, bad, right, or wrong?”', 'Ongoing', '/gallery/duality/the-burden-of-goodness.jpg', true, true, 3)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'states-of-awareness', 'States of Awareness', 'The Nilgai series — five paintings following one continuous journey: a bird''s passage from the nest, through the weight of a newly formed self, to a stillness observed in a forest clearing, and finally into perspective and bliss.', '2026', '/gallery/states-of-awareness/the-observer.jpg', true, true, 4)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;

insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'breath-and-the-mind', 'Breath and the Mind', '2026', 2026, 'art', 'Painting', 'Oil pastels on black paper', '54 × 67 cm', null, null, null,
  'The relationship between breath and mind, traced through repeated returns to the point where attention keeps slipping and keeps coming back.', '["The journey begins with a black canvas — a space before form, representing stillness and possibility. Through Anapana meditation, attention moves towards the breath: the touch of air at the nostrils, the movement through the body, and subtle sensations around the forehead.","Thoughts continue to arise and pull attention away, but awareness returns again and again to the breath. This painting explores the relationship between breath and mind — the constant movement between distraction and observation, thought and presence. A visual reflection on the process of becoming aware."]'::jsonb, null, null, null, '[]'::jsonb, 'black-canvas', 'published', 'available',
  65000, 'INR', true, false, 25, '/gallery/black-canvas/breath-and-the-mind.jpg', null, '[{"id":"breath-and-the-mind-cover","url":"/gallery/black-canvas/breath-and-the-mind.jpg","alt":"Breath and the Mind — Shivjeet Potdar, Oil pastels on black paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"breath-and-the-mind-installation","url":"/gallery/black-canvas/breath-and-the-mind-context.jpg","alt":"Breath and the Mind — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["subtle-currents","the-tree-house","vortex-of-awareness"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'subtle-currents', 'Subtle Currents', '2026', 2026, 'art', 'Painting', 'Oil pastels on black paper', '54 × 67 cm', null, null, null,
  'A narrowing of focus to the space between the nostrils and the upper lip, and the almost-invisible movements found there.', '["Attention moves deeper into a smaller field of observation — the space between the nostrils and the upper lip, where the breath gently touches the body. The slightest sensations become visible: the movement of air, the changing waves of feeling, and the subtle currents that are usually unnoticed.","Thoughts continue to arise and pull attention away, but awareness returns again and again. This painting explores the refinement of attention — discovering the depth within a single breath and the invisible movements that exist within each moment."]'::jsonb, null, null, null, '[]'::jsonb, 'black-canvas', 'published', 'available',
  55000, 'INR', true, false, 26, '/gallery/black-canvas/subtle-currents.jpg', null, '[{"id":"subtle-currents-cover","url":"/gallery/black-canvas/subtle-currents.jpg","alt":"Subtle Currents — Shivjeet Potdar, Oil pastels on black paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"subtle-currents-installation","url":"/gallery/black-canvas/subtle-currents-context.jpg","alt":"Subtle Currents — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["breath-and-the-mind","the-tree-house","vortex-of-awareness"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-tree-house', 'The Tree House', '2026', 2026, 'art', 'Painting', 'Oil pastels on black paper', '54 × 67 cm', null, null, null,
  'A meditation that wandered toward a real design brief — a tree house for a friend''s farm — and let the thought become the painting instead of resisting it.', '["The meditation began with observing the breath, but attention moved towards a thought — the design of a tree house for a friend''s farm. A place to work, observe the land, and remain connected with nature while working remotely. Instead of resisting the thought, I followed it.","The structure, the space, the relationship between architecture and landscape began to take form on the canvas. This work explores the meeting point of meditation and creativity — where a thought becomes a design, and design becomes a form of observation."]'::jsonb, null, null, null, '[]'::jsonb, 'black-canvas', 'published', 'available',
  75000, 'INR', true, false, 27, '/gallery/black-canvas/the-tree-house.jpg', null, '[{"id":"the-tree-house-cover","url":"/gallery/black-canvas/the-tree-house.jpg","alt":"The Tree House — Shivjeet Potdar, Oil pastels on black paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"the-tree-house-installation","url":"/gallery/black-canvas/the-tree-house-context.jpg","alt":"The Tree House — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["breath-and-the-mind","subtle-currents","vortex-of-awareness"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'vortex-of-awareness', 'Vortex of Awareness', '2026', 2026, 'art', 'Painting', 'Oil pastels on black paper', '54 × 67 cm', null, null, null,
  'Attention moved through the body from head to toe until the sensations converged into something felt as a single inner vortex.', '["Through meditation, attention moves through the body — observing sensations from head to toe and back again. As awareness deepens, these subtle sensations begin to feel like waves, converging into an inner movement — a vortex within the body.","For brief moments, the outside world fades, leaving only observation and experience. This painting explores the relationship between sensation, awareness, and the continuous journey of understanding the self through observation."]'::jsonb, null, null, null, '[]'::jsonb, 'black-canvas', 'published', 'available',
  75000, 'INR', true, false, 28, '/gallery/black-canvas/vortex-of-awareness.jpg', null, '[{"id":"vortex-of-awareness-cover","url":"/gallery/black-canvas/vortex-of-awareness.jpg","alt":"Vortex of Awareness — Shivjeet Potdar, Oil pastels on black paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"vortex-of-awareness-installation","url":"/gallery/black-canvas/vortex-of-awareness-context.jpg","alt":"Vortex of Awareness — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["breath-and-the-mind","subtle-currents","the-tree-house"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'shape-of-belief', 'Shape of Belief', '2026', 2026, 'art', 'Painting', 'Acrylic and chalk powder on black paper', '54 × 67 cm', null, null, null,
  'Transparent gum laid on black paper first, powder colour added after — belief, like perception, giving shape to a pattern that already existed.', '["This work begins with a question: do we experience truth as it is, or do we experience the meaning we create around it? The painting starts with transparent gum applied on the black surface — an invisible structure waiting to be revealed. Powder colour is then introduced, exposing patterns that were already formed before they became visible.","The process becomes a reflection of perception itself. We observe, interpret, connect fragments, and create meaning. Gradually, belief gives shape to what we see. This painting explores the space between reality and interpretation — between what exists and what the mind reveals."]'::jsonb, null, null, null, '[]'::jsonb, 'black-canvas', 'published', 'available',
  75000, 'INR', true, true, 29, '/gallery/black-canvas/shape-of-belief.jpg', null, '[{"id":"shape-of-belief-cover","url":"/gallery/black-canvas/shape-of-belief.jpg","alt":"Shape of Belief — Shivjeet Potdar, Acrylic and chalk powder on black paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"shape-of-belief-installation","url":"/gallery/black-canvas/shape-of-belief-context.jpg","alt":"Shape of Belief — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["breath-and-the-mind","subtle-currents","the-tree-house"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-light-attracts-everything', 'The Light Attracts Everything', '2026', 2026, 'art', 'Painting', 'Acrylic on Ivory paper', '56 × 71 cm', null, null, null,
  'A 3 a.m. meditation, documented on camera for the first time, as terrace lights drew bees out of the dark and distraction became the subject.', '["A 3 AM meditation led into this painting process. For the first time, decided to document the experience and speak in front of the camera. As the terrace lights drew bees from the darkness, the act of creating also brought distraction, fear, movement, and awareness to the surface.","This work became less about achieving stillness and more about observing everything that gathers around light."]'::jsonb, null, null, 'Watch the process: https://youtu.be/4laH2RzzHyg', '[]'::jsonb, 'states-of-attention', 'published', 'available',
  60000, 'INR', true, true, 30, '/gallery/states-of-attention/the-light-attracts-everything.jpg', null, '[{"id":"the-light-attracts-everything-cover","url":"/gallery/states-of-attention/the-light-attracts-everything.jpg","alt":"The Light Attracts Everything — Shivjeet Potdar, Acrylic on Ivory paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"the-light-attracts-everything-installation","url":"/gallery/states-of-attention/the-light-attracts-everything-context.jpg","alt":"The Light Attracts Everything — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["symmetry-in-the-swarm","concentric-emergence","pyre-for-perspective"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'symmetry-in-the-swarm', 'Symmetry in the Swarm', '2026', 2026, 'art', 'Painting', 'Acrylic on Ivory paper', '56 × 71 cm', null, null, null,
  'As the bees at the terrace light kept gathering, deeper focus turned their chaos into afterimages — symmetrical forms emerging within the swarm.', '["This emerged from observing distraction, fear, and the gradual ability to remain present. As bees gathered around the terrace lights, the chaos of movement became the subject of observation. With deeper focus, the external world began to fade, and patterns started appearing through afterimages — symmetrical forms emerging within the swarm.","The painting explores the hidden order within apparent chaos, and how attention can transform disturbance into perception."]'::jsonb, null, null, 'Watch the process: https://youtu.be/ZdW_NNWwjWE', '[]'::jsonb, 'states-of-attention', 'published', 'available',
  60000, 'INR', true, false, 31, '/gallery/states-of-attention/symmetry-in-the-swarm.jpg', null, '[{"id":"symmetry-in-the-swarm-cover","url":"/gallery/states-of-attention/symmetry-in-the-swarm.jpg","alt":"Symmetry in the Swarm — Shivjeet Potdar, Acrylic on Ivory paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"symmetry-in-the-swarm-installation","url":"/gallery/states-of-attention/symmetry-in-the-swarm-context.jpg","alt":"Symmetry in the Swarm — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["the-light-attracts-everything","concentric-emergence","pyre-for-perspective"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'concentric-emergence', 'Concentric Emergence', '2026', 2026, 'art', 'Painting', 'Acrylic on Ivory paper', '56 × 71 cm', null, null, null,
  'The camera was still there, but the mind had begun to move past it — what stayed visible were concentric afterimages expanding around a growing centre of light.', '["The camera was still present, but it no longer occupied the space the same way. The bees remained around the light, yet the mind had begun to move past distraction. What stayed visible were the afterimages — concentric formations expanding and dissolving around a growing centre of light.","The experience felt similar to searching for light while trapped inside fabric — like the brief moment when a T-shirt catches around the head and the eyes instinctively move toward the opening. This painting emerged from that sensation of perception pushing itself toward clarity."]'::jsonb, null, null, 'Watch the process: https://youtu.be/Fc9Obr-xNKI', '[]'::jsonb, 'states-of-attention', 'published', 'available',
  85000, 'INR', true, false, 32, '/gallery/states-of-attention/concentric-emergence.jpg', null, '[{"id":"concentric-emergence-cover","url":"/gallery/states-of-attention/concentric-emergence.jpg","alt":"Concentric Emergence — Shivjeet Potdar, Acrylic on Ivory paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"concentric-emergence-installation","url":"/gallery/states-of-attention/concentric-emergence-context.jpg","alt":"Concentric Emergence — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["the-light-attracts-everything","symmetry-in-the-swarm","pyre-for-perspective"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'pyre-for-perspective', 'Pyre for Perspective', '2026', 2026, 'art', 'Painting', 'Burnt on Ivory paper', '56 × 71 cm', null, null, null,
  'A disturbance during meditation — that thoughts about painting never stop arising — led to burning the paper itself and using the burn marks to form an eye.', '["During meditation, a disturbance arose from the thought that thoughts themselves continue to arise endlessly. The act of painting began to feel performative — an image repeating itself through habit, observation, and identity. A question remained: if art is meant to liberate, what must first be burned?","Began burning paper and using the burn marks themselves to form an eye-like structure on the canvas. The process became less about creating an image and more about confronting perspective through destruction. This work emerged from an attempt to burn perspective itself."]'::jsonb, null, null, 'Watch the process: https://youtu.be/xvQT-e2y8OE', '[]'::jsonb, 'states-of-attention', 'published', 'available',
  65000, 'INR', true, false, 33, '/gallery/states-of-attention/pyre-for-perspective.jpg', null, '[{"id":"pyre-for-perspective-cover","url":"/gallery/states-of-attention/pyre-for-perspective.jpg","alt":"Pyre for Perspective — Shivjeet Potdar, Burnt on Ivory paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"pyre-for-perspective-installation","url":"/gallery/states-of-attention/pyre-for-perspective-context.jpg","alt":"Pyre for Perspective — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["the-light-attracts-everything","symmetry-in-the-swarm","concentric-emergence"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-canvas-wouldnot-empty', 'The Canvas Wouldnot Empty', '2026', 2026, 'art', 'Painting', 'Acrylic on Ivory paper', '56 × 71 cm', null, null, null,
  'An attempt to cover the canvas in black and find emptiness — undone, layer after layer, by a mind that kept moving.', '["The meditation began, but thoughts arrived faster than silence — thoughts about painting, the camera, people watching, and the future. Instead of resisting them, placed them onto the canvas. I tried covering everything in black, searching for emptiness. But the mind was still active, still moving. Colours returned, one layer washing over another, like thoughts replacing thoughts.","This work explores a question: If thoughtlessness is not the goal, can deep awareness itself become meditation? Perhaps painting is also a meditation — not by escaping thought, but by moving completely through it."]'::jsonb, null, null, 'Watch the process: https://youtu.be/PFnRwOx9Z3U', '[]'::jsonb, 'states-of-attention', 'published', 'available',
  75000, 'INR', true, false, 34, '/gallery/states-of-attention/the-canvas-wouldnot-empty.jpg', null, '[{"id":"the-canvas-wouldnot-empty-cover","url":"/gallery/states-of-attention/the-canvas-wouldnot-empty.jpg","alt":"The Canvas Wouldnot Empty — Shivjeet Potdar, Acrylic on Ivory paper","kind":"cover","caption":null,"width":2400,"height":1874,"sortOrder":0},{"id":"the-canvas-wouldnot-empty-installation","url":"/gallery/states-of-attention/the-canvas-wouldnot-empty-context.jpg","alt":"The Canvas Wouldnot Empty — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["the-light-attracts-everything","symmetry-in-the-swarm","concentric-emergence"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'dance-of-duality', 'Dance of Duality', null, null, 'art', 'Painting', null, null, null, null, null,
  'From the Duality series.', '[]'::jsonb, null, null, null, '[]'::jsonb, 'duality', 'published', 'enquire',
  null, 'INR', false, false, 35, '/gallery/duality/dance-of-duality.jpg', null, '[{"id":"dance-of-duality-cover","url":"/gallery/duality/dance-of-duality.jpg","alt":"Dance of Duality — Shivjeet Potdar, painting","kind":"cover","caption":null,"width":2400,"height":1802,"sortOrder":0},{"id":"dance-of-duality-installation","url":"/gallery/duality/dance-of-duality-context.jpg","alt":"Dance of Duality — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["the-burden-of-goodness","the-infinite-axis","the-primordial-point"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-burden-of-goodness', 'The Burden of Goodness', null, null, 'art', 'Painting', 'Acrylic on Ivory paper', '56 × 71 cm', null, null, null,
  'A contemplative exploration of morality, pleasure, pain, and the identities we build around them, resolving into the open eye of consciousness at the centre.', '["The Burden of Goodness is a contemplative exploration of morality, pleasure, pain, and the subtle identities we create around them.","The upper half represents goodness and pleasure — the part of us that knows what it wants and moves toward it. The eyes have pupils, symbolising awareness, direction, and desire. Yet every desire can carry its own attachments: fear, anger, jealousy, pride, and the fear of losing what we seek.","The lower half represents pain, struggle, and surrender. The eyes have no pupils, suggesting a state that does not seek or grasp. Through struggle, sacrifice, and stepping beyond comfort, attachments can begin to dissolve.","At the centre is the open eye of consciousness — awareness beyond the labels of good and bad, pleasure and pain. The partially closing eyelid becomes the final metaphor. The path from above is obstructed, while below it remains open. It suggests that even the identity of being good, or the desire for a higher state of awareness, can become another form of attachment.","The painting ultimately asks: Who are you beyond the need to be good, bad, right, or wrong? And perhaps, more subtly: Can awakening be found when there is nothing left to seek?"]'::jsonb, null, null, null, '[]'::jsonb, 'duality', 'published', 'available',
  250000, 'INR', true, true, 36, '/gallery/duality/the-burden-of-goodness.jpg', null, '[{"id":"the-burden-of-goodness-cover","url":"/gallery/duality/the-burden-of-goodness.jpg","alt":"The Burden of Goodness — Shivjeet Potdar, Acrylic on Ivory paper","kind":"cover","caption":null,"width":2400,"height":1802,"sortOrder":0},{"id":"the-burden-of-goodness-installation","url":"/gallery/duality/the-burden-of-goodness-context.jpg","alt":"The Burden of Goodness — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["dance-of-duality","the-infinite-axis","the-primordial-point"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-infinite-axis', 'The Infinite Axis', null, null, 'art', 'Painting', null, null, null, null, null,
  'From the Duality series.', '[]'::jsonb, null, null, null, '[]'::jsonb, 'duality', 'published', 'enquire',
  null, 'INR', false, false, 37, '/gallery/duality/the-infinite-axis.jpg', null, '[{"id":"the-infinite-axis-cover","url":"/gallery/duality/the-infinite-axis.jpg","alt":"The Infinite Axis — Shivjeet Potdar, painting","kind":"cover","caption":null,"width":2400,"height":1802,"sortOrder":0},{"id":"the-infinite-axis-installation","url":"/gallery/duality/the-infinite-axis-context.jpg","alt":"The Infinite Axis — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["dance-of-duality","the-burden-of-goodness","the-primordial-point"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-primordial-point', 'The Primordial Point', null, null, 'art', 'Painting', null, null, null, null, null,
  'From the Duality series.', '[]'::jsonb, null, null, null, '[]'::jsonb, 'duality', 'published', 'enquire',
  null, 'INR', false, false, 38, '/gallery/duality/the-primordial-point.jpg', null, '[{"id":"the-primordial-point-cover","url":"/gallery/duality/the-primordial-point.jpg","alt":"The Primordial Point — Shivjeet Potdar, painting","kind":"cover","caption":null,"width":2400,"height":1802,"sortOrder":0},{"id":"the-primordial-point-installation","url":"/gallery/duality/the-primordial-point-context.jpg","alt":"The Primordial Point — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["dance-of-duality","the-burden-of-goodness","the-infinite-axis"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'untitled-i', 'Untitled', null, null, 'art', 'Painting', null, null, null, null, null,
  'From the Duality series — untitled in the material supplied by the artist.', '[]'::jsonb, null, null, null, '[]'::jsonb, 'duality', 'published', 'enquire',
  null, 'INR', false, false, 39, '/gallery/duality/untitled-i.jpg', null, '[{"id":"untitled-i-cover","url":"/gallery/duality/untitled-i.jpg","alt":"Untitled — Shivjeet Potdar, painting","kind":"cover","caption":null,"width":2400,"height":1802,"sortOrder":0},{"id":"untitled-i-installation","url":"/gallery/duality/untitled-i-context.jpg","alt":"Untitled — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["dance-of-duality","the-burden-of-goodness","the-infinite-axis"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'establishment-of-self', 'Establishment of Self', '2026', 2026, 'art', 'Painting', 'Acrylic on paper', '22 × 22 in', null, null, null,
  'The first painting in the series — a mountain landscape crowned by a Shivling, a nest with one hatched and one unhatched egg, and the young bird''s freedom to choose.', '["Establishment of Self is the first painting in the States of Awareness series. A mountain landscape crowned by a towering Shivling symbolizes the source of consciousness. Waterfalls descend into open grasslands before disappearing into a dense forest, representing the unfolding journey of life.","In the foreground, a luminous nest with one hatched and one unhatched egg symbolizes birth and infinite potential. The young bird embodies the freedom to choose. Through choice, experience, and karma, the sense of self gradually takes form, inviting the viewer to reflect on identity as a process established through the life we choose to live."]'::jsonb, null, null, 'Watch the process: https://youtu.be/NmezGg8lRSQ', '[]'::jsonb, 'states-of-awareness', 'published', 'sold',
  null, 'INR', false, false, 40, '/gallery/states-of-awareness/establishment-of-self.jpg', null, '[{"id":"establishment-of-self-cover","url":"/gallery/states-of-awareness/establishment-of-self.jpg","alt":"Establishment of Self — Shivjeet Potdar, Acrylic on paper","kind":"cover","caption":null,"width":2346,"height":2400,"sortOrder":0},{"id":"establishment-of-self-installation","url":"/gallery/states-of-awareness/establishment-of-self-context.jpg","alt":"Establishment of Self — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["the-weight-of-i","the-observer","the-bliss"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-weight-of-i', 'The Weight of ‘I’', '2026', 2026, 'art', 'Painting', 'Acrylic on paper', '22 × 22 in', null, null, null,
  'The second painting — a luminous bird moving through a forest where light cannot reach the ground, and the fear that arrives with a formed identity.', '["The Weight of ''I'' is the second painting in the States of Awareness series. A luminous bird journeys through a dense forest where light cannot reach the ground, symbolizing the mind after the formation of identity. As the sense of \"I\" emerges, so does the instinct to protect it.","The painting reflects on fear as a natural consequence of attachment to the self, inviting the viewer to contemplate the burden of identity."]'::jsonb, null, null, 'Watch the process: https://youtu.be/eYqfRj33NLo', '[]'::jsonb, 'states-of-awareness', 'published', 'sold',
  null, 'INR', false, false, 41, '/gallery/states-of-awareness/the-weight-of-i.jpg', null, '[{"id":"the-weight-of-i-cover","url":"/gallery/states-of-awareness/the-weight-of-i.jpg","alt":"The Weight of ‘I’ — Shivjeet Potdar, Acrylic on paper","kind":"cover","caption":null,"width":2346,"height":2400,"sortOrder":0},{"id":"the-weight-of-i-installation","url":"/gallery/states-of-awareness/the-weight-of-i-context.jpg","alt":"The Weight of ‘I’ — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["establishment-of-self","the-observer","the-bliss"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-observer', 'The Observer', '2026', 2026, 'art', 'Painting', 'Acrylic on paper', '22 × 22 in', null, null, null,
  'Deep in the forest, the bird meets a still Nilgai — and realises thoughts, emotions and fear need not be identified with, only observed.', '["The Observer is the third painting in the States of Awareness series. Deep within the dense forest, the bird encounters a still Nilgai, symbolizing awareness. In this silent meeting, the bird realizes that thoughts, emotions, and fear need not be identified with — they can simply be observed.","The painting marks the shift from attachment to witnessing, revealing awareness as the quiet presence behind every experience."]'::jsonb, null, null, 'Watch the process: https://youtu.be/vYGxbBO68tA', '[]'::jsonb, 'states-of-awareness', 'published', 'sold',
  null, 'INR', false, true, 42, '/gallery/states-of-awareness/the-observer.jpg', null, '[{"id":"the-observer-cover","url":"/gallery/states-of-awareness/the-observer.jpg","alt":"The Observer — Shivjeet Potdar, Acrylic on paper","kind":"cover","caption":null,"width":2346,"height":2400,"sortOrder":0},{"id":"the-observer-installation","url":"/gallery/states-of-awareness/the-observer-context.jpg","alt":"The Observer — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["establishment-of-self","the-weight-of-i","the-bliss"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'the-bliss', 'The Bliss', '2026', 2026, 'art', 'Painting', 'Acrylic on paper', '22 × 22 in', null, null, null,
  'Guided by fireflies, the bird rises above the forest into the open sky, witnessing light and darkness as parts of the same whole.', '["The Bliss is the fourth painting in the States of Awareness series. Guided by a swarm of fireflies, the bird rises above the forest into the open sky, where it witnesses both light and darkness as parts of the same whole.","The painting symbolizes the joy that arises from awareness — not through escaping the world, but through seeing it with clarity, freedom, and an unburdened mind."]'::jsonb, null, null, 'Watch the process: https://youtu.be/h4R5qXem2ys', '[]'::jsonb, 'states-of-awareness', 'published', 'sold',
  null, 'INR', false, false, 43, '/gallery/states-of-awareness/the-bliss.jpg', null, '[{"id":"the-bliss-cover","url":"/gallery/states-of-awareness/the-bliss.jpg","alt":"The Bliss — Shivjeet Potdar, Acrylic on paper","kind":"cover","caption":null,"width":2346,"height":2400,"sortOrder":0},{"id":"the-bliss-installation","url":"/gallery/states-of-awareness/the-bliss-context.jpg","alt":"The Bliss — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["establishment-of-self","the-weight-of-i","the-observer"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;
insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'a-small-fire', 'A Small Fire', '2026', 2026, 'art', 'Painting', 'Acrylic on paper', '22 × 22 in', null, null, null,
  'From above the forest, the bird watches a fire burning in the valley below — overwhelming up close, small within the whole landscape.', '["A Small Fire is the fifth and final painting in the States of Awareness series. From above the forest, the bird witnesses a fire burning in the valley below. What once might have appeared overwhelming is now seen within the vastness of the landscape.","The painting reflects on perspective, reminding us that the mind often magnifies its struggles, while awareness reveals them as fleeting moments within a much larger whole."]'::jsonb, null, null, 'Watch the process: https://youtu.be/K19KNbITkhk', '[]'::jsonb, 'states-of-awareness', 'published', 'sold',
  null, 'INR', false, false, 44, '/gallery/states-of-awareness/a-small-fire.jpg', null, '[{"id":"a-small-fire-cover","url":"/gallery/states-of-awareness/a-small-fire.jpg","alt":"A Small Fire — Shivjeet Potdar, Acrylic on paper","kind":"cover","caption":null,"width":2346,"height":2400,"sortOrder":0},{"id":"a-small-fire-installation","url":"/gallery/states-of-awareness/a-small-fire-context.jpg","alt":"A Small Fire — installation view","kind":"installation","caption":null,"width":2400,"height":1600,"sortOrder":1}]'::jsonb, '["establishment-of-self","the-weight-of-i","the-observer"]'::jsonb, '{}'::jsonb, null
) on conflict (slug) do update set
  title = excluded.title, year = excluded.year, year_sort = excluded.year_sort, discipline = excluded.discipline,
  kind = excluded.kind, medium = excluded.medium, dimensions = excluded.dimensions, client = excluded.client,
  location = excluded.location, role = excluded.role, summary = excluded.summary, description = excluded.description,
  statement = excluded.statement, concept = excluded.concept, process = excluded.process, credits = excluded.credits,
  collection_slug = excluded.collection_slug, status = excluded.status, availability = excluded.availability,
  price = excluded.price, currency = excluded.currency, price_visible = excluded.price_visible,
  featured = excluded.featured, sort_order = excluded.sort_order, cover_image = excluded.cover_image,
  accent = excluded.accent, images = excluded.images, related_slugs = excluded.related_slugs,
  seo = excluded.seo, published_at = excluded.published_at;

delete from public.exhibitions;

delete from public.timeline_entries;

insert into public.pages (slug, title, intro, sections, seo) values (
  'about', 'About', 'Within the smallest point, the whole is hidden. Within the self, the universe waits to be known.', '[{"id":"about-conscius-omnium","eyebrow":"Conscius Omnium™","heading":"Awareness of the whole","layout":"text","body":["Art is a way of entering that space. Painting, dance, music, architecture — each becomes a language for looking inward, going deeper, and awakening to what connects everything.","Art is rebellion. It questions the reality we inherit, breaks through Maya, and opens a passage into what lies beyond the familiar.","When creation becomes meditation, art becomes a path to higher knowing. Every work is an exploration of consciousness and a step towards the Ultimate Artwork — a creation that does not represent awareness, but embodies it; a work that needs no explanation, where the observer does not merely see, but experiences. Such a work becomes a portal: awareness expressed through form.","Every creation is a trace of this possibility. Just as a building exists first as an idea before taking form, the unseen precedes the seen. Each artwork becomes a footprint of what is yet to emerge.","Different forms. Different questions. One pursuit: from perception to knowing, from the individual to the whole, from form to awareness.","This is the work of Conscius Omnium™."]}]'::jsonb, '{"title":"About — Shivjeet Potdar","description":"Shivjeet Potdar — artist, architect, production designer and filmmaker. B.Arch, RV College of Architecture, Bengaluru; Production Design, FTII Pune."}'::jsonb)
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;
insert into public.pages (slug, title, intro, sections, seo) values (
  'studio', 'Studio & Process', 'A self-taught practice: the paintings emerge through observation, meditation, and experimentation — abstract forms, layered surfaces, and process-driven methods.', '[{"id":"studio-meditation","eyebrow":"01 — Meditation","heading":"It begins with sitting still","layout":"image-right","image":"/gallery/black-canvas/breath-and-the-mind-context.jpg","caption":"Breath and the Mind — oil pastels on black paper, 54 × 67 cm.","body":["Through Anapana meditation, attention moves towards the breath: the touch of air at the nostrils, the movement through the body, and subtle sensations around the forehead.","Thoughts continue to arise and pull attention away, but awareness returns again and again to the breath. The black canvas is where that begins — a space before form, representing stillness and possibility."]},{"id":"studio-attention","eyebrow":"02 — Attention","heading":"Whatever gathers around the light","layout":"image-left","image":"/gallery/states-of-attention/the-light-attracts-everything-context.jpg","caption":"The Light Attracts Everything — acrylic on ivory paper, 56 × 71 cm.","body":["A 3 AM meditation led into this painting process. As the terrace lights drew bees from the darkness, the act of creating also brought distraction, fear, movement, and awareness to the surface.","With deeper focus the external world begins to fade, and patterns start appearing through afterimages — symmetrical forms emerging within the swarm. Attention can transform disturbance into perception."]},{"id":"studio-material","eyebrow":"03 — Material","heading":"Gum, powder, burn","layout":"image-right","image":"/gallery/black-canvas/shape-of-belief-context.jpg","caption":"Shape of Belief — acrylic and chalk powder on black paper, 54 × 67 cm.","body":["Shape of Belief starts with transparent gum applied on the black surface — an invisible structure waiting to be revealed. Powder colour is then introduced, exposing patterns that were already formed before they became visible.","For Pyre for Perspective the paper itself was burned, the burn marks forming an eye-like structure on the canvas — less about creating an image and more about confronting perspective through destruction."]},{"id":"studio-documented","eyebrow":"04 — Documented","heading":"The process, filmed","layout":"image-left","image":"/gallery/states-of-awareness/the-observer-context.jpg","caption":"The Observer — acrylic on paper, 22 × 22 in.","body":["Most works are made in front of a camera. Each painting in the gallery carries a link to the session it came out of — the meditation, the distraction, the decisions made in real time.","Whether on canvas, an everyday object, or within a film set, the intention remains the same: to turn attention inward through art."]}]'::jsonb, '{"title":"Studio & Process — Conscius Omnium™","description":"Inside the practice of Shivjeet Potdar: meditation, observation and experimentation — oil pastel on black paper, acrylic on ivory paper, gum and powder, burnt paper."}'::jsonb)
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;
insert into public.pages (slug, title, intro, sections, seo) values (
  'contact', 'Contact', 'For collectors, collaborators, curators, institutions, production houses and commissions. Every enquiry is read personally.', '[]'::jsonb, '{"title":"Contact — Conscius Omnium™","description":"Get in touch with Shivjeet Potdar — commissions, collaborations, exhibitions, production design and acquisitions."}'::jsonb)
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;
