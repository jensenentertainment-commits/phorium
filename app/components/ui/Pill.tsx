import * as React from "react";

type PillVariant = "neutral" | "accent" | "outline" | "danger";
type PillSize = "sm" | "md";

type PillProps = {
  children: React.ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
};

export function Pill({
  children,
  variant = "neutral",
  size = "sm",
  className,
}: PillProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full border text-[10px] uppercase tracking-[0.16em]";

  const sizeClass =
    size === "sm" ? "px-3 py-1" : "px-4 py-1.5 text-[11px]";

  const variantClass =
    variant === "accent"
      ? "border-phorium-accent/60 bg-phorium-accent/15 text-phorium-accent/95"
      : variant === "outline"
      ? "border-phorium-off/40 bg-phorium-dark/70 text-phorium-light/80"
      : variant === "danger"
      ? "border-red-500/60 bg-red-500/10 text-red-200"
      : "border-phorium-off/35 bg-phorium-dark/80 text-phorium-light/75";

  return (
    <span className={`${base} ${sizeClass} ${variantClass} ${className ?? ""}`}>
      {children}
    </span>
  );
}
