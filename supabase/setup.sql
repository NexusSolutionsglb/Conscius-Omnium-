-- ═══════════════════════════════════════════════════════════════
--  CONSCIOUS OMNIUM — one-shot setup
--  Paste this whole file into the Supabase SQL Editor and Run.
--  (schema + RLS + storage + all portfolio content)
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
--  CONSCIOUS OMNIUM — initial schema
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
  brand         text not null default 'Conscious Omnium',
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


-- ═══════════════════════════════════════════════════════════════
--  CONSCIOUS OMNIUM — seed data (generated from lib/content)
--  Run AFTER 0001_init.sql. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

insert into public.profile (id, name, roles, headline, statement, bio, education, email, phone, whatsapp, location, portrait, social) values (
  'default', 'Shivjeet Potdar', '["Architect","Interior Designer","Production Designer","Filmmaker"]'::jsonb, 'Architecture, image, and the fading boundary between reality and fiction.', 'Architecture is a homogenous blend of art and science — science is the body, art is its soul.',
  '["Shivjeet Potdar works across architecture, interiors, production design and film. The practice began, by his own account, as a child drawing mythology and wanting to live in it — then wanting to be an artist, then deciding science was more useful, then building an electric dynamo and wanting to be a scientist, and finally refusing to give up either.","Architecture became the place the two could hold hands. Much of the work since has circled a single question: what to do with the ruin, the eco-void, the monument, the dead quarry — how to build in a way that reclaims a place rather than erases it. It moves fluidly between a plaster miniature photographed until it becomes a world, a 3D render set back into a real landscape, a built pavilion of bent steel, and a title card for a feature film.","More recently the work has moved toward the boundary between reality and fiction — production design, character design, and the beginnings of filmmaking."]'::jsonb, '[{"qualification":"Bachelor of Architecture","institution":"RV College of Architecture, Bengaluru"},{"qualification":"Production Design","institution":"Film and Television Institute of India, Pune"}]'::jsonb, 'architectshivjeet@gmail.com', '+91 99729 10950',
  '919972910950', 'Bengaluru, India', null, '[]'::jsonb)
on conflict (id) do update set
  name = excluded.name, roles = excluded.roles, headline = excluded.headline, statement = excluded.statement,
  bio = excluded.bio, education = excluded.education, email = excluded.email, phone = excluded.phone,
  whatsapp = excluded.whatsapp, location = excluded.location, portrait = excluded.portrait, social = excluded.social;

insert into public.site_settings (id, brand, brand_line, tagline, nav, hero, footer_note, contact_copy, seo) values (
  'default', 'Conscious Omnium', 'Shivjeet Potdar', 'Architect · Production Designer · Filmmaker', '[{"label":"Work","href":"/work"},{"label":"About","href":"/about"},{"label":"Studio","href":"/studio"},{"label":"Exhibitions","href":"/exhibitions"},{"label":"Contact","href":"/contact"}]'::jsonb,
  '{"eyebrow":"Conscious Omnium — Shivjeet Potdar","heading":"Architecture, image, and the things between them.","supporting":"A cross-disciplinary practice working between built space, the miniature, the render and the screen — circling what it means to hold a place rather than erase it.","ctaLabel":"Enter the work","ctaHref":"/work","workSlug":"ghosts-of-takht-mahal","image":null,"showMeta":true}'::jsonb, 'Conscious Omnium is the studio of Shivjeet Potdar — architecture, interiors, production design and film.', '{"heading":"Let''s talk about the work.","supporting":"For collectors, collaborators, curators, institutions, production houses and commissions."}'::jsonb, '{"defaultTitle":"Conscious Omnium — Shivjeet Potdar","titleTemplate":"%s — Conscious Omnium","description":"Conscious Omnium is the practice of Shivjeet Potdar — architect, interior and production designer, and filmmaker. Built space, miniatures, renders and screen work circling ruin, memory and the boundary between reality and fiction.","ogImage":"/work/the-black-taj-mahal.jpg"}'::jsonb)
on conflict (id) do update set
  brand = excluded.brand, brand_line = excluded.brand_line, tagline = excluded.tagline, nav = excluded.nav,
  hero = excluded.hero, footer_note = excluded.footer_note, contact_copy = excluded.contact_copy, seo = excluded.seo;

insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'ruin-and-remembrance', 'Ruin & Remembrance', 'Work that sits with decay — the Deccan forts, the bombed walls, the monuments half-returned to ground — and asks what it means to hold, conserve or resurrect a place without embalming it.', 'Ongoing', '/work/the-formalin-man.jpg', true, true, 1)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'miniature-worlds', 'Miniature Worlds', 'Landscapes and cities built at the scale of a table — plaster, box board, mirror, fern — then photographed until the seam between model and world disappears.', 'Ongoing', '/work/the-lost-city.jpg', true, true, 2)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'building-and-spatial-practice', 'Building & Spatial Practice', 'Realised and speculative architecture — a pavilion of bent steel, a house that breathes in a dry climate, a tower that grows out of a quarry it is trying to heal.', '2017 — ongoing', '/work/natures-rage-render.jpg', true, true, 3)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'screen-myth-and-mark', 'Screen, Myth & Mark', 'Production design, title cards, posters and identities — where a Kannada feature, a Prime Original and a coffee house are all folded back into Indian myth.', 'Ongoing', '/work/lore-tools.jpg', false, true, 4)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;
insert into public.collections (slug, title, description, period, cover_image, featured, published, sort_order) values (
  'paint-and-line', 'Paint & Line', 'The quiet register of the practice — an abstract Shiva emerging from a blue cosmos, an entire seascape reduced to four lines.', 'Ongoing', '/work/shiva.jpg', false, true, 5)
