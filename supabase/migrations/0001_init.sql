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
