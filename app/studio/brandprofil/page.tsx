"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Save } from "lucide-react";
import useBrandProfile from "@/hooks/useBrandProfile";
import PhoriumLoader from "../../components/PhoriumLoader";


export default function BrandProfilePage() {
  const {
    brand,
    loading: brandLoading,
    updateBrand,
    source,
    autoGenerateBrandProfile,
  } = useBrandProfile();

  const [localBrand, setLocalBrand] = useState({
    storeName: "",
    industry: "",
    tone: "",
  });

  const [saving, setSaving] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Sync inn når brand endrer seg
  useEffect(() => {
    setLocalBrand({
      storeName: brand?.storeName ?? "",
      industry: brand?.industry ?? "",
      tone: brand?.tone ?? "",
    });
  }, [brand]);

  function updateField(key: "storeName" | "industry" | "tone", value: string) {
    setLocalBrand((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await updateBrand(localBrand);
      setMessage("✅ Brandprofil lagret.");
    } catch {
      setMessage("❌ Klarte ikke å lagre brandprofil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAutoGenerate() {
    setAutoLoading(true);
    setMessage(null);
    try {
      await autoGenerateBrandProfile();
      setMessage("✅ Leste butikken din og oppdaterte brandprofilen.");
    } catch (err: any) {
      setMessage(
        err?.message ||
          "❌ Klarte ikke å auto-analysere. Sjekk at Shopify er koblet til.",
      );
    } finally {
      setAutoLoading(false);
    }
  }

  const busy = brandLoading && !brand && !localBrand.storeName;

  return (
    <main className="min-h-screen pt-24 pb-24 text-phorium-light">
      <section className="mx-auto max-w-4xl px-4">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Brandprofil
        </h1>
        <p className="mb-6 text-[13px] text-phorium-light/80 sm:text-[14px]">
          Phorium bruker dette på tvers av tekst og bilder – så alt føles som
          én og samme nettbutikk.
        </p>

        {busy && (
          <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-4 py-6">
            <PhoriumLoader label="Laster brandprofil …" />
          </div>
        )}

        {!busy && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-5 py-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-phorium-light">
                    Grunnprofil
                  </p>
                  <p className="text-[11px] text-phorium-light/65">
                    Navn, bransje og tone of voice.
                  </p>
                </div>
                {source === "auto" && (
                  <span className="rounded-full border border-phorium-off/40 bg-phorium-surface px-3 py-1 text-[10px] text-phorium-light/80">
                    Auto fra Shopify
                  </span>
                )}
              </div>

              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="mb-1 block text-[11px] text-phorium-light/70">
                    Butikknavn / brand
                  </label>
                  <input
                    value={localBrand.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    placeholder="F.eks. Varekompaniet"
                    className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-phorium-dark/40 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] text-phorium-light/70">
                    Bransje / kategori
                  </label>
                  <input
                    value={localBrand.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    placeholder="F.eks. Outlet, interiør, hund, friluft …"
                    className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-phorium-dark/40 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] text-phorium-light/70">
                    Tone of voice
                  </label>
                  <input
                    value={localBrand.tone}
                    onChange={(e) => updateField("tone", e.target.value)}
                    placeholder="F.eks. moderne, jordnær, humoristisk, eksklusiv …"
                    className="w-full rounded-xl border border-phorium-off/40 bg-[#F3EEE2] px-3 py-2 text-[13px] text-phorium-dark outline-none placeholder:text-phorium-dark/40 focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/25"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary btn-sm disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                      Lagrer …
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-3.5 w-3.5" />
                      Lagre profil
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  disabled={autoLoading}
                  className="btn btn-secondary btn-sm disabled:opacity-60"
                >
                  {autoLoading ? (
                    <>
                      <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                      Leser butikken …
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      Les butikken min automatisk
                    </>
                  )}
                </button>
              </div>

              {message && (
                <p className="mt-2 text-[11px] text-phorium-light/75">
                  {message}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
