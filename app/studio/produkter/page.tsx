"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type ProductSummary = {
  id: number;
  title: string;
  handle: string;
  status: string;
  price: string;
  image?: string | null;
};

export default function ProdukterPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null,
  );

  const [search, setSearch] = useState("");

  // Hent produkter fra Shopify
  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/shopify/products?limit=250", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Kunne ikke hente produkter.");
      }

      setProducts(data.products || []);
      setSelectedProduct(null);
    } catch (err: any) {
      setError(err?.message || "Uventet feil ved henting av produkter.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;

    return products.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.handle?.toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  function handleSelectProduct(p: ProductSummary) {
    console.log("VALGT PRODUKT:", p.id, p.title); // debug i devtools
    setSelectedProduct(p);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-24 pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Velg produkt fra Shopify
              </h1>
              <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
                Velg et produkt for å jobbe videre med tekst og bilder i
                Phorium.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 text-[11px] sm:items-end">
              <span className="text-phorium-light/70">
                Henter fra tilkoblet Shopify-butikk
              </span>
              <button
                type="button"
                onClick={fetchProducts}
                disabled={loading}
                className="rounded-full border border-phorium-accent bg-phorium-dark px-4 py-1.5 text-[11px] font-semibold text-phorium-accent shadow-sm transition hover:bg-phorium-accent/10 disabled:opacity-50"
              >
                {loading ? "Oppdaterer …" : "Oppdater liste"}
              </button>
            </div>
          </div>

          {/* Søkefelt */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk etter produktnavn, ID eller handle …"
              className="w-full rounded-full border border-phorium-off/35 bg-phorium-dark px-4 py-2.5 text-[13px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/20"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-phorium-accent/60 bg-phorium-accent/10 px-4 py-3 text-[12px] text-phorium-light">
              {error}
            </div>
          )}

          {/* Grid: venstre liste, høyre detaljer */}
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Produktliste */}
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-3">
              <div className="mb-2 flex items-center justify-between text-[11px] text-phorium-light/70">
                <span>
                  Viser {filteredProducts.length} produkt(er)
                  {search && " (filtrert)"}
                </span>
              </div>

              <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-[12px] transition ${
                      selectedProduct?.id === p.id
                        ? "border-phorium-accent bg-phorium-accent/15 shadow-md"
                        : "border-phorium-off/30 bg-phorium-dark/40 hover:border-phorium-accent/60 hover:bg-phorium-dark"
                    }`}
                  >
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-phorium-dark">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] text-phorium-light/50">
                          Ingen
                          <br />
                          bilde
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[12px] font-medium text-phorium-light">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-phorium-light/55">
                        #{p.id}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${
                          p.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : p.status === "draft"
                            ? "bg-yellow-500/15 text-yellow-300"
                            : "bg-phorium-off/30 text-phorium-light/70"
                        }`}
                      >
                        {p.status}
                      </span>
                      <span className="text-[11px] font-semibold text-phorium-accent">
                        {p.price}
                      </span>
                    </div>
                  </button>
                ))}

                {!loading && filteredProducts.length === 0 && (
                  <p className="py-6 text-center text-[12px] text-phorium-light/70">
                    Fant ingen produkter som matcher søket ditt.
                  </p>
                )}

                {loading && (
                  <p className="py-6 text-center text-[12px] text-phorium-light/70">
                    Laster produkter fra Shopify …
                  </p>
                )}
              </div>
            </div>

            {/* Detaljpanel – KUN valgt produkt + knapp */}
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4 text-[12px]">
              <h2 className="mb-3 text-[13px] font-semibold text-phorium-accent">
                Detaljer
              </h2>

              {!selectedProduct && (
                <p className="text-[12px] text-phorium-light/70">
                  Velg et produkt i listen for å se detaljer og åpne det i
                  tekststudio.
                </p>
              )}

              {selectedProduct && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 text-[13px] font-semibold text-phorium-light">
                        {selectedProduct.title}
                      </div>
                      <div className="text-[11px] text-phorium-light/65">
                        ID: {selectedProduct.id}
                      </div>
                      <div className="text-[11px] text-phorium-light/65">
                        Handle: {selectedProduct.handle}
                      </div>
                    </div>
                    {selectedProduct.image && (
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-phorium-off/40 bg-phorium-dark">
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl bg-phorium-dark/80 p-3 text-[11px] text-phorium-light/75">
                    Dette er kun et sammendrag. Du kan åpne produktet i
                    tekststudio for å generere og finpusse produkttekster,
                    SEO og mer.
                  </div>

                  <div>
                    <Link
                      href={`/studio/text?productId=${selectedProduct.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-phorium-accent px-5 py-2 text-[11px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90"
                    >
                      ✍️ Bruk dette produktet i tekststudio
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
