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
  ArrowRight,
} from "lucide-react";

import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Card } from "@/app/components/ui/Card";

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

    void fetchStatus();
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

  // Høyreside i SectionHeader – statuspanel
  const statusRightSide = (
    <div className="flex flex-col items-start gap-1 text-[11px] sm:items-end">
      <div className="text-phorium-accent/90">Phorium Core-status</div>
      <div className="text-[14px]">
        <span className="font-semibold text-phorium-light">
          {connected ? "Tilkoblet" : "Avventer tilkobling"}
        </span>
        <span className="text-phorium-light/55"> / Shopify</span>
      </div>
      <div className="relative h-2.5 w-40 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
        <div className="absolute inset-0 bg-gradient-to-r from-phorium-accent/20 via-phorium-light/5 to-transparent" />
        <motion.div
          className="relative h-full bg-phorium-accent"
          initial={{ width: "0%" }}
          animate={{ width: connected ? "100%" : "55%" }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-phorium-dark pt-8 pb-20 text-phorium-light">
      <section className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Studio-header – samme stil som resten av Studio */}
          <SectionHeader
            label="Studio · Koble nettbutikk"
            title="Koble Phorium til Shopify"
            description="Når butikken er koblet, kan Phorium lese og oppdatere produkter – akkurat som Sidekick, bare på norsk og mer tilpasset nettbutikker."
            rightSlot={statusRightSide}
          />

          {/* Hovedkort */}
          <Card className="space-y-6 px-5 py-5 text-[12px] shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:px-7 sm:py-6">
            {/* Statusbadge helt øverst */}
            <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-[11px]">
              {loading ? (
                <>
                  <PlugZap className="h-3.5 w-3.5 animate-pulse text-phorium-light/60" />
                  <span>Sjekker tilkobling …</span>
                </>
              ) : connected && shop ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    Nettbutikk tilkoblet:&nbsp;
                    <span className="rounded-full bg-phorium-accent/15 px-2 py-0.5 font-semibold text-phorium-accent">
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

            {/* Hvorfor koble til? – 3 små kort */}
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/75 p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px]">
                <Gauge className="h-3.5 w-3.5 text-phorium-accent" />
                <span className="font-semibold text-phorium-light">
                  Hvorfor koble til Shopify?
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-phorium-off/30 bg-phorium-dark/80 p-3">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold">
                    <Store className="h-3.5 w-3.5 text-phorium-accent" />
                    Lesetilgang
                  </div>
                  <p className="text-[11px] text-phorium-light/75">
                    Phorium leser produktene dine (tittel, tekst, pris, bilder
                    osv.) direkte fra Shopify.
                  </p>
                </div>

                <div className="rounded-xl border border-phorium-off/30 bg-phorium-dark/80 p-3">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold">
                    <Link2 className="h-3.5 w-3.5 text-phorium-accent" />
                    Direkte oppdatering
                  </div>
                  <p className="text-[11px] text-phorium-light/75">
                    Når du lagrer fra Tekststudio eller Visuals, oppdateres
                    produktet direkte i Shopify.
                  </p>
                </div>

                <div className="rounded-xl border border-phorium-off/30 bg-phorium-dark/80 p-3">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold">
                    <ArrowRight className="h-3.5 w-3.5 text-phorium-accent" />
                    Fleksibel tilkobling
                  </div>
                  <p className="text-[11px] text-phorium-light/75">
                    Du kan koble til på nytt når som helst – f.eks. ved bytte
                    av butikk eller test-miljø.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[10px] text-phorium-light/60">
                <AlertTriangle className="mt-[2px] h-3.5 w-3.5 text-amber-300" />
                <span>
                  Du må være logget inn i Shopify som en bruker som har tilgang
                  til å installere apper og endre produkter.
                </span>
              </div>
            </div>

            {/* Input + knapp – hvitt felt + Shopify-ikon */}
            <div className="space-y-2 rounded-2xl border border-phorium-off/35 bg-phorium-dark/75 p-4">
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

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  {/* Shopify-lignende ikon */}
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-phorium-dark/45"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M17.5 4.2 14 3l-3.6 1.2L7 4.2 5.5 7.5 6.7 20l7.3 1.8L20 20l-1.3-12.5L17.5 4.2z"
                      fill="currentColor"
                      fillOpacity="0.18"
                    />
                    <path
                      d="M14.1 4.1 10.5 5.3 8.8 4.8 7.5 7.7l1.1 11.6 6.1 1.5 4.6-1.5-1.2-11.7-1.4-2.4-2.6-1Z"
                      stroke="currentColor"
                      strokeWidth="0.7"
                      fill="none"
                    />
                  </svg>

                  <input
                    value={shopInput}
                    onChange={(e) => setShopInput(e.target.value)}
                    placeholder="butikknavn eller butikknavn.myshopify.com"
                    className="
                      flex-1
                      rounded-full
                      border border-phorium-off/40
                      bg-white/95
                      px-8 pr-4 py-2
                      text-[13px] text-phorium-dark
                      shadow-sm
                      outline-none
                      placeholder:text-phorium-dark/40
                      focus:border-phorium-accent focus:ring-1 focus:ring-phorium-accent/40
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConnectClick}
                  disabled={!shopInput.trim()}
                  className="
                    inline-flex items-center justify-center gap-1.5
                    rounded-full
                    bg-phorium-accent
                    px-5 py-2
                    text-[12px] font-semibold text-phorium-dark
                    shadow-[0_10px_30px_rgba(0,0,0,0.6)]
                    transition
                    hover:bg-phorium-accent/90
                    disabled:opacity-50 disabled:shadow-none
                  "
                >
                  <Link2 className="h-3.5 w-3.5" />
                  {connected ? "Koble til på nytt" : "Koble til Shopify-butikken"}
                </button>
              </div>
            </div>

            {/* Videre-navigasjon når koblet */}
            {connected && (
              <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark/75 p-4">
                <p className="mb-2 text-phorium-light/80">
                  Butikken din er koblet. Nå kan du jobbe direkte på produktene:
                </p>
                <div className="flex flex-wrap gap-2 text-[12px]">
                  <Link
                    href="/studio/produkter"
                    className="rounded-full bg-phorium-accent px-5 py-2 font-semibold text-phorium-dark shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition hover:bg-phorium-accent/90"
                  >
                    Gå til produkter
                  </Link>
                  <Link
                    href="/studio/tekst"
                    className="rounded-full border border-phorium-off/40 bg-phorium-dark px-5 py-2 text-phorium-light/85 transition hover:border-phorium-accent hover:text-phorium-accent"
                  >
                    Se Tekststudio
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
