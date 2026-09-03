import type {
  Collection,
  Exhibition,
  HeroConfig,
  PageContentMap,
  Profile,
  ThemeTokens,
  TimelineEntry,
  Work,
} from "@/lib/types";
import type { EditablePageSlug } from "@/lib/content/defaults";

export type Device = "desktop" | "tablet" | "mobile";
export type EditorMode = "edit" | "preview";

export const DEVICE_WIDTH: Record<Device, number | null> = {
  desktop: null, // fills the frame
  tablet: 834,
  mobile: 390,
};

/** Editable slice of site-wide settings (theme + chrome + footer legal). */
export interface EditorSettings {
  hero: HeroConfig;
  contactCopy: { heading: string; supporting: string };
  theme: ThemeTokens;
  nav: { label: string; href: string }[];
  brand: string;
  brandLine: string;
  tagline: string;
  footerNote: string;
  /** Editable footer legal / attribution text (was hard-coded). */
  footerLegal: string;
  footerOwner: string;
}

/** Records that live in their own DB tables but are edited inline. */
export type DataKind = "collections" | "exhibitions" | "timeline" | "works";

export interface EditorSnapshot {
  pages: PageContentMap;
  settings: EditorSettings;
  profile: Profile;
  collections: Collection[];
  exhibitions: Exhibition[];
  timeline: TimelineEntry[];
  works: Work[];
}

export interface EditorSelection {
  slug: EditablePageSlug;
  /** dotted path for text, or `@section:<key>` / `@item:<path>:<index>` for a block */
  id: string;
  kind: "text" | "section";
}
