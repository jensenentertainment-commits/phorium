"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Palette, Download } from "lucide-react";

type HistoryItem = {
  prompt: string;
  imageUrl: string;
  createdAt: string;
  tag?: string;
};

type Mode = "image" | "banner" | "product";
type BannerSource = "ai" | "own";

type BrandProfile = {
  name: string;
  primaryColor: string;
  accentColor: string;
  tone: "nøytral" | "lekent" | "eksklusivt";
};

type CampaignImage = {
  label: string;
  size: string;
  url: string;
};

const DEFAULT_BRAND: BrandProfile = {
  name: "Standardprofil",
  primaryColor: "#C8B77A",
  accentColor: "#ECE8DA",
  tone: "nøytral",
};

function PhoriumLoader({
  label = "Genererer … finpusser lys, kontrast og detaljer",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Spinner som spinner OG pulserer */}
      <motion.div className="relative h-10 w-10" aria-label="Laster">
        {/* Ytre ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-phorium-accent/70 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }}
        />
        {/* Indre puls */}
        <motion.div
          className="absolute inset-2 rounded-full border border-phorium-accent/40"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Tekst */}
      <p className="text-center text-[12.5px] text-phorium-accent/95">
        {label}
      </p>

      {/* Fremdriftsstripe (evig shimmer) */}
      <div className="h-2 w-48 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
        <motion.div
          className="h-full bg-phorium-accent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ width: "55%" }}
        />
      </div>

      {/* Mikro-hint */}
      <p className="text-[10px] tracking-wide text-phorium-light/55">
        Phorium Core aktiv …
      </p>
    </div>
  );
}

