import type { ThemeTokens } from "@/lib/types";

/** Curated font stacks the editor offers for display + body. Keys are stored. */
export const FONT_CHOICES: Record<string, { label: string; stack: string }> = {
  century: {
    label: "Century Gothic (house face)",
    stack: "var(--font-century)",
  },
  fraunces: {
    label: "Fraunces (default serif)",
    stack: 'var(--font-fraunces), "Iowan Old Style", Palatino, "Times New Roman", serif',
  },
  inter: {
    label: "Inter (default sans)",
    stack: 'var(--font-inter), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  georgia: { label: "Georgia", stack: 'Georgia, "Times New Roman", serif' },
  garamond: {
    label: "EB Garamond style",
    stack: '"EB Garamond", "Iowan Old Style", Garamond, Georgia, serif',
  },
  system: {
    label: "System sans",
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  mono: { label: "Monospace", stack: 'ui-monospace, "SF Mono", "Cascadia Code", monospace' },
};

function fontStack(key: string | undefined): string | null {
  if (!key) return null;
  return FONT_CHOICES[key]?.stack ?? null;
}

/**
 * Build the `:root { … }` override for the given tokens. Returns "" when the
 * theme is empty so the site renders exactly as its stylesheet defines.
 */
export function themeToCss(theme: ThemeTokens | undefined | null): string {
  if (!theme) return "";
  const v: string[] = [];
  const put = (name: string, value: string | number | undefined) => {
    if (value !== undefined && value !== null && value !== "") v.push(`  ${name}: ${value};`);
  };

  put("--color-paper", theme.colorPaper);
  put("--color-ink", theme.colorInk);
  put("--color-ink-soft", theme.colorInkSoft);
  put("--color-ink-mute", theme.colorInkMute);
  put("--color-accent", theme.colorAccent);
  put("--color-accent-deep", theme.colorAccentDeep);

  const disp = fontStack(theme.fontDisplay);
  if (disp) put("--font-display", disp);
  const sans = fontStack(theme.fontSans);
  if (sans) put("--font-sans", sans);

  if (theme.typeScale && theme.typeScale !== 1) {
    const s = Math.max(0.7, Math.min(1.4, theme.typeScale));
    // Scale the fluid editorial ramp proportionally.
    put("--text-display", `clamp(${2.6 * s}rem, ${1.4 * s}rem + ${5.4 * s}vw, ${6.75 * s}rem)`);
    put("--text-h1", `clamp(${2.1 * s}rem, ${1.3 * s}rem + ${3.4 * s}vw, ${4 * s}rem)`);
    put("--text-h2", `clamp(${1.7 * s}rem, ${1.2 * s}rem + ${2.1 * s}vw, ${2.85 * s}rem)`);
    put("--text-lead", `clamp(${1.05 * s}rem, ${0.98 * s}rem + ${0.4 * s}vw, ${1.28 * s}rem)`);
  }

  if (theme.containerWidth) {
    // In rem, so a saved width still rides the large-display root scale
    // in globals.css instead of pinning the page to a fixed pixel box.
    const width = Math.max(900, Math.min(2200, theme.containerWidth));
    put("--container-page", `${width / 16}rem`);
  }

  return v.length ? `:root{\n${v.join("\n")}\n}` : "";
}

export const THEME_DEFAULTS: Required<
  Pick<
    ThemeTokens,
    | "colorPaper"
    | "colorInk"
    | "colorInkSoft"
    | "colorInkMute"
    | "colorAccent"
    | "colorAccentDeep"
    | "fontDisplay"
    | "fontSans"
    | "typeScale"
    | "containerWidth"
  >
> = {
  colorPaper: "#ffffff",
  colorInk: "#111111",
  colorInkSoft: "#3a3a3a",
  colorInkMute: "#7a7a7a",
  colorAccent: "#4a4a4a",
  colorAccentDeep: "#262626",
  fontDisplay: "century",
  fontSans: "century",
  typeScale: 1,
  containerWidth: 1560,
};
