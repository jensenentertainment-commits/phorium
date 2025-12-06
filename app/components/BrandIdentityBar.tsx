"use client";

import { Store, Sparkles, AlertTriangle } from "lucide-react";
import type { BrandProfile } from "@/hooks/useBrandProfile";

type BrandSource = "manual" | "auto" | "unknown";

type Props = {
  brand: BrandProfile | null;
  source: BrandSource;
  loading?: boolean;
};

export default function BrandIdentityBar({ brand, source, loading }: Props) {
  // Prøv å hente felter robust – støtter både camelCase og snake_case
  const rawStoreName =
    (brand as any)?.storeName ??
    (brand as any)?.store_name ??
    (brand as any)?.name ??
    "";

  const storeName =
    (rawStoreName && String(rawStoreName).trim()) || "Ingen brandprofil enda";

  const industry =
    (brand as any)?.industry ??
    (brand as any)?.category ??
    (brand as any)?.segment ??
    "";

  const tone =
    (brand as any)?.tone ??
    (brand as any)?.tone_of_voice ??
    (brand as any)?.voice ??
    "";

  let sourceLabel = "Brandprofil ikke satt";
  if (source === "auto") sourceLabel = "Auto fra Shopify";
  if (source === "manual") sourceLabel = "Tilpasset manuelt";

  const hasProfile = !!brand && !!rawStoreName;

  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-3.5 py-2.5 text-[11px] text-phorium-light shadow-[0_14px_40px_rgba(0,0,0,0.55)]">
      {/* Venstre side: avatar + navn + tagline + chips */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
            hasProfile
              ? "bg-phorium-accent/18 text-phorium-accent"
              : "bg-phorium-off/25 text-phorium-light/70"
          }`}
        >
          {storeName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{storeName}</span>
            {loading && (
              <span className="text-[9px] text-phorium-light/60">
                (laster …)
              </span>
            )}
          </div>

          <p className="text-[10px] text-phorium-light/65">
            Phorium prøver å holde tekst og bilder i samme stil som nettbutikken
            din.
          </p>

          {/* Små chips for bransje / tone hvis vi har det */}
          {(industry || tone) && (
            <div className="mt-1 flex flex-wrap gap-1.5 text-[9px] text-phorium-light/70">
              {industry && (
                <span className="inline-flex items-center gap-1 rounded-full border border-phorium-off/40 bg-phorium-surface/80 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
                  {industry}
                </span>
              )}
              {tone && (
                <span className="inline-flex items-center gap-1 rounded-full border border-phorium-off/40 bg-phorium-surface/80 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent/80" />
                  {tone}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Høyre side: kilde-chip + ikon */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <span className="rounded-full border border-phorium-off/40 bg-phorium-surface/80 px-2.5 py-1 text-[9px] text-phorium-light/85 whitespace-nowrap">
          {sourceLabel}
        </span>

        {source === "auto" && (
          <Sparkles className="h-3.5 w-3.5 text-phorium-accent" />
        )}

        {source === "manual" && (
          <Store className="h-3.5 w-3.5 text-phorium-light/70" />
        )}

        {source === "unknown" && (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-300/90" />
        )}
      </div>
    </div>
  );
}
