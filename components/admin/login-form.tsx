"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    { t: "idle" } | { t: "loading" } | { t: "error"; m: string } | { t: "sent" }
  >({ t: "idle" });

  const supabase = getSupabaseBrowserClient();

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setStatus({ t: "loading" });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus({ t: "error", m: error.message });
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setStatus({ t: "loading" });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    });
    setStatus(error ? { t: "error", m: error.message } : { t: "sent" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <p className="font-serif text-sm font-semibold tracking-[0.18em] text-neutral-900">
        CONSCIOUS OMNIUM
      </p>
      <h1 className="mt-3 font-serif text-2xl text-neutral-900">Studio sign in</h1>
      <p className="mt-1.5 text-[13px] text-neutral-500">
        Restricted to the studio. Accounts are created in Supabase.
      </p>

      {status.t === "sent" ? (
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 text-[13px] text-neutral-600">
          Check <span className="font-medium text-neutral-900">{email}</span> for a
          sign-in link.
        </div>
      ) : (
        <form
          onSubmit={mode === "password" ? handlePassword : handleMagic}
          className="mt-8 space-y-4"
        >
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-neutral-900"
            />
          </label>

          {mode === "password" && (
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-neutral-900"
              />
            </label>
          )}

          {status.t === "error" && (
            <p className="text-[12px] text-red-600">{status.m}</p>
          )}

          <button
            type="submit"
            disabled={status.t === "loading"}
            className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60"
          >
            {status.t === "loading"
              ? "…"
              : mode === "password"
                ? "Sign in"
                : "Send magic link"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "password" ? "magic" : "password"));
              setStatus({ t: "idle" });
            }}
            className="w-full text-[12px] text-neutral-500 hover:text-neutral-900"
          >
            {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
          </button>
        </form>
      )}
    </div>
  );
}
