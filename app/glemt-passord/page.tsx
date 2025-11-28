"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function GlemtPassordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Skriv inn e-posten du brukte da du opprettet konto.");
      return;
    }

    setSending(true);

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://phorium.no";

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (error) {
        console.error("[resetPasswordForEmail]", error);
        setError(
          "Kunne ikke sende e-post for tilbakestilling. Sjekk e-posten og prøv igjen."
        );
        return;
      }

      setMessage(
        "Hvis e-posten finnes hos oss, har vi sendt en lenke for å tilbakestille passordet."
      );
    } catch (err) {
      console.error(err);
      setError("Uventet feil. Prøv igjen om litt.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-phorium-dark text-phorium-light flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-phorium-off/40 bg-phorium-surface/90 px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.8)]">
        <h1 className="text-lg font-semibold mb-1">Glemt passord</h1>
        <p className="text-[13px] text-phorium-light/70 mb-4">
          Skriv inn e-posten din, så sender vi en lenke for å velge nytt passord.
        </p>

        {message && (
          <div className="mb-3 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-100">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-[13px] text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-[12px] font-medium text-phorium-light/80"
            >
              E-post
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark/80 px-3 py-2 text-[13px] outline-none focus:border-phorium-accent/80"
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-phorium-accent px-3 py-2.5 text-[13px] font-semibold text-phorium-dark hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {sending ? "Sender lenke…" : "Send tilbakestillingslenke"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-[12px] text-phorium-light/70">
          <Link href="/login" className="hover:text-phorium-accent">
            Tilbake til innlogging
          </Link>
        </div>
      </div>
    </main>
  );
}
