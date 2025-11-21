"use client";

import Link from "next/link";
import { Palette, Sparkles, BadgeCheck } from "lucide-react";
import useBrandProfile from "@/hooks/useBrandProfile";

type BrandBadgeVariant = "minimal" | "premium" | "neon";

type Props = {
  variant?: BrandBadgeVariant;
  className?: string;
};

export default function BrandBadge({ variant = "premium", className }: Props) {
  const { brand, source } = useBrandProfile();

  if (!brand) return null; // Ikke vis før vi faktisk har noe lagret

  const label =
    brand.storeName && brand.storeName.trim().length > 0
      ? brand.storeName
      : "Uten navn";

  const toneSuffix = brand.tone ? ` · ${brand.tone}` : "";

  const isAuto = source === "auto";

  const baseClass =
    "inline-flex items-center gap-2 rounded-full text-[11px] transition-colors";

  const variants: Record<BrandBadgeVariant, string> = {
    minimal:
      "border border-phorium-off/35 px-2.5 py-1 bg-transparent hover:bg-phorium-dark/40",
    premium:
      "border border-phorium-off/30 bg-phorium-dark/60 px-3 py-1.5 shadow-sm hover:bg-phorium-dark/80",
    neon:
      "border border-phorium-accent/70 bg-phorium-dark/80 px-3 py-1.5 shadow-lg pulse-glow",
  };

  const iconClasses = {
    minimal: "w-3.5 h-3.5 text-phorium-accent/80",
    premium: "w-3.5 h-3.5 text-phorium-accent",
    neon: "w-3.5 h-3.5 text-phorium-accent",
  }[variant];

  const Icon =
    variant === "minimal"
      ? BadgeCheck
      : variant === "premium"
      ? Palette
      : Sparkles;

  return (
    <Link
      href="/studio/brandprofil"
      className={`${baseClass} ${variants[variant]} ${className ?? ""}`}
    >
      {/* Ikon */}
      <Icon className={iconClasses} />

      {/* Hovedtekst */}
      <span className="text-phorium-light/85">
        {label}
        {toneSuffix}
      </span>

      {/* Auto-chip */}
      {isAuto && (
        <span className="flex items-center gap-1 rounded-full bg-phorium-accent/15 px-2 py-0.5 text-[10px] text-phorium-accent/90">
          <Sparkles className="w-3 h-3" />
          auto
        </span>
      )}
    </Link>
  );
}
