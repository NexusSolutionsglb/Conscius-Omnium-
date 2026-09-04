import { ImageResponse } from "next/og";

/**
 * iOS home-screen icon. Safari won't use an SVG here, so the studio mark is
 * redrawn at 180×180 and rendered to PNG at build time — no binary asset to
 * keep in sync with the brand.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14110e",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <g fill="none" stroke="#f7f4ef" strokeWidth="1.4">
            <circle cx="32" cy="32" r="19" />
            <rect x="18.5" y="18.5" width="27" height="27" />
            <path d="M13 34c6-9 12-9 19 0s13 9 19 0" strokeLinecap="round" />
          </g>
          <circle cx="32" cy="14" r="1.6" fill="#f7f4ef" />
        </svg>
      </div>
    ),
    size,
  );
}
