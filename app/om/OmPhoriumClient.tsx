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
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-24 pb-32">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.4),transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-phorium-off/20 bg-phorium-surface/95 px-6 py-10 shadow-[0_28px_110px_rgba(0,0,0,0.68)] backdrop-blur-xl sm:px-12"
        >
          {/* Top CTA */}
          <div className="mb-7 flex flex-wrap gap-3 text-[11px]">
            <Link
              href="/priser"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/50 bg-phorium-accent/10 px-3 py-1.5 text-phorium-accent transition hover:bg-phorium-accent/20"
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
              <p className="mt-3 max-w-2xl text-sm text-phorium-light/80">
                Et norsk AI-verktøy for nettbutikker. Rolig tone, klare tekster
                og funksjoner som faktisk sparer tid – uten hype eller støy.
              </p>
            </div>

            {/* Icon Box */}
            <div className="shrink-0">
              <div className="grid h-44 w-44 place-content-center rounded-2xl border border-phorium-off/30 bg-phorium-dark shadow-[0_15px_60px_rgba(0,0,0,0.65)]">
                <Sparkles className="h-10 w-10 text-phorium-accent" />
              </div>
            </div>
          </div>

          {/* Tone of Voice & Why */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-xl font-semibold text-phorium-accent">
                Tone of Voice
              </h2>
              <ul className="space-y-3 text-[14px] text-phorium-light/85">
                <ListItem
                  icon={<MessageSquare className="h-4 w-4 text-phorium-accent" />}
                  text="Profesjonell, rolig og menneskelig – som en erfaren kollega."
                />
                <ListItem
                  icon={<Target className="h-4 w-4 text-phorium-accent" />}
                  text="Klart, kort og naturlig norsk. Ingen buzzwords, ingen støy."
                />
                <ListItem
                  icon={<Shield className="h-4 w-4 text-phorium-accent" />}
                  text="Nyttig fremfor «magisk». Vi lover lite, leverer jevnt."
                />
              </ul>
            </Card>

            <Card>
              <h2 className="mb-3 text-xl font-semibold text-phorium-accent">
                Hvorfor Phorium?
              </h2>
              <p className="text-[14px] text-phorium-light/85">
                De fleste AI-verktøy er enten altfor tekniske eller altfor
                pratsomme. Phorium er laget for norske nettbutikker – for deg som
                sitter i Shopify eller andre plattformer og trenger tekster,
                visuelle elementer og kontroll. AI som føles praktisk, ikke pyntete.
              </p>
            </Card>
          </div>

          {/* Values */}
          <div className="mt-12">
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
          <div className="mt-12">
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
                text="Enkle, merkevare-tro klipp for kampanjer og sosiale medier."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-phorium-off/30 bg-phorium-dark/95 px-6 py-6 shadow-[0_20px_70px_rgba(0,0,0,0.7)] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-phorium-accent">
                Bli med tidlig
              </p>
              <p className="text-[14px] text-phorium-light/85 max-w-lg">
                Vil du teste Phorium i butikk eller byrå? Vi tar inn noen få om
                gangen – med tett oppfølging.
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/studio" className="btn btn-primary btn-lg">
                Gå til Studio
              </Link>
              <Link href="/priser" className="btn btn-secondary btn-lg">
                Se priser
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

/* ---------- Reusable Components ---------- */

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-phorium-off/28 bg-phorium-surface/95 px-6 py-6 shadow-[0_22px_85px_rgba(0,0,0,0.65)] transition hover:shadow-[0_26px_100px_rgba(0,0,0,0.75)]">
      {children}
    </div>
  );
}

function ListItem({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-start gap-2">
      {icon}
      <span>{text}</span>
    </li>
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
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/95 px-5 py-5 shadow-[0_14px_55px_rgba(0,0,0,0.55)] hover:-translate-y-[1px] hover:shadow-[0_18px_75px_rgba(0,0,0,0.7)] transition">
      <div className="mb-2 inline-flex items-center gap-2 text-[12px] font-semibold text-phorium-accent">
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
  status: string;
  label: string;
  text: string;
}) {
  const tone =
    status === "Utrulling"
      ? "border-phorium-accent bg-phorium-accent/20 text-phorium-accent"
      : "border-phorium-off/40 bg-phorium-dark/90 text-phorium-light/80";

  return (
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/95 px-5 py-5 shadow-[0_14px_55px_rgba(0,0,0,0.55)] hover:-translate-y-[1px] hover:shadow-[0_18px_75px_rgba(0,0,0,0.7)] transition">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[10px] ${tone}`}
      >
        {status}
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-phorium-light">
        {label}
      </h3>
      <p className="text-[13px] text-phorium-light/75">{text}</p>
    </div>
  );
}
