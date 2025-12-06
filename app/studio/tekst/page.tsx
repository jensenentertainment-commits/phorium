"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import PhoriumTextForm from "@/app/components/PhoriumTextForm";
import { SectionHeader } from "@/app/components/ui/SectionHeader";

export default function TextPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-phorium-light"
    >
      <SectionHeader
        label="Studio · Tekst"
        title="Phorium Tekst"
        description="Generer produkt- og kategoritekster – eller bruk et Shopify-produkt for å få en ferdig tekstpakke med produkttekst, SEO, annonser og SoMe."
        rightSlot={
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
        }
      />

      {/* Selve tekststudioet – nå kommer mye nærmere toppen */}
      <Suspense fallback={null}>
        <PhoriumTextForm />
      </Suspense>
    </motion.div>
  );
}
