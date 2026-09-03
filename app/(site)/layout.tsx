import { getSettings } from "@/lib/queries/settings";
import { getProfile } from "@/lib/queries/profile";
import { whatsappGeneralMessage, whatsappLink } from "@/lib/whatsapp";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { CursorProvider } from "@/components/site/cursor";
import { PageTransition } from "@/components/site/page-transition";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-button";

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

  return (
    <SmoothScroll>
      <CursorProvider>
        <Header settings={settings} />
        <PageTransition>
          <main id="main" className="min-h-screen">
            {children}
          </main>
        </PageTransition>
        <Footer settings={settings} profile={profile} />
        <WhatsAppFloat href={whatsappHref} />
      </CursorProvider>
    </SmoothScroll>
  );
}
