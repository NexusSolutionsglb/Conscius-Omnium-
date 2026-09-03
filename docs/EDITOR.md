# Visual Website Editor — full reference

Everything about the on‑page editor: how it works, exactly what you can and
can't change with it, and where to go for the rest.

---

## 1. How it works (the mechanism)

- The editor lives at **`/admin/edit/<page>`**. It shows the **real public page**
  in an iframe (`/<page>?__edit=1`) with an editing layer on top.
- That editing layer **only activates for a signed‑in admin, inside the editor
  shell**. A normal visitor loads zero editor code — the public HTML, CSS and
  animations are byte‑for‑byte what they were before.
- Page copy is stored as JSON in the database:
  - **`pages.content`** — one typed object per page (headings, paragraphs,
    labels, section order, hidden sections, repeatable blocks).
  - **`site_settings`** — theme tokens, nav, brand, footer note, hero, contact copy.
- Every field has a **default** equal to the original hard‑coded text
  (`lib/content/defaults/*`, `lib/editor/theme.ts`). Nothing saved ⇒ the site is
  identical to before.
- Your changes are held in a **local draft** (your browser). **Publish** writes
  the draft to the database and revalidates the affected pages.

---

## 2. Opening it

- **Admin → Content → Edit site ✦**, or go to `/admin/edit/home`.
- Pages: `home`, `about`, `studio`, `work`, `exhibitions`, `contact`
  (switch with the dropdown in the top bar).

---

## 3. The controls

