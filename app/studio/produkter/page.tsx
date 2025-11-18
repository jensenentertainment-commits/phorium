"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Image as ImageIcon, FileText, Link2, Search } from "lucide-react";

type SimpleProduct = {
  id: number;
  title: string;
  handle: string;
  status: string;
  price: string | null;
  currency?: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductDetails = {
  product: any | null;
  metafields: any[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/shopify/products?limit=30`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Kunne ikke hente produkter.");
      }

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err?.message || "Noe gikk galt ved henting av produkter.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetails(id: number) {
    try {
      setSelectedId(id);
      setDetails(null);
      setDetailsLoading(true);
      setError(null);

      const res = await fetch(`/api/shopify/product?id=${id}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Kunne ikke hente produktdetaljer.");
      }

      setDetails({
        product: data.product,
        metafields: data.metafields || [],
      });
    } catch (err: any) {
      setError(err?.message || "Noe gikk galt ved henting av produktdetaljer.");
    } finally {
      setDetailsLoading(false);
    }
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-24 pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10"
        >
          {/* Top nav – samme stil som Visuals */}
          <div className="mb-8 flex flex-wrap gap-3 text-[11px]">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80"
            >
              <Home className="h-3.5 w-3.5 text-phorium-accent" />
              Studio-oversikt
            </Link>

            <Link
              href="/studio/text"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-accent"
            >
              <FileText className="h-3.5 w-3.5 text-phorium-accent" />
              Tekst
            </Link>

            <Link
              href="/studio/visuals"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-accent"
            >
              <ImageIcon className="h-3.5 w-3.5 text-phorium-accent" />
              Visuals
            </Link>

            <Link
              href="/studio/koble-nettbutikk"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-accent transition hover:border-phorium-accent hover:text-phorium-light"
            >
              <Link2 className="h-3.5 w-3.5 text-phorium-accent" />
              Koble til nettbutikk
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Velg produkt fra Shopify
              </h1>
              <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
                Phorium henter produktene direkte fra butikken din. Velg et produkt for å finpusse tekst og bilder.
              </p>
            </div>
          </div>

          {/* Søk */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-phorium-light/45" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Søk etter produktnavn …"
                className="w-full rounded-full border border-phorium-off/35 bg-phorium-dark pl-8 pr-3 py-2 text-[13px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-1 focus:ring-phorium-accent/30"
              />
            </div>
            <button
              type="button"
              onClick={fetchProducts}
              className="rounded-full bg-phorium-accent px-4 py-2 text-[12px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90"
            >
              Oppdater liste
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Liste */}
            <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/70 p-3.5">
              <div className="mb-3 flex items-center justify-between text-[11px] text-phorium-light/65">
                <span>
                  {loading
                    ? "Laster produkter …"
                    : `Viser ${filtered.length} produkt(er)`}
                </span>
              </div>

              {error && (
                <div className="mb-3 rounded-2xl border border-phorium-accent/50 bg-phorium-accent/10 px-3 py-2 text-[11px] text-phorium-light">
                  {error}
                </div>
              )}

              <div className="flex max-h-[440px] flex-col gap-2 overflow-y-auto pr-1">
                {loading && filtered.length === 0 && (
                  <p className="text-[12px] text-phorium-light/70">
                    Henter produkter fra Shopify …
                  </p>
                )}

                {!loading && filtered.length === 0 && !error && (
                  <p className="text-[12px] text-phorium-light/70">
                    Ingen produkter funnet. Prøv et annet søk.
                  </p>
                )}

                <AnimatePresence>
                  {filtered.map((p) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      onClick={() => fetchDetails(p.id)}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-2.5 py-2 text-left text-[12px] transition ${
                        selectedId === p.id
                          ? "border-phorium-accent bg-phorium-accent/10"
                          : "border-phorium-off/30 bg-phorium-dark/60 hover:border-phorium-accent/70 hover:bg-phorium-dark"
                      }`}
                    >
                      <div className="h-10 w-10 overflow-hidden rounded-xl bg-phorium-dark/80">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-phorium-light/50">
                            Ingen<br />bilde
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="line-clamp-1 font-medium text-phorium-light">
                            {p.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                              p.status === "active"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-phorium-off/30 text-phorium-light/70"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-phorium-light/65">
                          <span>#{p.id}</span>
                          {p.price && (
                            <span>
                              {p.price} {p.currency ?? ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Detaljer */}
            <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/70 p-4 text-[12px]">
              <h2 className="mb-2 text-[13px] font-semibold text-phorium-accent">
                Detaljer
              </h2>

              {!selectedId && !details && (
                <p className="text-[12px] text-phorium-light/70">
                  Velg et produkt i listen for å se detaljer og senere generere tekst/bilder.
                </p>
              )}

              {selectedId && detailsLoading && (
                <p className="text-[12px] text-phorium-light/70">
                  Henter detaljer for produkt #{selectedId} …
                </p>
              )}

              {details && details.product && !detailsLoading && (
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 text-[13px] font-semibold">
                      {details.product.title}
                    </div>
                    <div className="text-[11px] text-phorium-light/65">
                      Handle: {details.product.handle}
                    </div>
                  </div>

                  {details.product?.image?.src && (
                    <div className="overflow-hidden rounded-xl border border-phorium-off/40 bg-phorium-dark">
                      <img
                        src={details.product.image.src}
                        alt={details.product.title}
                        className="max-h-56 w-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <div className="mb-1 text-[11px] font-semibold text-phorium-light/80">
                      Kort beskrivelse (HTML)
                    </div>
                    <div className="max-h-40 overflow-auto rounded-xl border border-phorium-off/35 bg-phorium-dark/70 p-2 text-[11px] text-phorium-light/80">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            details.product.body_html ||
                            "<em>Ingen beskrivelse</em>",
                        }}
                      />
                    </div>
                  </div>

                  {details.metafields && details.metafields.length > 0 && (
                    <div>
                      <div className="mb-1 text-[11px] font-semibold text-phorium-light/80">
                        Metafields (utdrag)
                      </div>
                      <div className="max-h-32 overflow-auto rounded-xl border border-phorium-off/35 bg-phorium-dark/70 p-2 text-[10px] text-phorium-light/75">
                        {details.metafields.slice(0, 10).map((m: any) => (
                          <div key={m.id} className="mb-1">
                            <span className="font-semibold">
                              {m.namespace}.{m.key}
                            </span>
                            : <span>{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Her kommer senere:
                     - "Generer tekstpakke"
                     - "Lagre i Shopify"
                  */}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
