"use client";

import { useState } from "react";
import type { CustomBlockType } from "@/lib/types";
import { BLOCK_LABELS } from "@/lib/editor/new-entities";
import type { EditablePageSlug } from "@/lib/content/defaults";
import { useEditorStoreApi } from "./editor-store-context";

const TYPES: CustomBlockType[] = ["richText", "image", "quote", "cta", "gallery"];

const ICON: Record<CustomBlockType, string> = {
  richText: "¶",
  image: "▦",
  quote: "❝",
  cta: "◈",
  gallery: "▤",
};

/** The "+ Add section" strip shown at the end of the page while editing. */
export function AddSectionBar({ slug }: { slug: EditablePageSlug }) {
  const api = useEditorStoreApi();
  const [open, setOpen] = useState(false);
  if (!api) return null;

  return (
    <div data-editor-ui="" className="co-add-bar">
      {open ? (
        <div className="co-add-menu">
          <p className="co-add-title">Add a section</p>
          <div className="co-add-grid">
            {TYPES.map((t) => (
              <button
                key={t}
                className="co-add-item"
                onClick={() => {
                  api.getState().addBlock(slug, t);
                  setOpen(false);
                }}
              >
                <span className="co-add-icon">{ICON[t]}</span>
                {BLOCK_LABELS[t]}
              </button>
            ))}
          </div>
          <button className="co-add-cancel" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="co-add-trigger" onClick={() => setOpen(true)}>
          + Add section
        </button>
      )}
    </div>
  );
}
