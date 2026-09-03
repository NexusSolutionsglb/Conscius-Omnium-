"use client";

import { Fragment, type ElementType, type FocusEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { readBind, writeBind } from "@/lib/editor/bind";
import { useEditorMode } from "./use-editable";
import { useEditorStoreApi } from "./editor-store-context";

type Props = {
  /** e.g. `"home.disciplines.heading"`, `"@settings.contactCopy.heading"`, `"@profile.name"`. */
  bind: string;
  children: string;
  className?: string;
  as?: ElementType;
  multiline?: boolean;
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

export function EditableText({ bind, children, className, as, multiline, linebreaks }: Props) {
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

  const commit = (e: FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText.replace(/\n$/, "");
    if (text !== readBind<string>(api, bind)) writeBind(api, bind, text);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") e.currentTarget.blur();
    else if (!multiline && !linebreaks && e.key === "Enter") {
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
      onBlur={editable ? commit : undefined}
      onKeyDown={editable ? onKeyDown : undefined}
    >
      {rendered}
    </Tag>
  );
}
