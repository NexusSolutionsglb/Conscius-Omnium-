# Visual Website Editor — full reference

An on‑page, click‑to‑edit editor for the whole public site. Open it at
**`/admin/edit/<page>`** (Admin → Content → **Edit site ✦**). It shows the real
public page in an iframe with an editing layer on top; a normal visitor loads
**zero** editor code and the site is byte‑for‑byte unchanged until you Publish.

Pages: `home`, `about`, `studio`, `work`, `exhibitions`, `contact` (top‑bar
dropdown). Header and footer are edited from any page.

---

## 1. The model

- **Page copy** → `pages.content` (one typed object per page: headings,
  paragraphs, labels, section order, hidden sections, repeatable blocks, custom
  blocks, per‑section styles).
- **Site‑wide** → `site_settings` (hero, contact copy, nav, brand, footer note +
  legal + copyright + credit, theme tokens).
- **Records** → their own tables (`works`, `collections`, `exhibitions`,
  `timeline_entries`, `profile`) — edited inline, written back on Publish.
- Every field has a **default equal to the original hard‑coded text**
  (`lib/content/defaults/*`, `lib/editor/theme.ts`,
  `lib/content/defaults/footer.ts`). Nothing saved ⇒ the site is identical.
- Edits live in a **per‑browser draft** (localStorage). **Publish** writes the
  draft to the database and revalidates. **Restore defaults** (top bar) resets
  all page content + theme to defaults (into the draft — nothing is live until
  you Publish).

---

## 2. Editing text

