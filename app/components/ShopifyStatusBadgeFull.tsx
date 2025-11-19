"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PlugZap } from "lucide-react";

export default function ShopifyStatusBadgeFull() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [shop, setShop] = useState<string | undefined>();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/shopify/status", { cache: "no-store" });
        const data = await res.json();
        setConnected(data.connected);
        setShop(data.shop);
      } catch {
        setConnected(false);
      }
    }

    fetchStatus();
  }, []);

  // Loading → gul prikk + tekst
  if (connected === null) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-[12px] text-yellow-300">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400/90 shadow-[0_0_8px_rgba(255,255,0,0.5)]" />
        <span>Sjekker Shopify-tilkobling …</span>
      </div>
    );
  }

  // Connected → grønn
  if (connected) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/15 px-3 py-1.5 text-[12px] text-emerald-300">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        <span className="font-medium">Nettbutikk koblet</span>
        {shop && (
          <span className="text-emerald-200/80">Shopify · {shop}</span>
        )}
      </div>
    );
  }

  // Not connected → rød
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-[12px] text-red-300">
      <PlugZap className="h-4 w-4 text-red-300" />
      <span className="font-medium">Ikke koblet</span>
      <span className="text-red-200/70">Koble til Shopify</span>
    </div>
  );
}
