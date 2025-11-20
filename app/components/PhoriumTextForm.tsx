"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PhoriumLoader from "./PhoriumLoader";
// Ikoner kan brukes senere ved behov
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

export default function PhoriumTextForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("product");

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

  // --- Manuell generering (uten Shopify-produkt) ---
  async function handleGenerateManual() {
    if (!productName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaveMessage(null);
    setCopyMessage(null);

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
        setResult({
          title: data.data.title,
          description: data.data.description,
          meta_title: data.data.meta_title,
          meta_description: data.data.meta_description,
        });
        setActiveTab("product");
        setJustGenerated(true);
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
          tone: tone || "nøytral",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Kunne ikke generere tekst.");
      }

      const r = data.result;

      const mapped: GeneratedResult = {
        title: linkedProduct?.title || productName || "Generert produkttekst",
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
    } catch (err: any) {
      setError(err?.message || "Uventet feil ved generering.");
    } finally {
      setLoading(false);
    }
  }

  const primaryButtonLabel = isShopifyMode
    ? "Generer tekst fra Shopify-produkt"
    : "Generer tekst";

  const handlePrimaryClick = isShopifyMode
    ? handleGenerateFromProduct
    : handleGenerateManual;

  // Tone-presets
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

  // --- Tekst som skal lagres i Shopify ---
  function buildShopifyPayload() {
    if (!result) return null;

    return {
      title: result.title || productName,
      bodyHtml: result.description || "",
      seoTitle: result.meta_title || result.title || "",
      seoDescription: result.meta_description || result.shortDescription || "",
    };
  }

  // --- Lagre til Shopify (bruker egen API-route) ---
  async function handleSaveToShopify() {
    if (!productIdFromUrl || !result) return;

    const payload = buildShopifyPayload();
    if (!payload) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/shopify/save-product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(productIdFromUrl),
          ...payload,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Serverfeil (${res.status}): ${text || "Ukjent feil ved lagring"}`,
        );
      }

      const data = await res.json();
      // evt. sjekk data.success her hvis du vil

      setSaveMessage("✅ Tekst er lagret i Shopify.");
    } catch (err: any) {
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
        "Caption:",
        result.social_caption || "",
        "",
        "Hashtags:",
        Array.isArray(result.social_hashtags) && result.social_hashtags.length > 0
          ? result.social_hashtags
              .map((h) => (h.startsWith("#") ? h : `#${h}`))
              .join(" ")
          : "",
      ]
        .join("\n")
        .trim();
    }

    return "";
  }

  async function handleCopyActiveTab() {
    try {
      const text = getTextForActiveTab();
      if (!text) return;
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        setCopyMessage(
          "Kopiering støttes ikke i denne nettleseren – marker teksten manuelt.",
        );
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopyMessage("Tekst fra aktiv fane er kopiert.");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Klarte ikke å kopiere – marker og kopier manuelt.");
    }
  }

  return (
    <div className="mt-4 space-y-4">
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

                <Link href="/studio/produkter" className="btn btn-sm btn-secondary">
                  Bytt produkt
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {!isShopifyMode && (
        <div className="rounded-2xl border border-phorium-off/25 bg-phorium-dark/70 px-4 py-3 text-[12px]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold text-phorium-light/80">
                Ingen Shopify-produkt valgt
              </div>
              <div className="text-[11px] text-phorium-light/60">
                Velg et produkt fra nettbutikken din for å få auto-utfylte
                forslag.
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/studio/produkter" className="btn btn-sm btn-primary">
                Velg produkt
              </Link>
              <Link
                href="/studio/koble-nettbutikk"
                className="btn btn-sm btn-secondary"
              >
                Koble nettbutikk
              </Link>
            </div>
          </div>
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
                className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-phorium-dark/40 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
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
              className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-phorium-dark/40 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
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
              className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-phorium-dark/40 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
            />
          </div>

          {/* Refine-rad */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="mr-1 text-phorium-light/55">
              Juster tone med ett klikk:
            </span>
            <button
              type="button"
              onClick={() => setTonePreset("kortere")}
              className="btn btn-sm btn-ghost"
            >
              Kortere
            </button>
            <button
              type="button"
              onClick={() => setTonePreset("lengre")}
              className="btn btn-sm btn-ghost"
            >
              Lengre
            </button>
            <button
              type="button"
              onClick={() => setTonePreset("teknisk")}
              className="btn btn-sm btn-ghost"
            >
              Mer teknisk
            </button>
            <button
              type="button"
              onClick={() => setTonePreset("leken")}
              className="btn btn-sm btn-ghost"
            >
              Mer leken
            </button>
          </div>

          <button
            onClick={handlePrimaryClick}
            disabled={loading || (!isShopifyMode && !productName.trim())}
            className="btn btn-lg btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Genererer tekst …" : primaryButtonLabel}
          </button>

          <p className="mt-2 text-[10px] text-phorium-light/55">
            Tips: Velg tone først, så generer. Prøv gjerne flere varianter.
          </p>
        </div>

        {/* Høyre side – resultat m. tabs, lagre, kopi */}
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

          {/* Action-knapper: lagre / kopier / åpne i Shopify */}
          <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
            {isShopifyMode && result && (
              <button
                type="button"
                onClick={handleSaveToShopify}
                disabled={saving}
                className="btn btn-sm btn-primary disabled:opacity-60"
              >
                {saving ? "Lagrer …" : "Lagre i Shopify"}
              </button>
            )}

            {result && (
              <button
                type="button"
                onClick={handleCopyActiveTab}
                className="btn btn-sm btn-secondary"
              >
                Kopier teksten i aktiv fane
              </button>
            )}

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
                          className="rounded-md px-2 py-1 -mx-2"
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
                          {Array.isArray(result.tags) && result.tags.length > 0
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
                                .map((h) => (h.startsWith("#") ? h : `#${h}`))
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
      className={active ? "btn-tab btn-tab-active" : "btn-tab"}
    >
      {children}
    </button>
  );
}
