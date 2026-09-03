import { clsx, type ClassValue } from "clsx";

/** Tailwind-friendly class combiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Deterministic short reference, e.g. CO-7F3K-2Q. */
export function makeRef(prefix = "CO"): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
  return `${prefix}-${pick(4)}-${pick(2)}`;
}

export function formatDate(
  value: string | number | Date,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  try {
    return new Intl.DateTimeFormat("en-GB", opts).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function formatRelative(value: string | number | Date): string {
  const then = new Date(value).getTime();
  const now = Date.now();
  const diff = Math.round((then - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs || unit === "minute") {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return "just now";
}

export function formatPrice(amount: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

/** Split a run of paragraphs stored as a single textarea string. */
export function toParagraphs(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function fromParagraphs(paragraphs: string[] | null | undefined): string {
  return (paragraphs ?? []).join("\n\n");
}

export function truncate(input: string, max = 160): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trimEnd()}…`;
}

export function absoluteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Normalise an image URL before it is stored or rendered.
 *
 * People sometimes paste the browser's "copy image address" value, which is the
 * Next.js optimizer endpoint (`/_next/image?url=<real>&w=…&q=…`) rather than the
 * real asset. Feeding that back into `next/image` throws an unconfigured-host
 * error and 500s the page, so we unwrap it (recursively) to the inner URL.
 * Also trims whitespace and returns "" for empty input.
 */
export function normalizeImageUrl(value: string | null | undefined): string {
  let url = (value ?? "").trim();
  if (!url) return "";
  // Unwrap nested optimizer URLs, e.g. ".../_next/image?url=<real>&w=…&q=…".
  for (let i = 0; i < 5 && /_next\/image\?/.test(url); i++) {
    const inner = url.match(/[?&]url=([^&]+)/);
    if (!inner) break;
    const decoded = decodeURIComponent(inner[1]).trim();
    if (!decoded || decoded === url) break;
    url = decoded;
  }
  return url;
}

/** Clamp helper for scroll math. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}
