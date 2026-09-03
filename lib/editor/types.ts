import type { HeroConfig, PageContentMap, ThemeTokens } from "@/lib/types";
import type { EditablePageSlug } from "@/lib/content/defaults";

export type Device = "desktop" | "tablet" | "mobile";
export type EditorMode = "edit" | "preview";

export const DEVICE_WIDTH: Record<Device, number | null> = {
  desktop: null, // fills the frame
  tablet: 834,
  mobile: 390,
};

/** Editable slice of site-wide settings (theme + chrome). */
export interface EditorSettings {
  hero: HeroConfig;
  contactCopy: { heading: string; supporting: string };
  theme: ThemeTokens;
  nav: { label: string; href: string }[];
  brand: string;
  brandLine: string;
  tagline: string;
  footerNote: string;
}

export interface EditorSnapshot {
  pages: PageContentMap;
  settings: EditorSettings;
}

export interface EditorSelection {
  slug: EditablePageSlug;
  /** dotted path for text, or `@section:<key>` for a section */
  id: string;
  kind: "text" | "section";
}
