"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function StudioPage() {
  return (
    <main className="relative min-h-screen bg-[#F5E9D8] overflow-hidden pt-20 pb-32">
      {/* Bakgrunn */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_0%,rgba(200,183,122,0.08),transparent_70%)]" />

      <section className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#1C1F18] text-[#ECE8DA] rounded-3xl shadow-[0_24px_90px_rgba(0,0,0,0.55)] px-6 sm:px-10 py-10 border border-[#343828]/80"
        >
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Phorium Studio
            </h1>
            <p className="text-[#ECE8DA]/75 text-[15px]">
              Din kreative AI-hub. Velg hva du ønsker å generere.
            </p>
          </header>

          {/* Kort for moduler */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard"
              className="group rounded-2xl border border-[#3B4032] bg-[#23271D] p-5 hover:border-[#C8B77A] transition"
            >
              <h2 className="text-lg font-semibold">Phorium Tekst</h2>
              <p className="mt-1 text-sm text-[#ECE8DA]/75">
                Produkt- og kategoritekster generert på sekunder.
              </p>
              <div className="mt-4 text-[12px] text-[#C8B77A] group-hover:underline">
                Åpne →
              </div>
            </Link>

            <Link
              href="/dashboard/visuals"
              className="group rounded-2xl border border-[#3B4032] bg-[#23271D] p-5 hover:border-[#C8B77A] transition"
            >
              <h2 className="text-lg font-semibold">Phorium Visuals</h2>
              <p className="mt-1 text-sm text-[#ECE8DA]/75">
                Lag bannere, scener og kampanjepakker til nettbutikken.
              </p>
              <div className="mt-4 text-[12px] text-[#C8B77A] group-hover:underline">
                Åpne →
              </div>
            </Link>
          </div>

          {/* Koble til nettbutikk */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard/store-connect"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8B77A] text-[#1C1F18] text-[12px] font-semibold hover:bg-[#E3D8AC] transition"
            >
              🔗 Koble til nettbutikk
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
