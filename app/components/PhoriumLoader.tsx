"use client";
import { motion } from "framer-motion";

export default function PhoriumLoader({
  label = "Genererer … finpusser språk og tone",
}: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div className="relative w-10 h-10" aria-label="Laster">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#C8B77A]/70 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-[#C8B77A]/40"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>

      <p className="text-[12.5px] text-[#C8B77A]/95 text-center">{label}</p>

      <div className="w-48 h-2 rounded-full overflow-hidden border border-[#3B4032] bg-[#151710]">
        <motion.div
          className="h-full bg-[#C8B77A]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ width: "55%" }}
        />
      </div>

      <p className="text-[10px] tracking-wide text-[#ECE8DA]/55">
        Phorium Core aktiv …
      </p>
    </div>
  );
}
