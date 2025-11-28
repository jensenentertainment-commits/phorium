"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error("[getUser – reset-password]", error);
        setError(
          "Denne lenken er ikke gyldig lenger, eller sesjonen er utløpt. Be om en ny 'glemt passord'-lenke."
        );
      }

      setLoading(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password || password.length < 8) {
      setError("Passordet må være minst 8 tegn.");
      return;
    }

    if (password !== password2) {
      setError("Passordene er ikke like.");
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("[updateUser – reset-password]", error);
        setError("Kunne ikke oppdatere passordet. Prøv igjen.");
        return;
      }

      setMessage("Passordet er oppdatert. Du kan nå logge inn med det nye passordet.");
    } catch (err) {
      console.error(err);
      setError("Uventet feil. Prøv igjen om litt.");
    } finally {
      setUpdating(false);
    }
  }

  const canSubmit = !loading && !updating;

  return (
    <main className="min-h-screen bg-phorium-dark text-phorium-light flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-phorium-off/40 bg-phorium-surface/90 px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.8)]">
        <h1 className="text-lg font-semibold mb-1">Velg nytt passord</h1>
        <p className="text-[13px] text-phorium-light/70 mb-4">
          Skriv inn et nytt passord for kontoen din.
        </p>

        {loading && (
          <p className="text-[13px] text-phorium-light/70">
            Sjekker lenken din …
          </p>
        )}

        {!loading && error && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-[13px] text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="space-y-3">
            {message && (
              <div className="mb-3 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-[13px] text-emerald-100">
                {message}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-[12px] font-medium text-phorium-light/80"
              >
                Nytt passord
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark/80 px-3 py-2 text-[13px] outline-none focus:border-phorium-accent/80"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!canSubmit}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password2"
                className="text-[12px] font-medium text-phorium-light/80"
              >
                Gjenta nytt passord
              </label>
              <input
                id="password2"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark/80 px-3 py-2 text-[13px] outline-none focus:border-phorium-accent/80"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={!canSubmit}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-xl bg-phorium-accent px-3 py-2.5 text-[13px] font-semibold text-phorium-dark hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {updating ? "Lagrer passord…" : "Oppdater passord"}
            </button>
          </form>
        )}

        <div className="mt-4 flex justify-between text-[12px] text-phorium-light/70">
          <Link href="/login" className="hover:text-phorium-accent">
            Gå til innlogging
          </Link>
        </div>
      </div>
    </main>
  );
}
