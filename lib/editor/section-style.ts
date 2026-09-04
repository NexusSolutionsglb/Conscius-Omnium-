import type { BlockBase, SectionBackground, SectionSpacing } from "@/lib/types";

/**
 * Per-section background + spacing presets. `default` (or unset) keeps the
 * section's own built-in look, so nothing changes until an override is chosen.
 */

export const BACKGROUND_CLASS: Record<SectionBackground, string> = {
  default: "",
  paper: "bg-paper",
  "paper-dim": "bg-paper-dim/50 border-y border-line",
  obsidian: "u-invert bg-obsidian text-paper",
};

export const SPACING_CLASS: Record<SectionSpacing, string> = {
  default: "",
  tight: "py-12 md:py-16",
  normal: "py-20 md:py-28",
  spacious: "py-32 md:py-44",
};

export const BACKGROUND_OPTIONS: { value: SectionBackground; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "paper", label: "Paper" },
  { value: "paper-dim", label: "Dim (recessed)" },
  { value: "obsidian", label: "Obsidian (dark)" },
];

export const SPACING_OPTIONS: { value: SectionSpacing; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "spacious", label: "Spacious" },
];

/** Override classes for a section wrapper. Empty string ⇒ use the built-in look. */
export function sectionStyleClass(style: BlockBase | undefined): string {
  if (!style) return "";
  const bg = style.background && style.background !== "default"
    ? BACKGROUND_CLASS[style.background]
    : "";
  const sp = style.spacing && style.spacing !== "default"
    ? SPACING_CLASS[style.spacing]
    : "";
  return [bg, sp].filter(Boolean).join(" ");
}

export function hasStyleOverride(style: BlockBase | undefined): boolean {
  return !!style && (
    (!!style.background && style.background !== "default") ||
    (!!style.spacing && style.spacing !== "default")
  );
}
