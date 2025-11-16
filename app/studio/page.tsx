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

function StoreConnectionBadge() {
  const [connected, setConnected] = React.useState(false);
  const [label, setLabel] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("phorium_store_profile");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data?.url) {
        setConnected(true);
        setLabel(`${data.platform || "Butikk"} · ${data.url}`);
      }
    } catch {
      // Ignorer feil ved parsing
    }
  }, []);

  if (connected) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/60 bg-phorium-accent/15 px-3 py-1.5 text-[11px] text-phorium-accent/95">
        <span>✅ Nettbutikk koblet</span>
        <span className="text-phorium-light/90">{label}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/80">
      <span>🟠 Ikke koblet</span>
      <span className="opacity-80">Koble til for best resultater</span>
    </div>
  );
}

export default function DashboardHubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-24 pb-32">
      {/* Subtil bakgrunnsgradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10"
        >
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
              <StoreConnectionBadge />
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
                      Produkt- og kategoritekster på norsk, med meta-felt og riktig tone.
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
                <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-phorium-accent">
                  Åpne <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Primær CTA + små snarveier */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/studio/koble-nettbutikk"
              className="inline-flex items-center gap-2 rounded-full bg-phorium-accent px-5 py-2.5 text-[13px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90"
            >
              <Link2 className="h-4 w-4 text-phorium-dark" />
              Koble til nettbutikk
            </Link>

            <Link
              href="/guide"
              className="rounded-full border border-phorium-off/40 bg-phorium-dark px-4 py-2 text-[12px] text-phorium-light/85 transition hover:bg-phorium-surface"
            >
              Brukerguide
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
