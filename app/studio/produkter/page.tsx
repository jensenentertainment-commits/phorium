"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Type as TypeIcon,
  Image as ImageIcon,
  Store,
  ExternalLink,
  Gauge,
} from "lucide-react";

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
  optimizationScore?: number;
  optimizationLabel?: string;
  optimizationCharacters?: number;
};

type ApiResponse = {
  success: boolean;
  products?: Product[];
  error?: string;
  total?: number;
};

const PAGE_SIZE = 50;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "any" | "active" | "draft" | "archived"
  >("any");
  const [onlyLowScore, setOnlyLowScore] = useState(false);
  const [onlyMissingText, setOnlyMissingText] = useState(false);

  const [shopDomain, setShopDomain] = useState<string | null>(null);

  // 🔢 paginering
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // les shop-domain fra cookie (som før)
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

  // Felles fetch-funksjon – brukes både av useEffect, søk og paginering
  async function fetchProducts(nextPage: number) {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("page", String(nextPage));
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
      setTotal(data.total ?? list.length);
      setPage(nextPage);
    } catch (err: any) {
      setError(err?.message || "Uventet feil ved henting av produkter.");
    } finally {
      setLoading(false);
    }
  }

  // 🔁 hent side 1 når filtere endres
  useEffect(() => {
    void fetchProducts(1);
  }, [statusFilter, onlyMissingText, onlyLowScore]);

  // Søk: resetter til side 1
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void fetchProducts(1);
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  // ---------------- RENDER ----------------

  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-8 pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-phorium-light/50">
              <Store className="h-3 w-3" />
              <span>Studio · Produkter</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-phorium-light sm:text-3xl">
              Produkter
            </h1>
            <p className="mt-1 text-[12px] text-phorium-light/80 sm:text-[13px]">
              Se hvilke produkter som mangler tekst, og hvor AI-optimaliserte de
              er. Åpne direkte i Tekststudio eller Visuals.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 text-[11px] text-phorium-light/70 sm:items-end">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5">
              <Gauge className="h-3.5 w-3.5 text-phorium-accent" />
              <span className="font-medium text-phorium-light/90">
                {total} produkter
              </span>
            </div>
            <p className="text-[10px] text-phorium-light/55">
              Viser {from}–{to} av {total}. Data synkroniseres fra Shopify.
            </p>
          </div>
        </div>

        {/* Filter / søk */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6 rounded-3xl border border-phorium-off/30 bg-phorium-surface px-5 py-4 text-[12px] text-phorium-light"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 flex-col gap-3 md:flex-row md:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-[9px] h-4 w-4 text-phorium-light/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Søk etter produktnavn, handle eller ID …"
                  className="w-full rounded-full border border-phorium-off/40 bg-phorium-dark/90 px-9 py-2 text-[12px] text-phorium-light placeholder:text-phorium-light/40 focus:border-phorium-accent focus:outline-none focus:ring-2 focus:ring-phorium-accent/25"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as typeof statusFilter)
                  }
                  className="rounded-full border border-phorium-off/40 bg-phorium-dark/90 px-3 py-2 text-[11px] text-phorium-light focus:border-phorium-accent focus:outline-none"
                >
                  <option value="any">Alle statuser</option>
                  <option value="active">Aktiv</option>
                  <option value="draft">Utkast</option>
                  <option value="archived">Arkivert</option>
                </select>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm inline-flex items-center gap-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Oppdaterer …
                    </>
                  ) : (
                    <>Oppdater liste</>
                  )}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setOnlyMissingText((v) => !v);
                  setPage(1);
                }}
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
                onClick={() => {
                  setOnlyLowScore((v) => !v);
                  setPage(1);
                }}
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

          <div className="mt-3 flex items-start gap-2 text-[11px] text-phorium-light/70">
            <AlertTriangle className="mt-[2px] h-3.5 w-3.5 text-amber-300" />
            <p>
              Phorium måler kun{" "}
              <span className="font-semibold">tekstlengde og fylde</span> – ikke
              “hvor bra” teksten er.
            </p>
          </div>
        </motion.div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="flex items-center gap-2 text-[12px] text-phorium-light/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              Henter produkter …
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-[12px] text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && total === 0 && (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-6 py-10 text-center text-[12px] text-phorium-light/80">
            <PackageOpen className="h-10 w-10 text-phorium-light/40" />
            <div className="text-[13px] font-medium text-phorium-light">
              Ingen produkter funnet med disse filtrene
            </div>
            <p className="max-w-md text-[11px] text-phorium-light/65">
              Prøv å fjerne noen filtre eller søke mer generelt.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("any");
                setOnlyLowScore(false);
                setOnlyMissingText(false);
                setPage(1);
                void fetchProducts(1);
              }}
              className="btn btn-secondary btn-sm"
            >
              Nullstill filtre
            </button>
          </div>
        )}

        {/* Liste + paginering */}
        {!loading && !error && total > 0 && (
          <>
            <div className="space-y-3">
              {products.map((p) => {
                const score = p.optimizationScore ?? null;
                const label =
                  p.optimizationLabel ||
                  (score !== null
                    ? `${score}% AI-optimalisert`
                    : "Ingen score");
                const chars = p.optimizationCharacters ?? null;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 p-3 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
                      {/* Venstre side – samme som før */}
                      <div className="flex flex-1 gap-3">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-phorium-off/40 bg-phorium-dark">
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

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                                {p.price}
                              </span>
                            )}
                            {p.hasDescription ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-400/10 px-2 py-0.5 text-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Har beskrivelse
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-red-200">
                                <AlertTriangle className="h-3 w-3" />
                                Mangler beskrivelse
                              </span>
                            )}
                            {chars !== null && (
                              <span className="rounded-full border border-phorium-off/40 bg-phorium-surface px-2 py-0.5">
                                {chars} tegn
                              </span>
                            )}
                          </div>

                          {p.plainDescription && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-phorium-light/70">
                              {p.plainDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Høyre side – samme knapper som før */}
                      <div className="flex w-full flex-col justify-between gap-2 sm:w-64 sm:items-end">
                        {/* AI-score-boksen din kan være som før */}
                        <div className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-[11px]">
                          <div className="flex flex-1 flex-col">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-phorium-light/70">
                              AI-score
                            </span>
                            <span className="text-[11px] font-medium text-phorium-light">
                              {label}
                            </span>
                            <span className="text-[10px] text-phorium-light/60">
                              Basert på lengde og fylde, ikke kvalitet.
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-phorium-dark text-[11px] font-semibold text-phorium-light">
                              {score !== null ? `${score}%` : "–"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 text-[11px]">
                          <Link
                            href={`/studio/tekst?productId=${p.id}`}
                            className="btn btn-secondary btn-xs inline-flex items-center gap-1"
                          >
                            <TypeIcon className="h-3.5 w-3.5" />
                            Åpne i tekststudio
                          </Link>

                          <Link
                            href={`/studio/visuals?productId=${p.id}`}
                            className="btn btn-ghost btn-xs inline-flex items-center gap-1"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            Åpne i Visuals
                          </Link>

                          {shopDomain && (
                            <a
                              href={`https://${shopDomain}/admin/products/${p.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ghost btn-xs inline-flex items-center gap-1 text-[10px]"
                            >
                              <Store className="h-3.5 w-3.5" />
                              <ExternalLink className="h-3 w-3" />
                              Shopify
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Paginering */}
            {pageCount > 1 && (
              <div className="mt-4 flex items-center justify-between text-[11px] text-phorium-light/70">
                <span>
                  Side {page} av {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => void fetchProducts(page - 1)}
                    className="btn btn-ghost btn-xs disabled:opacity-40"
                  >
                    Forrige
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount || loading}
                    onClick={() => void fetchProducts(page + 1)}
                    className="btn btn-ghost btn-xs disabled:opacity-40"
                  >
                    Neste
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
