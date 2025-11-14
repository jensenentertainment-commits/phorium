"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type StoreProfile = {
  url: string;
  platform?: string;
  industry?: string;
  style?: string;
  tone?: string;
};

export default function StoreConnectPage() {
  const [profile, setProfile] = useState<StoreProfile | null>(null);

  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [tone, setTone] = useState("");

  const [saving, setSaving] = useState(false);

  const isConnected = !!profile;

  // Last fra localStorage ved load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("phorium_store_profile");
      if (stored) {
        const parsed: StoreProfile = JSON.parse(stored);
        setProfile(parsed);
        setUrl(parsed.url || "");
        setPlatform(parsed.platform || "");
        setIndustry(parsed.industry || "");
        setStyle(parsed.style || "");
        setTone(parsed.tone || "");
      }
    } catch {
      // ignore
    }
  }, []);

  // Lagre til localStorage
  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setSaving(true);

    const clean: StoreProfile = {
      url: url.trim(),
      platform: platform || "Ukjent",
      industry: industry || "Uspesifisert",
      style: style || "Ren / moderne",
      tone: tone || "Nøytral / profesjonell",
    };

    try {
      localStorage.setItem("phorium_store_profile", JSON.stringify(clean));
      setProfile(clean);
    } catch {
      // kunne lagt inn feilmelding
    } finally {
      setSaving(false);
    }
  }

  function handleDisconnect() {
    const confirmed = confirm(
      "Er du sikker på at du vil koble fra nettbutikken?"
    );
    if (!confirmed) return;

    try {
      localStorage.removeItem("phorium_store_profile");
    } catch {
      // ignore
    }

    setProfile(null);
    setUrl("");
    setPlatform("");
    setIndustry("");
    setStyle("");
    setTone("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-20 pb-32">
      {/* Subtil bakgrunn */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-4xl px-4">
        {/* Tilbake-lenke */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-light"
          >
            ← Tilbake til Studio
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 text-phorium-light shadow-[0_22px_80px_rgba(0,0,0,0.6)] sm:px-9"
        >
          {/* Header */}
          <div className="mb-4 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Phorium Connect
            </h1>
            <p className="max-w-xl text-[13px] text-phorium-light/80 sm:text-[14px]">
              Koble til nettbutikken én gang. Phorium bruker profil og sortiment
              til å gi mer treffsikre tekster, bilder og kampanjeforslag.
            </p>

            {/* Status badge */}
            <div className="mt-1">
              {isConnected ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/60 bg-phorium-accent/15 px-3 py-1.5 text-[10px] text-phorium-accent/95">
                  <span>🟢 Nettbutikk koblet</span>
                  <span className="text-phorium-light/90">
                    {profile?.platform || "Nettbutikk"} ·{" "}
                    {profile?.url?.replace(/^https?:\/\//, "")}
                  </span>
                  <button
                    onClick={handleDisconnect}
                    className="ml-2 rounded-full border border-phorium-accent/40 bg-transparent px-2 py-0.5 text-[9px] text-phorium-accent/95 transition hover:bg-phorium-accent/20"
                  >
                    🔌 Koble fra
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[10px] text-phorium-light/80">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-phorium-accent" />
                    <span>🟠 Ikke koblet</span>
                  </span>
                  <span className="text-phorium-light/70">
                    Fyll inn under for å aktivere butikkprofil i Phorium.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSave}
            className="mt-4 space-y-5 rounded-2xl border border-phorium-off/30 bg-phorium-dark px-5 py-5"
          >
            <div>
              <label className="mb-1 block text-[11px] text-phorium-accent/90">
                Nettadresse til butikk*
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://dinbutikk.no"
                className="w-full rounded-2xl border border-phorium-accent/35 bg-phorium-light px-3 py-2.5 text-[13px] text-phorium-dark outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] text-phorium-accent/90">
                  Plattform (valgfritt)
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-2xl border border-phorium-off/35 bg-phorium-surface px-3 py-2 text-[12px] text-phorium-light outline-none focus:border-phorium-accent"
                >
                  <option value="">Velg</option>
                  <option value="Shopify">Shopify</option>
                  <option value="WooCommerce">WooCommerce</option>
                  <option value="Mystore">Mystore</option>
                  <option value="Magento">Magento</option>
                  <option value="annet">Annet</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-phorium-accent/90">
                  Bransje / kategori (valgfritt)
                </label>
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Eks: Møbler, klær, interiør, kosmetikk …"
                  className="w-full rounded-2xl border border-phorium-off/35 bg-phorium-surface px-3 py-2 text-[12px] text-phorium-light outline-none focus:border-phorium-accent"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] text-phorium-accent/90">
                  Visuell stil (valgfritt)
                </label>
                <input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Eks: Minimalistisk, nordisk, fargerik, luksus …"
                  className="w-full rounded-2xl border border-phorium-off/35 bg-phorium-surface px-3 py-2 text-[12px] text-phorium-light outline-none focus:border-phorium-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-phorium-accent/90">
                  Teksttone (valgfritt)
                </label>
                <input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Eks: Rett frem, leken, eksklusiv, personlig …"
                  className="w-full rounded-2xl border border-phorium-off/35 bg-phorium-surface px-3 py-2 text-[12px] text-phorium-light outline-none focus:border-phorium-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !url.trim()}
              className="mt-2 w-full rounded-full bg-phorium-accent px-6 py-2.5 text-[13px] font-semibold text-phorium-dark shadow-md transition-all disabled:opacity-60 sm:w-auto hover:bg-phorium-accent/90"
            >
              {saving
                ? "Lagrer profil…"
                : isConnected
                ? "Oppdater tilkobling"
                : "Lagre og koble til"}
            </button>
          </form>

          {/* Forklaring */}
          <div className="mt-7 space-y-1.5 rounded-2xl border border-phorium-off/30 bg-phorium-dark px-4 py-4 text-[11px] text-phorium-light/78">
            <p className="text-[10px] uppercase tracking-[0.16em] text-phorium-accent">
              Hva brukes dette til?
            </p>
            <p>
              • Phorium bruker URL og profil til å forstå bransje, stil og
              forventet uttrykk.
            </p>
            <p>
              • Dette påvirker forslag i <strong>Phorium Tekst</strong> og{" "}
              <strong>Phorium Visuals</strong>, slik at output matcher butikken
              din bedre.
            </p>
            <p>
              • Ingen endringer gjøres i nettbutikken din. Data lagres kun hos
              deg (lokalt) i denne tidlige versjonen.
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
