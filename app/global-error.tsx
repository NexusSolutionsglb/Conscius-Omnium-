"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f4ef",
          color: "#1a1613",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontWeight: 400, fontSize: "1.7rem" }}>
          Something went wrong.
        </h1>
        <p style={{ fontFamily: "system-ui, sans-serif", color: "#7a7167", marginTop: "0.75rem" }}>
          The site hit an unexpected error{error?.digest ? ` (${error.digest})` : ""}.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "2rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "#1a1613",
              color: "#f7f4ef",
              padding: "0.9rem 1.8rem",
              border: "1px solid #1a1613",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {/* global-error replaces the root layout, so the router may be gone —
              a hard navigation is the reliable way out. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#1a1613",
              padding: "0.9rem 1.8rem",
              border: "1px solid rgba(26,22,19,0.26)",
              textDecoration: "none",
            }}
          >
            Return home
          </a>
        </div>
      </body>
    </html>
  );
}
