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
      {/* Header – speiler Tekststudio */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Phorium Visuals
          </h1>
          <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
            Generer produktbilder, bannere og kampanjemateriell – tilpasset
            brandprofilen din.
          </p>

          {/* Liten brandprofil-hint, samme logikk som på Tekst */}
          <p className="mt-1 text-[11px] text-phorium-light/65">
            Brandprofilen din brukes automatisk her.{" "}
            <Link
              href="/studio/brandprofil"
              className="font-medium text-phorium-accent hover:underline"
            >
              Juster brandprofil
            </Link>{" "}
            for å endre stil og tone.
          </p>
        </div>

       
      </div>

      {/* Selve Visuals-opplevelsen */}
      <Suspense fallback={null}>
        <PhoriumVisualsForm />
      </Suspense>
    </motion.div>
  );
}
