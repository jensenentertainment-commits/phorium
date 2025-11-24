"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import clsx from "clsx";

type CreditsBadgeProps = {
  compact?: boolean;
};

const MAX_CREDITS = 1000;

export default function CreditsBadge({ compact = false }: CreditsBadgeProps) {
  const [user, setUser] = useState<any | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  // For animasjonen
  const [lastCredits, setLastCredits] = useState<number | null>(null);
  const [changed, setChanged] = useState(false);
  const [delta, setDelta] = useState<number>(0);

  // 🌐 1. Hent innlogget bruker
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setUser(null);
        setUserLoading(false);
        return;
      }
      setUser(data.user);
      setUserLoading(false);
    }
    loadUser();
  }, []);

  // 🧮 2. Hent kreditter fra database
  useEffect(() => {
    if (!user) {
      setCreditsLoading(false);
      return;
    }

    async function loadCredits() {
      const { data, error } = await supabase
        .from("credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setCredits(data.balance);
      } else {
        setCredits(0);
      }

      setCreditsLoading(false);
    }

    loadCredits();
  }, [user]);

  // ✨ 3. Oppdag endring i credits og trigge animasjon
  useEffect(() => {
    if (
      credits !== null &&
      lastCredits !== null &&
      credits !== lastCredits
    ) {
      const diff = credits - lastCredits;

      setDelta(diff);
      setChanged(true);

      // Reset animation after 600ms
      setTimeout(() => setChanged(false), 600);
    }

    // Oppdater for neste runde
    setLastCredits(credits);
  }, [credits]);

  const loading = userLoading || creditsLoading;
  const current = credits ?? 0;

  const percentage =
    MAX_CREDITS > 0
      ? Math.min(100, (current / MAX_CREDITS) * 100)
      : 0;

  // ✨ Mini-versjon til Tekst/Visuals
  if (compact) {
    return (
      <div className="relative flex flex-col items-end gap-1 text-[11px]">
        <div className="text-phorium-accent/90">Kreditter</div>

        <div
          className={clsx(
            "text-[13px] transition-all duration-500",
            changed && "text-phorium-accent drop-shadow-[0_0_6px_#C8B77A]"
          )}
        >
          {loading ? (
            <span className="text-phorium-light/60">Laster …</span>
          ) : user ? (
            <>
              <span className="font-semibold text-phorium-light">
                {current}
              </span>
              <span className="text-phorium-light/55"> / {MAX_CREDITS}</span>
            </>
          ) : (
            <span className="text-phorium-light/60">
              Logg inn for å se
            </span>
          )}
        </div>

        {/* Mini-float delta */}
        {changed && delta < 0 && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: -4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute -right-7 text-[10px] text-phorium-accent"
          >
            {delta}
          </motion.span>
        )}
      </div>
    );
  }

  // ⭐ Full versjon til Studio-hub
  return (
    <div className="relative flex flex-col items-start gap-1 sm:items-end">
      <div className="text-[11px] text-phorium-accent/90 mt-2">
        Kreditter igjen
      </div>

      <div
        className={clsx(
          "text-[14px] transition-all duration-500",
          changed && "text-phorium-accent drop-shadow-[0_0_6px_#C8B77A]"
        )}
      >
        {loading ? (
          <span className="text-phorium-light/60">Laster …</span>
        ) : user ? (
          <>
            <span className="font-semibold">{current}</span>
            <span className="text-phorium-light/55"> / {MAX_CREDITS}</span>
          </>
        ) : (
          <span className="text-phorium-light/60">
            Logg inn for å se kreditter
          </span>
        )}
      </div>

      {/* Delta float */}
      {changed && delta < 0 && (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: -6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute right-0 -mr-10 text-[11px] text-phorium-accent"
        >
          {delta}
        </motion.span>
      )}

      {/* Progress bar */}
      <div className="h-2.5 w-40 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
        <motion.div
          className={clsx(
            "h-full bg-phorium-accent",
            changed && "shadow-[0_0_12px_#C8B77A]"
          )}
          initial={{ width: 0 }}
          animate={{
            width: loading ? "0%" : `${percentage}%`,
          }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}