### Top bar
| Control | What it does |
| --- | --- |
| Page dropdown | Switch page (your draft is kept) |
| 🖥 ▭ ▯ | Desktop / Tablet / Mobile preview width |
| ↶ ↷ | Undo / redo (last 50 edits) |
| **Theme & nav** | Opens the settings panel (Theme tab + Navigation & footer tab) |
| **Restore defaults** | Reset the **whole site's** content + theme to defaults (kept in your draft until you Publish) |
| ● Unsaved draft | Shown when you have unpublished changes |
| **Preview** | Hide all editing UI, run animations — exactly what visitors see, with your unsaved edits |
| **Publish** | Write the draft to the live site (disabled when there's nothing to publish) |

### Editing text
Click any highlighted heading / paragraph / label → type → click away. It saves
to the draft on click‑away. `Enter` finishes a single‑line field; `Esc` cancels.

### Section toolbar (home page sections, and About/Studio blocks)
**Click a section once to select it** — the frame turns solid blue, the toolbar
stays put, and the inspector opens. Then:

| Button | Applies to | Action |
| --- | --- | --- |
| ↑ ↓ | home sections, About/Studio blocks | Move up / down |
| ⚙ | all | Open the inspector (side panel) |
| ⧉ | About/Studio blocks only | Duplicate this block |
| ⊘ | home sections only | Hide / show (doesn't delete) |
| ⟲ | home sections only | Restore this section's text to default |
| 🗑 | About/Studio blocks only | Delete this block |

Hover also shows the toolbar (with a short grace period so you can reach it).
`Esc` or clicking empty space deselects.

### Inspector (right panel)
Shows every text field for the selected section as a labelled input/textarea,
plus **Hide** / **Restore** buttons where they apply. Editing here and editing
on the page do the same thing.

### "Add …" buttons
Under the About and Studio body sections there's a dashed **"+ Add a section" /
"+ Add a process step"** button. New blocks start with placeholder text.

### Theme & nav panel
- **Theme tab** — page background, heading/body/muted/accent colours; heading &
  body font (6 presets); type‑scale slider; max content width slider; "Reset
  theme". Applies live in the preview.
- **Navigation & footer tab** — brand name / brand line / tagline; nav links
  (add / remove / reorder / edit label + href); footer note.

---

## 4. Save / Preview / Publish

| | |
| --- | --- |
| **Draft** | Auto‑saved to your browser's local storage. Survives refresh. **Per‑browser** — not shared between devices or people. |
| **Preview** | A mode toggle. No save. Shows the draft with the real animations and no editor chrome. |
| **Publish** | Writes the draft to the database, revalidates the pages, clears the draft. |
| **Undo / redo** | 50 steps, within the current session. |
| **Restore this section** (⟲) | One section's text back to its default. Goes into the draft. |
| **Restore defaults** (top bar) | All pages' content + the theme back to defaults. Goes into the draft — the live site only changes when you Publish. Does **not** reset nav/brand/footer. |

---

## 5. What you CAN edit here — page by page

`✏️` = click‑to‑edit text (also in the inspector).
Reorder / Hide / Add‑remove columns are for the section toolbar.

### Home  (`/admin/edit/home`)

| Section | Editable text | Reorder | Hide | Add/remove |
| --- | --- | :---: | :---: | :---: |
| **Hero** | — *(edit in Admin → Settings — see §6)* | ✗ | ✗ | ✗ |
| **Intro** ("The practice") | eyebrow, "Read the full story" link | ✓ | ✓ | ✗ |
| **Featured work** | eyebrow, heading, "All work" link | ✓ | ✓ | ✗ |
| **Disciplines** | eyebrow, heading, body, **each discipline blurb** | ✓ | ✓ | ✗ |
| **Timeline strip** | eyebrow, heading, body, "Walk through the timeline" link | ✓ | ✓ | ✗ |
| **Studio preview** | eyebrow, heading (2 lines), body, "Enter the studio" link | ✓ | ✓ | ✗ |
| **Collections rail** | eyebrow, heading, "All work" link | ✓ | ✓ | ✗ |
| **Contact CTA** | eyebrow, button label, **heading + supporting** (shared with /contact) | ✓ | ✓ | ✗ |

The actual **work images, collection cards, timeline entries** in these sections
come from their own records — edit those in Admin → Works / Collections / Timeline.

### About  (`/admin/edit/about`)

| Part | Editable text | Notes |
| --- | --- | --- |
| Hero eyebrow ("About") | ✏️ | |
| Intro paragraph | ✏️ | |
| Portrait fallback caption | ✏️ | only shows when there's no portrait |
| **Body sections** ("The throughline", "Approach", …) | ✏️ eyebrow, heading, each paragraph | **Add / delete / duplicate / reorder** each block |
| Education heading ("Education") | ✏️ | |
| Timeline block | ✏️ eyebrow, heading, body | |
| "Next" CTA | ✏️ eyebrow, heading, "Enter the studio" link | |
| Name, roles, statement quote, portrait, education list, email/phone/location | — | from **Profile** (§6) |

### Studio  (`/admin/edit/studio`)

| Part | Editable text | Notes |
| --- | --- | --- |
| Hero eyebrow ("Studio & Process") | ✏️ | |
| Hero heading ("Material, then idea.") | ✏️ | 2 lines |
| Intro paragraph | ✏️ | |
| **Process steps** (01 Material, 02 Image, …) | ✏️ eyebrow, heading, each paragraph, caption | **Add / delete / duplicate / reorder** each step |
| "See it applied" CTA | ✏️ eyebrow, heading, "View selected work" link | |
| Step images | — | shown if set; **replace via Admin → Media / Works** (not in the inspector yet) |

### Work index  (`/admin/edit/work`)

| Part | Editable text |
| --- | --- |
| Eyebrow ("Conscious Omnium") | ✏️ |
| Heading ("Selected Work") | ✏️ (2 lines) |
| Intro line | ✏️ — **keep the `{count}` token**; it's replaced with the live number of works |
| The work grid, discipline filter, collections rail | — from Works / Collections |

### Exhibitions  (`/admin/edit/exhibitions`)

| Part | Editable text |
| --- | --- |
| Hero eyebrow, heading ("Shown & made"), intro | ✏️ |
| "Exhibitions & installations" heading | ✏️ |
| Empty‑state message | ✏️ (shows only when there are no exhibitions) |
| "On screen" eyebrow, heading, body | ✏️ — body supports `*italics*` (e.g. `*FUBAR*`) |
| "Training" heading | ✏️ |
| Bottom button ("Enquire about an exhibition") | ✏️ |
| The exhibition list, screen‑work cards, education list | — from Exhibitions / Works / Profile |

### Contact  (`/admin/edit/contact`)

| Part | Editable text |
| --- | --- |
| Eyebrow ("Contact") | ✏️ |
| Heading + supporting line | ✏️ (shared with the home Contact CTA → `settings.contactCopy`) |
| "Chat on WhatsApp" label | ✏️ |
| "Send an enquiry" label | ✏️ |
| Detail **labels** ("Email", "Phone", "WhatsApp", "Based in"), "Message the studio" | — hard‑coded |
| Detail **values** (email, phone, location, social links) | — from **Profile** (§6) |
| The enquiry form itself | — see §7 (Form Builder is a separate feature) |

### Header & Footer  (Theme & nav panel — every page)

| Editable | Where |
| --- | --- |
| Nav links (label, href, order, add/remove) | Theme & nav → Navigation & footer |
| Brand name, brand line, tagline | Theme & nav → Navigation & footer |
| Footer note | Theme & nav → Navigation & footer |
| Footer contact links, location | — from **Profile** (§6) |
| "Disclaimer / Owned by Nexus Solutions" block, © line | — hard‑coded in `components/site/footer.tsx` |

*(Header/footer are edited in the panel, not by clicking them on the page.)*

### Theme  (Theme & nav → Theme — every page)

Colours (page bg, ink, ink‑soft, ink‑mute, accent, accent‑deep) · heading font ·
body font · type‑scale · max content width. **Needs migration `0003` to Publish**
(see §8) — until then theme changes preview but publish is skipped with a note.

---

## 6. What you CANNOT edit here — and where to do it instead

| Content | Edit it in |
| --- | --- |
| **Hero** (eyebrow, heading, CTA label + link, which work fills it) | Admin → **Settings** |
| **Profile**: name, roles, headline, statement quote, biography, education, email, phone, WhatsApp number, location, portrait image, social links | Admin → **Profile** |
| **Works** (title, images, description, price, discipline, order, cover, …) | Admin → **Works** |
| **Collections** (title, description, cover, order) | Admin → **Collections** |
| **Exhibitions** (title, venue, year, type, description) | Admin → **Exhibitions** |
| **Timeline entries** (year, title, description, image) | Admin → **Timeline** |
| **Media library** (upload / compress / delete images) | Admin → **Media** |
| **Per‑page SEO** (meta title, description, OG image) | Admin → the page's own editor (Works/Pages) or `pages` SEO fields |
| **Legal / disclaimer footer block** | code — `components/site/footer.tsx` |

*(Editing hero / profile / works elsewhere still updates the visual editor — it
reads the same data.)*

---

## 7. Known limitations / not built

- **Hero section** has no editor here yet — use Admin → Settings.
- **Section images** (Studio steps, the Studio‑preview image on home) can't be
  swapped from the inspector yet. Set them via Media/Works; the value shows if present.
- **Backgrounds / spacing presets** per section — data model exists, no UI wired,
  components don't consume it yet.
- **Drag‑to‑reorder** — use the ↑ ↓ buttons (drag is not implemented).
- **Add new section *types* to Home** — you can reorder / hide / show the 7
  built‑in sections below the hero, but not invent new ones. (About/Studio *body*
  blocks *can* be added.)
- **Multi‑line & emphasis while editing** — the big animated page `<h1>`s
  (`Selected Work`, `Material, then idea.`, `Shown & made`, the Contact heading)
  edit as **plain text** in edit mode because the per‑letter intro animation
  can't host a text cursor. They animate normally in Preview and on the live site.
  `*emphasis*` markers stay visible while editing the Exhibitions "On screen" body.
- **The `{count}` token** on `/work` — if you rewrite that sentence, keep the
  literal `{count}` where the number should go, or the count won't appear.
- **Drafts are per‑browser** — not synced across devices, not shared, no
  simultaneous multi‑user editing. Last Publish wins.
- **The editor UI** is built for desktop. The *preview* works at every width;
  operating the editor itself on a phone is cramped.
- **Enquiry form / event popup** — not part of this editor; that's the separate
  Form Builder feature.
- **`prefers-reduced-motion`** is respected by the site as before; the editor
  doesn't add motion.

---

## 8. Database migrations

Run in the Supabase dashboard → SQL Editor if not already applied.

**`0002_page_content.sql`** — adds `pages.content`, seeds home/work/exhibitions rows:
```sql
alter table public.pages add column if not exists content jsonb not null default '{}'::jsonb;
insert into public.pages (slug, title)
values ('home','Home'),('work','Work'),('exhibitions','Exhibitions')
on conflict (slug) do nothing;
```

**`0003_site_chrome.sql`** — adds `site_settings.theme` (+ `header`, `footer`):
```sql
alter table public.site_settings
  add column if not exists theme  jsonb not null default '{}'::jsonb,
  add column if not exists header jsonb not null default '{}'::jsonb,
  add column if not exists footer jsonb not null default '{}'::jsonb;
```

Check:
```sql
select slug, jsonb_typeof(content) from public.pages order by slug;          -- 0002
select id, jsonb_typeof(theme) from public.site_settings;                    -- 0003
```

Without `0002` the editor still loads (bundled defaults) but Publish fails on
page content. Without `0003` everything works except **theme** changes, which
Publish skips with: *"Published (theme skipped — run migration 0003…)"*.

---

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| "theme: Could not find the 'theme' column…" | Run migration `0003` (§8). Your text/section/nav edits still published. |
| Publish button greyed out | Nothing changed since the last publish (no draft). |
| Toolbar vanishes when I reach for it | **Click the section once** to lock it (selected = sticky). Hover alone has a short grace window. |
| Edits gone after closing the tab | Drafts are per‑browser and survive refresh, but not clearing site data / a different browser. Publish to make them permanent. |
| Edited text reverted | Someone hit **Restore defaults** or **Restore this section**, then Published. Use Undo, or re‑type. |
| Live site didn't change after Publish | Hard‑reload the public page (Ctrl+Shift+R); pages are cached for an hour and revalidated on publish. |
| Editor looks stale after a code update | Hard‑reload `/admin/edit/<page>`. |
| CSS/manifest 500s, "Failed to find Server Action" | Stale `.next` — stop `npm run dev`, delete `.next`, restart. Never run `next build` while `dev` is running. |

---

## 10. Where the code lives

| Piece | File(s) |
| --- | --- |
| Content types | `lib/types.ts` (`*Content`, `ThemeTokens`) |
| Defaults (= original copy) | `lib/content/defaults/*` |
| Read + merge | `lib/queries/pages.ts` `getPageContent`, `lib/content/defaults/index.ts` |
| Editor store (draft, undo, publish state) | `lib/editor/store.ts`, `paths.ts`, `theme.ts` |
| Editor shell / top bar / panels | `components/editor/editor-shell.tsx`, `editor-topbar.tsx`, `settings-panel.tsx`, `inspector-panel.tsx` |
| On‑page overlay | `components/editor/edit-bridge.tsx`, `section-overlay.tsx`, `editable-text.tsx`, `editable-heading.tsx`, `editable-rich-text.tsx`, `repeatable-list.tsx` |
| Publish action | `lib/admin/actions.ts` `publishSite` |
| Page views (client, read live content) | `components/{home/home-sections,about/about-view,studio/studio-view,work/work-index-header,exhibitions/exhibitions-view,contact/contact-view}.tsx` |
| Migrations | `supabase/migrations/0002_page_content.sql`, `0003_site_chrome.sql` |
