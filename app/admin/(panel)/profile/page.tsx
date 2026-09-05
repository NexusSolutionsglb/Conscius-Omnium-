import { getProfile } from "@/lib/queries/profile";
import { saveProfile } from "@/lib/admin/actions";
import { fromParagraphs } from "@/lib/utils";
import { contactEmails } from "@/lib/contact-emails";
import { PageHeader, Card, Field, TextArea } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";
import { ImageField } from "@/components/admin/image-field";

export default async function ProfilePage() {
  const p = await getProfile();
  const emails = contactEmails(p);
  return (
    <>
      <PageHeader
        title="Artist profile"
        description="Drives the About page, footer, contact details and structured data."
      />
      <EntityForm action={saveProfile} submitLabel="Save profile">
        {(err) => (
          <Card>
            <div className="grid gap-4">
              <Field label="Name" name="name" required defaultValue={p.name} error={err.name?.[0]} />
              <Field label="Roles" name="roles" required defaultValue={p.roles.join(", ")} hint="Comma-separated" error={err.roles?.[0]} />
              <Field label="Headline" name="headline" required defaultValue={p.headline} error={err.headline?.[0]} />
              <TextArea label="Statement (short quote)" name="statement" required defaultValue={p.statement} rows={2} error={err.statement?.[0]} />
              <TextArea label="Biography" name="bio" required defaultValue={fromParagraphs(p.bio)} rows={7} hint="Blank line separates paragraphs" error={err.bio?.[0]} />
              <TextArea
                label="Education"
                name="education"
                defaultValue={p.education.map((e) => `${e.qualification} | ${e.institution}`).join("\n")}
                rows={3}
                hint="One per line — Qualification | Institution"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" required defaultValue={p.email} hint="The artist's own address — used for admin records" error={err.email?.[0]} />
                <Field label="Phone" name="phone" required defaultValue={p.phone} error={err.phone?.[0]} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Enquiries email" name="enquiryEmail" type="email" required defaultValue={emails.enquiry} hint="Enquiries, commissions, bookings" error={err.enquiryEmail?.[0]} />
                <Field label="General email" name="infoEmail" type="email" required defaultValue={emails.info} hint="Footer, About, legal pages" error={err.infoEmail?.[0]} />
                <Field label="Studio email" name="studioEmail" type="email" required defaultValue={emails.studio} hint="Studio, services, projects" error={err.studioEmail?.[0]} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp number" name="whatsapp" required defaultValue={p.whatsapp} hint="Digits only, with country code" error={err.whatsapp?.[0]} />
                <Field label="Location" name="location" required defaultValue={p.location} error={err.location?.[0]} />
              </div>
              <ImageField label="Portrait image" name="portrait" folder="profile" defaultValue={p.portrait ?? ""} />
              <TextArea
                label="Social links"
                name="social"
                defaultValue={p.social.map((s) => `${s.label} | ${s.href}`).join("\n")}
                rows={3}
                hint="One per line — Label | https://…"
              />
            </div>
          </Card>
        )}
      </EntityForm>
    </>
  );
}
