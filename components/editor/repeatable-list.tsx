"use client";

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { EditablePageSlug } from "@/lib/content/defaults";
import { useEditorMode } from "./use-editable";
import { useEditorStoreApi } from "./editor-store-context";

/**
 * Renders an array of content items. On the public site (and Preview) it is a
 * transparent `items.map(children)` inside a fragment — no wrapper elements,
 * layout untouched. In edit mode each item gets a `display:contents` wrapper
 * carrying `data-edit-item` (so the section overlay can move / duplicate /
 * delete it) plus an "Add" button after the list.
 */
export function RepeatableList<T>({
  slug,
  path,
  items,
  children,
  makeItem,
  addLabel = "Add item",
  addClassName = "u-container py-6",
}: {
  slug: EditablePageSlug;
  path: string;
  items: T[];
  children: (item: T, index: number) => ReactNode;
  makeItem: () => T;
  addLabel?: string;
  addClassName?: string;
}) {
  const mode = useEditorMode();
  const api = useEditorStoreApi();
  const editing = mode === "edit" && !!api;

  return (
    <>
      {items.map((item, i) =>
        editing ? (
          <div
            key={i}
            style={{ display: "contents" }}
            data-edit-item={`${slug}:${path}:${i}`}
          >
            {children(item, i)}
          </div>
        ) : (
          <Fragment key={i}>{children(item, i)}</Fragment>
        ),
      )}

      {editing && (
        <div className={addClassName} data-editor-ui="">
          <button
            type="button"
            onClick={() => api!.getState().addItem(slug, path, makeItem())}
            className={cn(
              "w-full rounded-lg border border-dashed border-neutral-400 py-3 text-[12px]",
              "font-medium text-neutral-500 hover:border-neutral-600 hover:text-neutral-800",
            )}
          >
            + {addLabel}
          </button>
        </div>
      )}
    </>
  );
}
