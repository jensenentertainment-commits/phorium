"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Link2,
  CheckCircle2,
  PlugZap,
  Store,
  AlertTriangle,
  Gauge,
} from "lucide-react";

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
    <main className="min-h-screen bg-phorium-dark pt-8 pb-20 text-phorium-light">
      <section className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Studio-header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-phorium-light/50">
                <Store className="h-3 w-3" />
                <span>Studio · Koble nettbutikk</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Koble Phorium til Shopify
              </h1>
              <p className="text-[12px] text-phorium-light/80 sm:text-[13px]">
                Når butikken er koblet, kan Phorium lese og oppdatere produkter –
                akkurat som Sidekick, bare på norsk og mer tilpasset nettbutikker.
              </p>
            </div>

            {/* Status / progress */}
            <div className="flex flex-col items-start gap-1 text-[11px] sm:items-end">
              <div className="text-phorium-accent/90">Phorium Core-status</div>
              <div className="text-[14px]">
                <span className="font-semibold text-phorium-light">
                  {connected ? "Tilkoblet" : "Avventer tilkobling"}
                </span>
                <span className="text-phorium-light/55"> / Shopify</span>
              </div>
              <div className="h-2.5 w-40 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
                <motion.div
                  className="h-full bg-phorium-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: connected ? "100%" : "45%" }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Hovedkort */}
          <div className="space-y-5 rounded-2xl border border-phorium-off/35 bg-phorium-dark/90 px-5 py-5 text-[12px] sm:px-7 sm:py-6">
            {/* Statusbadge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-[11px]">
              {loading ? (
                <>
                  <PlugZap className="h-3.5 w-3.5 text-phorium-light/60 animate-pulse" />
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

            {/* Forklaring */}
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4 text-[11px] text-phorium-light/80">
              <div className="mb-1 flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-phorium-accent" />
                <span className="font-semibold text-phorium-light">
                  Hva skjer når du kobler til?
                </span>
              </div>
              <ul className="ml-0 list-disc space-y-1 pl-4">
                <li>
                  Phorium får lesetilgang til produktene dine i Shopify
                  (tittel, tekst, pris, bilder osv.).
                </li>
                <li>
                  Når du lagrer fra Tekststudio eller Visuals, oppdateres
                  produktet direkte i Shopify.
                </li>
                <li>
                  Du kan koble til på nytt når som helst – f.eks. hvis du bytter
                  butikk eller test-miljø.
                </li>
              </ul>
              <div className="mt-2 flex items-start gap-2 text-[10px] text-phorium-light/60">
                <AlertTriangle className="mt-[2px] h-3.5 w-3.5 text-amber-300" />
                <span>
                  Du må være logget inn i Shopify som en bruker som har
                  tilgang til å installere apper og endre produkter.
                </span>
              </div>
            </div>

            {/* Input + knapp */}
            <div className="space-y-2 rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4">
              <p className="text-phorium-light/80">
                Skriv inn Shopify-butikkens adresse for å koble den til
                Phorium. Du kan bruke bare butikknavn{" "}
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-phorium-accent px-5 py-2 text-[12px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90 disabled:opacity-50"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {connected ? "Koble til på nytt" : "Koble til Shopify-butikken"}
                </button>
              </div>
            </div>

            {/* Videre-navigasjon når koblet */}
            {connected && (
              <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4">
                <p className="mb-2 text-phorium-light/80">
                  Butikken din er koblet. Nå kan du jobbe direkte på produktene:
                </p>
                <div className="flex flex-wrap gap-2 text-[12px]">
                  <Link
                    href="/studio/produkter"
                    className="rounded-full bg-phorium-accent px-5 py-2 font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90"
                  >
                    Gå til produkter
                  </Link>
                  <Link
                    href="/studio/tekst"
                    className="rounded-full border border-phorium-off/40 bg-phorium-dark px-5 py-2 text-phorium-light/85 transition hover:border-phorium-accent hover:text-phorium-accent"
                  >
                    Se tekststudio
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
