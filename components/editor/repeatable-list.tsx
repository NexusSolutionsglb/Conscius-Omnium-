"use client";

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { bindToPath } from "@/lib/editor/bind";
import type { EditablePageSlug } from "@/lib/content/defaults";
import { useEditorMode } from "./use-editable";
import { useEditorStoreApi } from "./editor-store-context";

/**
 * Renders an editable array of items. On the public site it's a transparent
 * `items.map(children)` (a fragment — no wrappers). In edit mode each item gets
 * a `display:contents` wrapper carrying `data-edit-item="<slug>:<path>:<i>"`
 * (for the section overlay's move / duplicate / delete / drag) plus an "Add"
 * button after the list.
 *
 * `slug` + `path` name the wrapper's data attribute; when the array lives
 * somewhere other than `pages.<slug>.<path>` (e.g. `@profile.education`,
 * `@works.3.images`) pass `listBind` — reorder/add/delete then target that.
 */
export function RepeatableList<T>({
  slug,
  path,
  items,
  children,
  makeItem,
  addLabel = "Add item",
  addClassName = "u-container py-6",
  listBind,
}: {
  slug: EditablePageSlug;
  path: string;
  items: T[];
  children: (item: T, index: number) => ReactNode;
  makeItem: () => T;
  addLabel?: string;
  addClassName?: string;
  listBind?: string;
}) {
  const mode = useEditorMode();
  const api = useEditorStoreApi();
  const editing = mode === "edit" && !!api;
  const targetPath = listBind ? bindToPath(listBind) : `pages.${slug}.${path}`;

  return (
    <>
      {items.map((item, i) =>
        editing ? (
          <div
            key={i}
            style={{ display: "contents" }}
            data-edit-item={`${slug}:${path}:${i}`}
            data-edit-list={targetPath}
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
            onClick={() => api!.getState().insertItem(targetPath, makeItem())}
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
