"use client";

import { Store, Sparkles } from "lucide-react";
import type { BrandProfile } from "@/hooks/useBrandProfile";

type BrandSource = "manual" | "auto" | "unknown";

type Props = {
  brand: BrandProfile | null;
  source: BrandSource;
  loading?: boolean;
};

export default function BrandIdentityBar({ brand, source, loading }: Props) {
  const storeName = brand?.storeName?.trim() || "Ingen brandprofil enda";

  let sourceLabel = "Brandprofil ikke satt";
  if (source === "auto") sourceLabel = "Auto fra Shopify";
  if (source === "manual") sourceLabel = "Tilpasset manuelt";

  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-3.5 py-2.5 text-[11px] text-phorium-light">
      {/* Venstre side: navn + status */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-phorium-accent/15 text-[13px] font-semibold text-phorium-accent">
          {storeName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{storeName}</span>
            {loading && (
              <span className="text-[9px] text-phorium-light/60">
                (laster …)
              </span>
            )}
          </div>
          <p className="text-[10px] text-phorium-light/65">
            Phorium forsøker å holde tekst og bilder i samme stil som nettbutikken.
          </p>
        </div>
      </div>

      {/* Høyre: kilde-chip */}
      <div className="flex items-center gap-1.5">
        <span className="rounded-full border border-phorium-off/40 bg-phorium-surface/80 px-2.5 py-1 text-[9px] text-phorium-light/85">
          {sourceLabel}
        </span>
        {source === "auto" && (
          <Sparkles className="h-3.5 w-3.5 text-phorium-accent" />
        )}
        {source === "manual" && (
          <Store className="h-3.5 w-3.5 text-phorium-light/70" />
        )}
      </div>
    </div>
  );
}
