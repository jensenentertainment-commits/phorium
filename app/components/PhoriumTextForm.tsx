"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PhoriumLoader from "./PhoriumLoader";

export default function PhoriumTextForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shopify-kontekst
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");
  const isShopifyMode = !!productIdFromUrl;

  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

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

  // Manuell generering (uten Shopify-produkt)
  async function handleGenerateManual() {
    if (!productName.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

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
        setResult(data.data);
      }
    } catch {
      setError("Kunne ikke kontakte Phorium Core.");
    } finally {
      setLoading(false);
    }
  }

  // Generering basert på Shopify-produkt
  async function handleGenerateFromProduct() {
    if (!productIdFromUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);

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

      setResult({
        title:
          linkedProduct?.title ||
          productName ||
          "Generert produkttekst",
        description: r.description || "",
        meta_title: r.seoTitle || "",
        meta_description: r.metaDescription || "",
        bullets: r.bullets || [],
        tags: r.tags || [],
      });
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

  return (
    <div className="mt-4">
      {/* Shopify-produkt header */}
      {isShopifyMode && (
        <div className="mb-4 rounded-2xl border border-phorium-off/35 bg-phorium-dark px-4 py-3 text-[12px]">
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
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/90 px-5 py-4">
          <h3 className="mb-2 text-sm font-semibold text-phorium-light">
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
                placeholder="F.eks. «Rustfri termokopp 1L – sort»"
                className="w-full rounded-xl border border-phorium-off/40 bg-phorium-surface px-3 py-2 text-[13px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
              />
            </div>
          )}

          {isShopifyMode && (
            <p className="mb-3 text-[11px] text-phorium-light/65">
              Produktnavn er låst til:{" "}
              <span className="font-semibold text-phorium-accent">
                {productName || linkedProduct?.title || "Ukjent produkt"}
              </span>
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
              placeholder="F.eks. «Kjøkken & servering», «Hund» osv."
              className="w-full rounded-xl border border-phorium-off/40 bg-phorium-surface px-3 py-2 text-[13px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
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
              className="w-full rounded-xl border border-phorium-off/40 bg-phorium-surface px-3 py-2 text-[13px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/18"
            />
          </div>

          <button
            onClick={handlePrimaryClick}
            disabled={loading || (!isShopifyMode && !productName.trim())}
            className="w-full rounded-full bg-phorium-accent px-6 py-2.5 text-[13px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90 disabled:opacity-60"
          >
            {loading ? "Genererer tekst …" : primaryButtonLabel}
          </button>

          <p className="mt-2 text-[10px] text-phorium-light/55">
            Tips: Når du åpner fra Shopify-produktlisten, fylles mye ut
            automatisk.
          </p>
        </div>

        {/* Høyre side – resultat */}
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/90 px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-phorium-light">
              Resultat
            </h3>
          </div>

          <div className="min-h-[220px] rounded-xl border border-phorium-off/35 bg-phorium-surface/95 px-4 py-3 text-[13px] text-phorium-light">
            {loading && (
              <div className="flex h-full items-center justify-center">
                <PhoriumLoader label="Genererer tekst … finpusser ordvalg og SEO" />
              </div>
            )}

            {!loading && !result && !error && (
              <p className="text-[12px] text-phorium-light/70">
                Når du genererer, vises ferdig produkttekst, bullet points og
                meta her – klar til å lime inn i Shopify.
              </p>
            )}

            {!loading && error && (
              <p className="text-[12px] text-red-300">{error}</p>
            )}

            <AnimatePresence>
              {!loading && result && !error && (
                <motion.div
                  key={result.title || "result"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-2"
                >
                  {result.title && (
                    <p className="text-[14px] font-semibold text-phorium-accent">
                      {result.title}
                    </p>
                  )}

                  {result.description && <p>{result.description}</p>}

                  {Array.isArray(result.bullets) &&
                    result.bullets.length > 0 && (
                      <div className="pt-2">
                        <p className="mb-1 text-[11px] font-semibold text-phorium-light/70">
                          Bullet points:
                        </p>
                        <ul className="list-disc pl-4 text-[12px] text-phorium-light/90">
                          {result.bullets.map((b: string, i: number) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className="mt-3 border-t border-phorium-off/30 pt-2 text-[11px] text-phorium-light/70 space-y-1">
                    {result.meta_title && (
                      <p>
                        <span className="font-semibold">Meta-tittel: </span>
                        {result.meta_title}
                      </p>
                    )}
                    {result.meta_description && (
                      <p>
                        <span className="font-semibold">
                          Meta-beskrivelse:{" "}
                        </span>
                        {result.meta_description}
                      </p>
                    )}
                    {Array.isArray(result.tags) && result.tags.length > 0 && (
                      <p>
                        <span className="font-semibold">Tags: </span>
                        {result.tags.join(", ")}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
