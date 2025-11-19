"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PhoriumTextForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Shopify-kontekst ---
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");

  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  const isShopifyMode = !!productIdFromUrl;

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

        // Lås produktnavnet til Shopify-tittel
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

  // --- Manuell generering (uten Shopify-produkt) ---
  async function handleGenerateManual() {
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
      setError("Kunne ikke kontakte API-et.");
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

  return (
    <div className="max-w-2xl w-full mx-auto bg-[#2A2E26]/95 border border-[#A39C84]/40 rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[#ECE8DA]">
        Phorium Tekstgenerator
      </h2>
      <p className="text-[12px] text-[#ECE8DA]/70">
        {isShopifyMode
          ? "Du har åpnet et produkt fra Shopify. Juster tone og kategori – Phorium bruker produktdata direkte."
          : "Fyll inn produktnavn, kategori og tone – Phorium lager en ferdig tekstpakke på norsk."}
      </p>

      {/* 🔹 Produktkort når vi kommer fra Shopify */}
      {isShopifyMode && (
        <div className="rounded-xl border border-[#A39C84]/40 bg-[#11140F] px-3 py-3 text-[12px] mb-1.5">
          {productLoading && (
            <p className="text-[#ECE8DA]/80">
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
                <div className="text-[11px] text-[#ECE8DA]/60">
                  Jobber mot produkt:
                </div>
                <div className="text-[13px] font-semibold text-[#C8B77A]">
                  {linkedProduct.title}
                </div>
                <div className="text-[11px] text-[#ECE8DA]/60">
                  Handle: {linkedProduct.handle} · ID: {linkedProduct.id}
                </div>
              </div>
              {linkedProduct.image?.src && (
                <img
                  src={linkedProduct.image.src}
                  alt={linkedProduct.title}
                  className="h-12 w-12 rounded-lg border border-[#A39C84]/40 object-cover"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* FELTENE */}
      {!isShopifyMode && (
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Produktnavn (obligatorisk)"
          className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
        />
      )}

      {isShopifyMode && (
        <div className="text-[11px] text-[#ECE8DA]/55">
          Produktnavn er låst til:{" "}
          <span className="text-[#ECE8DA] font-medium">
            {productName || linkedProduct?.title || "Ukjent produkt"}
          </span>
        </div>
      )}

      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Kategori (valgfritt)"
        className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
      />

      <input
        type="text"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        placeholder="Tone (f.eks. moderne, teknisk, humoristisk)"
        className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
      />

      {/* Knapper – avhenger av om vi har Shopify-produkt */}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        {!isShopifyMode && (
          <button
            onClick={handleGenerateManual}
            disabled={loading || !productName}
            className="w-full py-2.5 rounded-full bg-[#C8B77A] text-[#2A2E26] text-sm font-semibold hover:bg-[#E3D8AC] transition disabled:opacity-60"
          >
            {loading ? "Genererer..." : "Generer tekst"}
          </button>
        )}

        {isShopifyMode && (
          <>
            <button
              onClick={handleGenerateFromProduct}
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-[#C8B77A] text-[#2A2E26] text-sm font-semibold hover:bg-[#E3D8AC] transition disabled:opacity-60"
            >
              {loading
                ? "Genererer fra Shopify-produkt…"
                : "Generer tekst fra Shopify-produkt"}
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-[12px] bg-red-900/30 rounded-lg p-2">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 bg-[#11140F] border border-[#A39C84]/40 rounded-xl p-4 text-left space-y-2 text-[#ECE8DA]/90 text-sm">
          {result.title && (
            <p className="text-[#C8B77A] font-semibold">{result.title}</p>
          )}
          {result.description && <p>{result.description}</p>}

          {Array.isArray(result.bullets) && result.bullets.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-[12px] text-[#ECE8DA]/85">
              {result.bullets.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          <div className="text-[11px] text-[#ECE8DA]/60 border-t border-[#A39C84]/30 pt-2 mt-2 space-y-1">
            {result.meta_title && (
              <p>
                <strong>Meta-tittel:</strong> {result.meta_title}
              </p>
            )}
            {result.meta_description && (
              <p>
                <strong>Meta-beskrivelse:</strong> {result.meta_description}
              </p>
            )}
            {Array.isArray(result.tags) && result.tags.length > 0 && (
              <p>
                <strong>Tags:</strong> {result.tags.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
