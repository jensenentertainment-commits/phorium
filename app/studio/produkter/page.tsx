"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

type Product = {
  id: number;
  title: string;
  handle: string;
  status: string;
  price?: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  plainDescription?: string;
  hasDescription?: boolean;
  optimizationScore?: number;      // 0, 33, 66, 100
  optimizationLabel?: string;      // "33% AI-optimalisert"
  optimizationCharacters?: number; // antall tegn
};

type ApiResponse = {
  success: boolean;
  products?: Product[];
  error?: string;
};

export default function ProductsPage() {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"any" | "active" | "draft" | "archived">("any");
  const [onlyLowScore, setOnlyLowScore] = useState(false);
  const [onlyMissingText, setOnlyMissingText] = useState(false);

  // Brukes til "Åpne i Shopify"
  const [shopDomain, setShopDomain] = useState<string | null>(null);

  useEffect(() => {
    // Les butikkdomene fra cookie (samme som i Visuals/Text)
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

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("limit", "50");
        params.set("status", statusFilter);
        if (onlyMissingText) {
          params.set("missing_description", "1");
        }
        if (search.trim()) {
          params.set("q", search.trim());
        }

        const res = await fetch(`/api/shopify/products?${params.toString()}`, {
          cache: "no-store",
        });
        const data: ApiResponse = await res.json();

        if (!data.success || !data.products) {
          throw new Error(data.error || "Kunne ikke hente produkter.");
        }

        let list = data.products;

        // Ekstra filter i frontend: bare produkter med lav score
        if (onlyLowScore) {
          list = list.filter((p) => (p.optimizationScore || 0) < 66);
        }

        setProducts(list);
      } catch (err: any) {
        setError(err?.message || "Uventet feil ved henting av produkter.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [statusFilter, onlyMissingText, onlyLowScore]); // search trigges via manualFetch

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    manualFetch();
  }

  async function manualFetch() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", "50");
      params.set("status", statusFilter);
      if (onlyMissingText) {
        params.set("missing_description", "1");
      }
      if (search.trim()) {
        params.set("q", search.trim());
      }

      const res = await fetch(`/api/shopify/products?${params.toString()}`, {
        cache: "no-store",
      });
      const data: ApiResponse = await res.json();

      if (!data.success || !data.products) {
        throw new Error(data.error || "Kunne ikke hente produkter.");
      }

      let list = data.products;
      if (onlyLowScore) {
        list = list.filter((p) => (p.optimizationScore || 0) < 66);
      }

      setProducts(list);
    } catch (err: any) {
      setError(err?.message || "Uventet feil ved henting av produkter.");
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score?: number) {
    if (score === undefined || score === null) return "bg-red-500";
    if (score < 33) return "bg-red-500";
    if (score < 66) return "bg-amber-400";
    if (score < 100) return "bg-lime-400";
    return "bg-emerald-400";
  }

  function scoreBackground(score?: number) {
    if (score === undefined || score === null)
      return "bg-red-500/15 border-red-500/40";
    if (score < 33) return "bg-red-500/15 border-red-500/40";
    if (score < 66) return "bg-amber-400/15 border-amber-400/40";
    if (score < 100) return "bg-lime-400/15 border-lime-400/40";
    return "bg-emerald-400/15 border-emerald-400/40";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-24 pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-phorium-light sm:text-4xl">
              Produkter
            </h1>
            <p className="mt-1 text-[13px] text-phorium-light/80 sm:text-[14px]">
              Se hvilke produkter som mangler tekst, og hvor AI-optimaliserte de er.
            </p>
          </div>
        </div>

        {/* Filter / søk / info-kort */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6 rounded-3xl border border-phorium-off/30 bg-phorium-surface px-5 py-4 text-[12px] text-phorium-light"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Søk + filter */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 flex-col gap-3 md:flex-row md:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-[9px] h-4 w-4 text-phorium-light/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Søk i produkter (navn eller handle)…"
                  className="w-full rounded-full border border-phorium-off/40 bg-phorium-dark pl-9 pr-3 py-1.5 text-[12px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-1 focus:ring-phorium-accent/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "any" | "active" | "draft" | "archived",
                    )
                  }
                  className="rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/85 outline-none focus:border-phorium-accent"
                >
                  <option value="any">Alle statuser</option>
                  <option value="active">Aktiv</option>
                  <option value="draft">Utkast</option>
                  <option value="archived">Arkivert</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Oppdater liste
                </button>
              </div>
            </form>

            {/* Toggle-felt */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOnlyMissingText((v) => !v)}
                className={`rounded-full border px-3 py-1.5 text-[11px] ${
                  onlyMissingText
                    ? "border-phorium-accent bg-phorium-accent/15 text-phorium-accent"
                    : "border-phorium-off/40 bg-phorium-dark text-phorium-light/80 hover:border-phorium-accent hover:text-phorium-accent"
                }`}
              >
                Mangler tekst
              </button>

              <button
                type="button"
                onClick={() => setOnlyLowScore((v) => !v)}
                className={`rounded-full border px-3 py-1.5 text-[11px] ${
                  onlyLowScore
                    ? "border-amber-400 bg-amber-400/15 text-amber-300"
                    : "border-phorium-off/40 bg-phorium-dark text-phorium-light/80 hover:border-amber-400 hover:text-amber-300"
                }`}
              >
                Lav AI-score (&lt; 66%)
              </button>
            </div>
          </div>

          {/* Liten forklaring */}
          <div className="mt-3 flex items-start gap-2 text-[11px] text-phorium-light/70">
            <AlertTriangle className="mt-[2px] h-3.5 w-3.5 text-amber-300" />
            <p>
              Phorium måler kun <span className="font-semibold">tekstlengde og fylde</span> – ikke
              hvor “god” teksten er. Jobben din er å gjøre den bra –{" "}
              <span className="text-phorium-accent/95">
                Phorium sørger for at ingenting er tomt eller halvhjertet.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Innhold */}
        {loading && (
          <div className="flex items-center justify-center py-12 text-phorium-light/80">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Laster produkter fra Shopify …
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-[12px] text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-10 text-center text-[12px] text-phorium-light/70">
            Fant ingen produkter med disse filtrene. Prøv å justere søk eller filter.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="space-y-3">
            {products.map((p) => {
              const score = p.optimizationScore ?? 0;
              const label = p.optimizationLabel || "0% AI-optimalisert";
              const chars = p.optimizationCharacters ?? 0;

              const scoreWidth =
                score <= 0 ? "5%" : score >= 100 ? "100%" : `${score}%`;

              const bgClass = scoreBackground(score);

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-4 py-3 text-[12px] text-phorium-light"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Venstre: bilde + tittel */}
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-phorium-off/40 bg-phorium-surface">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-phorium-light/50">
                            Ingen
                            <br />
                            bilde
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-phorium-light">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-phorium-light/60">
                          Handle: {p.handle} · ID: {p.id}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-phorium-light/65">
                          <span className="rounded-full border border-phorium-off/40 bg-phorium-surface px-2 py-0.5">
                            {p.status === "active"
                              ? "Aktiv"
                              : p.status === "draft"
                              ? "Utkast"
                              : "Arkivert"}
                          </span>
                          {p.price && (
                            <span className="rounded-full border border-phorium-off/40 bg-phorium-surface px-2 py-0.5">
                              {p.price} kr
                            </span>
                          )}
                          {p.hasDescription ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Har beskrivelse
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-red-200">
                              <AlertTriangle className="h-3 w-3" />
                              Mangler beskrivelse
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Høyre: score + knapper */}
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      {/* Score-badge */}
                      <div
                        className={`flex flex-col gap-1 rounded-xl border px-3 py-2 text-[11px] ${bgClass}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{label}</span>
                          <span className="text-[10px] opacity-80">
                            {chars} tegn i beskrivelse
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-40 overflow-hidden rounded-full bg-black/25">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: scoreWidth }}
                            transition={{ duration: 0.4 }}
                            className={`h-full rounded-full ${scoreColor(score)}`}
                          />
                        </div>
                      </div>

                      {/* Handlinger */}
                      <div className="flex flex-wrap justify-end gap-2 text-[11px]">
                        <Link
                          href={`/studio/text?productId=${p.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Åpne i tekststudio
                        </Link>

                        <Link
                          href={`/studio/visuals?productId=${p.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Åpne i Visuals
                        </Link>

                        {(shopDomain || process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN) && (
                          <a
                            href={`https://${shopDomain || process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN}/admin/products/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                          >
                            Åpne i Shopify
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
