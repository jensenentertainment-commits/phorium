"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function ChangePasswordSection() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 8) {
      setError("Passordet må være minst 8 tegn.");
      return;
    }

    if (newPassword !== confirm) {
      setError("Passordene er ikke like.");
      return;
    }

    try {
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Feil ved oppdatering av passord:", updateError);
        setError(
          updateError.message ||
            "Kunne ikke oppdatere passordet. Prøv igjen om litt."
        );
        return;
      }

      setSuccess("Passordet er oppdatert.");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      console.error("Uventet feil ved passordbytte:", err);
      setError(
        err?.message ||
          "Noe gikk galt under passordbytte. Prøv igjen om litt."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 p-4 sm:p-5">
      <h2 className="mb-1 text-[14px] font-semibold text-phorium-light">
        Endre passord
      </h2>
      <p className="mb-4 text-[11px] text-phorium-light/70">
        Du er allerede innlogget, så du trenger bare å velge et nytt passord.
      </p>

      <form onSubmit={handleChangePassword} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-phorium-light/80">
            Nytt passord
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-phorium-off/40 bg-phorium-surface/80 px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minst 8 tegn"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-phorium-light/80">
            Gjenta nytt passord
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-phorium-off/40 bg-phorium-surface/80 px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Skriv det samme passordet igjen"
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="text-[11px] text-emerald-400">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-lg bg-phorium-accent px-4 py-2 text-[12px] font-semibold text-phorium-dark shadow-[0_8px_18px_rgba(0,0,0,0.6)] transition hover:translate-y-[1px] hover:bg-phorium-accent/90 disabled:opacity-60"
        >
          {loading ? "Lagrer ..." : "Oppdater passord"}
        </button>
      </form>
    </div>
  );
}
