"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
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

type ShopifyProductSummary = {
  id: number;
  title: string;
  handle: string;
  status: string;
  price?: string;
  image?: string | null;
  hasDescription?: boolean;
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

  const searchParams = useSearchParams();
  const router = useRouter();
  const productIdFromUrl = searchParams.get("productId");
  const isShopifyMode = !!productIdFromUrl;

  const [linkedProduct, setLinkedProduct] = useState<any | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Produktvelger
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productList, setProductList] = useState<ShopifyProductSummary[]>([]);
  const [productListLoading, setProductListLoading] = useState(false);
  const [productListError, setProductListError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  // Hent enkeltprodukt hvis vi har productId
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

  // --- Hjelper: hent produktliste (brukes av picker) ---
  async function loadProductList(search?: string) {
    try {
      setProductListLoading(true);
      setProductListError(null);

      const params = new URLSearchParams();
      params.set("limit", "40");
      params.set("status", "active");
      if (search && search.trim()) {
        params.set("q", search.trim());
      }

      const res = await fetch(`/api/shopify/products?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Kunne ikke hente produkter.");
      }

      setProductList(data.products || []);
    } catch (err: any) {
      setProductListError(err?.message || "Feil ved henting av produktliste.");
    } finally {
      setProductListLoading(false);
    }
  }

  function handleOpenPicker() {
    setProductPickerOpen((prev) => {
      const next = !prev;
      if (next && productList.length === 0) {
        // første gang: hent standardliste
        void loadProductList();
      }
      return next;
    });
  }

  function handlePickProduct(id: number) {
    // Oppdatér URL → useSearchParams + fetchProduct trigges automatisk
    router.push(`/studio/text?productId=${id}`);
    setProductPickerOpen(false);
  }

  // --- Manuell generering (uten Shopify-produkt) ---
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

  // tone-presets
  function setTonePreset(
    preset: "kortere" | "lengre" | "teknisk" | "leken",
  ) {
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

  return (
    <div className="mt-4 space-y-4">
      {/* Shopify-produkt header + produktvelger */}
      {isShopifyMode && (
        <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-4 py-3 text-[12px]">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
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
                <>
                  <div className="text-[11px] text-phorium-light/60">
                    Jobber mot produkt:
                  </div>
                  <div className="text-[13px] font-semibold text-phorium-accent">
                    {linkedProduct.title}
                  </div>
                  <div className="text-[11px] text-phorium-light/60">
                    Handle: {linkedProduct.handle} · ID: {linkedProduct.id}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {linkedProduct?.image?.src && (
                <img
                  src={linkedProduct.image.src}
                  alt={linkedProduct.title}
                  className="h-10 w-10 rounded-lg border border-phorium-off/40 object-cover"
                />
              )}

              <button
                type="button"
                onClick={handleOpenPicker}
                className="inline-flex items-center gap-1.5 rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1.5 text-[11px] text-phorium-light/85 transition hover:border-phorium-accent hover:text-phorium-accent"
              >
                <Search className="h-3.5 w-3.5" />
                {productPickerOpen ? "Lukk produktliste" : "Bytt produkt"}
              </button>
            </div>
          </div>

          {/* Produktvelger-panel */}
          <AnimatePresence>
            {productPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="mt-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 p-3"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Søk etter produktnavn eller handle …"
                    className="flex-1 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-1 focus:ring-phorium-accent/30"
                  />
                  <button
                    type="button"
                    onClick={() => loadProductList(productSearch)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-phorium-accent px-4 py-1.5 text-[11px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Søk
                  </button>
                </div>

                {productListLoading && (
                  <p className="text-[11px] text-phorium-light/75">
                    Laster produkter …
                  </p>
                )}

                {productListError && (
                  <p className="text-[11px] text-red-300">
                    {productListError}
                  </p>
                )}

                {!productListLoading && productList.length === 0 && !productListError && (
                  <p className="text-[11px] text-phorium-light/70">
                    Ingen produkter funnet. Prøv et annet søk.
                  </p>
                )}

                {!productListLoading && productList.length > 0 && (
                  <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1 text-[11px]">
                    {productList.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePickProduct(p.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent bg-phorium-dark px-3 py-2 text-left text-phorium-light/85 transition hover:border-phorium-accent/60 hover:bg-phorium-dark/80"
                      >
                        <div className="flex items-center gap-2">
                          {p.image && (
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-8 w-8 rounded-md border border-phorium-off/35 object-cover"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-[11px]">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-phorium-light/55">
                              {p.handle} · {p.status}
                              {p.hasDescription
                                ? ""
                                : " · mangler beskrivelse"}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-phorium-accent">
                          Velg
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
                className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
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
              className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
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
              className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark placeholder:text-phorium-dark/40 outline-none focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
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

        {/* Høyre side – resultat m. tabs */}
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
