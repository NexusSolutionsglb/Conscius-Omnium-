import type { Metadata } from "next";
import { getProfile } from "@/lib/queries/profile";
import { getSettings } from "@/lib/queries/settings";
import { getPage, getContactContent } from "@/lib/queries/pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { ContactView } from "@/components/contact/contact-view";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return buildMetadata({
    title: "Contact",
    description: page.seo?.description ?? page.intro ?? undefined,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [profile, settings, content] = await Promise.all([
    getProfile(),
    getSettings(),
    getContactContent(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <ContactView profile={profile} settings={settings} serverContent={content} />
    </>
  );
}
