"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  History as HistoryIcon,
} from "lucide-react";
import PhoriumLoader from "./PhoriumLoader";

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
  createdAt: string;
  mode: "manual" | "shopify";
  productId?: number;
  productTitle?: string;
  tone?: string;
  category?: string;
  syncedToShopify: boolean;
  result: GeneratedResult;
};

const HISTORY_KEY = "phorium_text_history_v1";

export default function PhoriumTextForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("product");

  // 🔹 Lagring til Shopify
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // 🔹 Historikk
  const [history, setHistory] = useState<TextHistoryItem[]>([]);

  // Shopify-kontekst
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");
  const isShopifyMode = !!productIdFromUrl;

  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Last historikk fra localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      // ignorer
    }
  }, []);

  // Lagre historikk til localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    } catch {
      // ignorer
    }
  }, [history]);

  // Hent Shopify-produkt hvis vi har productId
  useEffect(() => {
    async function fetchProduct() {
      if (!productIdFromUrl) return;

      try {
        setProductLoading(true);
        setProductError(null);

        const res = await fetch(`/api/shopify/product?id=${productIdFromUrl}`, {
          cache: "no-store",
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Kunne ikke hente produkt.");
        }

        setLinkedProduct(data.product);

        if (data.product?.title) {
          setProductName(data.product.title);
        }
      } catch (err: any) {
        setProductError(err?.message || "Feil ved henting av produkt.");
      } finally {
        setProductLoading(false);
      }
    }

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdFromUrl]);

  useEffect(() => {
    if (!justGenerated) return;
    const t = setTimeout(() => setJustGenerated(false), 1200);
    return () => clearTimeout(t);
  }, [justGenerated]);

  // Hjelper: legg til historikk-entry
  function pushHistory(entry: Omit<TextHistoryItem, "id" | "createdAt">) {
    const newItem: TextHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 20));
  }

  // --- Manuell generering (uten Shopify-produkt) ---
  async function handleGenerateManual() {
    if (!productName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
    setIsSynced(false);

    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          tone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Ukjent feil");
      } else {
        const baseResult: GeneratedResult = {
          title: data.data.title,
          description: data.data.description,
          meta_title: data.data.meta_title,
          meta_description: data.data.meta_description,
        };

        setResult(baseResult);
        setActiveTab("product");
        setJustGenerated(true);
        pushHistory({
          mode: "manual",
          productId: undefined,
          productTitle: productName,
          tone,
          category,
          result: baseResult,
          syncedToShopify: false,
        });
      }
    } catch {
      setError("Kunne ikke kontakte Phorium Core.");
    } finally {
      setLoading(false);
    }
  }

  // --- Generering basert på Shopify-produkt ---
  async function handleGenerateFromProduct() {
    if (!productIdFromUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
    setIsSynced(false);

    try {
      const res = await fetch("/api/shopify/generate-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productIdFromUrl),
          tone: tone || "nøytral",
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

      pushHistory({
        mode: "shopify",
        productId: Number(productIdFromUrl),
        productTitle:
          linkedProduct?.title || productName || "Ukjent produkt",
        tone,
        category,
        result: mapped,
        syncedToShopify: false,
      });
    } catch (err: any) {
      setError(err?.message || "Uventet feil ved generering.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 LAGRE TIL SHOPIFY
  async function handleSaveToShopify() {
    if (!productIdFromUrl || !result) return;

    try {
      setSaveLoading(true);
      setSaveMessage(null);

      const res = await fetch("/api/shopify/save-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productIdFromUrl),
          result,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setSaveMessage(
          data.error || "Kunne ikke lagre til Shopify. Prøv igjen.",
        );
        setIsSynced(false);
      } else {
        setSaveMessage("Teksten er lagret i Shopify-produktet.");
        setIsSynced(true);

        // Marker siste relevante historikk-post som synket
        setHistory((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex(
            (h) =>
              h.mode === "shopify" &&
              h.productId === Number(productIdFromUrl),
          );
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], syncedToShopify: true };
          }
          return copy;
        });
      }
    } catch (err: any) {
      setSaveMessage(
        err?.message || "Uventet feil ved lagring til Shopify.",
      );
      setIsSynced(false);
    } finally {
      setSaveLoading(false);
    }
  }

  const primaryButtonLabel = isShopifyMode
    ? "Generer tekst fra Shopify-produkt"
    : "Generer tekst";

  const handlePrimaryClick = isShopifyMode
    ? handleGenerateFromProduct
    : handleGenerateManual;

  // små helpers for refine-raden
  function setTonePreset(preset: "kortere" | "lengre" | "teknisk" | "leken") {
    if (preset === "kortere") {
      setTone("Kort, konsis og tydelig. Unngå unødvendige ord.");
    } else if (preset === "lengre") {
      setTone(
        "Litt lengre og mer forklarende, men fortsatt lettlest og oversiktlig.",
      );
    } else if (preset === "teknisk") {
      setTone(
        "Mer teknisk og faglig, men fortsatt forståelig for vanlige kunder.",
      );
    } else if (preset === "leken") {
      setTone(
        "Litt leken og uformell tone, men ikke barnslig eller useriøs.",
      );
    }
  }

  // Liten helper for å vise fin dato i historikk
  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("nb-NO", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="mt-4 space-y-6">
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

          {linkedProduct && !productLoading && (
            <div className="flex items-center justify-between gap-3">
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
              {linkedProduct.image?.src && (
                <img
                  src={linkedProduct.image.src}
                  alt={linkedProduct.title}
                  className="h-12 w-12 rounded-lg border border-phorium-off/40 object-cover"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid: input venstre, resultat høyre */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] text-phorium-dark px-3 py-2 text-[13px] placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
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
              placeholder='F.eks. «Kjøkken & servering», «Hund», «Interiør» …'
              className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] text-phorium-dark px-3 py-2 text-[13px] placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-[11px] text-phorium-light/70">
              Tone
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="F.eks. moderne, teknisk, humoristisk, eksklusiv …"
              className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] text-phorium-dark px-3 py-2 text-[13px] placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
            />
          </div>

          {/* Refine-rad */}
          <div className="mb-3 flex flex-wrap gap-2 text-[10px]">
            <span className="mr-1 text-phorium-light/55">
              Juster tone med ett klikk:
            </span>
            <button
              type="button"
              onClick={() => setTonePreset("kortere")}
              className="rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1 text-phorium-light/85 hover:border-phorium-accent hover:text-phorium-accent"
            >
              Kortere
            </button>
            <button
              type="button"
              onClick={() => setTonePreset("lengre")}
              className="rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1 text-phorium-light/85 hover:border-phorium-accent hover:text-phorium-accent"
            >
              Lengre
            </button>
            <button
              type="button"
              onClick={() => setTonePreset("teknisk")}
              className="rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1 text-phorium-light/85 hover:border-phorium-accent hover:text-phorium-accent"
            >
              Mer teknisk
            </button>
            <button
              type="button"
              onClick={() => setTonePreset("leken")}
              className="rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1 text-phorium-light/85 hover:border-phorium-accent hover:text-phorium-accent"
            >
              Mer leken
            </button>
          </div>

          <button
            onClick={handlePrimaryClick}
            disabled={loading || (!isShopifyMode && !productName.trim())}
            className="w-full rounded-full bg-phorium-accent px-6 py-2.5 text-[13px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90 disabled:opacity-60"
          >
            {loading ? "Genererer tekst …" : primaryButtonLabel}
          </button>

          <p className="mt-2 text-[10px] text-phorium-light/55">
            Tips: Velg tone først, så generer. Prøv gjerne flere varianter.
          </p>
        </div>

        {/* Høyre side – resultat m. tabs + lagre-knapp + status */}
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-5 py-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-phorium-light">
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

          {/* Diff / sync-indikator */}
          {isShopifyMode && result && !loading && !error && (
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px]">
                {isSynced ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-200/90">
                      Tekst er oppdatert i Shopify.
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-amber-100/85">
                      Endringer er ikke lagret i Shopify ennå.
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveToShopify}
                disabled={saveLoading}
                className="rounded-full border border-phorium-accent/70 bg-phorium-accent px-3.5 py-1.5 text-[11px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90 disabled:opacity-60"
              >
                {saveLoading ? "Lagrer …" : "Lagre i Shopify"}
              </button>
            </div>
          )}

          {saveMessage && (
            <div className="mb-2 flex items-center gap-2 text-[10px]">
              {saveMessage.includes("lagret") ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-200/90">{saveMessage}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-red-200/90">{saveMessage}</span>
                </>
              )}
            </div>
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
                SoMe-forslag her – organisert i faner.
              </p>
            )}

            {!loading && error && (
              <p className="text-[12px] text-red-600">{error}</p>
            )}

            <AnimatePresence mode="wait">
              {!loading && result && !error && (
                <motion.div
                  key={activeTab + (result.title || "")}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.22, delay: 0.03 }}
                  className="space-y-2"
                >
                  {/* Produkt-tab */}
                  {activeTab === "product" && (
                    <>
                      {result.title && (
                        <p className="text-[14px] font-semibold text-phorium-dark">
                          {result.title}
                        </p>
                      )}

                      {result.shortDescription && (
                        <p className="text-[12px] text-phorium-dark/80">
                          {result.shortDescription}
                        </p>
                      )}

                      {result.description && (
                        <motion.div
                          initial={{
                            backgroundColor: "rgba(200,183,122,0.18)",
                          }}
                          animate={{
                            backgroundColor: justGenerated
                              ? "rgba(200,183,122,0.08)"
                              : "rgba(0,0,0,0)",
                          }}
                          transition={{ duration: 0.8 }}
                          className="-mx-2 rounded-md px-2 py-1"
                        >
                          <p>{result.description}</p>
                        </motion.div>
                      )}

                      {Array.isArray(result.bullets) &&
                        result.bullets.length > 0 && (
                          <div className="pt-2">
                            <p className="mb-1 text-[11px] font-semibold text-phorium-dark/80">
                              Bullet points:
                            </p>
                            <ul className="list-disc pl-4 text-[12px]">
                              {result.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </>
                  )}

                  {/* SEO-tab */}
                  {activeTab === "seo" && (
                    <div className="space-y-2 text-[12px]">
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          SEO-tittel
                        </p>
                        <p>{result.meta_title || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Meta-beskrivelse
                        </p>
                        <p>{result.meta_description || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Tags
                        </p>
                        <p>
                          {Array.isArray(result.tags) &&
                          result.tags.length > 0
                            ? result.tags.join(", ")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ads-tab */}
                  {activeTab === "ads" && (
                    <div className="space-y-3 text-[12px]">
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Primær annonsetekst
                        </p>
                        <p>{result.ad_primary || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Annonseoverskrift
                        </p>
                        <p>{result.ad_headline || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Annonsebeskrivelse
                        </p>
                        <p>{result.ad_description || "—"}</p>
                      </div>
                    </div>
                  )}

                  {/* SoMe-tab */}
                  {activeTab === "some" && (
                    <div className="space-y-3 text-[12px]">
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Caption
                        </p>
                        <p>{result.social_caption || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-phorium-dark/80">
                          Hashtags
                        </p>
                        <p>
                          {Array.isArray(result.social_hashtags) &&
                          result.social_hashtags.length > 0
                            ? result.social_hashtags
                                .map((h) =>
                                  h.startsWith("#") ? h : `#${h}`,
                                )
                                .join(" ")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Historikk (siste 5) */}
      <div className="border-t border-phorium-off/30 pt-4">
        <div className="mb-2 flex items-center gap-2 text-[12px] text-phorium-light/85">
          <HistoryIcon className="h-3.5 w-3.5 text-phorium-accent" />
          <span>Historikk (siste 5 genereringer)</span>
        </div>

        {history.length === 0 && (
          <p className="text-[11px] text-phorium-light/60">
            Når du genererer tekst, dukker de siste forslagene opp her for rask gjenbruk.
          </p>
        )}

        {history.length > 0 && (
          <div className="mt-1 grid gap-2 md:grid-cols-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 px-3 py-2 text-[11px]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="font-semibold text-phorium-light/90 line-clamp-1">
                    {item.productTitle || item.result.title || "Uten navn"}
                  </div>
                  <span className="text-[10px] text-phorium-light/50">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px] text-phorium-light/65">
                  <span>
                    {item.mode === "shopify" ? "Shopify-produkt" : "Manuell"}
                    {item.tone ? ` · ${item.tone}` : ""}
                  </span>
                  {item.syncedToShopify ? (
                    <span className="inline-flex items-center gap-1 text-emerald-300/90">
                      <CheckCircle2 className="h-3 w-3" />
                      Lagret i Shopify
                    </span>
                  ) : item.mode === "shopify" ? (
                    <span className="inline-flex items-center gap-1 text-amber-200/90">
                      <Clock className="h-3 w-3" />
                      Ikke lagret
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
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
  children: React.ReactNode;
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
