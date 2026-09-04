import { ImageResponse } from "next/og";

/**
 * The site-wide social card, generated at build time at exactly the 1200×630
 * that Facebook, LinkedIn, WhatsApp and X expect. The previous fallback was a
 * 2200×874 artwork declared as 1200×630, so every unfurl cropped it wrongly.
 *
 * Typographic rather than photographic on purpose: it has to stay legible at
 * the ~200px wide thumbnail most feeds actually render.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Conscius Omnium — Shivjeet Potdar";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0c",
          color: "#ffffff",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="52" height="52" viewBox="0 0 64 64">
            <g fill="none" stroke="#ffffff" strokeWidth="1.6">
              <circle cx="32" cy="32" r="19" />
              <rect x="18.5" y="18.5" width="27" height="27" />
              <path d="M13 34c6-9 12-9 19 0s13 9 19 0" strokeLinecap="round" />
            </g>
            <circle cx="32" cy="14" r="1.6" fill="#ffffff" />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: 25,
              letterSpacing: 9,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            Conscius Omnium™
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.06, letterSpacing: -2 }}>
            Architecture, image, and
          </div>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.06, letterSpacing: -2 }}>
            the things between them.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 26,
            fontSize: 22,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex" }}>Shivjeet Potdar</div>
          <div style={{ display: "flex" }}>
            Architect · Production Designer · Filmmaker
          </div>
        </div>
      </div>
    ),
    size,
  );
}
