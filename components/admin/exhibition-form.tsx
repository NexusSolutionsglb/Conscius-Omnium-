"use client";

import type { Exhibition } from "@/lib/types";
import { saveExhibition, deleteExhibition } from "@/lib/admin/actions";
import { Card, Field, TextArea, SelectField, Toggle } from "./ui";
import { EntityForm } from "./entity-form";

const TYPES = [
  "exhibition",
  "solo",
  "group",
  "installation",
  "screening",
  "residency",
  "commission",
  "publication",
].map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));

export function ExhibitionForm({ exhibition }: { exhibition: Exhibition | null }) {
  const isNew = !exhibition;
  return (
    <EntityForm
      action={(fd) => saveExhibition(exhibition?.id ?? null, fd)}
      submitLabel={isNew ? "Create" : "Save"}
      redirectTo={isNew ? "/admin/exhibitions" : undefined}
      deleteAction={exhibition ? () => deleteExhibition(exhibition.id) : undefined}
    >
      {(err) => (
        <Card>
          <div className="grid gap-4">
            <Field label="Title" name="title" required defaultValue={exhibition?.title} error={err.title?.[0]} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Year" name="year" required defaultValue={exhibition?.year} placeholder="2017" error={err.year?.[0]} />
              <SelectField label="Type" name="type" options={TYPES} defaultValue={exhibition?.type ?? "exhibition"} />
              <Field label="Sort order" name="sortOrder" type="number" required defaultValue={exhibition?.sortOrder ?? 100} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Venue" name="venue" required defaultValue={exhibition?.venue} error={err.venue?.[0]} />
              <Field label="City" name="city" defaultValue={exhibition?.city ?? ""} />
              <Field label="Country" name="country" defaultValue={exhibition?.country ?? ""} />
            </div>
            <Field label="Date label" name="dateLabel" defaultValue={exhibition?.dateLabel ?? ""} placeholder="Annual Exhibition, 2017" />
            <TextArea label="Description" name="description" defaultValue={exhibition?.description ?? ""} rows={3} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="External URL" name="url" type="url" defaultValue={exhibition?.url ?? ""} />
              <Field label="Related work slugs" name="relatedSlugs" defaultValue={(exhibition?.relatedSlugs ?? []).join(", ")} hint="Comma-separated" />
            </div>
            <Toggle label="Published" name="published" defaultChecked={exhibition?.published ?? true} />
          </div>
        </Card>
      )}
    </EntityForm>
  );
}
