"use client";

import Link from "next/link";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import useBrandProfile from "@/hooks/useBrandProfile";

export default function BrandProfileBadge() {
  const { brand, source, loading } = useBrandProfile();

  const hasProfile =
    !!brand?.storeName || !!brand?.industry || !!brand?.tone;

  let subtitle = "Sett opp brandprofilen én gang – Phorium bruker den overalt.";
  if (source === "auto") subtitle = "Auto-lest fra Shopify. Du kan finjustere på brandprofil-siden.";
  if (!hasProfile && !loading) {
    subtitle = "Ingen brandprofil enda – start med noen enkle valg.";
  }

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-3.5 py-2.5 text-[11px] text-phorium-light">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-phorium-accent/15 text-phorium-accent">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Brandprofil</span>
            {loading && (
              <span className="text-[9px] text-phorium-light/60">
                (laster …)
              </span>
            )}
          </div>
          <p className="text-[10px] text-phorium-light/65">
            {subtitle}
          </p>
        </div>
      </div>

      <Link
        href="/studio/brandprofil"
        className="inline-flex items-center gap-1 rounded-full border border-phorium-off/40 bg-phorium-surface/80 px-2.5 py-1 text-[10px] text-phorium-light/90 hover:border-phorium-accent hover:text-phorium-accent"
      >
        <SlidersHorizontal className="h-3 w-3" />
        Juster brandprofil
      </Link>
    </div>
  );
}
