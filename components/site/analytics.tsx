import Script from "next/script";
import { env } from "@/lib/env";

/**
 * Privacy-conscious, opt-in analytics. Renders nothing unless an id is
 * configured. Supports GA4 and Plausible.
 */
export function Analytics() {
  if (env.plausibleDomain) {
    return (
      <Script
        defer
        data-domain={env.plausibleDomain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (env.gaId) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${env.gaId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${env.gaId}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }

  return null;
}
