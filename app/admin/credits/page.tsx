"use client";

import { useState } from "react";

export default function AdminCreditsPage() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState<string>("100");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const numericAmount = Number(amount);

    try {
      const res = await fetch("/api/credits/give", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          amount: numericAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Noe gikk galt ved tildeling av kreditter.");
      } else {
        setMessage(
          `Ny saldo for bruker: ${data.balance} kreditter. (Endring: ${numericAmount > 0 ? "+" : ""}${numericAmount})`
        );
      }
    } catch (err: any) {
      console.error(err);
      setError("Uventet feil ved kontakt med server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-phorium-dark text-phorium-light flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-phorium-off/40 bg-[#111210] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <h1 className="text-lg font-semibold mb-2">Admin · Gi kreditter</h1>
        <p className="text-[12px] text-phorium-light/70 mb-4">
          Lim inn <span className="font-mono text-[11px]">user_id</span> fra Supabase, velg antall
          kreditter, og trykk lagre. Negativt tall vil trekke kreditter.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] mb-1 text-phorium-light/80">
              Bruker-ID (Supabase <span className="font-mono">user_id</span>)
            </label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-md border border-phorium-off/40 bg-[#060706] px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80 focus:ring-1 focus:ring-phorium-accent/70"
              placeholder="f.eks. 1f234b1c-...."
            />
          </div>

          <div>
            <label className="block text-[12px] mb-1 text-phorium-light/80">
              Kreditter (+ for å gi, - for å trekke)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-phorium-off/40 bg-[#060706] px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80 focus:ring-1 focus:ring-phorium-accent/70"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !userId.trim() || amount.trim() === ""}
            className="mt-1 w-full rounded-md bg-phorium-accent py-2.5 text-[14px] font-semibold text-phorium-dark disabled:bg-phorium-accent/40 disabled:cursor-not-allowed"
          >
            {loading ? "Oppdaterer kreditter…" : "Lagre kreditter"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-[12px] text-emerald-300">{message}</p>
        )}

        {error && (
          <p className="mt-4 text-[12px] text-red-300">{error}</p>
        )}

        <p className="mt-5 text-[11px] text-phorium-light/50">
          Tips: Finn <span className="font-mono">user_id</span> under{" "}
          <span className="italic">Auth → Users</span> i Supabase.
        </p>
      </div>
    </main>
  );
}
