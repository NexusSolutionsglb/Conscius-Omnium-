"use client";

import type { Collection } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { useState } from "react";
import { saveCollection, deleteCollection } from "@/lib/admin/actions";
import { Card, Field, TextArea, Toggle } from "./ui";
import { EntityForm } from "./entity-form";
import { ImageField } from "./image-field";

export function CollectionForm({ collection }: { collection: Collection | null }) {
  const isNew = !collection;
  const [slug, setSlug] = useState(collection?.slug ?? "");

  return (
    <EntityForm
      action={(fd) => saveCollection(collection?.id ?? null, fd)}
      submitLabel={isNew ? "Create collection" : "Save"}
      redirectTo={isNew ? "/admin/collections" : undefined}
      deleteAction={collection ? () => deleteCollection(collection.id) : undefined}
    >
      {(err) => (
        <Card>
          <div className="grid gap-4">
            <Field
              label="Title"
              name="title"
              required
              defaultValue={collection?.title}
              error={err.title?.[0]}
              onChange={(e) => isNew && setSlug(slugify(e.target.value))}
            />
            <Field
              label="Slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              hint="/gallery/collection/<slug>"
              error={err.slug?.[0]}
            />
            <TextArea label="Description" name="description" required defaultValue={collection?.description} rows={4} error={err.description?.[0]} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Period" name="period" defaultValue={collection?.period ?? ""} placeholder="Ongoing" />
              <Field label="Sort order" name="sortOrder" type="number" required defaultValue={collection?.sortOrder ?? 100} />
            </div>
            <ImageField
              label="Cover image"
              name="coverImage"
              folder="projects"
              defaultValue={collection?.coverImage ?? ""}
            />
            <div className="flex gap-6">
              <Toggle label="Published" name="published" defaultChecked={collection?.published ?? true} />
              <Toggle label="Featured" name="featured" defaultChecked={collection?.featured} />
            </div>
          </div>
        </Card>
      )}
    </EntityForm>
  );
}
