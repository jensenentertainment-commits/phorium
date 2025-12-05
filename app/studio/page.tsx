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
import { PLAN_COLORS, type PlanName } from "@/app/components/PlanBadge";

export default function DashboardHubPage() {
  // Plan / palette
  const [plan, setPlan] = useState<PlanName | null>(null);

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

  return (
    <main className="min-h-screen pt-8 pb-20 text-phorium-light">
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* STUDIO-HUB HEADER */}
        <div className="relative mb-14 flex flex-col gap-3 rounded-2xl border border-phorium-off/30 bg-phorium-dark/70 p-6 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          {/* Elegant accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-phorium-accent/40 to-transparent" />

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-phorium-light/60">
            <Gauge
              className="h-3 w-3"
              style={{ color: palette?.text ?? "#C8B77A" }}
            />
            Studio-hub
          </div>

          <h1 className="text-xl font-semibold text-phorium-light sm:text-2xl">
            Velkommen til Phorium Studio
          </h1>

          <p className="max-w-xl text-[12px] text-phorium-light/70">
            Velg hva du vil jobbe med i nettbutikken din – tekster, bilder,
            brandprofil og produktadministrasjon.
          </p>
        </div>

        {/* HOVEDMODULER – 2 store kort */}
        <div className="mb-14 grid gap-8 md:grid-cols-2">
          {/* Tekststudio – stort kort */}
          <Link href="/studio/tekst">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ y: -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="
                group relative overflow-hidden rounded-2xl
                border bg-phorium-dark/85
                px-7 py-6
                shadow-[0_10px_32px_rgba(0,0,0,0.55)]
                hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)]
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
                    shadow-[0_4px_12px_rgba(0,0,0,0.45)]
                    transition-all duration-300 transform
                    group-hover:scale-110
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
                  <h2 className="text-lg font-semibold text-phorium-light/95">
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
                px-7 py-6
                shadow-[0_10px_32px_rgba(0,0,0,0.55)]
                hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)]
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
                    shadow-[0_4px_12px_rgba(0,0,0,0.45)]
                    transition-all duration-300 transform
                    group-hover:scale-110
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
            </motion.div>
          </Link>
        </div>

        {/* SEKUNDÆRE MODULER – 4 mindre, like store kort */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                h-36
                flex flex-col justify-between
                shadow-[0_6px_18px_rgba(0,0,0,0.45)]
                hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="
                    flex h-8 w-8 items-center justify-center rounded-lg
                    border bg-phorium-surface/30
                    shadow-[0_3px_8px_rgba(0,0,0,0.4)]
                    transition-all duration-300 transform
                    group-hover:scale-110
                  "
                  style={{
                    borderColor: palette?.ring ?? "rgba(200,183,122,0.4)",
                  }}
                >
                  <Settings2
                    className="h-4 w-4"
                    style={{ color: palette?.text ?? "#C8B77A" }}
                  />
                </div>
                <span className="text-sm font-semibold text-phorium-light/95">
                  Brandprofil
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
                Fortell Phorium hvordan butikken din høres og ser ut – tone,
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
                h-36
                flex flex-col justify-between
                shadow-[0_6px_18px_rgba(0,0,0,0.45)]
                hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="
                    flex h-8 w-8 items-center justify-center rounded-lg
                    border bg-phorium-surface/30
                    shadow-[0_3px_8px_rgba(0,0,0,0.4)]
                    transition-all duration-300 transform
                    group-hover:scale-110
                  "
                  style={{
                    borderColor: palette?.ring ?? "rgba(200,183,122,0.4)",
                  }}
                >
                  <Store
                    className="h-4 w-4"
                    style={{ color: palette?.text ?? "#C8B77A" }}
                  />
                </div>
                <span className="text-sm font-semibold text-phorium-light/95">
                  Produkter
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
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
                h-36
                flex flex-col justify-between
                shadow-[0_6px_18px_rgba(0,0,0,0.45)]
                hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="
                    flex h-8 w-8 items-center justify-center rounded-lg
                    border bg-phorium-surface/30
                    shadow-[0_3px_8px_rgba(0,0,0,0.4)]
                    transition-all duration-300 transform
                    group-hover:scale-110
                  "
                  style={{
                    borderColor: palette?.ring ?? "rgba(200,183,122,0.4)",
                  }}
                >
                  <Link2
                    className="h-4 w-4"
                    style={{ color: palette?.text ?? "#C8B77A" }}
                  />
                </div>
                <span className="text-sm font-semibold text-phorium-light/95">
                  Koble nettbutikk
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
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
                h-36
                flex flex-col justify-between
                shadow-[0_6px_18px_rgba(0,0,0,0.45)]
                hover:shadow-[0_12px_26px_rgba(0,0,0,0.65)]
                backdrop-blur-sm
                transition-all duration-300
              "
              style={{
                borderColor: palette?.ring ?? "rgba(200,183,122,0.3)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="
                    flex h-8 w-8 items-center justify-center rounded-lg
                    border bg-phorium-surface/30
                    shadow-[0_3px_8px_rgba(0,0,0,0.4)]
                    transition-all duration-300 transform
                    group-hover:scale-110
                  "
                  style={{
                    borderColor: palette?.ring ?? "rgba(200,183,122,0.4)",
                  }}
                >
                  <User
                    className="h-4 w-4"
                    style={{ color: palette?.text ?? "#C8B77A" }}
                  />
                </div>
                <span className="text-sm font-semibold text-phorium-light/95">
                  Min side
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-phorium-light/65">
                Se plan, kreditter og kontoinnstillinger (kommer etter hvert).
              </p>
            </motion.div>
          </Link>
        </div>
      </section>
    </main>
  );
}
