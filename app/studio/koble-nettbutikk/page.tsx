"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, CheckCircle2, PlugZap } from "lucide-react";

type StatusResponse = {
  connected: boolean;
  shop?: string;
};

export default function ConnectStorePage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [shop, setShop] = useState<string | undefined>(undefined);
  const [shopInput, setShopInput] = useState("");

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/shopify/status", { cache: "no-store" });
        const data: StatusResponse = await res.json();
        setConnected(data.connected);
        setShop(data.shop);
        if (data.shop) {
          setShopInput(data.shop);
        }
      } catch {
        // hvis noe feiler, antar vi ikke tilkoblet
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  function handleConnectClick() {
    const trimmed = shopInput.trim();
    if (!trimmed) return;

    // Aksepter både "butikknavn" og "butikknavn.myshopify.com"
    const shopDomain = trimmed.includes(".")
      ? trimmed
      : `${trimmed}.myshopify.com`;

    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(
      shopDomain,
    )}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="text-phorium-light"
    >
      {/* Header – samme stil/følelse som Tekst / Visuals */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Koble Phorium til Shopify
          </h1>
          <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
            Når butikken er koblet, kan Phorium lese og oppdatere produkter –
            akkurat som Sidekick, bare på norsk.
          </p>
        </div>

        {/* Liten "status-bar" for feel – kan tweakes */}
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="text-[11px] text-phorium-accent/90">
            Phorium Core-status
          </div>
          <div className="text-[14px]">
            <span className="font-semibold text-phorium-light">
              {connected ? "Tilkoblet" : "Avventer tilkobling"}
            </span>
            <span className="text-phorium-light/55"> / Shopify</span>
          </div>
          <div className="h-2 w-36 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
            <motion.div
              className="h-full bg-phorium-accent"
              initial={{ width: "0%" }}
              animate={{ width: connected ? "100%" : "45%" }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Hovedkort – matcher stil med resten av Studio */}
      <div className="space-y-5 rounded-2xl border border-phorium-off/35 bg-phorium-dark/90 px-5 py-5 sm:px-7 sm:py-6 text-[12px]">
        {/* Statusbadge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-[11px]">
          {loading ? (
            <>
              <PlugZap className="h-3.5 w-3.5 text-phorium-light/60" />
              <span>Sjekker tilkobling …</span>
            </>
          ) : connected && shop ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Nettbutikk tilkoblet:{" "}
                <span className="font-semibold text-phorium-accent">
                  {shop}
                </span>
              </span>
            </>
          ) : (
            <>
              <PlugZap className="h-3.5 w-3.5 text-phorium-light/60" />
              <span>Ingen nettbutikk er koblet til ennå.</span>
            </>
          )}
        </div>

        {/* Input + knapp */}
        <div className="space-y-2 rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4">
          <p className="text-phorium-light/80">
            Skriv inn Shopify-butikkens adresse for å koble den til Phorium.
            Du kan bruke bare butikknavn{" "}
            <span className="text-phorium-light/60">
              (f.eks. varekompaniet)
            </span>{" "}
            eller hele domenet{" "}
            <span className="text-phorium-light/60">
              (f.eks. varekompaniet.myshopify.com)
            </span>
            .
          </p>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={shopInput}
              onChange={(e) => setShopInput(e.target.value)}
              placeholder="butikknavn eller butikknavn.myshopify.com"
              className="flex-1 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-2 text-[12px] text-phorium-light outline-none placeholder:text-phorium-light/45 focus:border-phorium-accent focus:ring-1 focus:ring-phorium-accent/30"
            />
            <button
              type="button"
              onClick={handleConnectClick}
              disabled={!shopInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-phorium-accent px-5 py-2 text-[12px] font-semibold text-phorium-dark shadow-md transition disabled:opacity-50 hover:bg-phorium-accent/90"
            >
              <Link2 className="h-3.5 w-3.5" />
              {connected ? "Koble til på nytt" : "Koble til Shopify-butikken"}
            </button>
          </div>
        </div>

        {/* Videre-navigasjon */}
        {connected && (
          <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4">
            <p className="mb-2 text-phorium-light/80">
              Butikken din er koblet. Nå kan du jobbe direkte på produktene:
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/studio/produkter"
                className="rounded-full bg-phorium-accent px-5 py-2 text-[12px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90"
              >
                Gå til produkter
              </Link>
              <Link
                href="/studio/text"
                className="rounded-full border border-phorium-off/40 bg-phorium-dark px-5 py-2 text-[12px] text-phorium-light/85 transition hover:border-phorium-accent hover:text-phorium-accent"
              >
                Se tekststudio
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
