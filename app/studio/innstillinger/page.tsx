"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [brand, setBrand] = React.useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("phorium_brand_profile") || "null") || {
          name: "Standardprofil",
          primaryColor: "#C8B77A",
          accentColor: "#ECE8DA",
          tone: "nøytral",
        }
      );
    } catch {
      return {
        name: "Standardprofil",
        primaryColor: "#C8B77A",
        accentColor: "#ECE8DA",
        tone: "nøytral",
      };
    }
  });

  const [store, setStore] = React.useState<any>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("phorium_store_profile");
      if (raw) setStore(JSON.parse(raw));
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("phorium_brand_profile", JSON.stringify(brand));
    } catch {}
  }, [brand]);

  function handleDisconnectStore() {
    try {
      localStorage.removeItem("phorium_store_profile");
      setStore(null);
      setMessage("Nettbutikk ble koblet fra.");
      setTimeout(() => setMessage(null), 2500);
    } catch {}
  }

  function handleClearAll() {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("phorium_"))
        .forEach((key) => localStorage.removeItem(key));
      setStore(null);
      setBrand({
        name: "Standardprofil",
        primaryColor: "#C8B77A",
        accentColor: "#ECE8DA",
        tone: "nøytral",
      });
      setMessage("All lokal data er slettet.");
      setTimeout(() => setMessage(null), 2500);
    } catch {}
  }

  return (
    <main className="relative min-h-screen bg-[#F5E9D8] overflow-hidden pt-24 pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(200,183,122,0.08),transparent_70%)]" />
      <section className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#1C1F18] text-[#ECE8DA] rounded-3xl shadow-[0_24px_90px_rgba(0,0,0,0.55)] px-6 sm:px-10 py-9 border border-[#343828]/80"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold">Innstillinger</h1>
            <Link
              href="/studio"
              className="px-4 py-2 rounded-full bg-[#23271D] border border-[#3B4032] text-[#C8B77A] text-[12px] hover:bg-[#C8B77A]/10 transition"
            >
              ⬅ Tilbake til Studio
            </Link>
          </div>

          {message && (
            <div className="mb-5 text-[12px] text-center text-[#C8B77A] bg-[#23271D] border border-[#3B4032] rounded-xl py-2">
              {message}
            </div>
          )}

          {/* Koblingsstatus */}
          <div className="mb-8">
            <div className="text-sm text-[#ECE8DA]/80 mb-2">Nettbutikk</div>
            {store?.url ? (
              <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 py-2 rounded-xl bg-[#123524] border border-[#1f6f46] text-[12px] text-[#C8F7C5]">
                <div>
                  ✅ Koblet:{" "}
                  <span className="text-[#9BE6AF]">
                    {store.platform || "Butikk"} · {store.url}
                  </span>
                </div>
                <button
                  onClick={handleDisconnectStore}
                  className="px-3 py-1 rounded-full bg-[#1C1F18] border border-[#3B4032] text-[#C8F7C5] hover:bg-[#C8F7C5]/10 transition text-[11px]"
                >
                  Koble fra
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C2418] border border-[#6A5322] text-[12px] text-[#E9C08A]">
                🟠 Ikke koblet
              </div>
            )}
          </div>

          {/* Brand-profil */}
          <div className="bg-[#23271D] border border-[#3B4032] rounded-2xl p-5 mb-8">
            <div className="text-sm font-semibold text-[#C8B77A] mb-3">
              Brandprofil
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                placeholder="Butikknavn / profil"
                className="px-3 py-2 rounded-xl bg-[#1C1F18] border border-[#3B4032] text-[13px] outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#ECE8DA]/70">Primær</span>
                <input
                  type="color"
                  value={brand.primaryColor}
                  onChange={(e) =>
                    setBrand({ ...brand, primaryColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg border border-[#3B4032] bg-transparent p-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#ECE8DA]/70">Tone</span>
                <select
                  value={brand.tone}
                  onChange={(e) =>
                    setBrand({ ...brand, tone: e.target.value as any })
                  }
                  className="px-3 py-2 rounded-xl bg-[#1C1F18] border border-[#3B4032] text-[13px] outline-none"
                >
                  <option value="nøytral">Nøytral</option>
                  <option value="lekent">Lekent</option>
                  <option value="eksklusivt">Eksklusivt</option>
                </select>
              </div>
            </div>
            <p className="text-[12px] text-[#ECE8DA]/65 mt-3">
              Lagres lokalt og brukes automatisk i Tekst & Visuals.
            </p>
          </div>

          {/* Tøm data */}
          <div className="border-t border-[#343828]/70 pt-5">
            <button
              onClick={handleClearAll}
              className="px-5 py-2 rounded-full bg-[#1C1F18] border border-[#3B4032] text-[#C8B77A] text-[13px] hover:bg-[#C8B77A]/10 transition"
            >
              🗑 Tøm all lokal data
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
