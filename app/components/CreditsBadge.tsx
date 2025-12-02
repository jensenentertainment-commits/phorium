"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type CreditsBadgeProps = {
  /** Hvis du vil tvinge inn en bestemt saldo (f.eks. fra server), kan du sende den inn her. */
  balance?: number;
  /** Maks kreditter / kvote (default 300) */
  quota?: number;
  /** Valgfritt: mer kompakt variant hvis du vil style annerledes senere */
  compact?: boolean;
};

export default function CreditsBadge({
  balance,
  quota = 300,
  compact = false,
}: CreditsBadgeProps) {
  const [internalBalance, setInternalBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Hvis "balance" ikke er sendt inn via props, henter vi credits selv + realtime
  useEffect(() => {
    if (balance !== undefined) return; // parent styrer, vi trenger ikke hente

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadCredits() {
      try {
        setLoading(true);

        // Hent innlogget bruker
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          if (!cancelled) setInternalBalance(0);
          return;
        }

        const userId = userData.user.id;

        // 1) Første fetch
        const { data, error } = await supabase
          .from("credits")
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle();

        if (!cancelled) {
          if (error || !data) {
            setInternalBalance(0);
          } else {
            setInternalBalance(data.balance ?? 0);
          }
        }

        // 2) Realtime subscription
        channel = supabase
          .channel(`credits-realtime-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "credits",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const newBalance =
                (payload.new as { balance?: number })?.balance;
              if (!cancelled && typeof newBalance === "number") {
                setInternalBalance(newBalance);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("[CreditsBadge] Klarte ikke å hente credits:", err);
        if (!cancelled) setInternalBalance(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCredits();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [balance]);

  // Effektiv balance = prop hvis sendt inn, ellers internt hentet tall
  const effectiveBalance =
    balance !== undefined
      ? balance
      : internalBalance !== null
      ? internalBalance
      : 0;

  const safeQuota = quota > 0 ? quota : 1;
  const percentage = Math.min(
    100,
    Math.max(0, (effectiveBalance / safeQuota) * 100),
  );

  // Dynamisk farge på baren
  let barColor = "bg-phorium-off/40";
  if (percentage === 0) {
    barColor = "bg-phorium-off/30";
  } else if (percentage < 20) {
    barColor = "bg-red-500";
  } else if (percentage < 50) {
    barColor = "bg-yellow-500";
  } else if (percentage < 80) {
    barColor = "bg-emerald-500";
  } else {
    barColor = "bg-phorium-accent";
  }

  const wrapperClass = compact
    ? "inline-flex items-center gap-2 rounded-full bg-phorium-dark/70 px-3 py-1.5 border border-phorium-off/40"
    : "inline-flex flex-col gap-2 rounded-xl bg-phorium-dark/70 px-3 py-2 border border-phorium-off/40";

  return (
    <div className={wrapperClass}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-phorium-light/70">
          Kreditter
        </span>

        <span className="text-[11px] font-mono text-phorium-light/90">
          {loading ? "…" : `${effectiveBalance}/${quota}`}
        </span>

        {/* Tooltip-ikon */}
        {!compact && (
          <span className="group relative inline-flex">
            <Info className="h-3.5 w-3.5 text-phorium-light/50" />
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-56 -translate-x-1/2 rounded-md bg-black/90 p-2 text-[10px] text-phorium-light/90 shadow-lg group-hover:block">
              Kreditter brukes når du genererer tekst og bilder i Studio.
              <br />
              <br />
              Eksempel:
              <br />– Tekstpakke: 2 kreditter
              <br />– Banner / scene: 4–5 kreditter
            </span>
          </span>
        )}
      </div>

      {/* Progress-bar */}
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-phorium-off/20">
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!compact && (
        <p className="mt-1 text-[10px] text-phorium-light/65">
          Du har{" "}
          <span className="font-semibold">{effectiveBalance}</span> igjen av{" "}
          <span className="font-semibold">{quota}</span>.
        </p>
      )}
    </div>
  );
}
