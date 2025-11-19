import { Suspense } from "react";
import Link from "next/link";
import { Home, FileText, Image as ImageIcon, Link2 } from "lucide-react";
import PhoriumTextForm from "@/app/components/PhoriumTextForm";


export default function TextPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-24 pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10">
          {/* Top navigation */}
          <div className="mb-8 flex flex-wrap gap-3 text-[11px]">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80"
            >
              <Home className="h-3.5 w-3.5 text-phorium-accent" />
              Studio-oversikt
            </Link>

            <Link
              href="/studio/text"
              className="inline-flex items-center gap-2 rounded-full bg-phorium-accent px-3 py-1.5 text-[11px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90"
            >
              <FileText className="h-3.5 w-3.5 text-phorium-dark" />
              Tekst
            </Link>

            <Link
              href="/studio/visuals"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-accent"
            >
              <ImageIcon className="h-3.5 w-3.5 text-phorium-accent" />
              Visuals
            </Link>

            <Link
              href="/studio/koble-nettbutikk"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-accent transition hover:border-phorium-accent hover:text-phorium-light"
            >
              <Link2 className="h-3.5 w-3.5 text-phorium-accent" />
              Koble til nettbutikk
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Phorium Tekst
              </h1>
              <p className="text-[13px] text-phorium-light/80 sm:text-[14px]">
                Generer produkt- og kategoritekster – eller bruk et ekte
                Shopify-produkt for å få ferdig tekstpakke.
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <div className="text-[11px] text-phorium-accent/90">
                Kreditter igjen
              </div>
              <div className="text-[14px]">
                <span className="font-semibold text-phorium-light">996</span>
                <span className="text-phorium-light/55"> / 1000</span>
              </div>
              <div className="h-2 w-36 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
                <div className="h-full w-[99.6%] bg-phorium-accent" />
              </div>
            </div>
          </div>

          {/* Tekstgeneratoren – må ligge i Suspense pga useSearchParams */}
          <Suspense
            fallback={
              <div className="mt-4 rounded-2xl border border-phorium-off/35 bg-phorium-dark/70 p-4 text-[12px] text-phorium-light/80">
                Laster tekststudio …
              </div>
            }
          >
            <PhoriumTextForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
