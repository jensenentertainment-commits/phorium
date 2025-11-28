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
      {/* Header – matchet mot Visuals */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Phorium Tekst
          </h1>
          <p className="text-[13px] text-phorium-light/80 sm:text-[12px]">
            Generer produkt- og kategoritekster – eller bruk et ekte
            Shopify-produkt for å få en ferdig tekstpakke med produkttekst,
            SEO, annonser og SoMe.
          </p>

          {/* Hint om brandprofil */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark/70 px-3 py-1.5 text-[11px] text-phorium-light/75">
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
