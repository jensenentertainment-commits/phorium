"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import PhoriumLoader from "./PhoriumLoader";
import useBrandProfile from "@/hooks/useBrandProfile";
import BrandIdentityBar from "./BrandIdentityBar";
import { supabase } from "@/lib/supabaseClient";
import { useCreditError } from "@/app/studio/CreditErrorContext";


// Ikoner – brukes etter hvert om du vil
import {
  Wand2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  History,
  FileText,
  Target,
  Sparkles,
  Copy,
  Save,
  Store,
  Link2,
} from "lucide-react";

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
  bodyHtml?: string; // brukes når vi lager HTML til Shopify
};

type ActiveTab = "product" | "seo" | "ads" | "some";

type TextHistoryItem = {
  id: string;
  productName: string;
  category: string;
  tone: string;
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
  const { setCreditError } = useCreditError();


  const [matchScore, setMatchScore] = useState<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string;
  } | null>(null);

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Tone-analyse
  const [toneAnalysis, setToneAnalysis] = useState<{
    tone: string;
    confidence: number;
    styleTags: string[];
    summary: string;
    suggestions: string;
  } | null>(null);
  const [toneLoading, setToneLoading] = useState(false);
  const [toneError, setToneError] = useState<string | null>(null);

  // Brandprofil
  const { brand, loading: brandLoading, source: brandSource } =
    useBrandProfile();

  // URL-parametere (produkt fra Shopify)
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");
  const isShopifyMode = !!productIdFromUrl;

  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Lagring/kopi
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Historikk for tekststudio
  const [history, setHistory] = useState<TextHistoryItem[]>([]);




  // Hent butikkdomene fra cookie (phorium_shop)
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

  useEffect(() => {
    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Kunne ikke hente bruker:", error);
          setUserId(null);
          return;
        }

        setUserId(data.user?.id ?? null);
      } catch (err) {
        console.error("Uventet feil ved henting av bruker:", err);
        setUserId(null);
      }
    }

    void loadUser();
  }, []);


  // Les historikk fra localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("phorium_text_history");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // stille
    }
  }, []);

  // Lagre historikk til localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "phorium_text_history",
        JSON.stringify(history),
      );
    } catch {
      // stille
    }
  }, [history]);

  // --- Historikk-hjelpere ---
  function addToHistory(
    source: "manual" | "shopify",
    generated: GeneratedResult,
  ) {
    const item: TextHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productName:
        generated.title ||
        productName ||
        linkedProduct?.title ||
        "Uten navn",
      category: category || linkedProduct?.product_type || "",
      tone,
      createdAt: new Date().toISOString(),
      source,
      result: generated,
    };

    setHistory((prev) => [item, ...prev].slice(0, 6));
  }

  function handleLoadFromHistory(item: TextHistoryItem) {
    setProductName(item.productName);
    setCategory(item.category);
    setTone(item.tone);
    setResult(item.result);
    setJustGenerated(false);
    setMatchScore(null);
    setToneAnalysis(null);
    setError(null);
    setActiveTab("product");
  }

  function handleApplyToneFromHistory(item: TextHistoryItem) {
    // Bruker tone og kategorifølelse fra en tidligere tekst
    if (item.tone) setTone(item.tone);
    if (item.category && !category) setCategory(item.category);
  }

  // Shopify-produkthenting
  useEffect(() => {
    async function fetchProduct() {
      if (!productIdFromUrl) return;

      try {
        setProductLoading(true);
        setProductError(null);

        const res = await fetch(`/api/shopify/product?id=${productIdFromUrl}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Kunne ikke hente produkt.");
        }

        setLinkedProduct(data.product);

        if (data.product?.title) {
          setProductName(data.product.title);
        }
        if (data.product?.product_type) {
          setCategory(data.product.product_type);
        }
      } catch (err: any) {
        console.error("Feil ved henting av produkt:", err);
        setProductError(err?.message || "Noe gikk galt mot Shopify.");
      } finally {
        setProductLoading(false);
      }
    }

    fetchProduct();
  }, [productIdFromUrl]);

  // Bygg prompt ut fra brandprofil
  function buildPrompt() {
    const base: string[] = [];

    if (brand?.store_name) {
      base.push(`Butikk: ${brand.store_name}.`);
    }
    if (brand?.industry) {
      base.push(`Bransje: ${brand.industry}.`);
    }
    if (brand?.target_audience) {
      base.push(`Målgruppe: ${brand.target_audience}.`);
    }
    if (brand?.tone_of_voice) {
      base.push(`Tone: ${brand.tone_of_voice}.`);
    }
    if (brand?.style_keywords?.length) {
      base.push(
        `Stikkord for stil: ${brand.style_keywords
          .map((x: string) => x.toLowerCase())
          .join(", ")}.`,
      );
    }

    if (productName) {
      base.push(`Produktnavn: ${productName}.`);
    }
    if (category) {
      base.push(`Kategori: ${category}.`);
    }
    if (tone) {
      base.push(`Ønsket tone: ${tone}.`);
    }

    const core = base.join(" ");

    return (
      core +
      " Lag full produkttekst, kort tekst, SEO-tittel, meta-beskrivelse, punktliste, annonsetekster og SoMe-tekst på norsk."
    );
  }

  async function handleGenerateFromShopify() {
    if (!linkedProduct) {
      setError(
        "Fant ikke produktdata å generere ut fra. Prøv å hente et produkt på nytt.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setMatchScore(null);
    setToneAnalysis(null);
    setJustGenerated(false);

    try {
      const res = await fetch("/api/shopify/generate-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: linkedProduct.id,
          brandProfile: brand || null,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.result) {
        throw new Error(
          data.error ||
            "Kunne ikke generere tekst fra Shopify-produktet. Prøv igjen.",
        );
      }

      const r = data.result;

      const mapped: GeneratedResult = {
        title: r.title || productName || linkedProduct.title || "",
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
      console.error("Feil ved generering (Shopify):", err);

      const msg = err?.message || "";

      if (msg.includes("Ikke nok kreditter")) {
        setError(
          "Du er tom for kreditter i denne betaen. Ta kontakt hvis du vil ha flere."
        );
      } else {
        setError(
          "Kunne ikke generere tekst fra Shopify-produktet. Prøv igjen om litt."
        );
      }

      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateFromManual() {
    if (!productName.trim()) {
      setError("Skriv inn et produktnavn før du genererer tekst.");
      return;
    }

    setLoading(true);
    setError(null);
    setMatchScore(null);
    setToneAnalysis(null);
    setJustGenerated(false);

    try {
      const prompt = buildPrompt();

      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          productName,
          category,
          tone,
          brandProfile: brand || null,
          userId, // viktig for kreditt-systemet
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.result) {
        throw new Error(
          data.error || "Kunne ikke generere tekst. Prøv igjen om litt."
        );
      }

      const r = data.result;

      const mapped: GeneratedResult = {
        title: r.title || productName,
        description: r.description || "",
        shortDescription: r.shortDescription || "",
        meta_title: r.meta_title || "",
        meta_description: r.meta_description || "",
        bullets: r.bullets || [],
        tags: r.tags || [],
        ad_primary: r.ad_primary || "",
        ad_headline: r.ad_headline || "",
        ad_description: r.ad_description || "",
        social_caption: r.social_caption || "",
        social_hashtags: r.social_hashtags || [],
      };

      setResult(mapped);
      setActiveTab("product");
      setJustGenerated(true);
      addToHistory("manual", mapped);
    } catch (err: any) {
      console.error("Feil ved generering:", err);

      const msg = err?.message || "";

      if (msg.includes("Ikke nok kreditter")) {
        setError(
          "Du er tom for kreditter i denne betaen. Ta kontakt hvis du vil ha flere."
        );
      } else {
        setError(
          "Kunne ikke generere tekst akkurat nå. Prøv igjen om litt."
        );
      }

      setResult(null);
    } finally {
      setLoading(false);
    }
  }



function handlePrimaryClick() {
  // Hvis du har en toggle mellom Shopify og manuell:
  if (isShopifyMode) {
    void handleGenerateFromShopify();
  } else {
    void handleGenerateFromManual();
  }
}



    // --- Analyse av tone ---
    async function handleAnalyzeTone() {
      setToneError(null);
      setToneAnalysis(null);

      let textToAnalyze = "";

      if (result?.description) {
        textToAnalyze = result.description;
      } else if (linkedProduct?.body_html) {
        textToAnalyze = linkedProduct.body_html
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, " ");
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

    async function handleMatchScore() {
      setMatchError(null);

      const textToCheck =
        (result?.description && result.description.trim()) ||
        (result?.shortDescription && result.shortDescription.trim()) ||
        "";

      if (!textToCheck) {
        setMatchError(
          "Generer tekst først, så kan vi sjekke hvor godt den matcher brandprofilen din.",
        );
        return;
      }

      if (!brand) {
        setMatchError(
          "Du har ikke fylt ut brandprofilen ennå. Oppdater den først for å få match-score.",
        );
        return;
      }

      setMatchLoading(true);

      try {
        const res = await fetch("/api/match-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToCheck,
            brandProfile: brand,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(
            data.error || "Kunne ikke beregne match-score. Prøv igjen.",
          );
        }

        setMatchScore(data.result);
      } catch (err: any) {
        console.error("Match-score feilet:", err);
        setMatchError(
          err?.message || "Noe gikk galt med match-score. Prøv igjen.",
        );
        setMatchScore(null);
      } finally {
        setMatchLoading(false);
      }
    }

    // --- Lagring til Shopify ---
    async function handleSaveToShopify() {
      if (!isShopifyMode || !result || !linkedProduct) return;

      setSaving(true);
      setSaveMessage(null);

      try {
        const res = await fetch("/api/shopify/save-product-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: linkedProduct.id,
            result,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(
            data.error || "Kunne ikke lagre tekst i Shopify. Prøv igjen.",
          );
        }

        setSaveMessage("✅ Teksten er lagret i Shopify.");
      } catch (err: any) {
        console.error("Feil ved lagring til Shopify:", err);
        setSaveMessage(
          err?.message || "❌ Klarte ikke å lagre tekst i Shopify.",
        );
      } finally {
        setSaving(false);
      }
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
            "\nPunkter:\n" + result.bullets.map((b) => `• ${b}`).join("\n"),
          );
        }
        return parts.join("\n\n");
      }

      if (activeTab === "seo") {
        return [
          "SEO-tittel:",
          result.meta_title || "",
          "",
          "Meta-beskrivelse:",
          result.meta_description || "",
          "",
          "Tags:",
          Array.isArray(result.tags) && result.tags.length > 0
            ? result.tags.join(", ")
            : "",
        ]
          .join("\n")
          .trim();
      }

      if (activeTab === "ads") {
        return [
          "Primær annonsetekst:",
          result.ad_primary || "",
          "",
          "Annonseoverskrift:",
          result.ad_headline || "",
          "",
          "Annonsebeskrivelse:",
          result.ad_description || "",
        ]
          .join("\n")
          .trim();
      }

      if (activeTab === "some") {
        return [
          "SoMe-caption:",
          result.social_caption || "",
          "",
          "Hashtags:",
          Array.isArray(result.social_hashtags) &&
            result.social_hashtags.length > 0
            ? result.social_hashtags.map((h) => `#${h}`).join(" ")
            : "",
        ]
          .join("\n")
          .trim();
      }

      return "";
    }

    async function handleCopyActiveTab() {
      if (typeof navigator === "undefined") return;
      if (!result) return;

      const textToCopy = getTextForActiveTab();
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopyMessage("✂️ Teksten i aktiv fane er kopiert.");
        setTimeout(() => setCopyMessage(null), 3000);
      } catch {
        setCopyMessage("Kunne ikke kopiere til utklippstavlen.");
        setTimeout(() => setCopyMessage(null), 3000);
      }
    }

   const primaryButtonLabel = isShopifyMode
    ? "Generer tekst basert på Shopify-produktet"
    : "Generer tekst basert på input";

  return (
    <div className="space-y-3">
      {/* Brand-linje – beholdt som før */}
      <BrandIdentityBar
        brand={brand}
        source={brandSource}
        loading={brandLoading}
      />

      {/* Kompakt “verktøykort” for Shopify + match-score */}
      <div className="rounded-2xl border border-phorium-off/40 bg-phorium-dark px-4 py-3 text-[11px] space-y-3">
        {/* Shopify-produktstatus / tone-analyse – vises bare i Shopify-modus */}
        {isShopifyMode && (
          <>
            {productLoading && (
              <p className="text-phorium-light/80">
                Henter produktdata fra Shopify …
              </p>
            )}

            {productError && (
              <p className="text-[11px] text-red-300">
                Klarte ikke å hente produkt: {productError}
              </p>
            )}

            {linkedProduct && !productLoading && !productError && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-phorium-light/60">
                      <Store className="h-3.5 w-3.5" />
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

                <div className="border-t border-phorium-off/20 pt-2 mt-2">
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
                      {toneLoading ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Analyserer tone…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Analyser tone
                        </span>
                      )}
                    </button>
                  </div>

                  {toneError && (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-red-300">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {toneError}
                    </p>
                  )}

                  {toneAnalysis && (
                    <div className="mt-2 rounded-xl border border-phorium-off/25 bg-phorium-dark/70 p-3 text-[11px] text-phorium-light/90 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-phorium-light/60">
                            Toneanalyse
                          </div>
                          <div className="text-[12px] font-semibold text-phorium-accent">
                            {toneAnalysis.tone}
                          </div>
                        </div>
                        <div className="text-[10px] text-phorium-light/60">
                          Sikkerhet: {Math.round(toneAnalysis.confidence * 100)}%
                        </div>
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
          </>
        )}

        {/* Match-score – alltid tilgjengelig, men nå i samme kort */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            isShopifyMode ? "border-t border-phorium-off/20 pt-2" : ""
          }`}
        >
          <div className="text-[11px] text-phorium-light/70">
            Matcher teksten brandprofilen din?
          </div>
          <button
            type="button"
            onClick={handleMatchScore}
            disabled={matchLoading}
            className="btn btn-xs btn-secondary"
          >
            {matchLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyserer…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Beregn match-score
              </span>
            )}
          </button>
        </div>

        {matchError && (
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-red-300">
            <AlertCircle className="h-3.5 w-3.5" />
            {matchError}
          </p>
        )}

        {matchScore && (
          <div className="mt-2 rounded-xl border border-phorium-off/25 bg-phorium-dark/70 p-3 text-[11px] text-phorium-light/90 space-y-2">
            <div className="text-[13px] font-semibold text-phorium-accent">
              Match-score: {matchScore.score}%
            </div>

            {matchScore.strengths.length > 0 && (
              <>
                <p className="text-[10px] text-phorium-light/60">Styrker:</p>
                <ul className="list-disc pl-4">
                  {matchScore.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {matchScore.weaknesses.length > 0 && (
              <>
                <p className="text-[10px] text-phorium-light/60">Svakheter:</p>
                <ul className="list-disc pl-4">
                  {matchScore.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {matchScore.recommendations && (
              <p className="text-[11px] text-phorium-light/85">
                {matchScore.recommendations}
              </p>
            )}
          </div>
        )}
      </div>

        {/* Hovedkort: input + resultat */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)]">
          {/* Input-side */}
          <div className="space-y-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-phorium-light/60">
                  Produktinformasjon
                </div>
                <p className="text-[11px] text-phorium-light/60">
                  Gi Phorium det viktigste – resten bygger vi for deg.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-phorium-light/75">
                Produktnavn
              </label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="F.eks. «Rustfri vannflaske 750 ml»"
                className="w-full rounded-xl border border-phorium-off/35 bg-white text-[#0f1512] px-3 py-2 text-[12px] placeholder:text-[#6c7a75] focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/20"
              />

            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="text-[11px] text-phorium-light/75">
                  Kategori
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="F.eks. «Kjøkken & Husholdning»"
                  className="w-full rounded-xl border border-phorium-off/35 bg-white text-[#0f1512] px-3 py-2 text-[12px] placeholder:text-[#6c7a75] focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/20"
                />

              </div>
              <div>
                <label className="text-[11px] text-phorium-light/75">
                  Ønsket tone
                </label>
                <input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="F.eks. «Tydelig og trygg», «Leken og uformell»"
                  className="w-full rounded-xl border border-phorium-off/35 bg-white text-[#0f1512] px-3 py-2 text-[12px] placeholder:text-[#6c7a75] focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/20"
                />

              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] text-phorium-light/70">
              <button
                type="button"
                onClick={() => setTone("Tydelig, enkel og trygg")}
                className="btn btn-xs btn-ghost"
              >
                Tydelig & trygg
              </button>
              <button
                type="button"
                onClick={() => setTone("Vennlig, uformell og leken")}
                className="btn btn-xs btn-ghost"
              >
                Vennlig & leken
              </button>
              <button
                type="button"
                onClick={() =>
                  setTone("Kort, direkte og konverteringsfokusert")
                }
                className="btn btn-xs btn-ghost"
              >
                Kort & salgsfokusert
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] text-phorium-light/65">
              <span>Tonetriks:</span>
              <button
                type="button"
                onClick={() => setTone("Rolig, varm og tillitsvekkende")}
                className="btn btn-xs btn-ghost"
              >
                Rolig
              </button>
              <button
                type="button"
                onClick={() =>
                  setTone("Engasjerende, energisk og litt uformell")
                }
                className="btn btn-xs btn-ghost"
              >
                Mer energi
              </button>
              <button
                type="button"
                onClick={() =>
                  setTone("Ekspert, faglig trygg og profesjonell")
                }
                className="btn btn-xs btn-ghost"
              >
                Mer ekspert
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-[10px] text-phorium-light/60">
                <span>Lengde:</span>
                <button
                  type="button"
                  onClick={() =>
                    setTone(
                      (prev) =>
                        prev ||
                        "Kort og konsis, med fokus på det viktigste for kunden.",
                    )
                  }
                  className="btn btn-xs btn-ghost"
                >
                  Kortere
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTone(
                      (prev) =>
                        prev ||
                        "Litt mer forklarende, med konkrete fordeler og eksempler.",
                    )
                  }
                  className="btn btn-xs btn-ghost"
                >
                  Lengre
                </button>
              </div>
            </div>

            <button
              onClick={handlePrimaryClick}
              disabled={
                loading ||
                (!isShopifyMode && !productName.trim()) ||
                (!!error && error.toLowerCase().includes("tom for kreditter"))
              }
              className="btn btn-lg btn-primary w-full disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Genererer tekst …
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  {primaryButtonLabel}
                </span>
              )}
            </button>



            <div className="mt-2 flex items-center justify-between text-[10px] text-phorium-light/55">
              <p>
                Tips: Velg tone først, så generer. Prøv gjerne flere varianter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setProductName("");
                  setCategory("");
                  setTone("");
                  setResult(null);
                  setError(null);
                  setMatchScore(null);
                  setToneAnalysis(null);
                  setJustGenerated(false);
                }}
                className="inline-flex items-center gap-1 text-[10px] text-phorium-light/60 hover:text-phorium-light"
              >
                <X className="h-3 w-3" />
                Nullstill felt
              </button>
            </div>
          </div>

          {/* Resultat-side */}
          <div className="space-y-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-phorium-light">
                <FileText className="h-4 w-4" />
                Resultat
              </h3>
            </div>

            {/* Tabs */}
            <div className="mb-2 inline-flex rounded-full border border-phorium-off/35 bg-phorium-dark p-1 text-[11px]">
              <TabButton
                active={activeTab === "product"}
                onClick={() => setActiveTab("product")}
              >
                Produkttekst
              </TabButton>
              <TabButton
                active={activeTab === "seo"}
                onClick={() => setActiveTab("seo")}
              >
                SEO
              </TabButton>
              <TabButton
                active={activeTab === "ads"}
                onClick={() => setActiveTab("ads")}
              >
                Annonser
              </TabButton>
              <TabButton
                active={activeTab === "some"}
                onClick={() => setActiveTab("some")}
              >
                SoMe
              </TabButton>
            </div>

            {/* Actions */}
            <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
              {isShopifyMode && result && (
                <button
                  type="button"
                  onClick={handleSaveToShopify}
                  disabled={saving}
                  className="btn btn-sm btn-primary disabled:opacity-60"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Lagrer …
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      Lagre i Shopify
                    </span>
                  )}
                </button>
              )}

              {result && (
                <button
                  type="button"
                  onClick={handleCopyActiveTab}
                  className="btn btn-sm btn-secondary"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Copy className="h-3.5 w-3.5" />
                    Kopier teksten i aktiv fane
                  </span>
                </button>
              )}

              {isShopifyMode && shopDomain && (
                <a
                  href={`https://${shopDomain}/admin/products/${productIdFromUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-ghost"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5" />
                    Åpne i Shopify
                  </span>
                </a>
              )}
            </div>

            {(saveMessage || copyMessage) && (
              <p className="mb-2 text-[11px] text-phorium-light/70">
                {saveMessage && <span>{saveMessage}</span>}
                {saveMessage && copyMessage && <span> · </span>}
                {copyMessage && <span>{copyMessage}</span>}
              </p>
            )}

            <div className="min-h-[230px] rounded-xl border border-phorium-off/30 bg-[#F7F2E8] px-4 py-3 text-[13px] text-phorium-dark">
              {loading && (
                <div className="flex h-full items-center justify-center">
                  <PhoriumLoader label="Genererer tekst … finpusser ordvalg, struktur og SEO" />
                </div>
              )}

              {!loading && !result && !error && (
                <p className="text-[12px] text-phorium-dark/70">
                  Når du genererer, får du produkttekst, SEO, annonsetekster og
                  SoMe-tekst samlet her.
                </p>
              )}

              {!loading && error && (
                <p className="flex items-center gap-2 text-[12px] text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </p>
              )}

              <AnimatePresence mode="wait">
                {!loading && result && (
                  <motion.div
                    key={activeTab + (result.title || "")}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {activeTab === "product" && (
                      <>
                        {result.title && (
                          <h4 className="text-[14px] font-semibold">
                            {result.title}
                          </h4>
                        )}
                        {result.shortDescription && (
                          <p className="text-[13px] font-medium">
                            {result.shortDescription}
                          </p>
                        )}
                        {result.description && (
                          <p className="text-[13px] whitespace-pre-line">
                            {result.description}
                          </p>
                        )}
                        {Array.isArray(result.bullets) &&
                          result.bullets.length > 0 && (
                            <ul className="mt-2 list-disc pl-5 text-[13px]">
                              {result.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          )}
                      </>
                    )}

                    {activeTab === "seo" && (
                      <div className="space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold">
                            SEO-tittel
                          </div>
                          <p className="text-[13px]">
                            {result.meta_title || "–"}
                          </p>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold">
                            Meta-beskrivelse
                          </div>
                          <p className="text-[13px]">
                            {result.meta_description || "–"}
                          </p>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold">
                            Tags
                          </div>
                          <p className="text-[13px]">
                            {Array.isArray(result.tags) &&
                              result.tags.length > 0
                              ? result.tags.join(", ")
                              : "–"}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === "ads" && (
                      <div className="space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold">
                            Primær annonsetekst
                          </div>
                          <p className="text-[13px]">
                            {result.ad_primary || "–"}
                          </p>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold">
                            Annonseoverskrift
                          </div>
                          <p className="text-[13px]">
                            {result.ad_headline || "–"}
                          </p>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold">
                            Annonsebeskrivelse
                          </div>
                          <p className="text-[13px]">
                            {result.ad_description || "–"}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === "some" && (
                      <div className="space-y-2">
                        <div>
                          <div className="text-[11px] font-semibold">
                            Caption
                          </div>
                          <p className="text-[13px]">
                            {result.social_caption || "–"}
                          </p>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold">
                            Hashtags
                          </div>
                          <p className="text-[13px]">
                            {Array.isArray(result.social_hashtags) &&
                              result.social_hashtags.length > 0
                              ? result.social_hashtags
                                .map((h) => `#${h}`)
                                .join(" ")
                              : "–"}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Historikk */}
            <div className="mt-4 border-t border-phorium-off/30 pt-4">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-phorium-accent">
                    <History className="h-4 w-4" />
                    Historikk (tekststudio)
                  </h2>
                  <p className="text-[11px] text-phorium-light/65">
                    Viser de siste genererte tekstpakkene – uansett produkt.
                  </p>
                </div>
              </div>

              {history.length === 0 && (
                <p className="text-[12px] text-phorium-light/70">
                  Når du genererer tekst, dukker de siste forslagene dine opp
                  her. Du kan åpne dem igjen og gjenbruke tone og struktur.
                </p>
              )}

              {history.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-2 rounded-xl border border-phorium-off/30 bg-phorium-dark/70 p-3 text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-phorium-light/60">
                            {item.source === "shopify"
                              ? "Fra Shopify-produkt"
                              : "Manuell input"}
                          </div>
                          <div className="text-[12px] font-semibold text-phorium-accent">
                            {item.result.title || item.productName}
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-phorium-light/60">
                          {new Date(item.createdAt).toLocaleDateString("nb-NO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </div>
                      </div>

                      {item.result.shortDescription && (
                        <p className="line-clamp-2 text-[11px] text-phorium-light/85">
                          {item.result.shortDescription}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadFromHistory(item)}
                          className="btn btn-sm btn-secondary"
                        >
                          Gjenåpne
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyToneFromHistory(item)}
                          className="btn btn-sm btn-ghost"
                        >
                          Bruk tone/stil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function TabButton({
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
        className={active ? "btn-tab btn-tab-active" : "btn-tab"}
      >
        {children}
      </button>
    );
  }