Click any highlighted heading / paragraph / label → type → click away (saves to
the draft). `Enter` finishes a single‑line field; `Esc` cancels. The big animated
page headings edit as plain text (the per‑letter animation can't host a cursor)
and animate normally in Preview and on the live site.

Template tokens stay literal while editing and fill in everywhere else:
`{count}` on `/work`, `{year}` / `{brand}` in the footer copyright, `{name}` /
`{roles}` in the footer credit.

## 3. Sections

Hover a section for its toolbar; **click once to lock it** (frame turns solid,
inspector opens).

| Button | Action |
| --- | --- |
| ⠿ / ↑ ↓ | Drag to reorder (live drop‑line), or step up/down |
| ⚙ | Open the inspector (fields + Appearance) |
| ⧉ | Duplicate |
| ⊘ | Hide / show (doesn't delete) |
| ⟲ | Restore this section's text to default |
| 🗑 | Delete (a built‑in section can be brought back with "Restore defaults") |

**Add a section** — the dashed **"+ Add section"** strip at the end of the home
page offers: Text block · Image · Pull quote · Call to action · Image gallery.
Each new block is fully editable, movable, duplicable, styleable and removable.

**Appearance** (in every home‑section inspector, and every custom block) —
Background: Default / Paper / Dim / Obsidian; Vertical spacing: Default / Tight /
Normal / Spacious.

## 4. Images

Hover any editable image → **🖼 Replace image** → Media library · Upload
(compressed in the browser) · Paste URL · Remove. The same picker is in every
inspector `image` field.

**Galleries** (work detail images, and the Image‑gallery block) — in a work's ⚙
panel: upload (multi), add from library / URL, replace, remove, **drag or ↑↓ to
reorder**, and per‑image alt / caption / kind.

## 5. What each page exposes

### Home
- **Hero** — click the eyebrow / heading / button text; ⚙ for the button link,
  the **featured‑work picker** (background swaps live), a custom image, and the
  "show work caption" toggle.
- **Intro** — eyebrow, link, the two biography paragraphs.
- **Featured work** — edit the featured set: covers, titles, add, reorder;
  toggling "Featured" in a work adds/removes it.
- **Disciplines** — eyebrow, heading, body, each blurb, each card's cover.
- **Timeline strip** — eyebrow, heading, body, link; the shown moments (year /
  title / description) and add.
- **Studio preview**, **Collections rail**, **Contact CTA** — all copy; the rail
  is full CRUD (below).
- Reorder / hide / duplicate / delete / style any of the above; add new blocks.

### About
Hero eyebrow, name, roles, intro, statement quote, portrait; **body sections**
(add / delete / duplicate / reorder); **education** (add / edit / reorder + ⚙);
timeline (one editable list in the editor — year / title / description / category
/ image per moment; the pinned scroll animation stays on the live site);
"His story — …" label; the "Next" CTA.

### Studio
Hero eyebrow + heading, intro; **process steps** (add / delete / duplicate /
reorder, each with an image); the end CTA.

### Work
Header eyebrow / heading / intro (keep `{count}`). The grid becomes an editable
grid in the editor — every work: cover inline, title / year inline, ⚙ for the
full record (title, slug, cover, year, discipline, kind, medium, dimensions,
summary, description, statement, concept, process, client, location, role,
collection, status, availability, price + visibility, featured, accent, **and
the gallery**). Add / duplicate / delete / reorder / hide (= draft). The
collections rail below is full CRUD.

### Exhibitions
Hero, list heading, empty message, "On screen" copy, "Training" heading, bottom
button. The exhibition list is a flat editable list in the editor (title / year
/ venue inline, ⚙ for the rest, add / duplicate / delete / reorder / visibility)
and stays year‑grouped on the live site. Training = the education list.

### Contact
Eyebrow, heading + supporting (shared with the home Contact CTA), the WhatsApp
button label, every detail‑row label, and the social links (add / edit / reorder
+ ⚙).

### Header / Footer (every page)
Brand name, brand line, every nav label — click them. Theme & nav panel: brand
fields, nav (add / remove / reorder / edit), footer note. Footer: note,
copyright line, studio‑credit line, disclaimer, "Owned by …" — all click‑to‑edit.
Social links live on the footer and the contact page.

### Collections / Exhibitions / Timeline records
Full inline CRUD wherever they appear: edit every field (⚙), reorder (drag),
add, duplicate, delete, and toggle visibility. Hidden records are dimmed with a
"Hidden" tag in the editor and don't render on the live site. Order persists to
`sort_order` on Publish.

### Theme & nav panel
Colours (page bg, ink, ink‑soft, ink‑mute, accent, accent‑deep); heading + body
font (6 presets); type‑scale; max content width. Applies live in the preview.

---

## 6. Save / Preview / Publish

| | |
| --- | --- |
| **Draft** | Auto‑saved to your browser. Survives refresh. Per‑browser — not shared, no multi‑user. |
| **Preview** | A mode toggle, no save. The draft with real animations and no editor chrome — exactly what visitors will see. |
| **Publish** | Writes the draft to the database (page content, settings, theme, profile, and every added / edited / removed / reordered record), revalidates, clears the draft. |
| **Undo / redo** | 50 steps. |

---

## 7. Not yet in the editor

- The work **detail page** (`/work/<slug>`) isn't inline‑editable and the editor
  can't open it — but every work field is editable from the `/work` grid's ⚙
  panel, and Publish revalidates the detail page.
- Duplicating a **built‑in** section (vs a custom block) repeats its key in the
  order; the two instances aren't independently addressable. Use hide, or a
  custom block, for structural changes.
- The enquiry form / event popup — separate Form Builder feature.

---

## 8. Database migrations

Run in Supabase → SQL Editor if not already applied.

**`0002_page_content.sql`**
```sql
alter table public.pages add column if not exists content jsonb not null default '{}'::jsonb;
insert into public.pages (slug, title)
values ('home','Home'),('work','Work'),('exhibitions','Exhibitions')
on conflict (slug) do nothing;
```

**`0003_site_chrome.sql`** — theme + footer (legal / owner / copyright / credit)
```sql
alter table public.site_settings
  add column if not exists theme  jsonb not null default '{}'::jsonb,
  add column if not exists header jsonb not null default '{}'::jsonb,
  add column if not exists footer jsonb not null default '{}'::jsonb;
```

Without `0002`, Publish fails on page content. Without `0003`, everything
publishes **except** theme + footer legal/copyright/credit, and the toast says so.

---

## 9. Where the code lives

| Piece | File(s) |
| --- | --- |
| Content types | `lib/types.ts` (`*Content`, `CustomBlock`, `ThemeTokens`) |
| Defaults (= original copy) | `lib/content/defaults/*` |
| Read + merge | `lib/queries/pages.ts`, `lib/content/defaults/index.ts` |
| Editor store | `lib/editor/{store,paths,bind,types,theme,section-style,new-entities}.ts` |
| Inspector schema | `lib/editor/inspector-schema.ts` |
| Shell / topbar / panels | `components/editor/{editor-shell,editor-topbar,settings-panel,inspector-panel}.tsx` |
| On‑page overlay | `components/editor/{edit-bridge,section-overlay,image-overlay,image-dialog,gallery-editor,add-section-bar,repeatable-list,editable-*}.tsx` |
| Publish action | `lib/admin/actions.ts` `publishSite`; row mappers `lib/admin/entity-rows.ts` |
| Page views (read live content) | `components/{home/home-sections,home/sections,home/hero,home/featured-work,home/custom-block,about/about-view,studio/studio-view,work/work-index,work/work-index-header,exhibitions/exhibitions-view,contact/contact-view,timeline/timeline,site/header,site/footer}.tsx` |
| Migrations | `supabase/migrations/0002_page_content.sql`, `0003_site_chrome.sql` |
