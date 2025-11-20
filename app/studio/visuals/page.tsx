"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import PhoriumVisualsForm from "@/app/components/PhoriumVisualsForm";

export default function VisualsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-phorium-light"
    >
      {/* Header – helt lik som på Tekststudio */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Phorium Visuals
          </h1>
          <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
            Generer produktbilder, bannere og kampanjemateriell – tilpasset
            brandprofilen din.
          </p>
        </div>

        {/* Kreditt-indikator (samme komponentstil som Tekststudio) */}
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="text-[11px] text-phorium-accent/90">Kreditter igjen</div>

          <div className="text-[14px]">
            <span className="font-semibold text-phorium-light">994</span>
            <span className="text-phorium-light/55"> / 1000</span>
          </div>

          <div className="h-2 w-36 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
            <motion.div
              className="h-full bg-phorium-accent"
              initial={{ width: "0%" }}
              animate={{ width: "99.4%" }}
              transition={{ duration: 1 }}
            />
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
