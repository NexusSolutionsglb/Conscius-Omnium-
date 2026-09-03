"use client";

import { Fragment, type ElementType, type FocusEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { getPath } from "@/lib/editor/paths";
import { useEditorMode } from "./use-editable";
import { useEditorStoreApi } from "./editor-store-context";
import type { EditablePageSlug } from "@/lib/content/defaults";

type Props = {
  /**
   * Where this string lives. Either `"<pageSlug>.<dotted.path>"` (e.g.
   * `"home.disciplines.heading"`) or `"@settings.<dotted.path>"` (e.g.
   * `"@settings.contactCopy.heading"`).
   */
  bind: string;
  children: string;
  className?: string;
  /**
   * When set, renders that element in every mode (use where the text already
   * has a dedicated tag, e.g. an `h2`). When omitted it renders bare text on
   * the public site and only wraps it in a `<span>` inside the editor.
   */
  as?: ElementType;
  /** Allow line breaks (Enter inserts a newline instead of committing). */
  multiline?: boolean;
  /** Render `\n` in the value as `<br>` (for headings that wrap deliberately). */
  linebreaks?: boolean;
};

function withBreaks(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

function parseBind(
  bind: string,
): { scope: "settings"; path: string } | { scope: "page"; slug: EditablePageSlug; path: string } {
  if (bind.startsWith("@settings.")) {
    return { scope: "settings", path: bind.slice("@settings.".length) };
  }
  const dot = bind.indexOf(".");
  return { scope: "page", slug: bind.slice(0, dot) as EditablePageSlug, path: bind.slice(dot + 1) };
}

export function EditableText({
  bind,
  children,
  className,
  as,
  multiline,
  linebreaks,
}: Props) {
  const mode = useEditorMode();
  const api = useEditorStoreApi();
  const rendered = linebreaks ? withBreaks(children) : children;

  if (!api || mode === undefined) {
    if (as) {
      const Tag = as;
      return <Tag className={className}>{rendered}</Tag>;
    }
    return <>{rendered}</>;
  }

  const editable = mode === "edit";
  const Tag: ElementType = as ?? "span";
  const target = parseBind(bind);

  const readCurrent = (): string | undefined => {
    const st = api.getState();
    return target.scope === "settings"
      ? getPath<string>(st.settings, target.path)
      : getPath<string>(st.pages[target.slug], target.path);
  };

  const write = (value: string) => {
    if (target.scope === "settings") api.getState().setSettings(target.path, value);
    else api.getState().setValue(target.slug, target.path, value);
  };

  const commit = (e: FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText.replace(/\n$/, "");
    if (text !== readCurrent()) write(text);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    } else if (!multiline && !linebreaks && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <Tag
      className={cn(className, "co-editable")}
      style={linebreaks && editable ? { whiteSpace: "pre-wrap" } : undefined}
      data-edit-bind={bind}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
      tabIndex={editable ? 0 : undefined}
      onFocus={
        editable && target.scope === "page"
          ? () =>
              api
                .getState()
                .select({ slug: target.slug, id: target.path, kind: "text" })
          : undefined
      }
      onBlur={editable ? commit : undefined}
      onKeyDown={editable ? onKeyDown : undefined}
    >
      {rendered}
    </Tag>
  );
}
