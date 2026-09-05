import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { CursorProvider } from "@/components/site/cursor";
import { PageTransition } from "@/components/site/page-transition";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-button";
import { DraftBanner } from "@/components/site/draft-banner";
import { MaybeEditorProvider } from "@/components/editor/maybe-editor-provider";
import { themeToCss } from "@/lib/editor/theme";
import { IS_DRAFT_REVIEW } from "@/lib/draft-mode";

export const revalidate = 3600;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  const whatsappHref = whatsappLink(
    whatsappGeneralMessage(settings.brand),
    profile.whatsapp,
  );
  const themeCss = themeToCss(settings.theme);

  return (
    <>
      {IS_DRAFT_REVIEW && <DraftBanner />}
      {/* Shifts the whole page down by the banner's height so `Header`
       *  (fixed, offset to match — see header.tsx) doesn't sit over content,
       *  without touching any individual page's own top padding. */}
      <div className={IS_DRAFT_REVIEW ? "pt-9" : undefined}>
        <SmoothScroll>
          {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
          <MaybeEditorProvider>
            <CursorProvider>
              <Header settings={settings} profile={profile} />
              <PageTransition>
                <main id="main" className="min-h-screen">
                  {children}
                </main>
              </PageTransition>
              <Footer settings={settings} profile={profile} />
              <WhatsAppFloat href={whatsappHref} />
            </CursorProvider>
          </MaybeEditorProvider>
        </SmoothScroll>
      </div>
    </>
  );
}
