"use client";

import Link from "next/link";
import {
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-block text-[12px] text-ink-mute hover:text-ink"
        >
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-normal text-ink">{title}</h1>
          {description && (
            <p className="mt-1 max-w-xl text-[13px] text-ink-mute">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Card({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-line bg-paper", className)}>
      {title && (
        <header className="border-b border-line px-5 py-3">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-mute">
            {title}
          </h2>
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: {
  variant?: "primary" | "secondary" | "danger" | "ghost";
} & InputHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-ink text-paper hover:bg-accent-deep",
    secondary: "border border-line-strong bg-paper text-ink-soft hover:bg-paper-dim",
    danger: "border border-red-200 bg-paper text-red-600 hover:bg-red-50",
    ghost: "text-ink-mute hover:text-ink",
  };
  return (
    <button
      {...(props as object)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[12.5px] font-medium transition-colors disabled:opacity-50",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SubmitButton({
  children = "Save",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-accent-deep disabled:opacity-50",
        className,
      )}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

const labelCls =
  "flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-ink-mute";
const inputCls =
  "mt-1 w-full rounded-md border border-line-strong bg-paper px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-ink";

export function Field({
  label,
  name,
  hint,
  error,
  className,
  ...props
}: { label: string; hint?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("block", className)}>
      <span className={labelCls}>
        {label}
        {props.required ? null : <span className="text-neutral-300">optional</span>}
      </span>
      <input name={name} className={cn(inputCls, error && "border-red-400")} {...props} />
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  hint,
  error,
  className,
  ...props
}: { label: string; hint?: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("block", className)}>
      <span className={labelCls}>
        {label}
        {props.required ? null : <span className="text-neutral-300">optional</span>}
      </span>
      <textarea
        name={name}
        className={cn(inputCls, "min-h-[90px] leading-relaxed", error && "border-red-400")}
        {...props}
      />
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  error,
  className,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn("block", className)}>
      <span className={labelCls}>{label}</span>
      <select name={name} className={cn(inputCls, "cursor-pointer", error && "border-red-400")} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

export function Toggle({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-neutral-900"
      />
      <span>
        <span className="block text-[13px] font-medium text-neutral-800">{label}</span>
        {hint && <span className="block text-[11px] text-neutral-400">{hint}</span>}
      </span>
    </label>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-paper px-6 py-16 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      {children && <div className="mt-2 text-[13px] text-ink-mute">{children}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    archived: "bg-neutral-100 text-neutral-500 border-neutral-200",
    new: "bg-blue-50 text-blue-700 border-blue-200",
    read: "bg-neutral-100 text-neutral-600 border-neutral-200",
    "in-progress": "bg-amber-50 text-amber-700 border-amber-200",
    responded: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-neutral-100 text-neutral-500 border-neutral-200",
    archived_: "bg-neutral-100 text-neutral-400 border-neutral-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium capitalize",
        map[status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200",
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}
