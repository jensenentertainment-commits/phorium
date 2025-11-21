"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, Save, ScanEye } from "lucide-react";
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

        <div className="mb-6 rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 px-5 py-4 text-[12px] text-phorium-light/75">
  <h2 className="mb-1 text-[13px] font-semibold text-phorium-light">
    Hvordan fungerer Brandprofil?
  </h2>
  <p className="mb-2">
    Brandprofilen gir Phorium informasjon om hvordan nettbutikken din skal
    høres ut og se ut. Dette brukes i både tekst- og bildegenerering, slik at
    alt som produseres passer inn i butikkens identitet.
  </p>

  <ul className="mb-3 list-disc pl-5 space-y-1">
    <li>Styrer tone of voice i produkttekster, SEO, annonser og SoMe.</li>
    <li>Brukes i bildeprompting for å sikre at bildene matcher stil, bransje og uttrykk.</li>
    <li>Gjør produksjonen konsistent, selv når du genererer 50+ produkter.</li>
    <li>Kan enten settes manuelt eller auto-genereres ved å lese butikken din.</li>
  </ul>

  <p className="text-[11px] text-phorium-light/60">
    Du kan oppdatere brandprofilen når som helst uten å påvirke produkter som
    allerede ligger i Shopify.
  </p>
</div>


        {busy && (
          <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-4 py-6">
            <PhoriumLoader label="Laster brandprofil …" />
          </div>
        )}

        {!busy && (
          <div className="space-y-4">
            {/* --- MAGIC BRAND SCAN – PREMIUM KORT ------------------------ */}
            <div className="relative overflow-hidden rounded-3xl border border-phorium-accent/45 bg-gradient-to-br from-phorium-dark/95 via-phorium-dark to-black/80 px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.70)]">
              {/* Glød / dekor bakgrunn */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-phorium-accent/15 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-phorium-accent/10 blur-2xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Venstre: tittel + tekst */}
                <div className="max-w-md space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-phorium-accent/95">
                    <ScanEye className="h-3.5 w-3.5" />
                    Magic Brand Scan
                  </div>
                  <h2 className="text-lg font-semibold text-phorium-light">
                    La Phorium lese nettbutikken automatisk
                  </h2>
                  <p className="text-[11px] text-phorium-light/75">
                    Vi analyserer produktutvalg, tekster og struktur i
                    Shopify-butikken din og lager en brandprofil som brukes på
                    tvers av tekst og bilder.
                  </p>

                  <ul className="mt-1 space-y-1 text-[11px] text-phorium-light/70">
                    <li>• Oppdaget tone of voice direkte fra butikken</li>
                    <li>• Bransje / kategori settes automatisk</li>
                    <li>• Brukes i både tekststudio og visuals</li>
                  </ul>
                </div>

                {/* Høyre: status + knapp */}
                <div className="mt-3 flex flex-col items-start gap-3 sm:mt-0 sm:items-end">
                  {/* Status-chip hvis vi har profil */}
                  {brand && (
                    <div className="flex flex-col items-start sm:items-end gap-1 text-[10px]">
                      <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-black/40 px-3 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        <span className="text-phorium-light/80">
                          {source === "auto"
                            ? "Profil fra Shopify-analyse"
                            : "Manuelt satt brandprofil"}
                        </span>
                      </div>
                      <div className="text-[10px] text-phorium-light/70">
                        {brand.storeName && (
                          <>
                            <span className="font-semibold text-phorium-accent">
                              {brand.storeName}
                            </span>
                          </>
                        )}
                        {(brand.industry || brand.tone) && " · "}
                        {brand.industry && <span>{brand.industry}</span>}
                        {brand.industry && brand.tone && " · "}
                        {brand.tone && <span>tone: {brand.tone}</span>}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAutoGenerate}
                    disabled={autoLoading}
                    className="btn btn-primary btn-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    {autoLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Leser butikken …
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Les butikken min automatisk
                      </>
                    )}
                  </button>

                  <p className="max-w-xs text-right text-[10px] text-phorium-light/55">
                    Du kan alltid justere feltene manuelt etterpå. Auto-scan
                    overskriver bare brandprofilen, ikke produktene dine.
                  </p>
                </div>
              </div>

              {message && (
                <p className="relative mt-3 text-[11px] text-phorium-light/80">
                  {message}
                </p>
              )}
            </div>
            {/* ------------------------------------------------------------- */}

            {/* GRUNNPROFIL-KORTET (manuell redigering) */}
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
                    Auto fra Shopify · kan redigeres
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
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
