"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Compass,
  Rocket,
  Shield,
  Sparkles,
  ArrowRight,
  Target,
  MessageSquare,
  Clock,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

export default function OmPhoriumClient() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-20 pb-28">
      {/* Soft bakgrunnsglow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_65%)]" />

      <section className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10"
        >
          {/* Top bar */}
          <div className="mb-6 flex flex-wrap gap-3 text-[11px]">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80 transition hover:border-phorium-accent hover:text-phorium-light"
            >
              ← Tilbake til Studio
            </Link>
            <Link
              href="/priser"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/50 bg-phorium-dark px-3 py-1.5 text-phorium-accent/95 transition hover:bg-phorium-accent/10"
            >
              Se priser
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-phorium-light sm:text-4xl">
                Om Phorium
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-phorium-light/80">
                Et norsk AI-verktøy for nettbutikker. Rolig tone, klare tekster
                og funksjoner som faktisk sparer tid – uten hype eller støy.
              </p>
            </div>
            <div className="shrink-0">
              <div className="grid h-40 w-40 place-content-center rounded-2xl border border-phorium-off/35 bg-phorium-dark">
                <Sparkles className="h-8 w-8 text-phorium-accent" />
              </div>
            </div>
          </div>

          {/* Tone of Voice / Hvorfor */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="mb-2 text-xl font-semibold text-phorium-accent">
                Tone of Voice
              </h2>
              <ul className="space-y-2 text-[14px] text-phorium-light/85">
                <li className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 text-phorium-accent" />
                  <span>
                    Profesjonell, rolig og menneskelig – som en erfaren kollega.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="mt-0.5 h-4 w-4 text-phorium-accent" />
                  <span>
                    Klart, kort og naturlig norsk. Ingen buzzwords, ingen støy.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 text-phorium-accent" />
                  <span>
                    Nyttig fremfor «magisk». Vi lover lite, leverer jevnt.
                  </span>
                </li>
              </ul>
            </Card>

            <Card>
              <h2 className="mb-2 text-xl font-semibold text-phorium-accent">
                Hvorfor Phorium?
              </h2>
              <p className="text-[14px] text-phorium-light/85">
                De fleste AI-verktøy er enten altfor tekniske eller altfor
                pratsomme. Phorium er laget for norske nettbutikker – for deg som
                sitter i Shopify eller andre plattformer og trenger tekster,
                visuelle elementer og kontroll. AI som føles praktisk, ikke
                pyntete.
              </p>
            </Card>
          </div>

          {/* Verdier */}
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-phorium-accent">
              Verdier vi styrer etter
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ValueCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                title="Klarhet fremfor hype"
                text="Ingen store slagord – bare funksjoner som faktisk fungerer i hverdagen."
              />
              <ValueCard
                icon={<Compass className="h-4 w-4" />}
                title="Norsk først"
                text="Språk, tone og kontekst tilpasset norske nettbutikker og kunder."
              />
              <ValueCard
                icon={<Wrench className="h-4 w-4" />}
                title="Kontroll for brukeren"
                text="Du styrer tone, stil og output. Phorium følger din profil."
              />
              <ValueCard
                icon={<Clock className="h-4 w-4" />}
                title="Rask til nytte"
                text="Lav friksjon, tydelige steg, resultater du kan lime rett inn."
              />
              <ValueCard
                icon={<Shield className="h-4 w-4" />}
                title="Trygg leveranse"
                text="Ryggdekning på personvern og tydelige rammer for databruk."
              />
              <ValueCard
                icon={<Rocket className="h-4 w-4" />}
                title="Bygges i lag"
                text="Vi utvikler sammen med faktiske butikker og byråer – helt fra start."
              />
            </div>
          </div>

          {/* Roadmap */}
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-phorium-accent">
              Hva som er på vei
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <RoadItem
                status="Utrulling"
                label="Tidlig tilgang"
                text="Begrenset pilot for nettbutikker og byråer."
              />
              <RoadItem
                status="Neste"
                label="Phorium Connect"
                text="Dyp Shopify-integrasjon: hent produkter, push tekster og bilder."
              />
              <RoadItem
                status="Planlagt"
                label="Kreditter og teamroller"
                text="Rettigheter per bruker, delte profiler, logging og revisjon."
              />
              <RoadItem
                status="Vurderes"
                label="Video-visuals"
                text="Enkle, merkevare-tro snutter for kampanjer og sosiale medier."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-phorium-off/30 bg-phorium-dark px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-phorium-accent">
                Bli med tidlig
              </p>
              <p className="text-[14px] text-phorium-light/85">
                Vil du teste Phorium i butikk eller byrå? Vi tar inn noen få om
                gangen – med tett oppfølging.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/studio"
                className="rounded-full bg-phorium-accent px-4 py-2 text-[12px] font-semibold text-phorium-dark shadow transition hover:bg-phorium-accent/90"
              >
                Gå til Studio
              </Link>
              <Link
                href="/priser"
                className="rounded-full border border-phorium-off/40 bg-transparent px-4 py-2 text-[12px] text-phorium-accent/95 transition hover:bg-phorium-accent/10"
              >
                Se priser
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

/* ---------- Helpers ---------- */

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-5 py-5">
      {children}
    </div>
  );
}

function ValueCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-4 py-4">
      <div className="mb-1.5 inline-flex items-center gap-2 text-[12px] font-semibold text-phorium-accent">
        {icon}
        {title}
      </div>
      <p className="text-[13px] text-phorium-light/80">{text}</p>
    </div>
  );
}

function RoadItem({
  status,
  label,
  text,
}: {
  status: "Utrulling" | "Neste" | "Planlagt" | "Vurderes";
  label: string;
  text: string;
}) {
  const tone =
    status === "Utrulling"
      ? "border-phorium-accent bg-phorium-accent/15 text-phorium-accent"
      : status === "Neste"
      ? "border-phorium-off/40 bg-phorium-dark text-phorium-light/85"
      : status === "Planlagt"
      ? "border-phorium-off/40 bg-phorium-dark text-phorium-light/85"
      : "border-phorium-off/40 bg-phorium-dark text-phorium-light/85";

  return (
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-4 py-4">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[10px] ${tone}`}
      >
        {status}
      </div>
      <h3 className="mt-2 text-[15px] font-semibold text-phorium-light">
        {label}
      </h3>
      <p className="text-[13px] text-phorium-light/75">{text}</p>
    </div>
  );
}
