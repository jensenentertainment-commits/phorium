"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";

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

  // Last profil fra localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("phorium_store_profile");
      if (!stored) return;

      const parsed: StoreProfile = JSON.parse(stored);
      setProfile(parsed);
      setUrl(parsed.url || "");
      setPlatform(parsed.platform || "");
      setIndustry(parsed.industry || "");
      setStyle(parsed.style || "");
      setTone(parsed.tone || "");
    } catch {
      // ignore
    }
  }, []);

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
      // kunne logget feil
    } finally {
      setSaving(false);
    }
  }

  function handleDisconnect() {
    if (!confirm("Er du sikker på at du vil koble fra nettbutikken?")) return;

    try {
      localStorage.removeItem("phorium_store_profile");
    } catch {}

    setProfile(null);
    setUrl("");
    setPlatform("");
    setIndustry("");
    setStyle("");
    setTone("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-phorium-light"
    >
      {/* Header – samme struktur som Tekst-siden */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Phorium Connect
          </h1>
          <p className="max-w-xl text-[15px] text-phorium-light/80">
            Koble til nettbutikken én gang, så tilpasser Phorium tekster og
            bilder til stil, bransje og tone.
          </p>
        </div>

        <div className="mt-1 flex flex-col items-start gap-2 text-[11px] sm:mt-0 sm:items-end">
          {isConnected ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/60 bg-phorium-accent/15 px-3 py-1.5 text-phorium-accent/95">
              <span>🟢 Nettbutikk koblet</span>
              <span className="text-phorium-light/90">
                {profile?.platform || "Nettbutikk"} ·{" "}
                {profile?.url?.replace(/^https?:\/\//, "")}
              </span>
              <button
                onClick={handleDisconnect}
                className="ml-2 rounded-full border border-phorium-accent/40 bg-transparent px-2 py-0.5 text-[10px] text-phorium-accent/95 transition hover:bg-phorium-accent/20"
              >
                Koble fra
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[10px] text-phorium-light/80">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-phorium-accent" />
                <span>🟠 Ingen nettbutikk koblet</span>
              </span>
              <span className="text-phorium-light/70">
                Fyll inn under for å aktivere butikkprofil i Phorium.
              </span>
            </div>
          )}

          <p className="text-[10px] text-phorium-light/60">
            Profilen lagres kun lokalt i denne versjonen – ingen endringer gjøres
            i selve nettbutikken.
          </p>
        </div>
      </div>

      {/* Skjema – samme “card inside” stil som Tekst-historikken/mini-guide */}
      <form
        onSubmit={handleSave}
        className="mt-2 space-y-5 rounded-2xl border border-phorium-off/30 bg-phorium-dark px-5 py-5"
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
              placeholder="Eks: minimalistisk, nordisk, fargerik, luksus …"
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

      {/* Info-boks – samme feeling som “Mini-guide” nederst på Tekst-siden */}
      <div className="mt-8 rounded-2xl border border-phorium-off/30 bg-phorium-dark px-4 py-4 text-[11px] text-phorium-light/78">
        <p className="text-[10px] uppercase tracking-[0.16em] text-phorium-accent">
          Hva brukes dette til?
        </p>
        <p className="mt-1">
          • Phorium bruker URL, bransje og stil til å forstå butikken din.
        </p>
        <p>
          • Dette påvirker forslag i <strong>Phorium Tekst</strong> og{" "}
          <strong>Phorium Visuals</strong>, slik at output matcher profilen
          bedre.
        </p>
        <p>
          • Ingen faktiske integrasjoner settes opp i denne tidlige versjonen –
          alt lagres kun lokalt hos deg.
        </p>
      </div>
    </motion.div>
  );
}
