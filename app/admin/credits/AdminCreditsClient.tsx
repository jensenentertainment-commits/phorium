"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AdminUserRow = {
  user_id: string;
  balance: number;
  updated_at?: string;
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Kunne ikke hente brukere.");
        setUsers([]);
      } else {
        setUsers(data.users || []);
      }
    } catch (err: any) {
      console.error(err);
      setError("Uventet feil ved henting av brukere.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const run = async () => {
      await loadUsers();

      // Realtime på credits-tabellen for ALLE brukere
      channel = supabase
        .channel("admin-credits-live")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "credits",
          },
          (payload) => {
            if (cancelled) return;
            const row = payload.new as { user_id?: string; balance?: number };
            if (!row?.user_id) return;

            setUsers((prev) => {
              const existing = prev.find((u) => u.user_id === row.user_id);
              if (existing) {
                return prev.map((u) =>
                  u.user_id === row.user_id
                    ? { ...u, balance: row.balance ?? u.balance }
                    : u,
                );
              }

              // Hvis en bruker ikke fantes i lista (ny rad i credits)
              return [
                ...prev,
                {
                  user_id: row.user_id,
                  balance: row.balance ?? 0,
                },
              ];
            });
          },
        )
        .subscribe();
    };

    void run();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function adjustCredits(userId: string, delta: number) {
    try {
      setBusyId(userId);
      setError(null);

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

      // Vi lar fortsatt lokalt UI oppdatere direkte,
      // realtime vil uansett bekrefte/følge opp.
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, balance: data.balance } : u,
        ),
      );
    } catch (err: any) {
      console.error(err);
      setError("Uventet feil ved kreditt-oppdatering.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-phorium-dark text-phorium-light flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-semibold mb-2">
          Admin · Brukere &amp; kreditter
        </h1>
        <p className="text-[13px] text-phorium-light/70 mb-6">
          Viser alle brukere som har en rad i{" "}
          <span className="font-mono text-[12px]">credits</span>-tabellen.
          Juster saldo med hurtigknappene, eller bruk{" "}
          <span className="font-mono text-[12px]">/admin/credits</span>{" "}
          for manuelle endringer.
        </p>

        <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 shadow-[0_18px_50px_rgba(0,0,0,0.55)] overflow-hidden">
          {error && (
            <div className="px-4 py-3 text-[12px] text-red-300 border-b border-red-500/40">
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-4 py-6 text-[13px] text-phorium-light/70">
              Laster brukere …
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-6 text-[13px] text-phorium-light/70">
              Ingen brukere funnet i{" "}
              <span className="font-mono text-[12px]">credits</span>-tabellen ennå.
            </div>
          ) : (
            <ul className="divide-y divide-phorium-off/20">
              {users.map((u) => (
                <li
                  key={u.user_id}
                  className="grid grid-cols-[2.5fr,1fr,1.5fr] gap-4 px-4 py-3 text-[13px] items-center"
                >
                  <div className="font-mono text-[11px] text-phorium-light/80 break-all">
                    {u.user_id}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{u.balance}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    {[100, 300, 500].map((delta) => (
                      <button
                        key={delta}
                        onClick={() => adjustCredits(u.user_id, delta)}
                        disabled={busyId === u.user_id}
                        className="rounded-full border border-phorium-off/40 px-2.5 py-1 text-[11px] text-phorium-light/80 hover:border-phorium-accent/80 hover:text-phorium-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +{delta}
                      </button>
                    ))}
                    <button
                      onClick={() => adjustCredits(u.user_id, -100)}
                      disabled={busyId === u.user_id}
                      className="rounded-full border border-red-500/50 px-2.5 py-1 text-[11px] text-red-300 hover:border-red-400 hover:text-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -100
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-4 text-[11px] text-phorium-light/50">
          Data hentes fra{" "}
          <span className="font-mono text-[11px]">credits</span>-tabellen.
          Rader opprettes automatisk når en bruker får eller bruker kreditter.
        </p>
      </div>
    </main>
  );
}