on conflict (slug) do update set
  title = excluded.title, description = excluded.description, period = excluded.period,
  cover_image = excluded.cover_image, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;

insert into public.works (
  slug, title, year, year_sort, discipline, kind, medium, dimensions, client, location, role,
  summary, description, statement, concept, process, credits, collection_slug, status, availability,
  price, currency, price_visible, featured, sort_order, cover_image, accent, images, related_slugs, seo, published_at
) values (
  'shiva', 'Shiva', null, 2016, 'art', 'Painting', 'Oil on canvas', null, null, null, null,
  'An abstract portrait of Shiva emerging from the deep blue cosmos.', '["An abstract depiction of a portrait of Shiva, emerging from the deep blue cosmos. The face never fully resolves — a mouth in red, a column of pale light where a nose and brow might be, the rest given over to the dark.","The painting works the way the idea does: the god is not an image to be looked at so much as a pressure felt at the edge of sight, a figure the cosmos is still in the act of forming."]'::jsonb, 'I wanted the divine to arrive the way it does in the oldest stories — not as a body, but as something the darkness is busy assembling.', null, null, '[]'::jsonb, 'paint-and-line', 'published', 'enquire',
  null, 'INR', false, true, 2, '/work/shiva.jpg', '#2f3d63', '[{"id":"shiva-cover-0","url":"/work/shiva.jpg","alt":"Shiva — abstract oil portrait emerging from a deep blue cosmos, with a mouth rendered in red","kind":"cover","caption":null,"width":2200,"height":1524,"sortOrder":0}]'::jsonb, '["four-lines-essence","five-elements"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'ghosts-of-takht-mahal', 'Ghosts of Takht Mahal', null, 2016, 'photography', 'Miniature & photograph', 'Miniature built in box board, photo-manipulated', null, null, 'Takht Mahal, Bidar Fort', null,
  'The lore says a pregnant woman was buried alive in these walls. A model of the ruin, lit for the ghost.', '["The lore says that a pregnant woman was buried alive in the walls of the Takht Mahal. It is believed that the negative energy still holds those walls standing — that they survived severe bombing by later conquests because of what is sealed inside them.","The scene is a miniature, built in box board and then photographed and manipulated until dusk settles over it. A figure in red carries a lamp across the courtyard toward the ruin, small enough to be a memory of herself."]'::jsonb, 'A ruin keeps its stories in the mortar. I built this one small so I could stand a ghost in it.', null, null, '[]'::jsonb, 'ruin-and-remembrance', 'published', 'enquire',
  null, 'INR', false, true, 3, '/work/ghosts-takht-mahal.jpg', '#5b3a4b', '[{"id":"ghosts-cover-0","url":"/work/ghosts-takht-mahal.jpg","alt":"Ghosts of Takht Mahal — a box-board miniature of the ruined palace at dusk, a lamp-carrying figure in red crossing the courtyard","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["the-formalin-man","columns-of-past","the-lost-city"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'the-lost-city', 'The Lost City', null, 2016, 'experimental', 'Miniature & photograph', 'Miniature carved in plaster of Paris, painted and photo-manipulated', null, null, null, null,
  'An abandoned city, left to decay, waiting to be revealed in a great expanse of undulating blue desert.', '["An abandoned city left to decay for many years awaits its revelation in a large expanse of undulating blue desert.","The terrain is carved in plaster of Paris, painted, and then photo-manipulated so the horizon reads as endless. A lone traveller and a thread of smoke are the only evidence that the city was ever found again."]'::jsonb, null, null, null, '[]'::jsonb, 'miniature-worlds', 'published', 'enquire',
  null, 'INR', false, false, 4, '/work/the-lost-city.jpg', '#2f4d7a', '[{"id":"lost-city-cover-0","url":"/work/the-lost-city.jpg","alt":"The Lost City — a plaster miniature of a ruined city in a blue desert, shot to read as a vast landscape","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["abandoned-for-good","the-shapeshifting-landscape","ghosts-of-takht-mahal"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'abandoned-for-good', 'Abandoned for Good', null, 2016, 'experimental', 'Miniature & photograph', 'Miniature carved in plaster of Paris, painted and photo-manipulated', null, null, null, null,
  'As the light diminishes and the darkness takes over, the wilderness lurks in.', '["As the light diminishes and the darkness takes over, the wilderness lurks in.","A settlement carved in plaster, then all but swallowed by night in the photograph — a scatter of lamps along a path is the last of the human hold on the place before it is given back."]'::jsonb, null, null, null, '[]'::jsonb, 'miniature-worlds', 'published', 'enquire',
  null, 'INR', false, false, 5, '/work/abandoned-for-good.jpg', '#1f2740', '[{"id":"abandoned-cover-0","url":"/work/abandoned-for-good.jpg","alt":"Abandoned for Good — a plaster settlement at night, only a line of small lamps still lit along a path","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["the-lost-city","the-shapeshifting-landscape"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'resurrection-from-the-ruins', 'Resurrection from the Ruins', null, 2017, 'architecture', 'Speculative architecture', '3D rendered and photo-manipulated', null, null, 'Deccan fort landscape', null,
  'A tower rises out of a decaying site to make it liveable again.', '["A tower emerges from a decaying place to make it liveable again. It is grafted onto the ruin rather than clearing it — the old stone base is kept, and a stacked, porous structure grows up from it, terraces spilling green.","Rendered in 3D and set back into a photograph of the fort landscape, birds crossing the frame, the proposal argues that a monument can carry new life without being erased to do so."]'::jsonb, null, null, null, '[]'::jsonb, 'ruin-and-remembrance', 'published', 'enquire',
  null, 'INR', false, true, 6, '/work/resurrection-from-the-ruins.jpg', '#3f6b86', '[{"id":"resurrection-cover-0","url":"/work/resurrection-from-the-ruins.jpg","alt":"Resurrection from the Ruins — a tall porous tower growing from the stone base of a ruined fort, terraces planted green","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["columns-of-past","the-act-of-building-is-a-sin","natures-rage"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'columns-of-past', 'Columns of Past', null, 2017, 'architecture', 'Speculative architecture', '3D rendered and photo-manipulated', null, null, null, null,
  'Wooden columns lost to explosions return in glass — a quiet reminder of what stood there.', '["The wooden columns once perished by explosions are replaced by glass columns, as a subtle reminder of the past.","In the render, the new columns barely interrupt the light falling through the jaali screens; they mark the grid of the lost hypostyle hall without pretending to be it."]'::jsonb, null, null, null, '[]'::jsonb, 'ruin-and-remembrance', 'published', 'enquire',
  null, 'INR', false, false, 7, '/work/columns-of-past.jpg', '#7a6a4c', '[{"id":"columns-cover-0","url":"/work/columns-of-past.jpg","alt":"Columns of Past — a ruined hall rebuilt with transparent glass columns on the footprint of the lost wooden ones","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["resurrection-from-the-ruins","ghosts-of-takht-mahal","the-formalin-man"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'the-formalin-man', 'The Formalin Man', null, 2016, 'photography', 'Photograph', 'Photograph — a conservation worker on the ruins of Bidar Fort', null, null, 'Bidar Fort, Karnataka', null,
  'Ruins are history''s hard copy. He stands in them to hold off the decay — the fort''s formalin man.', '["Architectural ruins stand as a hard copy of history. Here a man stands to battle the decay of those ruins and becomes its formalin man — the preservative that keeps a specimen from turning.","The photograph is of a conservation worker on the ruins of Bidar Fort, framed through the arches so the figure is small, patient, and permanently on duty."]'::jsonb, 'Conservation is a strange, tender job — you are the chemical that stops a thing from becoming what time wants it to become.', null, null, '[]'::jsonb, 'ruin-and-remembrance', 'published', 'enquire',
  null, 'INR', false, true, 8, '/work/the-formalin-man.jpg', '#9a5f3c', '[{"id":"formalin-cover-0","url":"/work/the-formalin-man.jpg","alt":"The Formalin Man — a conservation worker standing in the arched ruins of Bidar Fort, seen through a run of pointed arches","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["ghosts-of-takht-mahal","columns-of-past","resurrection-from-the-ruins"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'balance-of-forms', 'Balance of Forms', null, 2016, 'experimental', 'Architectural model', 'Miniature — craft board and mount board', null, null, null, null,
  'A dominant central tower, held in balance by the intricate forms around it.', '["A dominant tower at the centre is balanced by the various intricate forms surrounding it. Smaller pieces assemble into a pathway that climbs to the top of the tower.","The study is built entirely in craft board and mount board — a composition exercise about how much a single mass can be asked to hold before the field around it has to answer back."]'::jsonb, null, null, null, '[]'::jsonb, 'miniature-worlds', 'published', 'enquire',
  null, 'INR', false, false, 9, '/work/balance-of-forms.jpg', '#6d6357', '[{"id":"balance-cover-0","url":"/work/balance-of-forms.jpg","alt":"Balance of Forms — a craft-board model of a tall central tower ringed by smaller stepped forms that build a path to its top","kind":"cover","caption":null,"width":2200,"height":1690,"sortOrder":0}]'::jsonb, '["the-act-of-building-is-a-sin","resurrection-from-the-ruins"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'the-shapeshifting-landscape', 'The Shape-Shifting Landscape', null, 2016, 'experimental', 'Miniature & photograph', 'Miniature in plaster of Paris — mirrors for water, ferns for vegetation — photo-manipulated', null, null, null, null,
  'Every time the winds whisper, the lands change their faces.', '["Every time the winds whisper, the lands change their faces.","The dunes are plaster of Paris, the ponds are set mirrors, the vegetation is fern; a caravan crosses the ridge. Photographed low and warm, the model becomes a desert that has clearly been a different desert the day before."]'::jsonb, null, null, null, '[]'::jsonb, 'miniature-worlds', 'published', 'enquire',
  null, 'INR', false, false, 10, '/work/the-shapeshifting-landscape.jpg', '#a8894f', '[{"id":"shapeshifting-cover-0","url":"/work/the-shapeshifting-landscape.jpg","alt":"The Shape-Shifting Landscape — a plaster desert with mirror ponds and fern vegetation, a small caravan crossing a dune","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["the-lost-city","abandoned-for-good"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'objects-of-space', 'Objects of Space', null, 2016, 'photography', 'Photograph', 'Photograph — the interior of a pierced tin can', null, null, null, null,
  'A photograph taken inside a Coca-Cola can, pierced from outside so its red bleeds into the space within.', '["A photograph taken from the opening of a Coca-Cola tin can, which is poked from outside so that its external red colour projects into the space inside.","The everyday object becomes an incredible space the moment it is given a human scale — a small seated figure at the base turns the can into a lit, domed chamber."]'::jsonb, 'Give any ordinary thing a person to stand in it and it stops being an object. That is most of architecture.', null, null, '[]'::jsonb, 'miniature-worlds', 'published', 'enquire',
  null, 'INR', false, false, 11, '/work/objects-of-space.jpg', '#8f7b2f', '[{"id":"objects-space-cover-0","url":"/work/objects-of-space.jpg","alt":"Objects of Space — the interior of a Coca-Cola can photographed as a vast domed chamber, a tiny seated figure at its base","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["the-shapeshifting-landscape","balance-of-forms"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'fubar-first-look', 'FUBAR — First Look', null, 2018, 'production-design', 'Title design & first-look poster', 'Title design and first-look poster', null, 'A Kiran G. Maney film', null, 'Title design, first-look poster',
  'Title design and the first-look poster for the Kannada feature film FUBAR.', '["The title design and first-look poster for the Kannada feature film FUBAR, a Kiran G. Maney film.","The key art holds the ensemble inside a single fractured colour field — school corridor, festival haze, the lead in a green-and-gold saree — with the FUBAR wordmark cut through the middle so the R breaks away."]'::jsonb, null, null, null, '[{"role":"Director","name":"Kiran G. Maney"},{"role":"Cast","name":"Shweta Hegde, Harish Raj, Frenny Pinto, Allan Charan"},{"role":"Cast","name":"Arasu Kumar, Shreyas Udupa, Sachin Acharya, Bhoomi Jonas"},{"role":"Music","name":"Maestro Music"}]'::jsonb, 'screen-myth-and-mark', 'published', 'not-for-sale',
  null, 'INR', false, true, 12, '/work/fubar.jpg', '#3b6b52', '[{"id":"fubar-cover-0","url":"/work/fubar.jpg","alt":"FUBAR first-look poster — the ensemble cast inside a fractured colour field with the FUBAR wordmark cut across the centre","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["terror-nature","lore-poster"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'terror-nature', 'Terror Nature', null, 2017, 'production-design', 'Character design & poster', 'Character design and short-film poster', null, null, null, 'Character design, poster',
  'A character design for the short film Terror Nature — a nature god in the clothes of a poor young man.', '["A character design for the short film Terror Nature: a nature god in the attire of a poor young man.","Paper crown, a phone held up like an offering, a length of red cloth unravelling into the storm behind him — divinity dressed down to the point where you would walk past it."]'::jsonb, null, null, null, '[]'::jsonb, 'screen-myth-and-mark', 'published', 'not-for-sale',
  null, 'INR', false, false, 13, '/work/terror-nature.jpg', '#b23b30', '[{"id":"terror-nature-cover-0","url":"/work/terror-nature.jpg","alt":"Terror Nature — a young man with a paper crown against a stormy sky, a long red cloth unspooling into the clouds","kind":"cover","caption":null,"width":2200,"height":874,"sortOrder":0}]'::jsonb, '["fubar-first-look","lore-poster"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'four-lines-essence', 'Four Lines, an Essence', null, 2015, 'art', 'Drawing', 'Ink on paper', null, null, null, null,
  'Mountains, a sea, the rushing waves, the horizon, the wind, the reach of the land and the sky — all of it in four lines.', '["A scenery with mountains, a huge sea, the waves rushing, the horizon, the wind direction, the extent of the landscape and the sky — all of it expressed in as little as four lines.","A reduction exercise, and a statement of intent: how far can a drawing be pared back before the landscape stops arriving?"]'::jsonb, 'Four lines. If the sea still comes in, you have found the essence. If it doesn''t, you were drawing decoration.', null, null, '[]'::jsonb, 'paint-and-line', 'published', 'enquire',
  null, 'INR', false, false, 14, '/work/four-lines-essence.jpg', '#8a7d63', '[{"id":"four-lines-cover-0","url":"/work/four-lines-essence.jpg","alt":"Four Lines, an Essence — a minimal ink drawing on cream paper reducing an entire seascape to four gestural lines","kind":"cover","caption":null,"width":2200,"height":1407,"sortOrder":0}]'::jsonb, '["shiva","five-elements"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'lore-poster', 'LORE — Prime Original', null, 2018, 'graphic', 'Key art / poster design', 'Drawing and 3D software, photo-manipulated', null, 'Concept key art — Prime Video series LORE', null, 'Poster design',
  'Two poster directions for the Prime Original series LORE — the show''s tools and horrors built into the title.', '["Poster design for the Prime Original series LORE. In the first direction the tools and horrors of the show are embedded directly into the letters — a hangman''s noose, a plague mask, a scythe, a pentagram struck through the O.","The show tells the story of events in history, inscribed in blood. The second direction takes that literally: the title is carved into rock and the cuts run red, modelled in 3D and manipulated back into stone."]'::jsonb, null, null, null, '[]'::jsonb, 'screen-myth-and-mark', 'published', 'not-for-sale',
  null, 'INR', false, true, 15, '/work/lore-tools.jpg', '#7c7f7a', '[{"id":"lore-tools-cover-0","url":"/work/lore-tools.jpg","alt":"LORE poster — the title drawn from the tools and horrors of the series, a pentagram through the O, on aged paper","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0},{"id":"lore-blood-gallery-1","url":"/work/lore-blood.jpg","alt":"LORE poster, second direction — the title carved into rock with the cuts filled red like inscribed blood","kind":"gallery","caption":null,"width":2200,"height":1495,"sortOrder":1}]'::jsonb, '["fubar-first-look","terror-nature","india-coffee-house-rebrand"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'natures-rage', 'Nature''s Rage', null, 2017, 'architecture', 'Architecture — residential', '3D rendered and photo-manipulated', null, null, 'Turahalli forest edge, Bengaluru', 'Design',
  'A residential complex on the edge of Turahalli forest, redesigned so that you live a forest rather than view one.', '["How would you like to hear a koel in the mornings, to catch a peacock dancing at your window, to have fresh breeze through your lungs and a flower garden at the back — the lush green of the forest and urban life in the same address?","The site is an existing residential complex standing at the edge of Turahalli forest, Bengaluru. The intervention promotes living a forest versus viewing a forest: a lattice structure whose surface is a growth medium, so the building''s skin is gradually replaced by vegetation. Water ponds at the green edge draw fauna; fruiting and flowering plants bring in birds, beetles and butterflies; the section lets nature''s rainwater runoff continue uninterrupted.","It celebrates the spirit of growing nature — and so Nature''s Rage begins through this design, and continues."]'::jsonb, 'The building is not the point. The point is whether, in twenty years, you can still tell where it ends and the forest begins.', 'Nature space, semi-public space and private apartments interlocked in a single diagonal lattice. Green cover filters the west sun to a glare-free view. Earth-coloured structure so the mass reads as ground, not object.', null, '[]'::jsonb, 'building-and-spatial-practice', 'published', 'enquire',
  null, 'INR', false, true, 16, '/work/natures-rage-render.jpg', '#4b6b3a', '[{"id":"natures-rage-render-cover-0","url":"/work/natures-rage-render.jpg","alt":"Nature''s Rage — a large diagonal green-clad structure merging into the Turahalli forest landscape, a peacock in the foreground","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0},{"id":"natures-rage-section-drawing-1","url":"/work/natures-rage-section.jpg","alt":"Nature''s Rage — a section through the forest edge showing the lattice building stepping down from Turahalli forest to Bengaluru city, and an interior overtaken by plants and birds","kind":"drawing","caption":null,"width":2200,"height":1495,"sortOrder":1}]'::jsonb, '["the-act-of-building-is-a-sin","resurrection-from-the-ruins","sumans-residence"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'the-act-of-building-is-a-sin', 'The Act of Building Itself Is a Sin', null, 2017, 'architecture', 'Speculative architecture', 'Miniature carved in plaster of Paris, painted and photo-manipulated', null, null, 'A disused quarry', 'Design',
  'If building at all is a sin, then build on the dead ground — the scarred face of a quarry — and bring it back to life.', '["The very fact of building a building, and taking a valuable piece of land to do it, is unsustainable. But care taken over what is built, and on what kind of land, can change that. A land space that is an eco-void — little ecosystem, non-regenerating, such as the scarred face of a quarry — can carry a permanent structure that reclaims the dead space and makes it alive again.","The proposal threads a programme through the cut rock: an auditorium braced against the quarry wall, semi-open workshops on the floor, a cycle path and bridge stitching the two faces together, and a transformable structure at the quarry-life intersection."]'::jsonb, 'You cannot build without taking something. So take the ground nobody wants, and give it back more than you took.', 'Quarry–life intersection · buttressed auditorium · semi-open workshops · cycle pathway and bridge · transformable structure.', null, '[]'::jsonb, 'building-and-spatial-practice', 'published', 'enquire',
  null, 'INR', false, false, 17, '/work/the-act-of-building-is-a-sin.jpg', '#6f6152', '[{"id":"act-building-cover-0","url":"/work/the-act-of-building-is-a-sin.jpg","alt":"The Act of Building Itself Is a Sin — a plaster model of an architectural programme threaded into the cut face of a quarry, with a section alongside","kind":"cover","caption":null,"width":2200,"height":874,"sortOrder":0}]'::jsonb, '["natures-rage","resurrection-from-the-ruins","balance-of-forms"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'pavilion-rvca-x', 'Pavilion RVCA X', '2017', 2017, 'spatial-design', 'Built installation', 'Bent steel and stretched jute fabric', null, null, 'RV College of Architecture, Bengaluru', 'Design and build',
  'A curvilinear pavilion for the RVCA exhibition, 2017 — bent steel anchored to the ground, framing stretched jute.', '["A curvilinear pavilion running through the central congregational area of RV College of Architecture during the 2017 exhibition.","8 torr steel is bent to shape and anchored into the landscape; stretched jute fabric is framed within it. The result is a soft, structural canopy that people walk under, sit against and photograph — a piece of built spatial design rather than a drawing of one."]'::jsonb, null, null, null, '[]'::jsonb, 'building-and-spatial-practice', 'published', 'not-for-sale',
  null, 'INR', false, true, 18, '/work/pavilion-rvca-x.jpg', '#9c6b46', '[{"id":"pavilion-cover-0","url":"/work/pavilion-rvca-x.jpg","alt":"Pavilion RVCA X — a curved canopy of bent steel and stretched jute fabric installed across a college courtyard, during construction and completed","kind":"cover","caption":null,"width":2200,"height":874,"sortOrder":0}]'::jsonb, '["natures-rage","rkva-bidar","sumans-residence"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'sumans-residence', 'Suman''s Residence', null, 2018, 'architecture', 'Architecture — residential', '3D rendered', null, null, 'Northern Karnataka', 'Design',
  'A house for a hot, dry climate — a breathable façade of climbers on a steel grill, rising from exposed-brick planters.', '["A residence in northern Karnataka, where the climate is hot and dry.","The elevation is designed around a steel grill that lifts out of exposed-brick planters; climbers are trained over it so the façade fills in with living shade. The house ends up with a breathable, nature-welcoming front that is right for the weather it has to stand in."]'::jsonb, null, null, null, '[]'::jsonb, 'building-and-spatial-practice', 'published', 'enquire',
  null, 'INR', false, false, 19, '/work/sumans-residence.jpg', '#8a6a44', '[{"id":"sumans-cover-0","url":"/work/sumans-residence.jpg","alt":"Suman''s Residence — a rendered elevation of a white house in northern Karnataka with brick planters and a steel grill carrying climbing plants","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["natures-rage","rkva-bidar","pavilion-rvca-x"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'rkva-bidar', 'Ramakrishna Vivekananda Ashrama, Bidar', null, 2018, 'architecture', 'Architecture — institutional', '3D rendered', null, null, 'Bidar, Karnataka', 'Elevation design',
  'An elevation for the Bidar ashrama that takes the Adil Shahi motifs of the city and says them in a contemporary voice.', '["The elevation design of the Ramakrishna Vivekananda Ashrama, Bidar, derives some of its architectural motifs from the native Adil Shahi architecture of Bidar and expresses them in a contemporary style.","Arched niches and a crenellated parapet quote the old city; the red vertical fins and the flat planes between them are the present day. The building belongs to Bidar without being a costume of it."]'::jsonb, null, null, null, '[]'::jsonb, 'building-and-spatial-practice', 'published', 'not-for-sale',
  null, 'INR', false, false, 20, '/work/rkva-bidar.jpg', '#9a4b3c', '[{"id":"rkva-cover-0","url":"/work/rkva-bidar.jpg","alt":"Ramakrishna Vivekananda Ashrama, Bidar — a rendered elevation with arched niches and a crenellated parapet quoting Adil Shahi architecture, with contemporary red vertical fins","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["sumans-residence","columns-of-past","pavilion-rvca-x"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'the-black-taj-mahal', 'The Black Taj Mahal', null, 2018, 'architecture', 'Speculative architecture', '3D rendered and photo-manipulated', null, null, 'Yamuna riverfront, opposite the Taj Mahal, Agra', 'Design',
  'The Black Taj that was meant to stand across the Yamuna — rebuilt here as black marble blocks holding a glass wall for love stories.', '["On the other side of the Yamuna, a Black Taj Mahal was supposed to exist. This proposal builds it as a composition of black marble blocks, placed in symmetry and balance with the Taj Mahal, holding a huge glass wall.","On that glass wall, people write their love — their stories, the names of the ones they love — inscribing their memory onto the Monument of Love. With the Taj as its backdrop it becomes a performance platform, and in the quiet hours a museum of love stories."]'::jsonb, 'The Taj is a tomb pretending to be a love story. The Black Taj could just be the love story.', null, null, '[]'::jsonb, 'ruin-and-remembrance', 'published', 'enquire',
  null, 'INR', false, true, 21, '/work/the-black-taj-mahal.jpg', '#3f4750', '[{"id":"black-taj-cover-0","url":"/work/the-black-taj-mahal.jpg","alt":"The Black Taj Mahal — black marble blocks and a large glass wall on the Yamuna riverbank, the white Taj Mahal across the water","kind":"cover","caption":null,"width":2200,"height":874,"sortOrder":0}]'::jsonb, '["resurrection-from-the-ruins","columns-of-past","natures-rage"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'india-coffee-house-rebrand', 'The Divine Coffee — India Coffee House', null, 2018, 'graphic', 'Identity / rebranding', 'Logo and identity design', null, null, null, 'Identity design',
  'A rebrand of the India Coffee House that pours the Samudra Manthan into the cup.', '["A rebranding of the India Coffee House that introduces Hindu mythological elements into the mark.","The churning of the ocean of milk — the Devas on one side, the Asuras on the other, pulling Mount Mandara wrapped in the serpent king Vasuki, to win the nectar of immortality — is redrawn as a single red emblem, the coffee cup where the mountain''s peak should be. The line reads: The Divine Coffee."]'::jsonb, null, null, null, '[]'::jsonb, 'screen-myth-and-mark', 'published', 'not-for-sale',
  null, 'INR', false, false, 22, '/work/india-coffee-house.jpg', '#9c3b32', '[{"id":"india-coffee-cover-0","url":"/work/india-coffee-house.jpg","alt":"The Divine Coffee — a red emblem for the India Coffee House rendering the churning of the ocean of milk with a coffee cup at its summit","kind":"cover","caption":null,"width":2200,"height":1654,"sortOrder":0}]'::jsonb, '["five-elements","lore-poster"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'flush-credits', 'Flush Credits', null, 2017, 'experimental', 'Speculative product design', 'Concept — product and system design', null, null, null, 'Concept and system design',
  'An infotech flush plate that pays a household in bio-gas credits for using the toilet instead of the open.', '["An infotech flush plate for public toilets. A fingerprint scanner on the plate identifies the person; on recognition it blinks green and triggers the flush. Every use is logged to a web account for that person or family.","Night soil collected becomes bio-gas. For a family of four, a day''s use generates enough fuel to cook a day''s food — replacing the dry wood that would otherwise be burned, with its emissions, in rural areas. The credits earned are redeemable, which turns using a toilet into a small income and makes open defecation the worse deal.","Quantity sensors meter the water released so nothing is wasted; a green-red indicator flags incorrect operation; a jet of air dries the finger after scanning."]'::jsonb, 'Public health is usually sold as a duty. It works better sold as a return.', null, null, '[]'::jsonb, 'screen-myth-and-mark', 'published', 'not-for-sale',
  null, 'INR', false, false, 23, '/work/flush-credits.jpg', '#4a4f55', '[{"id":"flush-credits-cover-0","url":"/work/flush-credits.jpg","alt":"Flush Credits — a white fingerprint-scanning flush plate marked TAP TO FLUSH, with a system diagram linking toilet, bio-gas and a web account","kind":"cover","caption":null,"width":2200,"height":778,"sortOrder":0}]'::jsonb, '["five-elements","india-coffee-house-rebrand"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
  'five-elements', 'Five Elements', null, 2015, 'graphic', 'Logo / mark', 'Logo design', null, null, null, null,
  'A mark for the five elements — fire, water, earth, air and space, each given a single line.', '["A logo design representing the five elements of nature, each reduced to one mark: fire is a wavy line, water a double wavy line, earth a straight line, air a dotted line, and space a circle.","Assembled, the five lines make a single geometric figure — the seed of the Conscious Omnium identity."]'::jsonb, null, null, null, '[]'::jsonb, 'paint-and-line', 'published', 'not-for-sale',
  null, 'INR', false, false, 24, '/work/five-elements.jpg', '#b5642a', '[{"id":"five-elements-cover-0","url":"/work/five-elements.jpg","alt":"Five Elements — a geometric logo of circle, square and triangles overlaid with fire and water, representing the five elements of nature","kind":"cover","caption":null,"width":2200,"height":1495,"sortOrder":0}]'::jsonb, '["india-coffee-house-rebrand","four-lines-essence","shiva"]'::jsonb, '{}'::jsonb, '2019-01-01T00:00:00.000Z'
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
insert into public.exhibitions (title, year, venue, city, country, type, date_label, description, url, published, sort_order, related_slugs) values (
  'Pavilion RVCA X', '2017', 'RV College of Architecture', 'Bengaluru', 'India', 'installation', 'Annual Exhibition, 2017', 'A curvilinear pavilion of bent steel and stretched jute fabric, built across the central congregational area of the college for the annual exhibition.', null, true, 1, '["pavilion-rvca-x"]'::jsonb);

delete from public.timeline_entries;
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '1995', 'Drawing mythology', 'He likes drawing mythology. He likes living mythology — the gods are less pictures than housemates.', null, 'Origin', 1, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '1998', 'He wants to be an artist', 'He likes drawing. He likes drawing more. He decides he wants to be an artist.', null, 'Art', 2, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2001', '“All art is quite useless”', 'A line read too early and taken too literally: all art is quite useless, it has no purpose. He begins to prefer science to art — it is more useful.', null, 'Science', 3, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2004', 'He invents an electric dynamo', 'He wants to be a scientist. But he cannot give up on art.', null, 'Science', 4, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2007', 'Both are his friends', 'Art and science are both his friends now — but science is his right hand.', null, 'Both', 5, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2014', 'Architecture holds both', 'Architecture turns out to be a homogenous blend of art and science. Science is the body; art is its soul.', null, 'Architecture', 6, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2015', '“Everything you can imagine is real”', '— Pablo Picasso. The sentence that turns the practice toward what has not been built yet.', null, 'Turn', 7, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2016', 'Reality and fiction', 'The boundary between reality and fiction begins to fade — the miniatures, the renders set into real photographs, the ruins that might be resurrected.', null, 'Fiction', 8, true);
insert into public.timeline_entries (year, title, description, image, category, sort_order, published) values (
  '2017', 'Toward the screen', 'Fiction. Reality. The move into production design and filmmaking — where holding both is the whole job.', null, 'Film', 9, true);

