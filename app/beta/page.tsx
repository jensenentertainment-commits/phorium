"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

const ACCESS_CODE = "PHORIUM2025"; // <-- BYTT TIL DIN KODE

export default function BetaLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hvis de kommer inn via ?code=... i URL
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (!urlCode) return;

    if (urlCode === ACCESS_CODE) {
      // sett cookie og slipp dem rett inn
      document.cookie = "phorium-beta=1; path=/; max-age=2592000"; // 30 dager
      router.push("/");
    } else {
      setError("Lenken inneholder en ugyldig kode.");
    }
  }, [searchParams, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code.trim()) return;

    setLoading(true);

    setTimeout(() => {
      if (code.trim() === ACCESS_CODE) {
        document.cookie = "phorium-beta=1; path=/; max-age=2592000"; // 30 dager
        router.push("/"); // ← ordentlig forside
      } else {
        setError("Feil kode. Sjekk invitasjonen din en gang til.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <main className="min-h-screen bg-[#1A4242] text-[#ECE8DA] flex items-center justify-center px-4">
      {/* Bakgrunnseffekter */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#C8B77A]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      </div>

      <section className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-[#2A2E26] border border-[#3B4032] mb-3">
            <Lock className="h-5 w-5 text-[#C8B77A]" />
          </div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#C8B77A]/80 mb-2">
            Privat beta
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Phorium er låst for innvidde
          </h1>
          <p className="mt-2 text-sm text-[#ECE8DA]/70">
            Denne versjonen er kun for inviterte testere. Skriv inn koden du
            fikk tilsendt – eller bruk den personlige lenken i invitasjonen.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="space-y-4 bg-[#181B15]/90 border border-[#3B4032] rounded-2xl p-5"
        >
          <label className="block text-xs font-medium text-[#ECE8DA]/80 mb-1">
            Tilgangskode
          </label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Skriv inn koden din her"
            className="w-full rounded-lg bg-[#181B15] border border-[#3B4032] px-3 py-2.5 text-sm placeholder:text-[#ECE8DA]/35 focus:outline-none focus:ring-2 focus:ring-[#C8B77A]/60 focus:border-[#C8B77A]"
          />

          {error && (
            <p className="text-xs text-red-300 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C8B77A] text-[#181B15] text-sm font-medium shadow-sm hover:bg-[#d5c384] transition-colors disabled:opacity-60"
          >
            {loading ? "Sjekker kode..." : "Lås opp Phorium"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-[11px] text-[#ECE8DA]/45 mt-1">
            Har du ikke kode? Da er du nok ikke med i testgruppen – enda 😉
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 text-center text-[11px] text-[#ECE8DA]/40"
        >
          © {new Date().getFullYear()} Phorium · Privat forhåndsvisning
        </motion.div>
      </section>
    </main>
  );
}
