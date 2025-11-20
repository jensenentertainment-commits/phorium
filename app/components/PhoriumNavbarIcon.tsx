"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}

export default function PhoriumNavbarIcon({
  icon: Icon,
  active = false,
  className = "",
}: Props) {
  return (
    <Icon
      className={`
        h-5 w-5 transition
        ${active ? "text-phorium-accent" : "text-phorium-light/60"}
        hover:text-phorium-accent
        ${className}
      `}
    />
  );
}
