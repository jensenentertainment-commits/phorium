"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  PencilLine,
  Layers,
  ArrowRightCircle,
  Lightbulb,
  ListChecks,
  Type,
  FileText,
  Megaphone,
  Wand2,
  CheckCircle2,
  StopCircle,
} from "lucide-react";

const promptExamples = [
  {
    title: "Produkttekst · god prompt",
    bad: "Skriv om en genser.",
    good:
      "Lag en norsk produkttekst for en herregenser i 100 % merinoull. 80–100 ord. " +
      "Fokus på kvalitet, passform, bruksområde og enkel retur. Unngå tomme klisjeer.",
  },
  {
    title: "Kategoritekst · god prompt",
    bad: "Trenger tekst til sko.",
    good:
      "Lag en kort kategoritekst for løpesko til dame. 100–130 ord. " +
      "Fremhev komfort, løpsopplevelse og utvalg. Nøktern, kommersiell tone.",
  },
  {
    title: "Kampanje / SoMe · god prompt",
    bad: "Lag en reklame.",
    good:
      "Skriv 2 korte norske tekster til Meta Ads for sommersalg på badetøy. " +
      "Maks 18 ord hver. Tydelig CTA. Ikke bruk ordet 'billig'.",
  },
];

export default function GuidePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark">
      {/* Subtile bakgrunnsglow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(0,0,0,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(0,0,0,0.55),transparent_75%)] mix-blend-multiply opacity-70" />

      <section className="mx-auto max-w-5xl space-y-12 px-4 pt-24 pb-24">
        {/* ─────────────────────────────────────────────── */}
        {/* HERO */}
        {/* ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6 rounded-3xl border border-phorium-off/25 bg-phorium-surface/95 px-6 py-8 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10 sm:py-10"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[10px] tracking-wide text-phorium-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Phorium · Slik får du presise resultater
          </p>

          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            <Wand2 className="h-7 w-7 text-phorium-accent" />
            Hvordan skrive gode prompts i Phorium
          </h1>

          <p className="max-w-2xl text-[13px] text-phorium-light/80 sm:text-[14px]">
            Phorium er bygget for presise, kommersielle tekster og bannere.  
            Denne guiden viser hvordan du beskriver det du trenger – og hvorfor du får 
            så gode resultater når prompten er tydelig.
          </p>

          {/* 3 steps */}
          <div className="grid gap-3 pt-2 text-[11px] text-phorium-light/82 sm:grid-cols-3">
            <GuideStep
              icon={<PencilLine className="h-4 w-4" />}
              title="1 · Du beskriver behovet"
              text="Produkt, kategori, kampanje eller annonse. Jo tydeligere du er, jo bedre blir resultatet."
            />
            <GuideStep
              icon={<Layers className="h-4 w-4" />}
              title="2 · Phorium strukturerer"
              text="Prompten pakkes inn i Phoriums regler for språk, lengde og kommersiell stil."
            />
            <GuideStep
              icon={<ArrowRightCircle className="h-4 w-4" />}
              title="3 · Du får klart resultat"
              text="Tekst leveres ren, norsk og klar til publisering eller lagring tilbake i Shopify."
            />
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────── */}
        {/* Hva Phorium gjør */}
        {/* ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-4 rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-6 py-8 text-phorium-light shadow-[0_18px_70px_rgba(0,0,0,0.55)] sm:px-9"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-phorium-accent">
            <Lightbulb className="h-5 w-5 text-phorium-accent" />
            Hva Phorium er trent til å gjøre
          </h2>

          <p className="max-w-3xl text-[12px] text-phorium-light/80">
            Phorium bruker moderne språkmodeller kombinert med egne rammer for norsk
            e-handel, kommersiell tone, SEO og struktur. Det betyr:
          </p>

          <ul className="grid gap-3 text-[12px] text-phorium-light/82 sm:grid-cols-2">
            <InfoCard
              title="Presis kommersiell tone"
              text="Skrevet for å selge – ikke bare beskrive. Kort, tydelig og troverdig."
            />
            <InfoCard
              title="Strukturert output"
              text="Kan leveres som ren tekst eller JSON, perfekt for integrasjoner."
            />
            <InfoCard
              title="Norsk først"
              text="Optimalisert for norske nettbutikker, begreper og konverteringsfokus."
            />
            <InfoCard
              title="Kontrollert kreativitet"
              text="Du styrer tone, lengde og fokusområder. Phorium følger brandprofilen din."
            />
          </ul>
        </motion.div>

        {/* ─────────────────────────────────────────────── */}
        {/* Tips til gode prompts */}
        {/* ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid gap-5 lg:grid-cols-[1.3fr,1.7fr]"
        >
          {/* Tips-blokk */}
          <div className="space-y-3 rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-6 py-7 shadow-[0_16px_60px_rgba(0,0,0,0.5)]">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-phorium-accent">
              <Type className="h-5 w-5 text-phorium-accent" />
              Slik skriver du prompts som gir gode tekster
            </h2>

            <ul className="space-y-2 text-[12px] text-phorium-light/82">
              <li>
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-phorium-accent" />
                <strong>Spesifiser kontekst:</strong> produktnavn, kategori, målgruppe.
              </li>
              <li>
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-phorium-accent" />
                <strong>Angi lengde:</strong> f.eks. 60–80 ord, 2 setninger.
              </li>
              <li>
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-phorium-accent" />
                <strong>Definer tone:</strong> nøktern, teknisk, varm, premium.
              </li>
              <li>
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-phorium-accent" />
                <strong>Fremhev det viktige:</strong> materiale, levering, retur osv.
              </li>
              <li>
                <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-phorium-accent" />
                <strong>Be om riktig format:</strong> tekst, bullets, meta osv.
              </li>
              <li className="flex items-start gap-2">
  <StopCircle className="mt-[2px] h-3.5 w-3.5 text-red-400" />
  <span>
    <strong>Unngå:</strong> «skriv noe kult». Si heller hva målet faktisk er.
  </span>
