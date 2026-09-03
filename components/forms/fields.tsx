"use client";

import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const labelClass =
  "flex items-baseline justify-between text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ink";
const controlClass =
  "w-full border-0 border-b border-line-strong bg-transparent py-3 text-[0.95rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink";

function Optional() {
  return <span className="text-[0.6rem] font-normal tracking-[0.1em] text-ink-faint">Optional</span>;
}

export function Field({
  label,
  name,
  error,
  optional,
  className,
  ...props
}: {
  label: string;
  error?: string;
  optional?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        <span>{label}</span>
        {optional && <Optional />}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClass, error && "border-[#9a3b32]")}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-[0.72rem] text-[#9a3b32]">
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  name,
  error,
  optional,
  className,
  ...props
}: {
  label: string;
  error?: string;
  optional?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        <span>{label}</span>
        {optional && <Optional />}
      </label>
      <textarea
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlClass, "resize-none leading-relaxed", error && "border-[#9a3b32]")}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-[0.72rem] text-[#9a3b32]">
          {error}
        </span>
      )}
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  error,
  optional,
  className,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  optional?: boolean;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        <span>{label}</span>
        {optional && <Optional />}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          className={cn(
            controlClass,
            "cursor-pointer appearance-none pr-8",
            error && "border-[#9a3b32]",
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error && (
        <span id={`${id}-error`} className="text-[0.72rem] text-[#9a3b32]">
          {error}
        </span>
      )}
    </div>
  );
}
