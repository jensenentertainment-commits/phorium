"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Palette,
  Download,
  Image as ImageIcon,
  LayoutTemplate,
  Sparkles,
  Store,
  AlertCircle,
  History,
  ZoomOut,
   ZoomIn,
  Loader2,
  Wand2,
  Link2,
  Crop,
  Clock,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import useBrandProfile from "@/hooks/useBrandProfile";
import BrandIdentityBar from "./BrandIdentityBar";
import { supabase } from "@/lib/supabaseClient";
import { useCreditError } from "@/app/studio/CreditErrorContext";
import { Type } from "lucide-react";
import PhoriumVisualsResult from "./PhoriumVisualsResult";


type BannerFont = "auto" | "sans" | "serif" | "handwritten";

type HistoryItem = {
  prompt: string;
  imageUrl: string;
  createdAt: string;
  tag?: string;
};

type CampaignImage = {
  label: string;
  size: string;
  url: string;
};

type Mode = "image" | "banner" | "product";
type BannerSource = "ai" | "upload";

function ModeButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] transition ${
        active
          ? "bg-phorium-accent text-phorium-dark shadow-sm"
          : "text-phorium-light/70 hover:bg-phorium-off/10"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function parseRetrySeconds(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/retry after (\d+) seconds?/i);
  if (!match) return null;
  return parseInt(match[1], 10) || null;
}

function handleCreditAwareError(
  rawError: any,
  setError: (msg: string) => void,
  fallback: string,
) {
  console.error("Visuals error:", rawError);

  const msg =
    typeof rawError === "string"
      ? rawError
      : rawError?.message || rawError?.error || "";

  if (msg.includes("Ikke nok kreditter")) {
    setError(
      "Du er tom for kreditter i denne betaen. Ta kontakt hvis du vil ha flere.",
    );
  } else {
    setError(fallback);
  }
}

