"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PhoriumTextForm from "@/app/components/PhoriumTextForm";

export default function TextPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-phorium-light"
    >
      {/* Header – nå litt tightere og mer kompakt */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-phorium-light/55">
            Studio · Tekst
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Phorium Tekst
          </h1>
          <p className="max-w-xl text-[12px] text-phorium-light/80">
            Generer produkt- og kategoritekster – eller bruk et ekte
            Shopify-produkt for å få en ferdig tekstpakke med produkttekst,
            SEO, annonser og SoMe.
          </p>
        </div>

        {/* Kompakt brandprofil-hint – flyttet til høyre på store skjermer */}
        <div className="sm:self-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark/70 px-3 py-1 text-[10px] text-phorium-light/75">
            <span>
              Tekstene prøver å følge brandprofilen din på tvers av produkter.
            </span>
            <Link
              href="/studio/brandprofil"
              className="rounded-full bg-phorium-accent/90 px-2.5 py-0.5 text-[10px] font-semibold text-phorium-dark hover:bg-phorium-accent"
            >
              Juster brandprofil
            </Link>
          </div>
        </div>
      </div>

      {/* Selve generatoren – håndterer Shopify-modus, brandprofil, historikk osv. */}
      <Suspense fallback={null}>
        <PhoriumTextForm />
      </Suspense>
    </motion.div>
  );
}
