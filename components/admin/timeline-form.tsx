"use client";

import type { TimelineEntry } from "@/lib/types";
import { saveTimelineEntry, deleteTimelineEntry } from "@/lib/admin/actions";
import { Card, Field, TextArea, Toggle } from "./ui";
import { EntityForm } from "./entity-form";
import { ImageField } from "./image-field";

export function TimelineForm({ entry }: { entry: TimelineEntry | null }) {
  const isNew = !entry;
  return (
    <EntityForm
      action={(fd) => saveTimelineEntry(entry?.id ?? null, fd)}
      submitLabel={isNew ? "Create" : "Save"}
      redirectTo={isNew ? "/admin/timeline" : undefined}
      deleteAction={entry ? () => deleteTimelineEntry(entry.id) : undefined}
    >
      {(err) => (
        <Card>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Year" name="year" required defaultValue={entry?.year} placeholder="1995" error={err.year?.[0]} />
              <Field label="Category" name="category" defaultValue={entry?.category ?? ""} placeholder="Origin" />
              <Field label="Sort order" name="sortOrder" type="number" required defaultValue={entry?.sortOrder ?? 100} />
            </div>
            <Field label="Title" name="title" required defaultValue={entry?.title} error={err.title?.[0]} />
            <TextArea label="Description" name="description" required defaultValue={entry?.description} rows={3} error={err.description?.[0]} />
            <ImageField
              label="Image"
              name="image"
              folder="studio"
              defaultValue={entry?.image ?? ""}
              hint="Optional archival image"
            />
            <Toggle label="Published" name="published" defaultChecked={entry?.published ?? true} />
          </div>
        </Card>
      )}
    </EntityForm>
  );
}