export default function PhoriumVisualsForm() {
  // Shopify-kontekst
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");
  const isShopifyMode = !!productIdFromUrl;

  const [bannerFont, setBannerFont] = useState<BannerFont>("auto");
  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { creditError, setCreditError } = useCreditError();

  // Brandprofil (felles med tekst)
  const {
    brand,
    loading: brandLoading,
    source: brandSource,
  } = useBrandProfile();

  // Visuals state
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [imageLoading, setImageLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("image");
  const [bannerSource, setBannerSource] = useState<BannerSource>("ai");

  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState("1024x1024");

  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [sceneFile, setSceneFile] = useState<File | null>(null);
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

  const [imageCooldown, setImageCooldown] = useState(0);
  const [bannerCooldown, setBannerCooldown] = useState(0);
  const [packCooldown, setPackCooldown] = useState(0);

  const [lastBannerConfig, setLastBannerConfig] = useState<{
    source: BannerSource;
    backgroundPrompt?: string;
    headline: string;
    subline?: string;
    font?: BannerFont;
  } | null>(null);

  const [showSafeZone, setShowSafeZone] = useState(false);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isBusy =
    imageLoading || safeLoading || overlayLoading || editing || campaignLoading;

  // Hent historikk fra localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("phorium_visuals_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // stille
    }
  }, []);

  // Lagre historikk
  useEffect(() => {
    try {
      localStorage.setItem("phorium_visuals_history", JSON.stringify(history));
    } catch {
      // stille
    }
  }, [history]);

  // Cooldown-timer
  useEffect(() => {
    if (imageCooldown <= 0) return;
    const id = setInterval(() => {
      setImageCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [imageCooldown]);

  useEffect(() => {
    if (bannerCooldown <= 0) return;
    const id = setInterval(() => {
      setBannerCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [bannerCooldown]);

  useEffect(() => {
    if (packCooldown <= 0) return;
    const id = setInterval(() => {
      setPackCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [packCooldown]);

  // Les Shopify-domain fra cookie til "Åpne i Shopify"-lenke
  useEffect(() => {
    if (typeof document === "undefined") return;
    try {
      const parts = document.cookie.split(";").map((c) => c.trim());
      const match = parts.find((c) => c.startsWith("phorium_shop="));
      if (match) {
        const value = decodeURIComponent(match.split("=").slice(1).join("="));
        setShopDomain(value);
      }
    } catch {
      // stille
    }
  }, []);

  // Hent innlogget bruker
  useEffect(() => {
    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Kunne ikke hente bruker (Visuals):", error);
          setUserId(null);
          return;
        }

        setUserId(data.user?.id ?? null);
      } catch (err) {
        console.error("Uventet feil ved henting av bruker (Visuals):", err);
        setUserId(null);
      }
    }

    void loadUser();
  }, []);

  // Hent produkt fra Shopify når productId finnes i URL
  useEffect(() => {
    if (!productIdFromUrl) return;

    async function fetchProduct() {
      try {
        setProductLoading(true);
        setProductError(null);

        const res = await fetch(`/api/studio/product?id=${id}`)`, {
          cache: "no-store",
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Kunne ikke hente produkt.");
        }

        setLinkedProduct(data.product);
      } catch (err: any) {
        setProductError(err?.message || "Feil ved henting av produkt.");
      } finally {
        setProductLoading(false);
      }
    }

    void fetchProduct();
  }, [productIdFromUrl]);

  // ------- helpers for prompt-kontekst -------

  function brandPrefix() {
    if (!brand) return "";
    const parts: string[] = [];

    if (brand.store_name) {
      parts.push(`Butikk: ${brand.store_name}.`);
    }
    if (brand.industry) {
      parts.push(`Bransje: ${brand.industry}.`);
    }
    if (brand.target_audience) {
      parts.push(`Målgruppe: ${brand.target_audience}.`);
    }
    if (brand.tone_of_voice) {
      parts.push(`Tone: ${brand.tone_of_voice}.`);
    }
    if (brand.style_keywords && brand.style_keywords.length > 0) {
      parts.push(
        `Visuell stil: ${brand.style_keywords
          .map((w: string) => w.toLowerCase())
          .join(", ")}.`,
      );
    }
    if (brand.primary_color || brand.secondary_color) {
      parts.push(
        `Farger: ${
          brand.primary_color ? `primær ${brand.primary_color}` : ""
        } ${brand.secondary_color ? `sekundær ${brand.secondary_color}` : ""}.`,
      );
    }

    return parts.join(" ") + " ";
  }

  function productPrefix() {
    if (!linkedProduct) return "";
    const p = linkedProduct;
    const details: string[] = [];

    if (p.title) details.push(`Produkt: ${p.title}.`);
    if (p.product_type) details.push(`Kategori: ${p.product_type}.`);
    if (p.vendor) details.push(`Merke: ${p.vendor}.`);
    if (p.tags && Array.isArray(p.tags) && p.tags.length > 0) {
      details.push(`Tags: ${p.tags.join(", ")}.`);
    }

    return details.join(" ") + " ";
  }

  function storePrefix() {
    if (!brand || !brand.store_name) return "";
    return `Butikk: ${brand.store_name}. `;
  }

  function contextPrefix() {
    return `${storePrefix()}${brandPrefix()}${productPrefix()}`;
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

  // ------- download / lagre -------

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

  async function handleSaveImageToShopify() {
    if (!productIdFromUrl || !imageUrl || saving) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/shopify/save-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productIdFromUrl),
          imageDataUrl: imageUrl,
          alt: linkedProduct?.title || "Produktbilde generert av Phorium",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Klarte ikke å lagre bildet i Shopify.");
      }

      setSaveMessage("✅ Bildet er lagret som produktbilde i Shopify.");
    } catch (err: any) {
      setSaveMessage(
        err?.message || "❌ Noe gikk galt ved lagring til Shopify.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ------- 1) Standardbilde -------

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
          size: imageSize,
          userId,
        }),
      });

      if (res.status === 429) {
        const txt = await res.text().catch(() => "");
        const secs = parseRetrySeconds(txt);
        if (typeof secs === "number") {
          setImageCooldown(secs);
        }
        throw new Error(
          "Du har nådd en grense for bildegenerering. Vent litt og prøv igjen.",
        );
      }

      if (res.status === 403) {
        const data = await res.json().catch(() => ({} as any));
        setCreditError(
          data.error ||
            "Ikke nok kreditter til å generere flere bilder akkurat nå.",
        );
        return;
      }

      if (!res.ok) {
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // ignore
        }
        console.error(
          "[handleGenerate] Feil fra /api/generate-image:",
          res.status,
          data,
        );
        throw new Error(data?.error || "Kunne ikke generere bilde.");
      }

      const data = await res.json();
      if (!data?.imageUrl) {
        throw new Error("Svar fra tjenesten mangler bilde-URL.");
      }

      setImageUrl(data.imageUrl);
      addToHistory(trimmed, data.imageUrl, "Standardbilde");
    } catch (err: any) {
      handleCreditAwareError(
        err,
        (msg) => setError(msg),
        "Kunne ikke generere bilde akkurat nå. Prøv igjen om litt.",
      );
    } finally {
      setImageLoading(false);
    }
  }

  // ------- 2A) Banner med trygg tekst – AI-bakgrunn -------

  async function handleSmartTextGenerate() {
    if (!safeHeadline.trim() || isBusy) return;

    setSafeLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    const backgroundPrompt =
      contextPrefix() +
      (safeBgPrompt.trim() ||
        "Ren, kommersiell stil som matcher nettbutikk og brand.");

    try {
      const res = await fetch("/api/phorium-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundPrompt,
          headline: safeHeadline.trim(),
          subline: safeSubline.trim() || undefined,
          size: "1200x628",
          userId,
          fontStyle: bannerFont,
        }),
      });

      if (res.status === 429) {
        const txt = await res.text().catch(() => "");
        const secs = parseRetrySeconds(txt);
        if (typeof secs === "number") {
          setBannerCooldown(secs);
        }
        throw new Error(
          "Du har nådd en grense for bannergenerering. Vent litt og prøv igjen.",
        );
      }

      if (res.status === 403) {
        const data = await res.json().catch(() => ({} as any));
        setCreditError(
          data.error ||
            "Ikke nok kreditter til å generere flere bannere akkurat nå.",
        );
        return;
      }

      if (!res.ok) {
        throw new Error("Kunne ikke generere banner.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setLastBannerConfig({
        source: "ai",
        backgroundPrompt,
        headline: safeHeadline.trim(),
        subline: safeSubline.trim() || undefined,
        font: bannerFont,
      });
      addToHistory(
        `[Banner AI] ${safeHeadline.trim()}${
          safeSubline ? " – " + safeSubline.trim() : ""
        }`,
        url,
        "Banner",
      );
    } catch (err: any) {
      handleCreditAwareError(
        err,
        (msg) => setError(msg),
        "Kunne ikke generere banner akkurat nå. Prøv igjen om litt.",
      );
    } finally {
      setSafeLoading(false);
    }
  }

  // ------- 2B) Banner med trygg tekst – egen bakgrunn -------

  async function handleOverlayGenerate() {
    if (!safeHeadline.trim() || !textBgFile || isBusy) return;

    setOverlayLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    const backgroundPrompt =
      contextPrefix() +
      (safeBgPrompt.trim() ||
        "Ren, kommersiell stil som matcher nettbutikk og brand.");

    try {
      const formData = new FormData();
      formData.append("image", textBgFile);
      formData.append("headline", safeHeadline.trim());
      if (safeSubline.trim()) formData.append("subline", safeSubline.trim());
      formData.append("backgroundPrompt", backgroundPrompt);
      if (userId) {
        formData.append("userId", userId);
      }

      const res = await fetch("/api/phorium-overlay", {
        method: "POST",
        body: formData,
      });

      if (res.status === 429) {
        const txt = await res.text().catch(() => "");
        const secs = parseRetrySeconds(txt);
        if (typeof secs === "number") {
          setBannerCooldown(secs);
        }
        throw new Error(
          "Du har nådd en grense for bannergenerering. Vent litt og prøv igjen.",
        );
      }

      if (res.status === 403) {
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // ignore
        }
        setCreditError(
          data.error ||
            "Ikke nok kreditter til å generere flere bannere akkurat nå.",
        );
        setOverlayLoading(false);
        return;
      }

      if (!res.ok) {
        let msg = "Kunne ikke legge tekst på bildet.";
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
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
        "Banner",
      );
      setLastBannerConfig({
        source: "upload",
        backgroundPrompt,
        headline: safeHeadline.trim(),
        subline: safeSubline.trim() || undefined,
      });
    } catch (err: any) {
      handleCreditAwareError(
        err,
        (msg) => setError(msg),
        "Kunne ikke generere banner akkurat nå. Prøv igjen om litt.",
      );
    } finally {
      setOverlayLoading(false);
    }
  }

  // ------- 2C) Kampanjepakke -------

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
            userId,
            fontStyle: bannerFont,
          }),
        });

        if (res.status === 429) {
          const txt = await res.text().catch(() => "");
          const secs = parseRetrySeconds(txt);
          if (typeof secs === "number") {
            setPackCooldown(secs);
          }
          throw new Error(
            "Du har nådd en grense for kampanjepakke. Vent litt og prøv igjen.",
          );
        }

        if (res.status === 403) {
          const data = await res.json().catch(() => ({} as any));
          setCreditError(
            data.error ||
              "Ikke nok kreditter til å generere kampanjepakke akkurat nå.",
          );
          setCampaignLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Kunne ikke generere ett av kampanjebildene.");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        results.push({
          label: fmt.label,
          size: fmt.size,
          url,
        });
      }

      setCampaignPack(results);
      setLastBannerConfig({
        source: "ai",
        backgroundPrompt: baseBg,
        headline: safeHeadline.trim(),
        subline: safeSubline.trim() || undefined,
        font: bannerFont,
      });
    } catch (err: any) {
      handleCreditAwareError(
        err,
        (msg) => setError(msg),
        "Noe gikk galt ved generering av kampanjepakke. Prøv igjen om litt.",
      );
    } finally {
      setCampaignLoading(false);
    }
  }

  // ------- 2D) Variant -------

  async function handleVariant() {
    if (!lastBannerConfig || isBusy) return;

    setSafeLoading(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    try {
      const bgPrompt =
        lastBannerConfig.backgroundPrompt ||
        (contextPrefix() +
          (safeBgPrompt.trim() ||
            "Ren, kommersiell stil som matcher nettbutikk og brand."));

      const res = await fetch("/api/phorium-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundPrompt: bgPrompt,
          headline: lastBannerConfig.headline,
          subline: lastBannerConfig.subline,
          size: "1200x628",
          userId,
          fontStyle: lastBannerConfig.font || "auto",
        }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({} as any));
        setCreditError(
          data.error ||
            "Ikke nok kreditter til å generere flere varianter akkurat nå.",
        );
        return;
      }

      if (!res.ok) throw new Error("Kunne ikke lage nytt forslag.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      addToHistory(
        `[Banner variant] ${lastBannerConfig.headline}${
          lastBannerConfig.subline ? " – " + lastBannerConfig.subline : ""
        }`,
        url,
        "Banner",
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Noe gikk galt ved generering av variant. Prøv igjen om litt.",
      );
    } finally {
      setSafeLoading(false);
    }
  }

  // ------- 3) Produktbilde → scene -------

  async function handleEditGenerate() {
    if (!sceneFile || !editPrompt.trim() || isBusy) return;

    setEditing(true);
    setError(null);
    setImageUrl(null);
    setCampaignPack([]);

    try {
      const fd = new FormData();
      fd.append("image", sceneFile);
      fd.append("prompt", contextPrefix() + editPrompt.trim());
      if (userId) fd.append("userId", userId);
      fd.append("fontStyle", bannerFont);

      const res = await fetch("/api/edit-image", {
        method: "POST",
        body: fd,
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({} as any));
        setCreditError(
          data.error ||
            "Ikke nok kreditter til å generere flere scener akkurat nå.",
        );
        return;
      }

      if (!res.ok) {
        throw new Error("Kunne ikke generere scene rundt produktet.");
      }

      const data = await res.json();
      if (!data?.imageUrl) {
        throw new Error("Svar fra tjenesten mangler bilde-URL.");
      }

      setImageUrl(data.imageUrl);
      addToHistory(
        `[Scene] ${editPrompt.trim()}`,
        data.imageUrl,
        "Produktscene",
      );
    } catch (err: any) {
      handleCreditAwareError(
        err,
        (msg) => setError(msg),
        "Noe gikk galt ved generering av scene. Prøv igjen om litt.",
      );
    } finally {
      setEditing(false);
    }
  }

  function handleReusePrompt(item: HistoryItem) {
    setPrompt(item.prompt);
    setImageUrl(item.imageUrl);
    setError(null);
  }

  function handleUseStyle(item: HistoryItem) {
    setSafeHeadline(item.prompt.slice(0, 80));
    setImageUrl(item.imageUrl);
    setError(null);
  }

  // ============== RENDER ==============

  return (
    <>
      {/* Toppseksjon: brand + Shopify-status + modusvalg i ett kort */}
      <div className="mb-5 space-y-3">
        <BrandIdentityBar
          brand={brand}
          source={brandSource}
          loading={brandLoading}
        />

        <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-4 py-3 text-[11px]">
          {/* Shopify-status / produktinfo */}
          {isShopifyMode ? (
            <>
              {productLoading && (
                <p className="flex items-center gap-1.5 text-phorium-light/85">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Henter produktdata fra Shopify …
                </p>
              )}

              {productError && (
                <p className="mt-1 flex items-center gap-1.5 text-red-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Klarte ikke å hente produkt: {productError}
                </p>
              )}

              {linkedProduct && !productLoading && !productError && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-phorium-light/60">
                      <Store className="h-3.5 w-3.5" />
                      Jobber mot produkt:
                    </div>
                    <div className="text-[13px] font-semibold text-phorium-accent">
                      {linkedProduct.title}
                    </div>
                    <div className="text-[10px] text-phorium-light/60">
                      Handle: {linkedProduct.handle} · ID: {linkedProduct.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {linkedProduct.image?.src && (
                      <img
                        src={linkedProduct.image.src}
                        alt={linkedProduct.title}
                        className="h-12 w-12 rounded-lg border border-phorium-off/40 object-cover"
                      />
                    )}

                    <div className="flex gap-2">
                      <Link
                        href="/studio/produkter"
                        className="btn btn-sm btn-ghost"
                      >
                        Bytt produkt
                      </Link>

                      {(shopDomain || process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN) &&
                        productIdFromUrl && (
                          <a
                            href={`https://${
                              shopDomain ||
                              process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
                            }/admin/products/${productIdFromUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-secondary inline-flex items-center gap-1.5"
                          >
                            <Store className="h-3.5 w-3.5" />
                            Åpne i Shopify
                          </a>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-phorium-light/70">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ingen nettbutikk koblet til Visuals enda.
                </div>
                <div className="text-[10px] text-phorium-light/60">
                  Du kan fortsatt generere bilder, men lagring direkte i Shopify
                  krever integrasjon.
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/studio" className="btn btn-sm btn-ghost">
                  Tilbake til Studio
                </Link>
                <Link
                  href="/studio/koble-nettbutikk"
                  className="btn btn-sm btn-ghost inline-flex items-center gap-1"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Koble nettbutikk
                </Link>
              </div>
            </div>
          )}

          {/* Modusvalg */}
          <div className="mt-3 flex flex-col gap-2 border-t border-phorium-off/25 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[10px] text-phorium-light/70">
              Hva vil du lage nå?
            </span>
            <div className="inline-flex rounded-full border border-phorium-off/40 bg-phorium-dark/90 p-1">
              <ModeButton
                active={mode === "image"}
                onClick={() => setMode("image")}
                icon={<ImageIcon className="h-3.5 w-3.5" />}
              >
                Standardbilde
              </ModeButton>
              <ModeButton
                active={mode === "banner"}
                onClick={() => setMode("banner")}
                icon={<LayoutTemplate className="h-3.5 w-3.5" />}
              >
                Banner med tekst
              </ModeButton>
              <ModeButton
                active={mode === "product"}
                onClick={() => setMode("product")}
                icon={<Sparkles className="h-3.5 w-3.5" />}
              >
                Produktbilde til scene
              </ModeButton>
            </div>
          </div>
        </div>
      </div>

      {/* MODE: Standardbilde */}
      {mode === "image" && (
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] text-phorium-light/70">
            <ImageIcon className="h-3.5 w-3.5" />
            Fritt bilde / konseptbilde. Bruk dette til miljøbilder,
            illustrasjoner og generelle visuals til nettbutikken.
          </p>
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
                void handleGenerate();
              }
            }}
            placeholder="Beskriv bildet du vil ha – f.eks. «Stemningsfullt produktfoto av kopp på mørkt trebord, mykt lys, skandinavisk stil»."
            className="h-32 w-full resize-none rounded-2xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[12px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/18"
          />

          {/* Presets + størrelse */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex flex-wrap gap-2">
              {[
                "Produktfoto",
                "Livsstil",
                "Kampanjebanner",
                "Bakgrunn",
                "Mockup",
              ].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() =>
                    setPrompt(
                      `Lag et ${label.toLowerCase()} i fotorealistisk stil. Profesjonelt lys, høy oppløsning.`,
                    )
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-phorium-light/60">Størrelse:</span>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="rounded-full border border-phorium-off/40 bg-phorium-dark px-2 py-1 text-[11px] text-phorium-light/85 outline-none focus:border-phorium-accent"
              >
                <option value="1024x1024">
                  1024×1024 – Produkt / kvadrat
                </option>
                <option value="768x768">768×768 – Mindre kvadrat</option>
                <option value="1200x628">1200×628 – Banner / hero</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                !prompt.trim() ||
                isBusy ||
                imageCooldown > 0 ||
                !!creditError
              }
              className="btn btn-primary btn-lg inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {imageCooldown > 0 ? (
                <>
                  <Clock className="h-4 w-4" />
                  Vent {imageCooldown}s
                </>
              ) : imageLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Genererer bilde…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generer bilde
                </>
              )}
            </button>
            <p className="text-[10px] text-phorium-light/60">
              Tips: Unngå for mye tekstbeskrivelse her – bruk heller
              bannermodusen om du vil ha tekst i selve bildet.
            </p>
          </div>
        </div>
      )}

            {/* MODE: Banner med tekst */}
   {mode === "banner" && (
  <div className="mb-8 space-y-5 rounded-2xl border border-phorium-off/30 bg-phorium-dark p-5">
    {/* Intro */}
    <p className="flex items-center gap-1.5 text-[11px] text-phorium-light/70">
      <LayoutTemplate className="h-3.5 w-3.5" />
      Bannere for kampanjer, nyheter og tilbud. Perfekt til forsiden, kampanjesider og sosiale medier.
    </p>

    {/* Hovedtekst + undertekst */}
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-[11px] text-phorium-light/70">
          Hovedtekst*
        </label>
        <input
          type="text"
          value={safeHeadline}
          onChange={(e) => setSafeHeadline(e.target.value)}
          placeholder="-40% SOMMERSALG"
          className="w-full rounded-xl border border-phorium-off/40 bg-white/95 px-3 py-2 text-[13px] text-phorium-dark shadow-[0_4px_14px_rgba(0,0,0,0.15)] placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-phorium-light/70">
          Undertekst (valgfritt)
        </label>
        <input
          type="text"
          value={safeSubline}
          onChange={(e) => setSafeSubline(e.target.value)}
          placeholder="Kun denne helgen"
          className="w-full rounded-xl border border-phorium-off/40 bg-white/95 px-3 py-2 text-[13px] text-phorium-dark shadow-[0_4px_14px_rgba(0,0,0,0.15)] placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
        />
      </div>
    </div>

    {/* ---- KOMPAKT STIL / MAL / FONT ---- */}
    <div className="space-y-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/60 p-3">
      {/* Rad 1: Stil på teksten + font-dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-phorium-light/70">
          Stil på teksten
        </span>

        <div className="flex items-center gap-2 text-[10px] text-phorium-light/70">
  <Type className="h-3.5 w-3.5 text-phorium-light/70" />

  <select
    className="rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[11px] text-phorium-light focus:border-phorium-accent focus:outline-none focus:ring-1 focus:ring-phorium-accent/40"
    value={bannerFont}
    onChange={(e) => setBannerFont(e.target.value as BannerFont)}
  >
    <option value="auto">Følg brandprofil</option>
    <option value="sans">Ren sans</option>
    <option value="serif">Stilren serif</option>
    <option value="handwritten">Håndskrift</option>
  </select>
</div>

      </div>

      {/* Rad 2: Templates + stiltekst i to rader */}
      <div className="space-y-2">
        {/* Templates (Sommersalg / Nyhet / …) */}
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-phorium-light/80">
          {["Sommersalg", "Nyhet", "Black Week", "Outlet"].map((tpl) => (
            <button
              key={tpl}
              type="button"
              onClick={() => {
                if (tpl === "Sommersalg") {
                  setSafeHeadline("-40% SOMMERSALG");
                  setSafeSubline("Kun denne uken");
                } else if (tpl === "Nyhet") {
                  setSafeHeadline("NYHETER I BUTIKKEN");
                  setSafeSubline("Utforsk de siste produktene");
                } else if (tpl === "Black Week") {
                  setSafeHeadline("BLACK WEEK");
                  setSafeSubline("Begrenset antall – førstemann til mølla");
                } else if (tpl === "Outlet") {
                  setSafeHeadline("OUTLET");
                  setSafeSubline("Siste sjanse – gjør et kupp");
                }
              }}
              className="inline-flex items-center rounded-full border border-phorium-off/40 bg-phorium-dark/80 px-3 py-1 hover:border-phorium-accent/70 hover:text-phorium-accent"
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Stil / bakgrunn textarea */}
        <div>
          <label className="mb-1 block text-[10px] text-phorium-light/70">
            Stil / bakgrunn (valgfritt)
          </label>
          <textarea
            value={safeBgPrompt}
            onChange={(e) => setSafeBgPrompt(e.target.value)}
            placeholder='F.eks. «lys sommerfølelse, myke farger, skandinavisk stil» eller la stå tom for auto.'
            className="h-20 w-full resize-none rounded-2xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[12px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/18"
          />
        </div>
      </div>
    </div>

    {/* ---- BAKGRUNN / AI / MITT BILDE + FORESLÅ ---- */}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/60 px-4 py-3">
      <div className="flex flex-col gap-1 text-[11px] text-phorium-light/70">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-phorium-light/65">
          Bakgrunn til banneret
        </span>
        <span className="text-[10px] text-phorium-light/60">
          Vi lager et komplett banner som matcher brandprofilen din – du trenger ikke laste opp noe.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* AI / Mitt bilde toggle – behold logikken du allerede har */}
        <div className="inline-flex rounded-full border border-phorium-off/30 bg-phorium-dark/80 p-0.5">
          <button
            type="button"
            onClick={() => setBannerSource("ai")}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
              bannerSource === "ai"
                ? "bg-phorium-accent text-phorium-dark"
                : "text-phorium-light/75"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            AI-bakgrunn
          </button>
          <button
            type="button"
            onClick={() => setBannerSource("upload")}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
              bannerSource === "upload"
                ? "bg-phorium-accent text-phorium-dark"
                : "text-phorium-light/75"
            }`}
          >
            <ImageIcon className="h-3 w-3" />
            Mitt bilde
          </button>
        </div>

       <button
  type="button"
  className="btn btn-xs btn-ghost inline-flex items-center gap-1"
  onClick={async () => {
    // Ikke gjør noe hvis hovedtekst er tom
    if (!safeHeadline.trim()) return;

    try {
      const res = await fetch("/api/phorium-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: safeHeadline.trim(),
          // Ta gjerne med brand hvis du har det i komponenten:
          // brand,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data?.suggestion) {
        setSafeSubline(data.suggestion);
      }
    } catch (err) {
      console.error("Kunne ikke foreslå undertekst", err);
      // Vi lar bare knappen feile stille – luksusfunksjon :)
    }
  }}
>
  <Palette className="h-3 w-3" />
  Foreslå undertekst
</button>

      </div>
    </div>

          {/* Knapper nederst – tett på innholdet */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  bannerSource === "ai"
                    ? handleSmartTextGenerate
                    : handleOverlayGenerate
                }
                disabled={
                  !safeHeadline.trim() ||
                  isBusy ||
                  bannerCooldown > 0 ||
                  (bannerSource === "upload" && !textBgFile) ||
                  !!creditError
                }
                className="btn btn-primary btn-lg inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bannerCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Vent {bannerCooldown}s
                  </>
                ) : safeLoading || overlayLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Genererer banner…
                  </>
                ) : bannerSource === "ai" ? (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generer banner med trygg tekst
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generer banner med mitt bilde
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCampaignPack}
                disabled={
                  !safeHeadline.trim() ||
                  isBusy ||
                  packCooldown > 0 ||
                  !!creditError
                }
                className="btn btn-secondary btn-lg inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {packCooldown > 0 ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Vent {packCooldown}s
                  </>
                ) : campaignLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Lager kampanjepakke…
                  </>
                ) : (
                  <>
                    <LayoutTemplate className="h-4 w-4" />
                    Lag kampanjepakke
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleVariant}
                disabled={!lastBannerConfig || isBusy || !!creditError}
                className="btn btn-ghost btn-sm inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Ny variant
              </button>
            </div>

            <p className="text-[10px] text-phorium-light/60">
              Kampanjepakken gir deg web-hero, Instagram-post og story/reel med
              samme uttrykk.
            </p>
          </div>
        </div>
      )}


      {/* MODE: Produktbilde til scene */}
      {mode === "product" && (
        <div className="mb-8 space-y-4 rounded-2xl border border-phorium-off/30 bg-phorium-dark p-5">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] text-phorium-light/70">
            <Sparkles className="h-3.5 w-3.5" />
            Plasser produktet ditt i en AI-generert scene. Bruk et tydelig
            produktbilde – vi bygger miljøet rundt det.
          </p>

          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setBaseImage(url);
              setSceneFile(file);
              setImageUrl(null);
              setCampaignPack([]);
            }}
            className="block w-full text-[11px] text-phorium-light/80 file:mr-3 file:rounded-full file:border file:border-phorium-off/40 file:bg-phorium-dark file:px-3 file:py-1.5 file:text-[11px] file:text-phorium-light hover:file:bg-phorium-off/10"
          />

          {baseImage && (
            <div className="flex flex-col gap-2 rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-3 text-[11px]">
              <div className="flex items-center gap-1.5 text-[10px] text-phorium-light/60">
                <ImageIcon className="h-3.5 w-3.5" />
                Utgangspunkt:
              </div>
              <div className="flex items-center justify-center overflow-hidden rounded-xl bg-phorium-dark">
                <img
                  src={baseImage}
                  alt="Utgangsbilde"
                  className="max-h-40 w-full object-contain"
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
            className="h-20 w-full resize-none rounded-2xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[12px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/18"
          />

          <button
            type="button"
            onClick={handleEditGenerate}
            disabled={
              !baseImage || !editPrompt.trim() || isBusy || !!creditError
            }
            className="btn btn-primary btn-lg inline-flex w-full items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {editing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Genererer scene…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generer scene rundt produktet
              </>
            )}
          </button>
        </div>
      )}

  
  <PhoriumVisualsResult
  imageUrl={imageUrl}
   isBusy={isBusy}  
  error={error}
  campaignPack={campaignPack}
  history={history}
  showSafeZone={showSafeZone}
  setShowSafeZone={setShowSafeZone}
  fullscreenImage={fullscreenImage}
  setFullscreenImage={setFullscreenImage}
  isShopifyMode={isShopifyMode}
  productIdFromUrl={productIdFromUrl}
  saving={saving}
  onDownload={handleDownload}
  onSaveToShopify={handleSaveImageToShopify}
 onUseHistoryAgain={handleReusePrompt}
onUseHistoryStyle={handleUseStyle}

/>



      {/* Global lightbox for alle bilder (preview, kampanjepakke, historikk) */}
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

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => handleDownload(fullscreenImage)}
          className="btn btn-secondary btn-sm inline-flex items-center gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          Last ned
        </button>
        <button
          type="button"
          onClick={() => setFullscreenImage(null)}
          className="btn btn-ghost btn-sm inline-flex items-center gap-1"
        >
          <ZoomOut className="h-3.5 w-3.5" />
          Lukk
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </>
  );
}
