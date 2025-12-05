import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "xs";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";

  const sizeClass =
    size === "xs"
      ? "px-2.5 py-1 text-[11px]"
      : size === "sm"
      ? "px-3 py-1.5 text-[12px]"
      : "px-4 py-2 text-[13px]";

  const variantClass =
    variant === "primary"
      ? "bg-phorium-accent text-phorium-dark shadow-[0_10px_28px_rgba(0,0,0,0.6)] hover:bg-phorium-accent/95"
      : variant === "secondary"
      ? "border border-phorium-off/40 bg-phorium-dark text-phorium-light hover:bg-phorium-dark/80"
      : "text-phorium-light/80 hover:bg-phorium-dark/60";

  return (
    <button
      className={`${base} ${sizeClass} ${variantClass} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
