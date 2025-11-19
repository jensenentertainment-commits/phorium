"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ShopifyStatusBadge() {
  const [connected, setConnected] = useState(false);
  const [shop, setShop] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/shopify/status", { cache: "no-store" });
        const data = await res.json();
        setConnected(data.connected);
        setShop(data.shop || null);
      } catch {
        setConnected(false);
        setShop(null);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, []);

  // Felles base-klasser – IDENTISK som de andre knappene
  const baseClasses =
    "inline-flex items-center gap-2 rounded-full border bg-phorium-dark px-3 py-1.5 text-[11px] transition";

  if (loading) {
    return (
      <div
        className={`${baseClasses} border-phorium-off/35 text-phorium-light/80`}
      >
        <span className="opacity-80">Sjekker Shopify-tilkobling …</span>
      </div>
    );
  }

  if (connected && shop) {
    // Tilkoblet – samme form som knappene, men med accent-farge på tekst/border
    return (
      <div
        className={`${baseClasses} border-phorium-accent/70 text-phorium-accent`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
        <span className="font-semibold">Tilkoblet</span>
        <span className="text-phorium-light/80">{shop}</span>
      </div>
    );
  }

  // Ikke koblet – ser ut som en vanlig nav-knapp med hover-effekt
  return (
    <Link
      href="/studio/koble-nettbutikk"
      className={`${baseClasses} border-phorium-off/35 text-phorium-light/80 hover:border-phorium-accent hover:text-phorium-accent`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
      <span>Ikke koblet</span>
      <span className="opacity-80">Koble til Shopify</span>
    </Link>
  );
}
