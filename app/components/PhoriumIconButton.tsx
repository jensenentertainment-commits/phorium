"use client";

import { LucideIcon } from "lucide-react";

interface PhoriumIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

export default function PhoriumIconButton({
  icon: Icon,
  label,
  onClick,
  href,
  variant = "primary",
  size = "md",
  className = "",
}: PhoriumIconButtonProps) {

  const base =
    "inline-flex items-center gap-2 rounded-full transition font-medium";

  const sizes = {
    sm: "text-[11px] px-3 py-1.5",
    md: "text-[12px] px-4 py-2",
  };

  const variants = {
    primary:
      "bg-phorium-accent text-phorium-dark hover:bg-phorium-accent/90 shadow-sm",
    outline:
      "border border-phorium-off/40 text-phorium-light/80 hover:border-phorium-accent hover:text-phorium-accent",
    ghost: "text-phorium-light/60 hover:text-phorium-accent",
  };

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  const content = (
    <>
      <Icon className="h-4 w-4" />
      {label}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
