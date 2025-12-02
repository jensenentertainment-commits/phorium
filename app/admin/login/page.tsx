"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Kunne ikke logge inn som admin.");
        return;
      }

      // Alt ok → gå til admin-oversikt (f.eks. credits)
      router.push("/admin/credits");
    } catch (err) {
      console.error(err);
      setError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center items-start pt-20">
      <div className="w-full max-w-sm rounded-2xl border border-phorium-off/30 bg-phorium-dark/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        <h1 className="text-lg font-semibold text-phorium-light">
          Admin-tilgang
        </h1>
        <p className="mt-1 text-[13px] text-phorium-light/70">
          Denne siden er kun for deg som administrerer Phorium.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-[12px] text-phorium-light/70">
              Admin-nøkkel
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-lg border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80"
              placeholder="Skriv inn admin-nøkkel"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="w-full rounded-lg bg-phorium-accent py-2 text-[13px] font-semibold text-phorium-dark hover:bg-phorium-accent/90 disabled:opacity-60 disabled:hover:bg-phorium-accent"
          >
            {loading ? "Logger inn …" : "Logg inn som admin"}
          </button>
        </form>
      </div>
    </main>
  );
}
