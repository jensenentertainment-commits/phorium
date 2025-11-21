// app/components/BrandProfileBadge.tsx
"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import useBrandProfile from "@/hooks/useBrandProfile";

type Props = {
  className?: string;
};

export default function BrandProfileBadge({ className = "" }: Props) {
  const { brand, source } = useBrandProfile();

  if (!brand) return null;

  const parts: string[] = [];
  if (brand.industry) parts.push(brand.industry);
  if (brand.tone) parts.push(`Tone: ${brand.tone}`);
  if (source === "auto") parts.push("Auto fra Shopify");

  return (
    <div
      className={`mb-3 flex flex-wrap items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark/80 px-3 py-1.5 text-[11px] text-phorium-light/80 ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        <Sparkles className="h-3.5 w-3.5 text-phorium-accent" />
        <span className="font-medium text-phorium-accent">
          {brand.storeName || "Brandprofil"}
        </span>
      </span>

      {parts.length > 0 && (
        <span className="text-phorium-light/60">· {parts.join(" · ")}</span>
      )}

      <Link
        href="/studio/brandprofil"
        className="ml-auto rounded-full border border-phorium-off/40 bg-phorium-surface px-2.5 py-0.5 text-[10px] text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-accent"
      >
        Åpne brandprofil
      </Link>
    </div>
  );
}
