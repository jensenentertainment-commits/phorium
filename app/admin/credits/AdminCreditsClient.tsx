"use client";

import { useEffect, useState } from "react";

type CreditRow = {
  user_id: string;
  balance: number;
  updated_at: string;
  email?: string | null;
};

export default function AdminCreditsClient() {
  const [rows, setRows] = useState<CreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hent eksisterende kredittdata (hvis du har /api/admin/users)
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) throw new Error("Kunne ikke hente brukere");
        const data = await res.json();
        // Forventer en liste; hvis formatet er annerledes kan vi justere senere
        setRows(data.users ?? data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGiveCredits(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!userId.trim() || amount === "" || isNaN(Number(amount))) {
      setError("Fyll inn både bruker-ID og antall kreditter.");
      return;
    }

    try {
      const res = await fetch("/api/credits/give", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          amount: Number(amount),
          reason: reason || "admin_adjust",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Kunne ikke oppdatere kreditter.");
      }

      setMessage("Kreditter oppdatert.");
      setAmount("");
      setReason("");

      // Oppdater tabellen i UI hvis mulig
      setRows((prev) => {
        const idx = prev.findIndex((r) => r.user_id === userId.trim());
        if (idx === -1) {
          return [
            ...prev,
            {
              user_id: userId.trim(),
              balance: Number(amount),
              updated_at: new Date().toISOString(),
            },
          ];
        }
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          balance: (copy[idx].balance ?? 0) + Number(amount),
          updated_at: new Date().toISOString(),
        };
        return copy;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Noe gikk galt.");
    }
  }

  return (
    <main className="min-h-screen bg-phorium-dark pt-24 pb-24 text-phorium-light">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-phorium-light/50">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Kredittadministrasjon</h1>
          <p className="mt-2 text-[13px] text-phorium-light/70">
            Her kan du justere kredittsaldo for brukere i Phorium under beta.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Skjema */}
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            <h2 className="text-sm font-semibold text-phorium-light">
              Juster kreditter
            </h2>
            <p className="mt-1 text-[12px] text-phorium-light/65">
              Lim inn Supabase user_id for brukeren, og angi hvor mange
              kreditter du vil legge til (eller trekke).
            </p>

            <form onSubmit={handleGiveCredits} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[12px] text-phorium-light/70">
                  Bruker-ID (Supabase user_id)
                </label>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full rounded-lg border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80"
                  placeholder="f.eks. 8c969c90-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] text-phorium-light/70">
                    Antall kreditter (+/-)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80"
                    placeholder="f.eks. 100 eller -50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] text-phorium-light/70">
                    Begrunnelse (valgfritt)
                  </label>
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80"
                    placeholder="f.eks. beta-justering"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[12px] text-red-400 mt-1">{error}</p>
              )}
              {message && (
                <p className="text-[12px] text-emerald-400 mt-1">{message}</p>
              )}

              <button
                type="submit"
                className="mt-2 inline-flex items-center rounded-lg bg-phorium-accent px-4 py-2 text-[13px] font-semibold text-phorium-dark hover:bg-phorium-accent/90 transition"
              >
                Oppdater kreditter
              </button>
            </form>
          </div>

          {/* Liste / tabell */}
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            <h2 className="text-sm font-semibold text-phorium-light">
              Brukere & saldo
            </h2>
            <p className="mt-1 text-[12px] text-phorium-light/65">
              Enkel oversikt over registrerte kredittsaldoer. Denne listen er kun for
              internt bruk i beta.
            </p>

            {loading ? (
              <p className="mt-4 text-[13px] text-phorium-light/70">
                Laster …
              </p>
            ) : rows.length === 0 ? (
              <p className="mt-4 text-[13px] text-phorium-light/70">
                Ingen kredittdata funnet enda.
              </p>
            ) : (
              <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1 text-[12px]">
                {rows.map((row) => (
                  <div
                    key={row.user_id}
                    className="flex flex-col rounded-lg border border-phorium-off/25 bg-phorium-dark/60 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-phorium-light/90">
                        {row.email || row.user_id}
                      </span>
                      <span className="rounded-full bg-phorium-accent/10 px-2 py-0.5 text-[11px] font-semibold text-phorium-accent">
                        {row.balance} kreditter
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-phorium-light/55">
                      Sist oppdatert:{" "}
                      {new Date(row.updated_at).toLocaleString("nb-NO", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {row.user_id && (
                      <span className="mt-0.5 truncate text-[10px] text-phorium-light/40">
                        ID: {row.user_id}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
