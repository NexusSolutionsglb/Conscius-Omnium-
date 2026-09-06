import type { SVGProps } from "react";

/**
 * Minimal single-path social glyphs — same hairline weight and same
 * optical size as the arrow marks elsewhere, so they read as part of the
 * site's own drawing rather than as pasted-in brand badges.
 */

type Glyph = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const Instagram: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect
      x="3.25"
      y="3.25"
      width="17.5"
      height="17.5"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="17.2" cy="6.8" r="1.05" fill="currentColor" />
  </svg>
);

const YouTube: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect
      x="2.25"
      y="5.25"
      width="19.5"
      height="13.5"
      rx="4"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M10.4 9.3v5.4l4.7-2.7-4.7-2.7Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const Facebook: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect
      x="3.25"
      y="3.25"
      width="17.5"
      height="17.5"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M14.6 8.2h-1.1c-.9 0-1.5.6-1.5 1.5v1.5h2.5l-.4 2.4h-2.1v5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9.6 11.2h1.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const LinkedIn: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <rect
      x="3.25"
      y="3.25"
      width="17.5"
      height="17.5"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M8 10.6v6M8 7.6v.02M11.6 16.6v-3.4c0-1.2.8-2 1.9-2s1.9.8 1.9 2v3.4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const Link: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <circle cx="12" cy="12" r="8.75" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M3.4 12h17.2M12 3.25c2.1 2.4 3.2 5.4 3.2 8.75s-1.1 6.35-3.2 8.75c-2.1-2.4-3.2-5.4-3.2-8.75S9.9 5.65 12 3.25Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  </svg>
);

const REGISTRY: { match: RegExp; Glyph: Glyph }[] = [
  { match: /instagram|insta\b/i, Glyph: Instagram },
  { match: /youtube|youtu\.be/i, Glyph: YouTube },
  { match: /facebook|fb\.com/i, Glyph: Facebook },
  { match: /linkedin/i, Glyph: LinkedIn },
];

/** Pick a glyph from a social link's label or URL; falls back to a globe. */
export function SocialGlyph({
  label,
  href,
  className,
}: {
  label: string;
  href: string;
  className?: string;
}) {
  const hay = `${label} ${href}`;
  const found = REGISTRY.find((entry) => entry.match.test(hay));
  const Glyph = found?.Glyph ?? Link;
  return <Glyph className={className} />;
}
