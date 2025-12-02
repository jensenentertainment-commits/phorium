"use client";

import { useState } from "react";

const PLAN_OPTIONS = [
  { value: "", label: "Ingen (beta / free)" },
  { value: "source", label: "Source" },
  { value: "flow", label: "Flow" },
  { value: "pulse", label: "Pulse" },
  { value: "nexus", label: "Nexus" },
];


export default function UserAdminClient({
  userId,
  initialPlan,
  initialBalance,
}: {
  userId: string;
  initialPlan: string | null;
  initialBalance: number;
}) {
  const [plan, setPlan] = useState<string>(initialPlan ?? "");
  const [balance, setBalance] = useState<number>(initialBalance);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdjustCredits(delta: number) {
    try {
      setBusy(true);
      setError(null);
      setMessage(null);

      const res = await fetch("/api/credits/give", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: delta }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Kunne ikke oppdatere kreditter.");
        return;
      }

      setBalance(data.balance);
      setMessage(
        `Saldo oppdatert til ${data.balance} (endring: ${
          delta > 0 ? "+" : ""
        }${delta})`,
      );
    } catch (err) {
      console.error(err);
      setError("Uventet feil ved kreditt-oppdatering.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSavePlan() {
    try {
      setBusy(true);
      setError(null);
      setMessage(null);

      const res = await fetch("/api/admin/users/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: plan || null }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Kunne ikke oppdatere plan.");
        return;
      }

      setMessage(`Plan oppdatert til ${data.plan || "Ingen"}.`);
    } catch (err) {
      console.error(err);
      setError("Uventet feil ved oppdatering av plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 text-[12px]">
      {/* Plan */}
      <div className="space-y-1">
        <p className="text-[11px] text-phorium-light/60">Endre plan</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[12px] text-phorium-light/90"
            disabled={busy}
          >
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.value || "NONE"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={busy}
            className="rounded-full border border-phorium-off/50 bg-phorium-dark px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-phorium-light/80 transition hover:border-phorium-accent/80 hover:text-phorium-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lagre plan
          </button>
        </div>
      </div>

      {/* Kreditter */}
      <div className="space-y-1">
        <p className="text-[11px] text-phorium-light/60">
          Juster kreditt-saldo
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-phorium-light/70">
            Nåværende saldo:{" "}
            <span className="font-semibold text-phorium-light">
              {balance}
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[100, 300, 500].map((delta) => (
            <button
              key={delta}
              type="button"
              disabled={busy}
              onClick={() => handleAdjustCredits(delta)}
              className="rounded-full border border-phorium-off/40 px-2.5 py-1 text-[11px] text-phorium-light/80 transition hover:border-phorium-accent/80 hover:text-phorium-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +{delta}
            </button>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => handleAdjustCredits(-100)}
            className="rounded-full border border-red-500/50 px-2.5 py-1 text-[11px] text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -100
          </button>
        </div>
      </div>

      {/* Meldinger */}
      {message && (
        <p className="text-[11px] text-emerald-300">{message}</p>
      )}
      {error && <p className="text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
