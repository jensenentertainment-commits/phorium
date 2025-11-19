"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Type as TypeIcon,
  Image as ImageIcon,
  Link2,
  ChevronRight,
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

  // Lager en badge basert på status (samme stil som før, men nå live)
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
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Phorium Studio
          </h1>
          <p className="mt-1 text-[13px] text-phorium-light/80 sm:text-[14px]">
            Hub for alt innhold: norsk tekst, bannere, produktscener — tunet for
            nettbutikker.
          </p>
        </div>

        {/* Høyreside: status + kreditter */}
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {renderStatusBadge()}
          <div className="text-[11px] text-phorium-accent/90">
            Kreditter igjen
          </div>
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

      {/* Modul-kort */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2">
        {/* Tekst */}
        <Link href="/studio/text">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="group relative overflow-hidden rounded-2xl border border-phorium-off/30 bg-phorium-dark px-5 py-5"
          >
            <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-phorium-accent/10 blur-2xl" />
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl border border-phorium-off/35 bg-phorium-surface px-2.5 py-2.5">
                <TypeIcon className="h-5 w-5 text-phorium-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-phorium-light">
                  Phorium Tekst
                </h2>
                <p className="mt-1 text-[13px] text-phorium-light/80">
                  Produkt- og kategoritekster på norsk, med meta-felt og riktig
                  tone.
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
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="group relative overflow-hidden rounded-2xl border border-phorium-off/30 bg-phorium-dark px-5 py-5"
          >
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-phorium-accent/10 blur-2xl" />
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-xl border border-phorium-off/35 bg-phorium-surface px-2.5 py-2.5">
                <ImageIcon className="h-5 w-5 text-phorium-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-phorium-light">
                  Phorium Visuals
                </h2>
                <p className="mt-1 text-[13px] text-phorium-light/80">
                  Bannere med trygg tekst, kampanjepakker og produktscener.
                </p>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-phorium-accent transition group-hover:translate-x-[1px]">
              Åpne <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </motion.div>
        </Link>
      </div>

            {/* CTA */}
      <div className="flex flex-wrap items-center gap-3">
        {status?.connected ? (
          // Når Shopify er koblet → vis "Gå til produkter"
          <Link
            href="/studio/produkter"
            className="btn btn-primary btn-lg inline-flex items-center gap-2"
          >
            <Link2 className="h-4 w-4" />
            Gå til produkter
          </Link>
        ) : (
          // Når ikke koblet (eller mens vi ikke har fått status) → "Koble til nettbutikk"
          <Link
            href="/studio/koble-nettbutikk"
            className="btn btn-primary btn-lg inline-flex items-center gap-2"
          >
            <Link2 className="h-4 w-4" />
            Koble til nettbutikk
          </Link>
        )}

        <Link href="/guide" className="btn btn-secondary btn-lg">
          Brukerguide
        </Link>
      </div>

    </>
  );
}
