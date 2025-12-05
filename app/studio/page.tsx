"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Type as TypeIcon,
  Image as ImageIcon,
  Link2,
  Gauge,
  Blocks,
  Store,
  Settings2,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { PLAN_COLORS, type PlanName } from "@/app/components/PlanBadge";

type StatusResponse = {
  connected: boolean;
  shop?: string;
};

export default function DashboardHubPage() {
  // Shopify-status
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Plan / palette
  const [plan, setPlan] = useState<PlanName | null>(null);

  // Hent plan fra profiles
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

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Feil ved henting av profil/plan i /studio:", error);
          setPlan(null);
          return;
        }

        if (profile?.plan) {
          const normalized = String(profile.plan).toLowerCase().trim();
          if (["source", "flow", "pulse", "nexus"].includes(normalized)) {
            setPlan(normalized as PlanName);
          } else {
            setPlan("source");
          }
        } else {
          setPlan("source");
        }
      } catch (err) {
        console.error("Uventet feil ved henting av plan i /studio:", err);
        setPlan(null);
      }
    };

    run();
  }, []);

  const palette = plan ? PLAN_COLORS[plan] : null;

  // Hent Shopify-tilkoblingsstatus
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
          <span className="text-phorium-light/90">
            Shopify · {status.shop}
          </span>
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
      <section className="mx-auto max-w-5xl px-4">
        {/* Studio-header */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-phorium-light/50">
              <Gauge className="h-3 w-3" />
              Studio-hub
            </div>

            <h1 className="text-xl font-semibold text-phorium-light sm:text-2xl">
              Velkommen til Phorium Studio
            </h1>

            <p className="max-w-md text-[12px] text-phorium-light/70">
              Her styrer du alt innhold for nettbutikken din – tekster, bilder,
              bannere, brandprofil og produktadministrasjon.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {renderStatusBadge()}
          </div>
        </div>

        {/* HOVEDMODULER – 2 store kort */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Tekststudio – stort kort */}
          <Link href="/studio/tekst">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/85
                px-6 py-6
                shadow-[0_6px_20px_rgba(0,0,0,0.45)]
                hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.35)",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10 items-center justify-center rounded-xl
                    border bg-phorium-surface/30
                    shadow-[0_4px_10px_rgba(0,0,0,0.35)]
                    transition-all duration-300
                  "
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
                  <h2 className="text-sm font-semibold text-phorium-light/95">
                    Tekststudio
                  </h2>
                  <p className="text-[11px] text-phorium-light/60">
                    Produkttekster, SEO og annonsetekster tilpasset butikken
                    din.
                  </p>
                </div>
              </div>

              <p className="mb-4 text-[12px] leading-relaxed text-phorium-light/75">
                Start her når du vil gi produktene dine tydelige tekster som
                matcher brandprofil, kategori og kanal – uten å skrive alt fra
                scratch.
              </p>

              <div className="flex items-center justify-between text-[11px] text-phorium-light/60">
                <span className="inline-flex items-center gap-1">
                  <TypeIcon
                    className="h-3 w-3"
                    style={{ color: palette?.text ?? "#C8B77A" }}
                  />
                  <span>Åpne Tekststudio</span>
                </span>
                <span className="uppercase tracking-[0.16em]">Studio</span>
              </div>
            </motion.div>
          </Link>

          {/* Visuals – stort kort */}
          <Link href="/studio/visuals">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/85
                px-6 py-6
                shadow-[0_6px_20px_rgba(0,0,0,0.45)]
                hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.35)",
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10 items-center justify-center rounded-xl
                    border bg-phorium-surface/30
                    shadow-[0_4px_10px_rgba(0,0,0,0.35)]
                    transition-all duration-300
                  "
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
                  <h2 className="text-sm font-semibold text-phorium-light/95">
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

              <div className="flex items-center justify-between text-[11px] text-phorium-light/60">
                <span className="inline-flex items-center gap-1">
                  <ImageIcon
                    className="h-3 w-3"
                    style={{ color: palette?.text ?? "#C8B77A" }}
                  />
                  <span>Åpne Visuals</span>
                </span>
                <span className="uppercase tracking-[0.16em]">Studio</span>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* SEKUNDÆRE MODULER – 4 mindre kort */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brandprofil */}
          <Link href="/studio/brandprofil">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/80
                px-4 py-4
                shadow-[0_4px_14px_rgba(0,0,0,0.45)]
                hover:shadow-[0_10px_24px_rgba(0,0,0,0.6)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Settings2
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-[12px] font-medium text-phorium-light/95">
                  Brandprofil
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-phorium-light/65">
                Fortell Phorium hvordan butikken din høres ut og ser ut – tone,
                ordvalg og stil.
              </p>
            </motion.div>
          </Link>

          {/* Produkter */}
          <Link href="/studio/produkter">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/80
                px-4 py-4
                shadow-[0_4px_14px_rgba(0,0,0,0.45)]
                hover:shadow-[0_10px_24px_rgba(0,0,0,0.6)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Store
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-[12px] font-medium text-phorium-light/95">
                  Produkter
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-phorium-light/65">
                Se hvilke produkter som mangler tekst, bilder eller SEO – og
                hopp rett inn i riktig studio.
              </p>
            </motion.div>
          </Link>

          {/* Koble nettbutikk */}
          <Link href="/studio/koble-nettbutikk">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/80
                px-4 py-4
                shadow-[0_4px_14px_rgba(0,0,0,0.45)]
                hover:shadow-[0_10px_24px_rgba(0,0,0,0.6)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Link2
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-[12px] font-medium text-phorium-light/95">
                  Koble nettbutikk
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-phorium-light/65">
                Sjekk status på Shopify-tilkoblingen og synk produkter på nytt.
              </p>
            </motion.div>
          </Link>

          {/* Min side */}
          <Link href="/studio/minside">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/80
                px-4 py-4
                shadow-[0_4px_14px_rgba(0,0,0,0.45)]
                hover:shadow-[0_10px_24px_rgba(0,0,0,0.6)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <User
                  className="h-4 w-4"
                  style={{ color: palette?.text ?? "#C8B77A" }}
                />
                <span className="text-[12px] font-medium text-phorium-light/95">
                  Min side
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-phorium-light/65">
                Se plan, kreditter og kontoinnstillinger (kommer etter hvert).
              </p>
            </motion.div>
          </Link>
        </div>

        {/* CTA nederst */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {status?.connected ? (
            <Link
              href="/studio/produkter"
              className="btn btn-primary btn-lg inline-flex items-center gap-2"
            >
              <Blocks className="h-4 w-4" />
              Gå til produkter
            </Link>
          ) : (
            <Link
              href="/studio/koble-nettbutikk"
              className="btn btn-primary btn-lg inline-flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              Koble til nettbutikk
            </Link>
          )}

          <Link
            href="/guide"
            className="btn btn-secondary btn-lg inline-flex items-center gap-2"
          >
            <Gauge className="h-4 w-4" />
            Brukerguide
          </Link>
        </div>
      </section>
    </main>
  );
}
