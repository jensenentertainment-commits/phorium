"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PhoriumVisualsForm from "@/app/components/PhoriumVisualsForm";

export default function VisualsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-phorium-light"
    >
      {/* Header – mer kompakt, matcher Tekststudio v2 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-phorium-light/55">
            Studio · Visuals
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Phorium Visuals
          </h1>
          <p className="max-w-xl text-[12px] text-phorium-light/80">
            Generer produktbilder, bannere og kampanjemateriell – tilpasset
            brandprofilen din og butikken du jobber med.
          </p>
        </div>

        {/* Kompakt brandprofil-hint på høyre side */}
        <div className="sm:self-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark/70 px-3 py-1 text-[10px] text-phorium-light/75">
            <span>
              Visuals bruker brandprofilen din automatisk for stil og tone.
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

      {/* Selve Visuals-opplevelsen */}
      <Suspense fallback={null}>
        <PhoriumVisualsForm />
      </Suspense>
    </motion.div>
  );
}
