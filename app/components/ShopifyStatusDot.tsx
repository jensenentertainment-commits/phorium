"use client";

import { useEffect, useState } from "react";

export default function ShopifyStatusDot({ className = "" }) {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/shopify/status", { cache: "no-store" });
        const data = await res.json();
        setConnected(data.connected);
      } catch {
        setConnected(false);
      }
    }

    fetchStatus();
  }, []);

  // Loading → gul blinkende prikk
  if (connected === null) {
    return (
      <div
        className={`h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400/80 shadow-[0_0_8px_rgba(255,255,0,0.6)] ${className}`}
        title="Sjekker Shopify-tilkobling…"
      />
    );
  }

  // Connected → grønn prikk med myk puls
  if (connected) {
    return (
      <div
        className={`h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-[pulseGlow_2.6s_ease-in-out_infinite] ${className}`}
        title="Shopify tilkoblet"
      />
    );
  }

  // Not connected → rød prikk
  return (
    <div
      className={`h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] ${className}`}
      title="Ikke tilkoblet Shopify"
    />
  );
}
