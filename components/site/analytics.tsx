"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const STORAGE_KEY = "co-analytics-consent";

type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Privacy-conscious, opt-in analytics. Renders nothing unless an id is
 * configured.
 *
 * Plausible is cookieless and aggregate, so it loads straight away.
 * GA4 sets cookies, so it is gated behind an explicit consent choice — the
 * banner only ever appears on a deploy that has actually configured GA.
 */
export function Analytics({
  gaId,
  plausibleDomain,
}: {
  gaId: string;
  plausibleDomain: string;
}) {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  function choose(next: Exclude<Consent, null>) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage blocked — the choice simply won't persist */
    }
    setConsent(next);
  }

  if (plausibleDomain) {
    return (
      <Script
        defer
        data-domain={plausibleDomain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (!gaId) return null;

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {ready && consent === null && (
        <div
          role="dialog"
          aria-label="Analytics consent"
          className="u-no-print fixed inset-x-3 bottom-3 z-[150] border border-line-strong bg-paper p-5 shadow-[0_18px_50px_rgba(26,22,19,0.14)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm"
        >
          <p className="u-eyebrow">Analytics</p>
          <p className="mt-2.5 text-[0.82rem] leading-relaxed text-ink-soft">
            This site would like to measure which work people look at. Nothing
            is used for advertising. See the{" "}
            <Link href="/privacy" className="u-link">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => choose("granted")}
              className="u-btn px-5 py-3"
            >
              Allow
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="u-btn u-btn--ghost px-5 py-3"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
