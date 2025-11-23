"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Type as TypeIcon,
  Image as ImageIcon,
  Link2,
  ChevronRight,
  Gauge,
  Blocks,
  Store,
  Settings2,
} from "lucide-react";

type StatusResponse = {
  connected: boolean;
  shop?: string;
};

export default function DashboardHubPage() {
  const [status, setStatus] = React.useState<StatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = React.useState(true);

  React.useEffect(() => {
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
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8x_rgba(239,68,68,0.7)]" />
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

            <h1 className="text-xl font-semibold sm:text-2xl text-phorium-light">
              Velkommen til Phorium Studio
            </h1>

            <p className="text-[12px] text-phorium-light/70 max-w-md">
              Her styrer du alt innhold for nettbutikken din – tekster, bilder,
              bannere, brandprofil og produktadministrasjon.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {renderStatusBadge()}

            {/* Kredittlinje */}
            <div className="text-[11px] text-phorium-accent/90 mt-2">Kreditter igjen</div>
            <div className="text-[14px]">
              <span className="font-semibold text-phorium-light">994</span>
              <span className="text-phorium-light/55"> / 1000</span>
            </div>

            <div className="h-2.5 w-40 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
              <motion.div
                className="h-full bg-phorium-accent"
                initial={{ width: "0%" }}
                animate={{ width: "99.4%" }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Modul-grid */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">

          {/* Tekststudio */}
          <Link href="/studio/tekst">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group relative overflow-hidden rounded-2xl border border-phorium-off/30 bg-phorium-dark px-6 py-6"
            >
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-phorium-accent/10 blur-2xl" />
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl border border-phorium-off/35 bg-phorium-surface px-3 py-3">
                  <TypeIcon className="h-5 w-5 text-phorium-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-phorium-light">
                    Phorium Tekst
                  </h2>
                  <p className="mt-1 text-[12px] text-phorium-light/75">
                    Produkttekster, SEO-innhold, annonser og SoMe-tekster – i én pakke.
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-phorium-accent">
                Åpne <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>

          {/* Visuals */}
          <Link href="/studio/visuals">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group relative overflow-hidden rounded-2xl border border-phorium-off/30 bg-phorium-dark px-6 py-6"
            >
              <div className="pointer-events-none absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-phorium-accent/10 blur-2xl" />

              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl border border-phorium-off/35 bg-phorium-surface px-3 py-3">
                  <ImageIcon className="h-5 w-5 text-phorium-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-phorium-light">
                    Phorium Visuals
                  </h2>
                  <p className="mt-1 text-[12px] text-phorium-light/75">
                    Flotte bannere, produktscener, kampanjepakker og AI-bilder.
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-phorium-accent">
                Åpne <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>

          {/* Brandprofil */}
          <Link href="/studio/brandprofil">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group relative overflow-hidden rounded-2xl border border-phorium-off/30 bg-phorium-dark px-6 py-6"
            >
              <div className="pointer-events-none absolute -bottom-16 right-0 h-32 w-32 rounded-full bg-phorium-accent/5 blur-2xl" />

              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl border border-phorium-off/35 bg-phorium-surface px-3 py-3">
                  <Settings2 className="h-5 w-5 text-phorium-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-phorium-light">
                    Brandprofil
                  </h2>
                  <p className="mt-1 text-[12px] text-phorium-light/75">
                    Tone-of-voice, bransje, stil og identitet for hele butikken.
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-phorium-accent">
                Åpne <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>

          {/* Produkter */}
          <Link href="/studio/produkter">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="group relative overflow-hidden rounded-2xl border border-phorium-off/30 bg-phorium-dark px-6 py-6"
            >
              <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-phorium-accent/5 blur-2xl" />

              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl border border-phorium-off/35 bg-phorium-surface px-3 py-3">
                  <Store className="h-5 w-5 text-phorium-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-phorium-light">
                    Produkter
                  </h2>
                  <p className="mt-1 text-[12px] text-phorium-light/75">
                    Se produktene fra Shopify og åpne dem i Studio.
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-phorium-accent">
                Åpne <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-3">
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

          <Link href="/guide" className="btn btn-secondary btn-lg inline-flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Brukerguide
          </Link>
        </div>
      </section>
    </main>
  );
}