export default function VisualsPage() {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [imageLoading, setImageLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("image");
  const [bannerSource, setBannerSource] = useState<BannerSource>("ai");

  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [storeProfile, setStoreProfile] = useState<any>(null);
  const [brand, setBrand] = useState<BrandProfile>(DEFAULT_BRAND);

  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editing, setEditing] = useState(false);

  const [safeBgPrompt, setSafeBgPrompt] = useState("");
  const [safeHeadline, setSafeHeadline] = useState("");
  const [safeSubline, setSafeSubline] = useState("");
  const [safeLoading, setSafeLoading] = useState(false);

  const [textBgFile, setTextBgFile] = useState<File | null>(null);
  const [textBgPreview, setTextBgPreview] = useState<string | null>(null);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignPack, setCampaignPack] = useState<CampaignImage[]>([]);

  // Cooldowns (sekunder) – brukes for å vise "Vent Xs" på knappene etter 429
  const [imageCooldown, setImageCooldown] = useState(0);
  const [bannerCooldown, setBannerCooldown] = useState(0);
  const [packCooldown, setPackCooldown] = useState(0);

  function startCooldown(setter: (v: number) => void, seconds: number) {
    const secs = Math.max(1, Math.min(60, seconds || 10)); // 1–60s
    setter(secs);

    let current = secs;

    const interval = setInterval(() => {
      current -= 1;

      if (current <= 0) {
        clearInterval(interval);
        setter(0);
      } else {
        setter(current);
      }
    }, 1000);
  }

  function parseRetrySeconds(msg: string | undefined) {
    if (!msg) return 10;
    const m = msg.match(/try again in\s+(\d+)s/i);
    return m ? parseInt(m[1], 10) : 10;
  }

  const [lastBannerConfig, setLastBannerConfig] = useState<{
    source: BannerSource;
    backgroundPrompt?: string;
    headline: string;
    subline?: string;
  } | null>(null);

  const [showSafeZone, setShowSafeZone] = useState(false);

  const isBusy =
    imageLoading || safeLoading || overlayLoading || editing || campaignLoading;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("phorium_visuals_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {}

    try {
      const storedBrand = localStorage.getItem("phorium_brand_profile");
      if (storedBrand) setBrand(JSON.parse(storedBrand));
    } catch {}

    try {
      const storedProfile = localStorage.getItem("phorium_store_profile");
      if (storedProfile) setStoreProfile(JSON.parse(storedProfile));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("phorium_visuals_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem("phorium_brand_profile", JSON.stringify(brand));
    } catch {}
  }, [brand]);

  function storePrefix(): string {
    if (!storeProfile) return "";
    return `For en nettbutikk i bransjen "${storeProfile.industry}", stil: "${storeProfile.style}", tone: "${storeProfile.tone}". `;
  }

  function brandPrefix(): string {
    return `Brand: ${brand.name}. Farger: ${brand.primaryColor} og ${brand.accentColor}. Stil: ${brand.tone}. `;
  }

  function contextPrefix(): string {
    return storePrefix() + brandPrefix();
  }

  function addToHistory(prompt: string, url: string, tag?: string) {
    setHistory((prev) => {
      const entry: HistoryItem = {
        prompt,
        imageUrl: url,
        createdAt: new Date().toISOString(),
        tag,
      };
      return [entry, ...prev].slice(0, 3);
    });
  }

  async function handleDownload(url: string) {
    try {
      const isDataUrl = url.startsWith("data:image");
      if (isDataUrl) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "phorium-visual.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "phorium-visual.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Kunne ikke laste ned bildet. Prøv høyreklikk → Lagre som.");
    }
  }

  // 1) Standard bildegenerering
  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || isBusy) return;

    setError(null);
    setImageUrl(null);
    setCampaignPack([]);
    setImageLoading(true);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: contextPrefix() + trimmed,
          size: "1024x1024",
        }),
      });

      // 429 → start nedtelling og avbryt
      if (res.status === 429) {
        const txt = await res.text().catch(() => "");
        const secs = parseRetrySeconds(txt);
        setError(
          "Du har nådd en grense for antall bildespørringer. Vent noen sekunder og prøv igjen.",
        );
        startCooldown(setImageCooldown, secs);
        return;
      }

      const data = await res.json();
      if (data.success && data.image) {
        const url = data.image as string;
        setImageUrl(url);
        addToHistory(trimmed, url, "image");
      } else {
        const info = data.details
          ? ` (${String(data.details).slice(0, 160)}...)`
          : "";
        setError((data.error || "Kunne ikke generere bilde.") + info);
      }
    } catch {
      setError("Feil ved tilkobling til Phorium Core (bilde).");
    } finally {
      setImageLoading(false);
    }
  }

  // 2A) Banner med trygg tekst – AI-bakgrunn
  async function handleSmartTextGenerate() {
    if (!safeHeadline.trim() || isBusy) return;

    setSafeLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    const backgroundPrompt =
      contextPrefix() +
      (safeBgPrompt.trim() ||
        "Eksklusivt kommersielt banner med tydelig plass til tekst.");

    try {
      const response = await fetch("/api/phorium-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundPrompt,
          headline: safeHeadline.trim(),
          subline: safeSubline.trim() || undefined,
          size: "1200x628",
        }),
      });

      if (response.status === 429) {
        let seconds = 10;
        try {
          const txt = await response.text();
          const m = txt.match(/try again in (\d+)s?/i);
          if (m) seconds = parseInt(m[1], 10);
        } catch {}
        setError(
          "Du har nådd en grense for bannergenerering. Vent noen sekunder og prøv igjen.",
        );
        startCooldown(setBannerCooldown, seconds);
        return;
      }

      if (!response.ok) {
        let msg = "Kunne ikke generere Phorium-banner.";
        try {
          const data = await response.json();
          if (data?.error) msg = data.error;
        } catch {}
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      addToHistory(
        `[Banner] ${safeHeadline.trim()}${
          safeSubline ? " – " + safeSubline.trim() : ""
        }`,
        url,
        "banner",
      );

      setLastBannerConfig({
        source: "ai",
        backgroundPrompt,
        headline: safeHeadline.trim(),
        subline: safeSubline.trim() || undefined,
      });
    } catch (err: any) {
      setError(err?.message || "Noe gikk galt ved Phorium tekstgenerering.");
    } finally {
      setSafeLoading(false);
    }
  }

  // 2B) Banner med trygg tekst – mitt bilde
  async function handleSmartTextOnOwnImage() {
    if (!safeHeadline.trim() || !textBgFile || isBusy) return;

    setOverlayLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    try {
      const form = new FormData();
      form.append("image", textBgFile);
      form.append("headline", safeHeadline.trim());
      if (safeSubline.trim()) {
        form.append("subline", safeSubline.trim());
      }

      const res = await fetch("/api/phorium-overlay", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        let msg = "Kunne ikke legge tekst på bildet.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {}
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      addToHistory(
        `[Banner eget bilde] ${safeHeadline.trim()}${
          safeSubline ? " – " + safeSubline.trim() : ""
        }`,
        url,
        "banner",
      );

      setLastBannerConfig({
        source: "own",
        headline: safeHeadline.trim(),
        subline: safeSubline.trim() || undefined,
      });
    } catch (err: any) {
      setError(
        err.message || "Noe gikk galt ved tekst-overlay på opplastet bilde.",
      );
    } finally {
      setOverlayLoading(false);
    }
  }

  // 2C) Kampanjepakke
  async function handleCampaignPack() {
    if (!safeHeadline.trim() || isBusy) return;

    setCampaignLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    const baseBg =
      contextPrefix() +
      (safeBgPrompt.trim() ||
        "Ren, kommersiell stil som matcher nettbutikk og brand.");

    const formats = [
      { label: "Web hero", size: "1200x628" },
      { label: "Instagram", size: "1080x1080" },
      { label: "Story / Reel", size: "1080x1920" },
    ];

    try {
      const results: CampaignImage[] = [];

      for (const fmt of formats) {
        const res = await fetch("/api/phorium-generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backgroundPrompt: baseBg,
            headline: safeHeadline.trim(),
            subline: safeSubline.trim() || undefined,
            size: fmt.size,
          }),
        });

        if (res.status === 429) {
          const txt = await res.text().catch(() => "");
          const secs = parseRetrySeconds(txt);
          setError(
            "Du har nådd en grense for kampanjepakke. Vent noen sekunder og prøv igjen.",
          );
          startCooldown(setPackCooldown, secs);
          setCampaignLoading(false);
          return;
        }

        if (!res.ok) continue;

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        results.push({ label: fmt.label, size: fmt.size, url });
      }

      if (results.length === 0) {
        throw new Error("Kunne ikke generere kampanjepakke.");
      }

      setCampaignPack(results);
      setImageUrl(results[0].url);
      addToHistory(
        `[Kampanjepakke] ${safeHeadline.trim()}`,
        results[0].url,
        "campaign",
      );

      setLastBannerConfig({
        source: "ai",
        backgroundPrompt: baseBg,
        headline: safeHeadline.trim(),
        subline: safeSubline.trim() || undefined,
      });
    } catch (err: any) {
      setError(
        err.message || "Noe gikk galt ved generering av kampanjepakke.",
      );
    } finally {
      setCampaignLoading(false);
    }
  }

  // 2D) Variant-knapp
  async function handleVariant() {
    if (!lastBannerConfig || isBusy) return;

    if (lastBannerConfig.source === "own") {
      if (!textBgFile) return;
      return handleSmartTextOnOwnImage();
    }

    const extra =
      " Variasjon i lys og komposisjon, behold brand-følelse.";
    const bgPrompt =
      (lastBannerConfig.backgroundPrompt ||
        safeBgPrompt ||
        contextPrefix()) + extra;

    setSafeLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    try {
      const res = await fetch("/api/phorium-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundPrompt: bgPrompt,
          headline: lastBannerConfig.headline,
          subline: lastBannerConfig.subline,
          size: "1200x628",
        }),
      });

      if (!res.ok) throw new Error("Kunne ikke lage nytt forslag.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      addToHistory(
        `[Banner variant] ${lastBannerConfig.headline}`,
        url,
        "banner",
      );
    } catch (err: any) {
      setError(err.message || "Noe gikk galt ved variantgenerering.");
    } finally {
      setSafeLoading(false);
    }
  }

  // 2E) Foreslå norsk tekst (valgfritt – krever /api/phorium-copy)
  async function handleSuggestText() {
    try {
      setError(null);
      const res = await fetch("/api/phorium-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "kampanje",
          tone: brand.tone,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data?.headline) setSafeHeadline(data.headline);
      if (data?.subline) setSafeSubline(data.subline);
    } catch {
      // stille feil – ikke kritisk
    }
  }

  // 3) Eget produktbilde → scene
  async function handleEditGenerate() {
    if (!baseImage || !editPrompt.trim() || isBusy) return;

    setEditing(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    try {
      const blob = await fetch(baseImage).then((r) => r.blob());
      const file = new File([blob], "upload.png", { type: blob.type });

      const form = new FormData();
      form.append("image", file);
      form.append("prompt", contextPrefix() + editPrompt.trim());

      const res = await fetch("/api/edit-image", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success && data.image) {
        const url = data.image as string;
        setImageUrl(url);
        addToHistory(
          `[Produkt-scene] ${editPrompt.trim()}`,
          url,
          "product",
        );
      } else {
        const info = data.details
          ? ` (${String(data.details).slice(0, 160)}...)`
          : "";
        setError(
          (data.error || "Kunne ikke generere ny bakgrunn.") + info,
        );
      }
    } catch {
      setError("Feil ved tilkobling til Phorium Core (scene).");
    } finally {
      setEditing(false);
    }
  }

  function handleReusePrompt(item: HistoryItem) {
    const clean = item.prompt.replace(/^\[[^\]]+\]\s*/i, "");
    setPrompt(clean);
    setImageUrl(item.imageUrl);
    setError(null);
    setMode("image");
  }

  function handleUseStyle(item: HistoryItem) {
    setMode("banner");
    setSafeBgPrompt(
      `Lag et banner i samme stil som dette: ${item.prompt}.`,
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-phorium-light"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Phorium Visuals
          </h1>
          <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
            Velg modus, skriv kort – Phorium tilpasser alt til butikken din.
          </p>
        </div>
       
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="text-[11px] text-phorium-accent/90">
            Kreditter igjen
          </div>
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

      {/* Brand-profil */}
      <BrandProfileCard brand={brand} setBrand={setBrand} />

      {/* Mode switch */}
      <div className="mb-8 inline-flex rounded-full border border-phorium-off/40 bg-phorium-dark p-1 text-[11px]">
        <ModeButton
          active={mode === "image"}
          onClick={() => setMode("image")}
        >
          Standardbilde
        </ModeButton>
        <ModeButton
          active={mode === "banner"}
          onClick={() => setMode("banner")}
        >
          Banner med tekst
        </ModeButton>
        <ModeButton
          active={mode === "product"}
          onClick={() => setMode("product")}
        >
          Produktbilde til scene
        </ModeButton>
      </div>

      {/* MODE: Standardbilde */}
      {mode === "image" && (
        <div className="mb-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              const isMac =
                typeof navigator !== "undefined" &&
                navigator.platform.toUpperCase().includes("MAC");
              const submitCombo =
                (isMac && e.metaKey && e.key === "Enter") ||
                (!isMac && e.ctrlKey && e.key === "Enter");
              if (submitCombo) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder='Beskriv bildet. Eks: «Produktfoto av kaffekopp på lys benk, mykt dagslys.»'
            className="h-32 w-full resize-none rounded-2xl border border-phorium-accent/40 bg-phorium-light px-4 py-3 text-[14px] text-phorium-dark outline-none placeholder:text-[#8F8A7A] focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
          />

          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {["Produktfoto", "Livsstil", "Kampanjebanner", "Bakgrunn", "Mockup"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/82 transition hover:border-phorium-accent hover:text-phorium-accent"
                  onClick={() =>
                    setPrompt(
                      `Lag et ${label.toLowerCase()} i fotorealistisk stil. Profesjonelt lys, høy oppløsning.`,
                    )
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isBusy || imageCooldown > 0}
            className="mt-4 w-full rounded-full bg-phorium-accent px-7 py-2.5 text-[13px] font-semibold text-phorium-dark shadow-md transition-all disabled:opacity-60 sm:w-auto hover:bg-phorium-accent/90"
          >
            {imageCooldown > 0
              ? `Vent ${imageCooldown}s`
              : "Generer bilde"}
          </button>
        </div>
      )}

      {/* MODE: Banner med tekst */}
      {mode === "banner" && (
        <div className="mb-8 space-y-4 rounded-2xl border border-phorium-off/30 bg-phorium-dark p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] text-phorium-accent/90">
                Hovedtekst*
              </label>
              <input
                value={safeHeadline}
                onChange={(e) => setSafeHeadline(e.target.value)}
                placeholder="-40% SOMMERSALG"
                className="w-full rounded-2xl border border-phorium-accent/35 bg-phorium-light px-3 py-2 text-[13px] text-phorium-dark outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-phorium-accent/90">
                Undertekst (valgfritt)
              </label>
              <input
                value={safeSubline}
                onChange={(e) => setSafeSubline(e.target.value)}
                placeholder="Kun denne helgen"
                className="w-full rounded-2xl border border-phorium-accent/35 bg-phorium-light px-3 py-2 text-[13px] text-phorium-dark outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
              />
            </div>
          </div>

          {/* Templates / forslag */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            {["Sommersalg", "Nyhet", "Black Week", "Outlet"].map((tpl) => (
              <button
                key={tpl}
                type="button"
                onClick={() => {
                  if (tpl === "Sommersalg") {
                    setSafeHeadline("-40% SOMMERSALG");
                    setSafeSubline("Kun denne uken");
                  } else if (tpl === "Nyhet") {
                    setSafeHeadline("NYHETER");
                    setSafeSubline("Utforsk siste kolleksjon");
                  } else if (tpl === "Black Week") {
                    setSafeHeadline("BLACK WEEK");
                    setSafeSubline("Begrensede tilbud");
                  } else if (tpl === "Outlet") {
                    setSafeHeadline("OUTLET");
                    setSafeSubline("Siste sjanse, lave priser");
                  }
                }}
                className="rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1 text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-accent"
              >
                {tpl}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSuggestText}
              className="rounded-full border border-phorium-accent/40 bg-phorium-accent/10 px-3 py-1 text-[10px] text-phorium-accent transition hover:bg-phorium-accent/20"
            >
              Foreslå tekst
            </button>
          </div>

          {/* Kildevalg */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            <BannerSourceButton
              active={bannerSource === "ai"}
              onClick={() => setBannerSource("ai")}
            >
              AI-bakgrunn
            </BannerSourceButton>
            <BannerSourceButton
              active={bannerSource === "own"}
              onClick={() => setBannerSource("own")}
            >
              Mitt bilde
            </BannerSourceButton>
          </div>

          {/* AI-bakgrunn */}
          {bannerSource === "ai" && (
            <>
              <textarea
                value={safeBgPrompt}
                onChange={(e) => setSafeBgPrompt(e.target.value)}
                onKeyDown={(e) => {
                  const isMac =
                    typeof navigator !== "undefined" &&
                    navigator.platform.toUpperCase().includes("MAC");
                  const submitCombo =
                    (isMac && e.metaKey && e.key === "Enter") ||
                    (!isMac && e.ctrlKey && e.key === "Enter");
                  if (submitCombo) {
                    e.preventDefault();
                    handleSmartTextGenerate();
                  }
                }}
                placeholder='Stil / bakgrunn (valgfritt). Eks: «Mørkt, eksklusivt banner med subtil struktur.»'
                className="h-20 w-full resize-none rounded-2xl border border-phorium-accent/35 bg-phorium-light px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-[#8F8A7A] focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSmartTextGenerate}
                  disabled={
                    !safeHeadline.trim() || isBusy || bannerCooldown > 0
                  }
                 className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bannerCooldown > 0
                    ? `Vent ${bannerCooldown}s`
                    : safeLoading
                    ? "Genererer banner…"
                    : "Generer banner med trygg tekst"}
                </button>
                <button
                  type="button"
                  onClick={handleCampaignPack}
                  disabled={
                    !safeHeadline.trim() || isBusy || packCooldown > 0
                  }
                  className="btn btn-secondary btn-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {packCooldown > 0
                    ? `Vent ${packCooldown}s`
                    : campaignLoading
                    ? "Lager kampanjepakke…"
                    : "Lag kampanjepakke"}
                </button>
                <button
                  type="button"
                  onClick={handleVariant}
                  disabled={!lastBannerConfig || isBusy}
                  className="btn btn-ghost btn-sm inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Ny variant
                </button>
              </div>
            </>
          )}

          {/* Mitt bilde */}
          {bannerSource === "own" && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setTextBgFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setTextBgPreview(url);
                    } else {
                      setTextBgPreview(null);
                    }
                  }}
                  className="text-[11px] text-phorium-light/90"
                />
                {textBgPreview && (
                  <div className="h-16 w-24 overflow-hidden rounded-xl border border-phorium-off/35 bg-phorium-dark">
                    <img
                      src={textBgPreview}
                      alt="Valgt bakgrunn"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSmartTextOnOwnImage}
                disabled={!safeHeadline.trim() || !textBgFile || isBusy}
                className="mt-1 w-full rounded-full bg-phorium-accent px-7 py-2.5 text-[12px] font-semibold text-phorium-dark shadow-md transition-all disabled:opacity-40 sm:w-auto hover:bg-phorium-accent/90"
              >
                Legg trygg tekst på mitt bilde
              </button>
            </>
          )}
        </div>
      )}

      {/* MODE: Produktbilde til scene */}
      {mode === "product" && (
        <div className="mb-8 space-y-4 rounded-2xl border border-phorium-off/30 bg-phorium-dark p-5">
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setBaseImage(url);
            }}
            className="text-[11px] text-phorium-light/90"
          />
          {baseImage && (
            <div className="flex items-center gap-3">
              <div className="h-24 w-24 overflow-hidden rounded-xl border border-phorium-off/35 bg-phorium-dark">
                <img
                  src={baseImage}
                  alt="Opplastet produkt"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-[11px] text-phorium-light/70">
                Bruk et tydelig produktbilde. Vi bygger scenen rundt det.
              </p>
            </div>
          )}
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder='Kort: «Lyst studio», «Eksklusivt baderom», «Kjøkkenbenk i tre» osv.'
            className="h-20 w-full resize-none rounded-2xl border border-phorium-accent/35 bg-phorium-light px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-[#8F8A7A] focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
          />
          <button
  type="button"
  onClick={handleEditGenerate}
  disabled={!baseImage || !editPrompt.trim() || isBusy}
  className="w-full rounded-full bg-phorium-accent px-7 py-2.5 text-[13px] font-semibold text-phorium-dark shadow-md transition-all disabled:opacity-50 sm:w-auto hover:bg-phorium-accent/90"
>
            {editing
              ? "Genererer scene…"
              : "Generer scene rundt produktet"}
          </button>
        </div>
      )}

      {/* Forhåndsvisning + kampanjepakke */}
      <div className="mt-2 border-t border-phorium-off/30 pt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-phorium-accent">
            Forhåndsvisning
          </h2>
          <label className="flex items-center gap-2 text-[10px] text-phorium-light/65">
            <input
              type="checkbox"
              checked={showSafeZone}
              onChange={(e) => setShowSafeZone(e.target.checked)}
              className="accent-phorium-accent"
            />
            Vis trygg tekst-sone
          </label>
        </div>

        {error && (
          <div className="mb-3 rounded-2xl border border-phorium-accent/50 bg-phorium-accent/10 px-3 py-2 text-[11px] text-phorium-light">
            {error}
          </div>
        )}

        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-phorium-off/35 bg-phorium-dark/60 px-4 py-6">
          {isBusy && (
            <PhoriumLoader label="Genererer bilde … finjusterer komposisjon og tekstplass" />
          )}

          {!isBusy && imageUrl && (
            <AnimatePresence>
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="flex w-full flex-col items-center gap-3"
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Generert bilde"
                    onClick={() => setFullscreenImage(imageUrl)}
                    className="max-h-[420px] max-w-full cursor-zoom-in rounded-2xl border border-phorium-accent/40 object-contain shadow-2xl transition hover:opacity-90"
                  />

                  {showSafeZone && (
                    <div className="pointer-events-none absolute inset-[8%] rounded-2xl border border-dashed border-phorium-accent/70" />
                  )}
                </div>
                <button
                  onClick={() => handleDownload(imageUrl)}
                  className="btn btn-secondary btn-sm inline-flex items-center gap-1"

                >
                  <Download className="h-3.5 w-3.5" />
                  Last ned
                </button>

                <AnimatePresence>
                  {fullscreenImage && (
                    <motion.div
                      key="fullscreen"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                      onClick={() => setFullscreenImage(null)}
                    >
                      <motion.img
                        src={fullscreenImage}
                        alt="Forstørret bilde"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="max-h-[90vh] max-w-[95vw] rounded-2xl border border-phorium-accent/50 object-contain shadow-2xl"
                      />
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-6 top-6 rounded-full bg-phorium-accent px-4 py-1.5 text-[13px] font-semibold text-phorium-dark shadow-lg transition hover:bg-phorium-accent/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenImage(null);
                        }}
                      >
                        Lukk ✕
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          )}

          {!isBusy && !imageUrl && !error && (
            <p className="text-center text-[12px] text-phorium-light/70">
              Velg modus, fyll inn det viktigste – forhåndsvisningen dukker opp
              her.
            </p>
          )}
        </div>

        {/* Kampanjepakke-visning */}
        {campaignPack.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-[11px] text-phorium-light/75">
              Kampanjepakke generert:
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {campaignPack.map((item) => (
                <div
                  key={item.label + item.size}
                  className="flex flex-col gap-1 rounded-2xl border border-phorium-off/35 bg-phorium-dark p-2 text-[11px]"
                >
                  <div className="text-[10px] font-semibold text-phorium-accent">
                    {item.label}
                  </div>
                  <div className="text-[9px] text-phorium-light/60">
                    {item.size}
                  </div>
                  <div className="mt-1 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-phorium-dark">
                    <img
                      src={item.url}
                      alt={item.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setImageUrl(item.url)}
                    className="mt-1 rounded-full border border-phorium-off/40 bg-phorium-surface px-2 py-1 text-[9px] text-phorium-accent transition hover:border-phorium-accent"
                  >
                    Vis i forhåndsvisning
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historikk */}
      <div className="mt-8 border-t border-phorium-off/30 pt-5">
        <h2 className="mb-3 text-lg font-semibold text-phorium-accent">
          Historikk (siste 3)
        </h2>

        {history.length === 0 && (
          <p className="text-[12px] text-phorium-light/70">
            Når du genererer bilder, lagres de her for rask gjenbruk.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {history.map((item, index) => (
            <div
              key={item.createdAt + index}
              className="flex flex-col gap-2 rounded-2xl border border-phorium-off/35 bg-phorium-dark p-3 text-[11px]"
            >
              <p className="min-h-[30px] line-clamp-2 font-semibold text-phorium-accent/90">
                {item.prompt}
              </p>
              <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-phorium-dark/80">
                <img
                  src={item.imageUrl}
                  alt="Historikkbilde"
                  onClick={() => setFullscreenImage(item.imageUrl)}
                  className="h-full w-full cursor-zoom-in object-cover transition hover:opacity-90"
                />
              </div>
              <div className="mt-2 flex gap-1.5">
                <button
  onClick={() => handleReusePrompt(item)}
  className="btn btn-secondary btn-sm flex-1 inline-flex items-center justify-center gap-1"
>
  <RotateCcw className="h-3.5 w-3.5" />
  Bruk igjen
</button>
<button
  onClick={() => handleUseStyle(item)}
  className="btn btn-ghost btn-sm flex-1 inline-flex items-center justify-center gap-1"
>
  <Palette className="h-3.5 w-3.5" />
  Bruk stil
</button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ——— UI helpers ——— */

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-phorium-accent px-3.5 py-1.5 text-[11px] font-semibold text-phorium-dark"
          : "rounded-full px-3.5 py-1.5 text-[11px] text-phorium-light/75 transition hover:text-phorium-accent"
      }
    >
      {children}
    </button>
  );
}

function BannerSourceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-phorium-accent bg-phorium-accent px-3 py-1.5 text-[10px] font-semibold text-phorium-dark"
          : "rounded-full border border-phorium-off/40 bg-transparent px-3 py-1.5 text-[10px] text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-accent"
      }
    >
      {children}
    </button>
  );
}

function BrandProfileCard({
  brand,
  setBrand,
}: {
  brand: BrandProfile;
  setBrand: (b: BrandProfile) => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark px-3.5 py-3.5 text-[10px] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-0.5 font-semibold text-phorium-accent/90">
          Brandprofil
        </div>
        <p className="text-phorium-light/65">
          Lagres lokalt og brukes automatisk i genererte forslag.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={brand.name}
          onChange={(e) =>
            setBrand({ ...brand, name: e.target.value })
          }
          className="rounded-full border border-phorium-off/40 bg-phorium-surface px-2 py-1 text-[10px] text-phorium-light outline-none"
          placeholder="Butikknavn / profil"
        />
        <input
          type="color"
          value={brand.primaryColor}
          onChange={(e) =>
            setBrand({ ...brand, primaryColor: e.target.value })
          }
          className="h-7 w-7 rounded-full border border-phorium-off/40 bg-transparent p-0"
        />
        <select
          value={brand.tone}
          onChange={(e) =>
            setBrand({
              ...brand,
              tone: e.target.value as BrandProfile["tone"],
            })
          }
          className="rounded-full border border-phorium-off/40 bg-phorium-surface px-2 py-1 text-[10px] text-phorium-light outline-none"
        >
          <option value="nøytral">Nøytral</option>
          <option value="lekent">Lekent</option>
          <option value="eksklusivt">Eksklusivt</option>
        </select>
      </div>
    </div>
  );
}
