"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CreditLogRow = {
  id: string;
  user_id: string;
  change_amount: number;
  reason: string | null;
  created_at: string;
};

export default function CreditHistory() {
  const [rows, setRows] = useState<CreditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
        }
        return;
      }

      // 1) Første fetch
      const { data, error } = await supabase
        .from("credits_log")
        .select("id, user_id, change_amount, reason, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!cancelled) {
        if (error) {
          console.warn(
            "Kunne ikke hente kreditt-historikk (helt ok i tidlig beta):",
            error,
          );
          setRows([]);
        } else {
          setRows(data ?? []);
        }
        setLoading(false);
      }

      // 2) Realtime på credits_log for denne brukeren
      channel = supabase
        .channel(`credits-log-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "credits_log",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (cancelled) return;
            const newRow = payload.new as CreditLogRow;
            setRows((prev) => {
              // unngå duplikater
              if (prev.some((r) => r.id === newRow.id)) return prev;
              return [newRow, ...prev].slice(0, 50);
            });
          },
        )
        .subscribe();
    };

    void load();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <p className="mt-2 text-[12px] text-phorium-light/65">
        Laster kreditt-historikk …
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="mt-2 text-[12px] text-phorium-light/65">
        Ingen kreditt-historikk ennå.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2 text-[12px]">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center justify-between rounded-lg border border-phorium-off/25 bg-phorium-dark/70 px-3 py-2"
        >
          <div className="flex flex-col">
            <span className="text-phorium-light/80">
              {row.reason || "Justering av kreditter"}
            </span>
            <span className="text-[11px] text-phorium-light/55">
              {new Date(row.created_at).toLocaleString("nb-NO", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span
            className={
              row.change_amount >= 0
                ? "text-emerald-300 font-semibold"
                : "text-red-300 font-semibold"
            }
          >
            {row.change_amount > 0 ? "+" : ""}
            {row.change_amount}
          </span>
        </div>
      ))}
    </div>
  );
}
