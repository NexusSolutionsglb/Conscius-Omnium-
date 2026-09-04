import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { themeToCss } from "@/lib/editor/theme";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-button";
import { ErrorState, NOT_FOUND_SUGGESTIONS } from "@/components/site/error-state";

export const metadata: Metadata = {
  title: "Page not found — Conscious Omnium",
  description:
    "That page isn't here. Return to the work of Shivjeet Potdar — architecture, miniatures, photography, production design and film.",
  robots: { index: false, follow: true },
};

/**
 * Rendered inside the root layout for URLs that match no route at all.
 * It carries the full site chrome so a mistyped link is a detour, not a
 * dead end. Route-level `notFound()` calls inside `(site)` use that
 * group's own not-found, which is already inside the chrome.
 */
export default async function RootNotFound() {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  const themeCss = themeToCss(settings.theme);
  const whatsappHref = whatsappLink(
    whatsappGeneralMessage(settings.brand),
    profile.whatsapp,
  );

  return (
    <>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <Header settings={settings} profile={profile} />
      <main id="main" className="min-h-screen pt-16 md:pt-[4.75rem]">
        <ErrorState
          code="404"
          title="This page has dissolved."
          message="The page you're looking for isn't here — it may have been moved, renamed, or never existed."
          action={{ label: "Return home", href: "/" }}
          suggestions={NOT_FOUND_SUGGESTIONS}
        />
      </main>
      <Footer settings={settings} profile={profile} />
      <WhatsAppFloat href={whatsappHref} />
    </>
  );
}