</li>
            </ul>
          </div>

          {/* Eksempelkort */}
          <div className="space-y-4">
            {promptExamples.map((ex, idx) => (
              <motion.div
                key={ex.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.12 + idx * 0.05 }}
                className="rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-5 py-4 text-[11px] text-phorium-light/85 shadow-[0_14px_50px_rgba(0,0,0,0.45)]"
              >
                <p className="mb-1 flex items-center gap-2 font-semibold text-phorium-accent/95">
                  <FileText className="h-3.5 w-3.5 text-phorium-accent" />
                  {ex.title}
                </p>
                <p className="mb-1 text-[11px] text-phorium-light/65">
                  Dårlig: <span className="italic">"{ex.bad}"</span>
                </p>
                <p>
                  Bedre:{" "}
                  <span className="text-phorium-light font-medium">
                    "{ex.good}"
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────── */}
        {/* Teknisk / Trygghet */}
        {/* ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="space-y-3 rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-6 py-7 text-[11px] text-phorium-light/82 shadow-[0_16px_60px_rgba(0,0,0,0.5)] sm:px-8"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold text-phorium-accent">
            <CheckCircle2  className="h-4 w-4 text-phorium-accent" />
            Bak kulissene (for deg som vil vite mer)
          </h2>
          <p>
            Phorium er bygget på moderne språkmodeller levert av OpenAI, pakket inn i
            egne rammer for norsk e-handel, struktur og tone-of-voice.
          </p>
          <p>
            Du beholder eierskap til alle tekster. Vi lagrer kun det som trengs for å
            levere tjenesten.
          </p>
          <p className="mt-2 text-phorium-accent/85">
            Kort fortalt: Du beskriver behovet — Phorium gjør resten.
          </p>
        </motion.div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────── */
/* Reusable Components */
/* ─────────────────────────────────────────────── */

function GuideStep({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-3 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
      <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-phorium-accent">
        {icon}
        {title}
      </p>
      <p>{text}</p>
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <li className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-3 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
      <span className="font-semibold text-phorium-accent">{title}.</span>{" "}
      {text}
    </li>
  );
}
