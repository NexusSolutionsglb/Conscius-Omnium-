# Visual Website Editor

On-page, click-to-edit editing for the public site. Open it from **Admin →
Content → Edit site**, or go to `/admin/edit/<page>` (`home`, `about`, `studio`,
`work`, `exhibitions`, `contact`).

## How it works

- The editor shell (`/admin/edit/[slug]`) shows the **real page** in an iframe at
  `/<slug>?__edit=1`. That `?__edit=1` overlay only activates for a signed-in
  admin viewing the page *inside* the shell — a normal visitor never loads any
  editor code, and the public HTML/CSS/animations are unchanged.
- All page copy lives in `pages.content` (JSON, per page); theme + nav + footer
  live in `site_settings`. Defaults for every field are the original hardcoded
  text (`lib/content/defaults/*`, `lib/editor/theme.ts`), so nothing published =
  identical to before.

## Editing

| Action | How |
| --- | --- |
| Edit text | Click any heading / paragraph / label, type, click away |
| Reorder a section | Hover it → **↑ / ↓** in the toolbar (home page) |
| Hide / show a section | Hover → **⊘** (home page) |
| Add / remove a block | "Add …" button under repeatable lists (about / studio); **🗑** on the item toolbar |
| Duplicate a block | Hover the item → **⧉** |
| Section settings | Hover → **⚙** opens the inspector (right panel) |
| Restore one section | Hover → **⟲**, or the inspector's "Restore section" |
| Theme (colours, fonts, spacing) | Top bar → **Theme & nav** → Theme tab |
| Navigation / footer / brand | Top bar → **Theme & nav** → Navigation & footer tab |
| Restore the whole site | Top bar → **Restore defaults** |

## Save / Preview / Publish

- Edits are kept in a **local draft** (your browser) and survive a refresh.
- **Preview** hides all editing UI and runs the animations — exactly what
  visitors will see, with your unsaved edits.
- **Publish** writes the draft to the live site and clears the draft. The
  affected pages are revalidated immediately.
- Undo / redo (↶ ↷) covers the last 50 edits.

## Database migrations

Run these in the Supabase SQL editor if not already applied:

- `supabase/migrations/0002_page_content.sql` — adds `pages.content`
- `supabase/migrations/0003_site_chrome.sql` — adds `site_settings.theme/header/footer`

Until `0003` is applied, theme edits publish as a no-op (everything else works).

## Notes / limits

- Hero and page `<h1>` headings are edited as plain text in edit mode (the
  per-character intro animation can't host a text caret); they animate normally
  in Preview and on the live site.
- Section **backgrounds/spacing** are chosen from fixed presets, and "add
  section" only offers block types the design already supports — this keeps the
  bespoke layout intact (same model as Squarespace).
- Body prose for About/Studio also still editable in **Admin → Pages**; both
  write the same content.
