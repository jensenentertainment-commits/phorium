"use client";

import Link from "next/link";
import { Sparkles, Boxes, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-[80vh] bg-phorium-dark">
      {/* HERO */}
      <section className="relative px-4 py-16 sm:py-20">
        {/* Soft spotlight bak kortet */}
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div className="h-[420px] w-[90%] max-w-4xl rounded-[50px] bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.32),_transparent_60%)] opacity-80" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-10 lg:flex-row lg:items-center">
          {/* Hero-kort */}
          <div className="w-full rounded-[32px] bg-phorium-surface px-7 py-9 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-phorium-accent">
              Norsk AI for nettbutikker
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-tight text-phorium-light">
              Phorium Platform
            </h1>
            <p className="mt-4 text-sm sm:text-base text-phorium-light/80">
              En norsk AI-plattform for tekst, visuals og Shopify-verktøy. Lag
              produkttekster, kategoritekster og kampanjebannere på minutter –
              ikke timer.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center rounded-full bg-phorium-accent px-5 py-2.5 text-xs sm:text-sm font-medium text-phorium-dark transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.7)]"
              >
                Åpne Phorium Studio
              </Link>
              <Link
                href="/priser"
                className="inline-flex items-center justify-center rounded-full border border-phorium-off/40 px-5 py-2.5 text-xs sm:text-sm text-phorium-light/85 transition-all duration-150 ease-out hover:border-phorium-accent/70 hover:text-phorium-light"
              >
                Se planene
              </Link>
            </div>

            {/* liten ikonrad under CTA */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-phorium-light/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-phorium-accent" strokeWidth={2} />
                <span>Genererer på norsk</span>
              </div>
              <div className="flex items-center gap-2">
                <Boxes className="h-3.5 w-3.5 text-phorium-accent" strokeWidth={2} />
                <span>Bygget for Shopify-butikker</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-phorium-accent" strokeWidth={2} />
                <span>Data trygt lagret i Norge/EU</span>
              </div>
            </div>
          </div>

          {/* Liten “preview” av Studio – skjules på mobil */}
          <div className="hidden flex-1 rounded-[28px] bg-phorium-surface/60 p-[1px] shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-sm lg:block">
            <div className="h-full rounded-[26px] bg-phorium-dark/70 px-5 py-4">
              <div className="mb-4 flex items-center justify-between text-[11px] text-phorium-light/60">
                <span>Phorium Studio</span>
                <span className="rounded-full bg-phorium-accent/15 px-3 py-1 text-[10px] font-medium text-phorium-accent">
                  Live preview
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-[18px] bg-phorium-surface px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
                    Produkttekst
                  </p>
                  <p className="mt-2 text-[12px] text-phorium-light/85">
                    “En robust, nordisk inspirert kjøkkenmaskin for hverdagsbruk –
                    skrevet for å konvertere, ikke bare beskrive.”
                  </p>
                </div>
                <div className="rounded-[18px] bg-phorium-surface px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
                    Kampanjebanner
                  </p>
                  <p className="mt-2 text-[12px] text-phorium-light/85">
                    “Høstkampanje – 20% på utvalgte favoritter. Klar til bruk i
                    nyhetsbrev, sosiale medier og på forsiden.”
                  </p>
                </div>
                <div className="rounded-[18px] bg-phorium-surface px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
                    Tone of voice
                  </p>
                  <p className="mt-2 text-[12px] text-phorium-light/80">
                    Direkte, tydelig og uten unødvendig buzzwords. Bare tekst som
                    hjelper kundene dine å handle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDIO-SEKSJON */}
      <section className="px-4 pb-14 pt-6 sm:pb-18">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row lg:items-start">
          <div className="w-full lg:w-1/3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
              Phorium Studio
            </p>
            <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-phorium-light">
              Tekst og visuals på norsk – i samme flate
            </h2>
            <p className="mt-3 text-sm text-phorium-light/80">
              Studio samler tekstgenerator, bilde- og bannerverktøy i én rolig
              arbeidsflate. Du slipper å hoppe mellom verktøy – alt er tilpasset
              norske nettbutikker.
            </p>
            <p className="mt-3 text-[11px] text-phorium-light/65">
              Tilpasset både eiere, markedsførere og byråer som jobber med flere
              butikker.
            </p>
          </div>

          <div className="flex w-full flex-1 flex-col gap-4 sm:grid sm:grid-cols-2">
            <div className="rounded-[24px] bg-phorium-surface px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] transition-all duration-150 ease-out hover:-translate-y-0.5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-phorium-accent">
                Tekst
              </p>
              <h3 className="mt-2 text-sm font-semibold text-phorium-light">
                Produkt-, kategori- og kampanjetekster
              </h3>
              <p className="mt-2 text-xs text-phorium-light/80">
                Generer tekster som faktisk passer nettbutikk-språk, ikke generisk
                AI-prat. Full støtte for norsk og fokus på konvertering.
              </p>
            </div>

            <div className="rounded-[24px] bg-phorium-surface px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] transition-all duration-150 ease-out hover:-translate-y-0.5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-phorium-accent">
                Visuals
              </p>
              <h3 className="mt-2 text-sm font-semibold text-phorium-light">
                Bannere, utsnitt og kreative flater
              </h3>
              <p className="mt-2 text-xs text-phorium-light/80">
                Lag enkle kampanjebilder og bannere, klare til bruk i Shopify,
                nyhetsbrev eller sosiale medier. Norsk kontekst – ikke generisk
                stock-look.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE / TRYGGHET */}
      <section className="px-4 pb-14">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-[20px] bg-phorium-surface px-4 py-4 text-sm text-phorium-light/85">
            <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
              Bygget for Norge
            </p>
            <p className="mt-2 text-[13px]">
              Fokus på norsk språk, norske butikker og norske betalings- og
              fraktvaner.
            </p>
          </div>
          <div className="rounded-[20px] bg-phorium-surface px-4 py-4 text-sm text-phorium-light/85">
            <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
              Shopify-klar
            </p>
            <p className="mt-2 text-[13px]">
              Phorium utvikles side om side med egne Shopify-apper for frakt og
              trust badges.
            </p>
          </div>
          <div className="rounded-[20px] bg-phorium-surface px-4 py-4 text-sm text-phorium-light/85">
            <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-accent">
              Enkel hverdag
            </p>
            <p className="mt-2 text-[13px]">
              Målet er ikke mer “AI-støy”, men færre verktøy og raskere vei fra
              idé til publisert innhold.
            </p>
          </div>
        </div>
      </section>

      {/* NEDERST CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-[28px] bg-phorium-surface px-7 py-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-phorium-accent">
            Klar når du er
          </p>
          <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-phorium-light">
            Bygget for norske nettbutikker – ikke for alle.
          </h2>
          <p className="mt-3 text-sm text-phorium-light/80">
            Phorium lanseres trinnvis. Start med Studio, og koble til Shopify etter
            hvert som appene våre kommer på plass.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:text-sm">
            <Link
              href="/priser"
              className="inline-flex items-center justify-center rounded-full bg-phorium-accent px-5 py-2.5 text-xs sm:text-sm font-medium text-phorium-dark transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(0,0,0,0.7)]"
            >
              Se planene
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-full border border-phorium-off/40 px-5 py-2.5 text-xs sm:text-sm text-phorium-light/85 transition-all duration-150 ease-out hover:border-phorium-accent/70 hover:text-phorium-light"
            >
              Ta en prat først
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
