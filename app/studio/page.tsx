"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Type as TypeIcon,
  Image as ImageIcon,
  Gauge,
  Store,
  Settings2,
  Link2,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import CreditsBadge from "@/app/components/CreditsBadge";
import { PlanBadge, PLAN_COLORS, type PlanName } from "@/app/components/PlanBadge";
import { Card } from "@/app/components/ui/Card";
import { SectionHeader } from "@/app/components/ui/SectionHeader";

type StatusResponse = {
  connected: boolean;
  shop?: string | null;
};

export default function DashboardHubPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [plan, setPlan] = useState<PlanName | null>(null);

  // Shopify-status
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/shopify/status", { cache: "no-store" });
        if (!res.ok) throw new Error("Status-feil");
        const data: StatusResponse = await res.json();
        setStatus(data);
      } catch {
        setStatus({ connected: false });
      } finally {
        setStatusLoading(false);
      }
    }

    fetchStatus();
  }, []);

  // Plan
  useEffect(() => {
    const run = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPlan(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Feil ved henting av plan i /studio:", error);
          setPlan(null);
          return;
        }

        if (data?.plan) {
          const normalized = String(data.plan).toLowerCase().trim();
          const valid: PlanName[] = ["source", "flow", "pulse", "nexus", "admin"];
          if (valid.includes(normalized as PlanName)) {
            setPlan(normalized as PlanName);
          } else {
            setPlan(null);
          }
        } else {
          setPlan(null);
        }
      } catch (err) {
        console.error("Uventet feil ved henting av plan i /studio:", err);
        setPlan(null);
      }
    };

    void run();
  }, []);

  const palette = plan ? PLAN_COLORS[plan] : null;

  function renderStatusBadge() {
    if (statusLoading) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/80">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400/80 shadow-[0_0_8px_rgba(255,255,0,0.6)]" />
          <span>Sjekker Shopify-tilkobling …</span>
        </div>
      );
    }

    if (status?.connected && status.shop) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/60 bg-phorium-accent/15 px-3 py-1.5 text-[11px] text-phorium-accent/95">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span className="font-semibold">Nettbutikk koblet</span>
          <span className="text-phorium-light/90">Shopify · {status.shop}</span>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/80">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        <span className="font-semibold">Ikke koblet</span>
        <span className="opacity-80">Koble til for best resultater</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-8 pb-20 text-phorium-light">
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Toppseksjon – SectionHeader + plan/credits + status */}
        <SectionHeader
          label="Studio"
          title="Velkommen til Phorium Studio"
          description="Velg hva du vil jobbe med i nettbutikken din – tekster, bilder, brandprofil og produktadministrasjon."
          rightSlot={renderStatusBadge()}
        />

        <Card className="mb-10 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <PlanBadge plan={plan} />
              <CreditsBadge quota={300} compact />
            </div>
            <p className="text-[11px] text-phorium-light/60">
              Plan og kreditter gjelder for hele kontoen – alle moduler i Studio
              trekker fra samme pott.
            </p>
          </div>
        </Card>

        {/* HOVEDMODULER – 2 store kort */}
        <div className="mb-10 grid gap-8 md:grid-cols-2">
          {/* Tekststudio */}
          <Link href="/studio/tekst">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Card className="group relative overflow-hidden px-7 py-6 shadow-[0_10px_32px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)] transition-shadow duration-300">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border bg-phorium-surface/30 shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110"
                    style={{
                      borderColor: palette?.ring ?? "rgba(200,183,122,0.45)",
                    }}
                  >
                    <TypeIcon
                      className="h-5 w-5"
                      style={{ color: palette?.text ?? "#C8B77A" }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-phorium-light/95">
                      Tekststudio
                    </h2>
                    <p className="text-[11px] text-phorium-light/60">
                      Produkttekster, SEO og annonsetekster tilpasset butikken din.
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-[12px] leading-relaxed text-phorium-light/75">
                  Start her når du vil gi produktene dine tydelige tekster som
                  matcher brandprofil, kategori og kanal – uten å skrive alt fra
                  scratch.
                </p>

                <div className="flex items-center justify-between text-[11px] text-phorium-light/60 pr-2">
                  <span className="inline-flex items-center gap-1">
                    <TypeIcon
                      className="h-3 w-3"
                      style={{ color: palette?.text ?? "#C8B77A" }}
                    />
                    <span>Åpne Tekststudio</span>
                  </span>
                  <span className="uppercase tracking-[0.16em]">Studio</span>
                </div>
              </Card>
            </motion.div>
          </Link>

          {/* Visuals */}
          <Link href="/studio/visuals">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <Card className="group relative overflow-hidden px-7 py-6 shadow-[0_10px_32px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)] transition-shadow duration-300">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border bg-phorium-surface/30 shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110"
                    style={{
                      borderColor: palette?.ring ?? "rgba(200,183,122,0.45)",
                    }}
                  >
                    <ImageIcon
                      className="h-5 w-5"
                      style={{ color: palette?.text ?? "#C8B77A" }}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-phorium-light/95">
                      Visuals
                    </h2>
                    <p className="text-[11px] text-phorium-light/60">
                      Produktbilder, bannere og kampanjevisuals.
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-[12px] leading-relaxed text-phorium-light/75">
                  Lag visuals til forsiden, kategorier og kampanjer som holder
                  samme stil som butikken – med hjelp av brandprofilen din.
                </p>

                <div className="flex items-center justify-between text-[11px] text-phorium-light/60 pr-2">
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon
                      className="h-3 w-3"
                      style={{ color: palette?.text ?? "#C8B77A" }}
                    />
                    <span>Åpne Visuals</span>
                  </span>
                  <span className="uppercase tracking-[0.16em]">Studio</span>
                </div>
              </Card>
            </motion.div>
          </Link>
        </div>

        {/* SEKUNDÆRE MODULER */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brandprofil */}
          <Link href="/studio/brandprofil">
            <Card className="group h-36 px-4 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)] transition-shadow duration-300 bg-phorium-dark/80">
              <div className="mb-2 flex items-center gap-2.5">
                <Settings2
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-sm font-semibold text-phorium-light/95">
                  Brandprofil
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
                Fortell Phorium hvordan butikken din høres og ser ut – tone,
                ordvalg og stil.
              </p>
            </Card>
          </Link>

          {/* Produkter */}
          <Link href="/studio/produkter">
            <Card className="group h-36 px-4 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)] transition-shadow duration-300 bg-phorium-dark/80">
              <div className="mb-2 flex items-center gap-2.5">
                <Store
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-sm font-semibold text-phorium-light/95">
                  Produkter
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
                Se hvilke produkter som mangler tekst, bilder eller SEO – og
                hopp rett inn i riktig studio.
              </p>
            </Card>
          </Link>

          {/* Koble nettbutikk */}
          <Link href="/studio/koble-nettbutikk">
            <Card className="group h-36 px-4 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)] transition-shadow duration-300 bg-phorium-dark/80">
              <div className="mb-2 flex items-center gap-2.5">
                <Link2
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-sm font-semibold text-phorium-light/95">
                  Koble nettbutikk
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
                Sjekk status på Shopify-tilkoblingen og synk produkter på nytt.
              </p>
            </Card>
          </Link>

          {/* Min side */}
          <Link href="/studio/minside">
            <Card className="group h-36 px-4 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.45)] hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)] transition-shadow duration-300 bg-phorium-dark/80">
              <div className="mb-2 flex items-center gap-2.5">
                <User
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-sm font-semibold text-phorium-light/95">
                  Min side
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
                Se plan, kreditter og kontoinnstillinger (kommer etter hvert).
              </p>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  );
}
