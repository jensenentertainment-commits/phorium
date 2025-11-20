"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  color?: "green" | "red" | "yellow" | "neutral";
  className?: string;
}

export default function PhoriumBadgeIcon({
  icon: Icon,
  color = "neutral",
  className = "",
}: Props) {
  const colors = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-300",
    neutral: "text-phorium-light/60",
  };

  return (
    <Icon className={`h-4 w-4 ${colors[color]} ${className}`} />
  );
}
