import { getSettings } from "@/lib/queries/settings";
import { getPublishedWorks } from "@/lib/queries/works";
import { saveSettings } from "@/lib/admin/actions";
import { PageHeader, Card, Field, TextArea, SelectField } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";

export default async function SettingsPage() {
  const [s, works] = await Promise.all([getSettings(), getPublishedWorks()]);
  return (
    <>
      <PageHeader
        title="Site settings"
        description="Identity, the home hero, footer, contact copy and default SEO."
      />
      <EntityForm action={saveSettings} submitLabel="Save settings">
        {(err) => (
          <div className="space-y-6">
            <Card title="Identity">
              <div className="grid gap-4">
                <Field label="Brand" name="brand" required defaultValue={s.brand} error={err.brand?.[0]} />
                <Field label="Brand line" name="brandLine" required defaultValue={s.brandLine} error={err.brandLine?.[0]} />
                <Field label="Tagline" name="tagline" required defaultValue={s.tagline} error={err.tagline?.[0]} />
                <TextArea label="Footer note" name="footerNote" required defaultValue={s.footerNote} rows={2} error={err.footerNote?.[0]} />
              </div>
            </Card>

            <Card title="Home hero">
              <div className="grid gap-4">
                <Field label="Eyebrow" name="heroEyebrow" required defaultValue={s.hero.eyebrow} error={err.heroEyebrow?.[0]} />
                <TextArea label="Heading" name="heroHeading" required defaultValue={s.hero.heading} rows={2} hint="Use line breaks for deliberate wrapping" error={err.heroHeading?.[0]} />
                <TextArea label="Supporting copy" name="heroSupporting" required defaultValue={s.hero.supporting} rows={2} error={err.heroSupporting?.[0]} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="CTA label" name="heroCtaLabel" required defaultValue={s.hero.ctaLabel} error={err.heroCtaLabel?.[0]} />
                  <Field label="CTA link" name="heroCtaHref" required defaultValue={s.hero.ctaHref} error={err.heroCtaHref?.[0]} />
                </div>
                <SelectField
                  label="Hero work"
                  name="heroWorkSlug"
                  options={[
                    { value: "", label: "Auto (first featured)" },
                    ...works.map((w) => ({ value: w.slug, label: w.title })),
                  ]}
                  defaultValue={s.hero.workSlug ?? ""}
                />
              </div>
            </Card>

            <Card title="Contact & SEO">
              <div className="grid gap-4">
                <Field label="Contact heading" name="contactHeading" required defaultValue={s.contactCopy.heading} error={err.contactHeading?.[0]} />
                <TextArea label="Contact supporting" name="contactSupporting" required defaultValue={s.contactCopy.supporting} rows={2} error={err.contactSupporting?.[0]} />
                <Field label="Default SEO title" name="seoDefaultTitle" required defaultValue={s.seo.defaultTitle} error={err.seoDefaultTitle?.[0]} />
                <TextArea label="Default SEO description" name="seoDescription" required defaultValue={s.seo.description} rows={3} error={err.seoDescription?.[0]} />
              </div>
            </Card>
          </div>
        )}
      </EntityForm>
    </>
  );
}