insert into public.pages (slug, title, intro, sections, seo) values (
  'about', 'About', 'Shivjeet Potdar is an architect, interior and production designer, and filmmaker. The practice moves between built space, the photographed miniature, the render and the screen.', '[{"id":"about-throughline","eyebrow":"The throughline","heading":"Art and science, holding hands","layout":"text","body":["It started as a child drawing mythology and wanting to live in it. Then wanting to be an artist. Then deciding — after reading that all art is quite useless — that science was more useful, and building an electric dynamo to prove it.","Architecture became the place both could stand. Science is the body; art is its soul. The work since has circled one question: what to do with the ruin, the eco-void, the monument, the dead quarry — how to build so a place is reclaimed rather than erased.","Lately it has moved toward the boundary between reality and fiction: production design, character design, and the beginnings of filmmaking."]},{"id":"about-approach","eyebrow":"Approach","heading":"Whatever the idea needs","layout":"text","body":["A single project might be a plaster miniature photographed until the seam disappears, a 3D render set back into a real landscape, a built canopy of bent steel, or a title card for a Kannada feature. The medium is chosen by the idea, not the other way around.","The recurring materials are plaster of Paris, box board and craft board; a camera; rendering software; ink; oil paint. The recurring sites are the Deccan forts, the forest edge, the quarry, the riverbank opposite a famous tomb."]}]'::jsonb, '{"title":"About — Shivjeet Potdar","description":"Shivjeet Potdar — architect, interior and production designer, and filmmaker. B.Arch, RV College of Architecture, Bengaluru; Production Design, FTII Pune."}'::jsonb)
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;
insert into public.pages (slug, title, intro, sections, seo) values (
  'studio', 'Studio & Process', 'The practice is built at the scale of a table as often as at the scale of a site. Material first, then idea, then the long work of making one convince you of the other.', '[{"id":"studio-material","eyebrow":"01 — Material","heading":"Plaster, board, mirror, fern","layout":"image-right","image":"/work/the-shapeshifting-landscape.jpg","caption":"The Shape-Shifting Landscape — plaster dunes, set mirrors for water, fern for vegetation.","body":["Terrain is carved in plaster of Paris and painted. Buildings and cities are cut from box board, craft board and mount board. Water is a piece of mirror; a forest is a handful of fern; a caravan is three plastic camels.","Working small is not a compromise on the real thing — it is a way of testing an idea cheaply, at speed, with your hands."]},{"id":"studio-photograph","eyebrow":"02 — Image","heading":"Photograph, then manipulate","layout":"image-left","image":"/work/the-lost-city.jpg","caption":"The Lost City — a plaster model shot low, then extended into an endless blue desert.","body":["The model is lit and photographed at eye level, so the horizon reads as a horizon. Then the image is manipulated — sky extended, dusk introduced, a figure dropped in at the right scale — until the object becomes a world.","The goal is the moment the viewer forgets they are looking at something that fits on a desk."]},{"id":"studio-render","eyebrow":"03 — Render","heading":"Set the drawing back into the world","layout":"image-right","image":"/work/resurrection-from-the-ruins.jpg","caption":"Resurrection from the Ruins — a 3D proposal composited into a photograph of the fort landscape.","body":["For the speculative buildings — the tower over the ruin, the Black Taj, the lattice house on the forest edge — the structure is modelled in 3D and composited into a real photograph of the site, birds and all.","It keeps the proposal honest: it has to survive being placed next to the thing it wants to change."]},{"id":"studio-build","eyebrow":"04 — Build","heading":"And sometimes, build it","layout":"image-left","image":"/work/pavilion-rvca-x.jpg","caption":"Pavilion RVCA X — 8 torr steel bent to shape and anchored, framing stretched jute.","body":["Pavilion RVCA X was built at full scale for the 2017 college exhibition — bent steel anchored into the ground, jute stretched within it, a soft structure people walked under for a week.","The residential and institutional projects — Suman''s Residence, the Bidar ashrama — carry the same instinct into drawings meant to be constructed."]}]'::jsonb, '{"title":"Studio & Process — Conscious Omnium","description":"Inside the practice of Shivjeet Potdar: plaster miniatures, photographic manipulation, 3D renders composited into real sites, and built work."}'::jsonb)
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;
insert into public.pages (slug, title, intro, sections, seo) values (
  'contact', 'Contact', 'For collectors, collaborators, curators, institutions, production houses and commissions. Every enquiry is read personally.', '[]'::jsonb, '{"title":"Contact — Conscious Omnium","description":"Get in touch with Shivjeet Potdar — commissions, collaborations, exhibitions, production design and acquisitions."}'::jsonb)
on conflict (slug) do update set
  title = excluded.title, intro = excluded.intro, sections = excluded.sections, seo = excluded.seo;
