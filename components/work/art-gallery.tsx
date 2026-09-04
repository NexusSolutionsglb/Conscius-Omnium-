"use client";

import type { Work } from "@/lib/types";
import { StaggerList } from "@/components/motion/reveal";
import { useEditableData, useEditorMode } from "@/components/editor/use-editable";
import { ArtworkCard } from "./artwork-card";
import { EditableWorkGrid } from "./work-index";

/**
 * The premium gallery-wall presentation for photographed artwork series
 * (Black Canvas, Duality, States of Attention, States of Awareness) — a
 * CSS-columns masonry so mixed portrait/landscape/square pieces sit
 * naturally next to each other with no forced aspect ratio or cropping.
 * Falls back to the plain editable grid in edit mode, same as `WorkIndex`.
 */
export function ArtGallery({ works }: { works: Work[] }) {
  const editing = useEditorMode() === "edit";
  const live = useEditableData<Work>("works", works);

  if (editing) return <EditableWorkGrid works={live} />;

  return (
    <StaggerList className="columns-1 gap-8 sm:columns-2 lg:columns-3">
      {works.map((work, i) => (
        <ArtworkCard key={work.slug} work={work} priority={i < 2} />
      ))}
    </StaggerList>
  );
}
