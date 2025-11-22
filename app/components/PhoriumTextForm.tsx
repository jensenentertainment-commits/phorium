"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import PhoriumLoader from "./PhoriumLoader";
import useBrandProfile from "@/hooks/useBrandProfile";
import BrandIdentityBar from "./BrandIdentityBar";

// Ikoner – brukes etter hvert om du vil
import { Wand2, Check, X, Loader2, ArrowLeft, Sparkles } from "lucide-react";

type GeneratedResult = {
  title?: string;
  description?: string;
  shortDescription?: string;
  meta_title?: string;
  meta_description?: string;
  bullets?: string[];
  tags?: string[];
  ad_primary?: string;
  ad_headline?: string;
  ad_description?: string;
  social_caption?: string;
  social_hashtags?: string[];
};

type ActiveTab = "product" | "seo" | "ads" | "some";

type TextHistoryItem = {
  id: string;
  productName: string;
  category?: string;
  tone?: string;
  createdAt: string;
  source: "manual" | "shopify";
  result: GeneratedResult;
};

export default function PhoriumTextForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("product");

  // Felles brandprofil (tekst + visuals)
  const { brand, loading: brandLoading, updateBrand, source } =
    useBrandProfile();

  // Shopify-kontekst
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");
  const isShopifyMode = !!productIdFromUrl;

  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Lagre til Shopify / kopiering
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);

  // Global historikk for tekststudio
  const [history, setHistory] = useState<TextHistoryItem[]>([]);

  // Tone-analyse av eksisterende/generert tekst
  const [toneAnalysis, setToneAnalysis] = useState<{
    tone: string;
    confidence: number;
    styleTags: string[];
    summary: string;
    suggestions: string;
  } | null>(null);
  const [toneLoading, setToneLoading] = useState(false);
  const [toneError, setToneError] = useState<string | null>(null);

  // Hent butikkdomene fra cookie (phorium_shop) – brukes til "Åpne i Shopify"
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
      // stille feil
    }
  }, []);

  // Hent produkt hvis vi har productId
  useEffect(() => {
    async function fetchProduct() {
      if (!productIdFromUrl) return;

      try {
        setProductLoading(true);
        setProductError(null);

        const res = await fetch(
          `/api/shopify/product?productId=${productIdFromUrl}`,
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Ukjent feil ved henting av produkt.");
        }

        const data = await res.json();
        setLinkedProduct(data.product);
        setProductName(data.product.title || "");
      } catch (err: any) {
        setProductError(err?.message || "Feil ved henting av produkt.");
      } finally {
        setProductLoading(false);
      }
    }

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdFromUrl]);

  // Just-generated highlight
  useEffect(() => {
    if (!justGenerated) return;
    const t = setTimeout(() => setJustGenerated(false), 1200);
    return () => clearTimeout(t);
  }, [justGenerated]);

  // Last historikk fra localStorage (GLOBAL for tekststudio)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("phorium_text_history");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // stille feil
    }
  }, []);

  // Persist historikk til localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "phorium_text_history",
        JSON.stringify(history),
      );
    } catch {
      // stille feil
    }
  }, [history]);

  function addToHistory(
    source: "manual" | "shopify",
    generated: GeneratedResult,
  ) {
    const item: TextHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productName,
      category,
      tone,
      createdAt: new Date().toISOString(),
      source,
      result: generated,
    };

    setHistory((prev) => [item, ...prev].slice(0, 6)); // siste 6 globalt
  }

  function handleLoadFromHistory(item: TextHistoryItem) {
    setProductName(item.productName);
    setCategory(item.category || "");
    setTone(item.tone || "");
    setResult(item.result);
    setActiveTab("product");
    setError(null);
    setSaveMessage(null);
    setCopyMessage(null);
    setJustGenerated(false);
  }

  function handleApplyToneFromHistory(item: TextHistoryItem) {
    if (item.tone) setTone(item.tone);
    if (item.category) setCategory(item.category);
  }

  // Analysér tone på eksisterende eller generert tekst
  async function handleAnalyzeTone() {
    setToneError(null);

    let textToAnalyze =
      (result?.description && result.description.trim()) ||
      (result?.shortDescription && result.shortDescription.trim()) ||
      "";

    if (!textToAnalyze && linkedProduct?.body_html) {
      textToAnalyze = String(linkedProduct.body_html).replace(
        /<[^>]+>/g,
        " ",
      );
    }

    if (!textToAnalyze || !textToAnalyze.trim()) {
      setToneError(
        "Det finnes ingen tekst å analysere ennå. Generer tekst, eller bruk eksisterende Shopify-tekst først.",
      );
      setToneAnalysis(null);
      return;
    }

    setToneLoading(true);
    try {
      const res = await fetch("/api/analyze-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToAnalyze,
          language: "norsk",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Kunne ikke analysere tone.");
      }

      setToneAnalysis(data.result);
    } catch (err: any) {
      console.error("Tone-analyse feilet:", err);
      setToneError(
        err?.message || "Noe gikk galt under tone-analysen.",
      );
      setToneAnalysis(null);
    } finally {
      setToneLoading(false);
    }
  }

  // --- Manuell generering (uten Shopify-produkt) ---
  async function handleGenerateManual() {
    if (!productName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
    setCopyMessage(null);

    try {
      const effectiveTone = tone || (brand?.tone as string) || "nøytral";

      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          tone: effectiveTone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Ukjent feil");
      } else {
        const newResult: GeneratedResult = {
          title: data.data.title,
          description: data.data.description,
          meta_title: data.data.meta_title,
          meta_description: data.data.meta_description,
        };

        setResult(newResult);
        setActiveTab("product");
        setJustGenerated(true);
        addToHistory("manual", newResult);
      }
    } catch {
      setError("Kunne ikke kontakte Phorium Core.");
    } finally {
      setLoading(false);
    }
  }

  // --- Generering basert på Shopify-produkt (rik respons) ---
  async function handleGenerateFromProduct() {
    if (!productIdFromUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
    setCopyMessage(null);

    try {
      const res = await fetch("/api/shopify/generate-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productIdFromUrl),
          tone: tone || (brand?.tone as string) || "nøytral",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Kunne ikke generere tekst.");
      }

      const r = data.result;

      const mapped: GeneratedResult = {
        title:
          linkedProduct?.title ||
          productName ||
          "Generert produkttekst",
        description: r.description || "",
        shortDescription: r.shortDescription || "",
        meta_title: r.seoTitle || "",
        meta_description: r.metaDescription || "",
        bullets: r.bullets || [],
        tags: r.tags || [],
        ad_primary: r.adPrimaryText || "",
        ad_headline: r.adHeadline || "",
        ad_description: r.adDescription || "",
        social_caption: r.socialCaption || "",
        social_hashtags: r.hashtags || [],
      };

      setResult(mapped);
      setActiveTab("product");
      setJustGenerated(true);
      addToHistory("shopify", mapped);
    } catch (err: any) {
      setError(err?.message || "Kunne ikke generere tekst fra Shopify.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToShopify() {
    if (!productIdFromUrl || !result) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/shopify/update-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productIdFromUrl),
          title:
            linkedProduct?.title ||
            result.title ||
            productName ||
            "",
          description: result.description || "",
          shortDescription: result.shortDescription || "",
          seoTitle: result.meta_title || "",
          metaDescription: result.meta_description || "",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Klarte ikke å lagre tekst i Shopify.");
      }

      setSaveMessage("✅ Tekstpakke er lagret i Shopify.");
    } catch (err: any) {
      setSaveMessage(
        err?.message || "❌ Klarte ikke å lagre tekst i Shopify.",
      );
    } finally {
      setSaving(false);
    }
  }

  // --- Kopiering / reset ---
  function handleCopyActiveTab() {
    const text = getTextForActiveTab();
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage("Kopiert!");
        setTimeout(() => setCopyMessage(null), 1500);
      })
      .catch(() => {
        setCopyMessage("Kunne ikke kopiere.");
        setTimeout(() => setCopyMessage(null), 1500);
      });
  }

  function handleResetForm() {
    setProductName("");
    setCategory("");
    setTone("");
    setResult(null);
    setError(null);
    setSaveMessage(null);
    setCopyMessage(null);
    setJustGenerated(false);
  }

  // --- Tekst for aktiv fane (brukes til "Kopier") ---
  function getTextForActiveTab(): string {
    if (!result) return "";

    if (activeTab === "product") {
      const parts: string[] = [];
      if (result.title) parts.push(result.title);
      if (result.shortDescription) parts.push(result.shortDescription);
      if (result.description) parts.push(result.description);
      if (Array.isArray(result.bullets) && result.bullets.length > 0) {
        parts.push(
          "",
          "Nøkkelpunkter:",
          ...result.bullets.map((b) => `• ${b}`),
        );
      }
      return parts.join("\n\n");
    }

    if (activeTab === "seo") {
      const parts: string[] = [];
      if (result.meta_title)
        parts.push(`SEO-tittel:\n${result.meta_title}`);
      if (result.meta_description)
        parts.push(
          `Meta-beskrivelse:\n${result.meta_description}`,
        );
      if (Array.isArray(result.tags) && result.tags.length > 0) {
        parts.push("", "Tags/keywords:", result.tags.join(", "));
      }
      return parts.join("\n\n");
    }

    if (activeTab === "ads") {
      const parts: string[] = [];
      if (result.ad_headline)
        parts.push(`Annonseoverskrift:\n${result.ad_headline}`);
      if (result.ad_primary)
        parts.push(`Primær annonsetekst:\n${result.ad_primary}`);
      if (result.ad_description)
        parts.push(
          `Tilleggsbeskrivelse:\n${result.ad_description}`,
        );
      return parts.join("\n\n");
    }

    if (activeTab === "some") {
      const parts: string[] = [];
      if (result.social_caption)
        parts.push(`Caption:\n${result.social_caption}`);
      if (
        Array.isArray(result.social_hashtags) &&
        result.social_hashtags.length > 0
      ) {
        parts.push(
          "",
          "Hashtags:",
          result.social_hashtags.map((h) => `#${h}`).join(" "),
        );
      }
      return parts.join("\n\n");
    }

    return "";
  }

  return (
    <div className="space-y-4">
      {/* Tilbake til produktliste hvis vi er i Shopify-modus */}
      {isShopifyMode && (
        <div className="mb-1 flex items-center gap-2 text-[11px] text-phorium-light/70">
          <ArrowLeft className="h-3 w-3" />
          <Link href="/studio/produkter" className="hover:underline">
            Tilbake til produktlisten
          </Link>
        </div>
      )}

      {/* Topprad: brand + status + historikk */}
      <div className="flex flex-col gap-3 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-phorium-light/50">
            <Sparkles className="h-3 w-3" />
            <span>Phorium tekststudio</span>
          </div>
          <h2 className="text-sm font-semibold text-phorium-light">
            Generer tekst for produktsider, SEO og annonser
          </h2>
          <p className="text-[11px] text-phorium-light/65">
            Tilpasset din nettbutikk sin brandprofil og ønsket tone-of-voice.
          </p>
        </div>

        <BrandIdentityBar
          brand={brand}
          loading={brandLoading}
          source={source}
          onUpdateBrand={updateBrand}
        />
      </div>

      {/* Shopify-produkt header */}
      {isShopifyMode && (
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-4 py-3 text-[12px]">
          {productLoading && (
            <p className="text-phorium-light/85">
              Henter produktdata fra Shopify …
            </p>
          )}

          {productError && (
            <p className="text-red-300">
              Klarte ikke å hente produkt: {productError}
            </p>
          )}

          {linkedProduct && !productLoading && !productError && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[11px] text-phorium-light/60">
                    Jobber mot produkt:
                  </div>
                  <div className="text-[13px] font-semibold text-phorium-accent">
                    {linkedProduct.title}
                  </div>
                  <div className="text-[11px] text-phorium-light/60">
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

                  <Link
                    href="/studio/produkter"
                    className="btn btn-sm btn-secondary"
                  >
                    Bytt produkt
                  </Link>
                </div>
              </div>

              <div className="mt-3 border-t border-phorium-off/20 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-phorium-light/70">
                    Analyser tonen i eksisterende produkttekst
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyzeTone}
                    disabled={toneLoading}
                    className="btn btn-xs btn-secondary"
                  >
                    {toneLoading ? "Analyserer tone…" : "Analyser tone"}
                  </button>
                </div>

                {toneError && (
                  <p className="mt-1 text-[11px] text-red-300">
                    {toneError}
                  </p>
                )}

                {toneAnalysis && (
                  <div className="mt-2 rounded-xl border border-phorium-off/25 bg-phorium-dark/70 p-3 text-[11px] text-phorium-light/90 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        Oppdaget tone: {toneAnalysis.tone}
                      </span>
                      <span className="text-[10px] text-phorium-light/60">
                        Sikkerhet:{" "}
                        {(toneAnalysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {toneAnalysis.styleTags?.length > 0 && (
                      <p className="text-[10px] text-phorium-light/70">
                        Stil: {toneAnalysis.styleTags.join(", ")}
                      </p>
                    )}

                    <p className="text-[11px]">{toneAnalysis.summary}</p>
                    <p className="text-[11px] text-phorium-light/80">
                      {toneAnalysis.suggestions}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hovedlayout – venstre (input) / høyre (resultat) */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
        {/* Venstre side – input */}
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-5 py-5">
          <h3 className="mb-3 text-sm font-semibold text-phorium-light">
            Hva ønsker du å generere?
          </h3>

          {!isShopifyMode && (
            <div className="mb-3">
              <label className="mb-1 block text-[11px] text-phorium-light/70">
                Produktnavn*
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder='F.eks. «Rustfri termokopp 1L – sort»'
                className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/25"
              />
            </div>
          )}

          {isShopifyMode && (
            <p className="mb-3 text-[11px] text-phorium-light/70">
              Produktnavn er låst til{" "}
              <span className="font-semibold text-phorium-accent">
                {productName || linkedProduct?.title || "Ukjent produkt"}
              </span>
              .
            </p>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-[11px] text-phorium-light/70">
              Kategori (valgfritt)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="F.eks. kjøkken, interiør, hundeutstyr …"
              className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/25"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-[11px] text-phorium-light/70">
              Tone-of-voice (f.eks. «folkelig og ærlig», «formell og
              faglig»)
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder={
                brand?.tone
                  ? `Trykk enter for å bruke brand-tone: ${brand.tone}`
                  : "F.eks. «ærlig og rett frem», «varm og personlig»"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !tone && brand?.tone) {
                  e.preventDefault();
                  setTone(brand.tone);
                }
              }}
              className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-[13px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/25"
            />
            {brand?.tone && !tone && (
              <p className="mt-1 text-[11px] text-phorium-light/60">
                Brandprofilen din har allerede en tone definert:{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => setTone(brand.tone!)}
                >
                  bruk «{brand.tone}»
                </button>
                .
              </p>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {!isShopifyMode && (
              <button
                type="button"
                onClick={handleGenerateManual}
                disabled={loading || !productName.trim()}
                className="btn btn-primary flex items-center gap-1 text-[13px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Genererer …
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3" />
                    Generer tekst
                  </>
                )}
              </button>
            )}

            {isShopifyMode && (
              <button
                type="button"
                onClick={handleGenerateFromProduct}
                disabled={loading || !productIdFromUrl}
                className="btn btn-primary flex items-center gap-1 text-[13px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Leser produkt og genererer …
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3" />
                    Generer tekst fra Shopify-produkt
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleResetForm}
              className="btn btn-ghost btn-sm text-[11px]"
            >
              <X className="mr-1 h-3 w-3" />
              Nullstill
            </button>

            {isShopifyMode && shopDomain && (
              <a
                href={`https://${shopDomain}/admin/products/${productIdFromUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-ghost"
              >
                Åpne i Shopify
              </a>
            )}
          </div>

          {(saveMessage || copyMessage || error) && (
            <div className="mt-2 space-y-1 text-[11px]">
              {saveMessage && (
                <p className="text-phorium-light/85">{saveMessage}</p>
              )}
              {copyMessage && (
                <p className="text-phorium-light/85">{copyMessage}</p>
              )}
              {error && <p className="text-red-300">{error}</p>}
            </div>
          )}

          {/* Historikk */}
          {history.length > 0 && (
            <div className="mt-5 border-t border-phorium-off/25 pt-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-phorium-light/60">
                Tidligere genererte tekster
              </div>

              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLoadFromHistory(item)}
                    className="group flex flex-col rounded-xl border border-phorium-off/40 bg-phorium-dark px-3 py-2 text-left text-[11px] text-phorium-light/80 hover:border-phorium-accent/60 hover:bg-phorium-dark/90"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 font-medium">
                        {item.productName || "Uten navn"}
                      </span>
                      <span className="text-[10px] uppercase text-phorium-light/45">
                        {item.source === "manual" ? "Manuell" : "Shopify"}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-1 text-[10px] text-phorium-light/55">
                      {item.result.shortDescription ||
                        item.result.description ||
                        "Ingen kortbeskrivelse"}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[9px] text-phorium-light/45">
                      <span>
                        {item.category || "Uten kategori"} ·{" "}
                        {item.tone || "Uten tone"}
                      </span>
                      <button
                        type="button"
                        className="text-[9px] underline opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyToneFromHistory(item);
                        }}
                      >
                        Bruk tone
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Høyre side – resultater */}
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-5 py-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] text-phorium-light/70">
              <Sparkles className="h-3 w-3 text-phorium-accent" />
              <span>
                Generert tekst
                {linkedProduct?.title
                  ? ` for «${linkedProduct.title}»`
                  : result?.title
                    ? ` for «${result.title}»`
                    : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!result}
                onClick={handleCopyActiveTab}
                className="btn btn-xs btn-secondary"
              >
                Kopier aktiv fane
              </button>
            </div>
          </div>

          <div className="mb-3 flex gap-1">
            {[
              { id: "product", label: "Produkttekst" },
              { id: "seo", label: "SEO" },
              { id: "ads", label: "Annonser" },
              { id: "some", label: "Sosiale medier" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`rounded-full px-3 py-1 text-[11px] ${
                  activeTab === tab.id
                    ? "bg-phorium-accent text-phorium-dark"
                    : "bg-phorium-dark text-phorium-light/70 hover:bg-phorium-off/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[240px] rounded-xl border border-phorium-off/35 bg-phorium-dark px-4 py-3 text-[13px] text-phorium-light">
            {loading && (
              <div className="flex h-full items-center justify-center">
                <PhoriumLoader />
              </div>
            )}

            {!loading && !result && (
              <p className="text-[12px] text-phorium-light/65">
                Ingen tekst generert ennå. Fyll ut produktdata til venstre og
                klikk på <span className="font-medium">Generer tekst</span>.
              </p>
            )}

            {!loading && result && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className={`space-y-2 ${
                    justGenerated ? "ring-1 ring-phorium-accent/50" : ""
                  }`}
                >
                  {activeTab === "product" && (
                    <>
                      {result.title && (
                        <h3 className="text-[14px] font-semibold text-phorium-accent">
                          {result.title}
                        </h3>
                      )}
                      {result.shortDescription && (
                        <p className="text-[13px] text-phorium-light">
                          {result.shortDescription}
                        </p>
                      )}
                      {result.description && (
                        <p className="whitespace-pre-line text-[13px] text-phorium-light/90">
                          {result.description}
                        </p>
                      )}
                      {Array.isArray(result.bullets) &&
                        result.bullets.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] text-phorium-light/90">
                            {result.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}
                    </>
                  )}

                  {activeTab === "seo" && (
                    <div className="space-y-2 text-[13px]">
                      <div>
                        <div className="text-[11px] font-semibold text-phorium-light/70">
                          SEO-tittel
                        </div>
                        <div className="text-phorium-light">
                          {result.meta_title || "Ingen SEO-tittel generert."}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-phorium-light/70">
                          Meta-beskrivelse
                        </div>
                        <div className="text-phorium-light">
                          {result.meta_description ||
                            "Ingen meta-beskrivelse generert."}
                        </div>
                      </div>
                      {Array.isArray(result.tags) &&
                        result.tags.length > 0 && (
                          <div>
                            <div className="text-[11px] font-semibold text-phorium-light/70">
                              Tags / søkeord
                            </div>
                            <div className="text-phorium-light">
                              {result.tags.join(", ")}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {activeTab === "ads" && (
                    <div className="space-y-2 text-[13px]">
                      <div>
                        <div className="text-[11px] font-semibold text-phorium-light/70">
                          Annonseoverskrift
                        </div>
                        <div className="text-phorium-light">
                          {result.ad_headline ||
                            "Ingen annonseoverskrift generert."}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-phorium-light/70">
                          Primær annonsetekst
                        </div>
                        <div className="text-phorium-light">
                          {result.ad_primary ||
                            "Ingen primær annonsetekst generert."}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-phorium-light/70">
                          Tilleggsbeskrivelse
                        </div>
                        <div className="text-phorium-light">
                          {result.ad_description ||
                            "Ingen tilleggsbeskrivelse generert."}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "some" && (
                    <div className="space-y-2 text-[13px]">
                      <div>
                        <div className="text-[11px] font-semibold text-phorium-light/70">
                          Caption
                        </div>
                        <div className="text-phorium-light">
                          {result.social_caption ||
                            "Ingen caption for sosiale medier generert."}
                        </div>
                      </div>
                      {Array.isArray(result.social_hashtags) &&
                        result.social_hashtags.length > 0 && (
                          <div>
                            <div className="text-[11px] font-semibold text-phorium-light/70">
                              Hashtags
                            </div>
                            <div className="text-phorium-light">
                              {result.social_hashtags
                                .map((h) =>
                                  h.startsWith("#") ? h : `#${h}`,
                                )
                                .join(" ")}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
