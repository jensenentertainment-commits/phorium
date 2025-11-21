"use client";

import { Crown, Sparkles } from "lucide-react";

type Variant = "premium" | "beta" | "info";

export default function BrandBadge({ variant = "premium" }: { variant?: Variant }) {
  let label = "Phorium Brand Engine";
  let sub = "Tilpasser alt til nettbutikken din.";
  let icon: "crown" | "sparkles" = "crown";

  if (variant === "beta") {
    label = "Brand Engine (beta)";
    sub = "Vi tester nye funksjoner på utvalgte brukere.";
    icon = "sparkles";
  }

  if (variant === "info") {
    label = "Brand-modus";
    sub = "Brukes på tvers av tekst, bilder og kampanjer.";
    icon = "sparkles";
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/10 px-3 py-1.5 text-[10px] text-phorium-light">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-phorium-accent/30 text-phorium-dark">
        {icon === "crown" ? (
          <Crown className="h-3 w-3" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold">{label}</span>
        <span className="text-[9px] text-phorium-light/80">{sub}</span>
      </div>
    </div>
  );
}
