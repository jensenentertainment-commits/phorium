"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      window.location.href = "/";
    } else {
      setError(data.error || "Feil kode");
    }
  }

  return (
    <main className="relative min-h-screen bg-[#EEE3D3] flex items-center justify-center overflow-hidden">
      {/* MATCHER maintenance: store bakgrunnsblokken */}
      <div className="absolute inset-0 bg-[#1A4242] rounded-b-[32px] sm:rounded-b-[42px] md:rounded-b-[0px]" />

    

      {/* Kort-container */}
      <div className="relative z-10 px-6 w-full max-w-md pt-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-3xl bg-[#072E2B]/90 border border-[#0B3835] shadow-[0_0_60px_rgba(0,0,0,0.45)] p-8 backdrop-blur-xl"
        >
          {/* Topp-tag som matcher maintenance */}
          <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-[#D6C07455] bg-[#072E2B] px-4 py-1 text-[11px] tracking-[0.22em] uppercase text-[#D6C074]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
            <span>Privat beta</span>
          </div>

          {/* Tittel */}
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-[#F5F2E7] mb-3">
            Lås opp tilgang til{" "}
            <span className="text-[#D6C074]">Phorium</span>
          </h1>

          {/* Intro */}
          <p className="text-[#D9D5C8] text-sm mb-6 leading-relaxed">
            Denne privat-betaen er kun tilgjengelig for utvalgte testbutikker.
            Skriv inn tilgangskoden du har mottatt for å komme videre.
          </p>

          {/* Skjema */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Tilgangskode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-[#0B3835] bg-[#031F1E] px-3 py-2.5 text-[14px] text-[#F5F2E7] outline-none focus:border-[#D6C074] focus:ring-1 focus:ring-[#D6C074] transition"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] text-red-300"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading || !code.trim()}
              whileTap={
                loading || !code.trim() ? {} : { scale: 0.97 }
              }
              className="rounded-xl bg-[#D6C074] text-[#072E2B] font-semibold py-2.5 text-[14px] disabled:bg-[#D6C074]/40"
            >
              {loading ? "Sjekker kode…" : "Fortsett"}
            </motion.button>
          </form>

          {/* Footer-linje (match) */}
          <p className="text-center text-[11px] text-[#EEE3D3]/50 mt-6">
            Trenger du tilgang? Kontakt{" "}
            <span className="text-[#D6C074]">support@phorium.no</span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
