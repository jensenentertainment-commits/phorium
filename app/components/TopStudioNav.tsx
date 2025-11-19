"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Image as ImageIcon, Link2 } from "lucide-react";
import ShopifyStatusDot from "@/app/components/ShopifyStatusDot";

export default function TopStudioNav() {
  const pathname = usePathname();

  const isHub = pathname === "/studio";
  const isText = pathname.startsWith("/studio/text");
  const isVisuals = pathname.startsWith("/studio/visuals");
  const isConnect = pathname.startsWith("/studio/koble-nettbutikk");

  // 🔌 Hent Shopify-status for å styre knappetekst
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/shopify/status", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setConnected(!!data.connected);
        }
      } catch {
        if (!cancelled) {
          setConnected(false);
        }
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mb-8 flex justify-center">
      <div className="flex w-full max-w-6xl items-center justify-between rounded-3xl border border-phorium-off/25 bg-phorium-surface px-5 py-4 shadow-[0_18px_70px_rgba(0,0,0,0.55)] flex justify-center">
        {/* Venstre: tabs */}
        <nav className="flex flex-wrap items-center gap-3">
          <Link
            href="/studio"
            className={`btn-tab ${isHub ? "btn-tab-active" : ""}`}
          >
            <Home />
            Studio-oversikt
          </Link>

          <Link
            href="/studio/text"
            className={`btn-tab ${isText ? "btn-tab-active" : ""}`}
          >
            <FileText />
            Tekst
          </Link>

          <Link
            href="/studio/visuals"
            className={`btn-tab ${isVisuals ? "btn-tab-active" : ""}`}
          >
            <ImageIcon />
            Visuals
          </Link>

          <Link
            href="/studio/koble-nettbutikk"
            className={`btn-tab ${isConnect ? "btn-tab-active" : ""}`}
          >
            <Link2 />
            {connected ? "Tilkoblet" : "Koble til nettbutikk"}
          </Link>
        </nav>

        {/* Høyre: liten status-prikk */}
        <div className="flex items-center">
  <ShopifyStatusDot className="ml-4" />
</div>

      </div>
    </div>
  );
}
