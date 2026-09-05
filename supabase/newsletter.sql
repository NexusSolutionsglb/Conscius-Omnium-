-- ═══════════════════════════════════════════════════════════════
--  CONSCIUS OMNIUM™ — newsletter patch
--  Paste this whole file into the Supabase SQL Editor and Run.
--  Identical to migrations/0005_newsletter.sql. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
--  0005 · newsletter + enquiry source
--  • inquiries.source        — which form the enquiry came from
--  • newsletter_subscribers  — the mailing list
--  • newsletter_campaigns    — a log of what was sent, to whom, when
--  Subscribe / unsubscribe run through SECURITY DEFINER functions so the
--  public never needs SELECT on the subscriber table (no email harvesting)
--  and duplicates are resolved inside the database.
--  Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════

-- ─── enquiry source ───────────────────────────────────────────────
alter table public.inquiries
  add column if not exists source text;

-- ─── subscribers ──────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  name             text,
  status           text not null default 'subscribed'
                     check (status in ('subscribed','unsubscribed')),
  source           text,
  token            text not null default encode(gen_random_bytes(16), 'hex'),
  subscribed_at    timestamptz not null default now(),
  unsubscribed_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- One row per address, case-insensitively — this is what makes a duplicate
-- subscription impossible rather than merely unlikely.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));
create unique index if not exists newsletter_subscribers_token_key
  on public.newsletter_subscribers (token);
create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);

-- ─── campaign log ─────────────────────────────────────────────────
create table if not exists public.newsletter_campaigns (
  id           uuid primary key default gen_random_uuid(),
  subject      text not null,
  preheader    text,
  intro        text,
  body         jsonb not null default '[]'::jsonb,
  cta_label    text,
  cta_href     text,
  status       text not null default 'draft'
                 check (status in ('draft','sent')),
  sent_at      timestamptz,
  sent_count   integer not null default 0,
  failed_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists newsletter_campaigns_created_idx
  on public.newsletter_campaigns (created_at desc);

do $$
declare t text;
begin
  foreach t in array array['newsletter_subscribers','newsletter_campaigns']
  loop
    if not exists (
      select 1 from pg_trigger where tgname = t || '_touch'
    ) then
      execute format(
        'create trigger %I_touch before update on public.%I
         for each row execute function public.touch_updated_at()', t, t);
    end if;
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════
--  RLS — admin-only. The public reaches the list through the functions
--  below, never through the table.
-- ═══════════════════════════════════════════════════════════════════
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns   enable row level security;

drop policy if exists "newsletter_subscribers admin all" on public.newsletter_subscribers;
create policy "newsletter_subscribers admin all" on public.newsletter_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "newsletter_campaigns admin all" on public.newsletter_campaigns;
create policy "newsletter_campaigns admin all" on public.newsletter_campaigns
  for all using (public.is_admin()) with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
--  SUBSCRIBE / UNSUBSCRIBE
-- ═══════════════════════════════════════════════════════════════════

-- Returns the outcome so the app knows whether to send a welcome email:
--   'subscribed'   — brand new address
--   'resubscribed' — previously unsubscribed, now back on the list
--   'duplicate'    — already an active subscriber, nothing changed
create or replace function public.newsletter_subscribe(
  p_email  text,
  p_name   text default null,
  p_source text default null
)
returns table (outcome text, token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_name  text := nullif(trim(coalesce(p_name, '')), '');
  v_row   public.newsletter_subscribers%rowtype;
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;

  select * into v_row
  from public.newsletter_subscribers
  where lower(email) = v_email;

  if not found then
    insert into public.newsletter_subscribers (email, name, source)
    values (v_email, v_name, nullif(trim(coalesce(p_source, '')), ''))
    returning * into v_row;
    return query select 'subscribed'::text, v_row.token;
    return;
  end if;

  if v_row.status = 'unsubscribed' then
    update public.newsletter_subscribers
    set status = 'subscribed',
        name = coalesce(v_name, name),
        source = coalesce(nullif(trim(coalesce(p_source, '')), ''), source),
        subscribed_at = now(),
        unsubscribed_at = null
    where id = v_row.id
    returning * into v_row;
    return query select 'resubscribed'::text, v_row.token;
    return;
  end if;

  -- Already on the list. Fill in a name if we didn't have one, but do not
  -- treat it as a new subscription.
  if v_name is not null and v_row.name is null then
    update public.newsletter_subscribers set name = v_name where id = v_row.id;
  end if;
  return query select 'duplicate'::text, v_row.token;
end;
$$;

create or replace function public.newsletter_unsubscribe(p_token text)
returns table (outcome text, email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.newsletter_subscribers%rowtype;
begin
  select * into v_row
  from public.newsletter_subscribers
  where token = trim(p_token);

  if not found then
    return query select 'unknown'::text, null::text;
    return;
  end if;

  if v_row.status = 'unsubscribed' then
    return query select 'already'::text, v_row.email;
    return;
  end if;

  update public.newsletter_subscribers
  set status = 'unsubscribed', unsubscribed_at = now()
  where id = v_row.id;

  return query select 'unsubscribed'::text, v_row.email;
end;
$$;

revoke all on function public.newsletter_subscribe(text, text, text) from public;
revoke all on function public.newsletter_unsubscribe(text) from public;
grant execute on function public.newsletter_subscribe(text, text, text) to anon, authenticated;
grant execute on function public.newsletter_unsubscribe(text) to anon, authenticated;

-- Verify:
--   select * from public.newsletter_subscribe('test@example.com', 'Test', 'footer');
--   select * from public.newsletter_subscribe('TEST@example.com');  -- duplicate
--   select email, status, source from public.newsletter_subscribers;
