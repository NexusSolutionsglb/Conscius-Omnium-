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
 *
 * Pass `kind` to give each item a schema-driven `⚙` inspector (see
 * `lib/editor/inspector-schema.ts`); its fields bind to `<listBind>.<i>`.
 *
 * When `items` is a *filtered / mapped view* of the real array (e.g. only the
 * featured works), pass `indexOf` so the data attributes and inspector binds
 * use each item's real position in the underlying array.
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
  kind,
  itemLabel,
  indexOf,
}: {
  slug: EditablePageSlug;
  path: string;
  items: T[];
  children: (item: T, index: number) => ReactNode;
  makeItem: () => T;
  addLabel?: string;
  addClassName?: string;
  listBind?: string;
  kind?: string;
  itemLabel?: (item: T, index: number) => string;
  indexOf?: (item: T, mapIndex: number) => number;
}) {
  const mode = useEditorMode();
  const api = useEditorStoreApi();
  const editing = mode === "edit" && !!api;
  const targetPath = listBind ? bindToPath(listBind) : `pages.${slug}.${path}`;
  // Inspector bind — keep the `@scope` prefix so `bindToPath` resolves it to the
  // snapshot root rather than `pages.*`.
  const inspectBase = listBind ?? `${slug}.${path}`;

  return (
    <>
      {items.map((item, mapIndex) => {
        const i = indexOf ? indexOf(item, mapIndex) : mapIndex;
        return editing ? (
          <div
            key={i}
            style={{ display: "contents" }}
            data-edit-item={`${slug}:${path}:${i}`}
            data-edit-list={targetPath}
            {...(kind
              ? {
                  "data-edit-kind": kind,
                  "data-edit-bind": `${inspectBase}.${i}`,
                  "data-edit-label": itemLabel ? itemLabel(item, i) : undefined,
                }
              : {})}
          >
            {children(item, i)}
          </div>
        ) : (
          <Fragment key={mapIndex}>{children(item, mapIndex)}</Fragment>
        );
      })}

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
