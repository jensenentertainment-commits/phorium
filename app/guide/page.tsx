"use client";

import { motion } from "framer-motion";

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
      {/* Subtil bakgrunn */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(0,0,0,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(0,0,0,0.55),transparent_75%)] mix-blend-multiply opacity-70" />

      <section className="mx-auto max-w-5xl space-y-10 px-4 pt-24 pb-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4 rounded-3xl border border-phorium-off/25 bg-phorium-surface/95 px-6 py-8 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10 sm:py-9"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[10px] tracking-wide text-phorium-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
            Phorium · Slik får du presise resultater
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Hvordan Phorium fungerer — og hvordan skrive gode prompts
          </h1>

          <p className="max-w-2xl text-[13px] text-phorium-light/80 sm:text-[14px]">
            Phorium er bygget for én ting: presise, kommersielle tekster og kampanjer
            for nettbutikker. Her er en kort guide til hvordan maskinen tenker, og hvordan
            du gir den nok kontekst til å levere innhold du faktisk kan lime rett inn.
          </p>

          <div className="grid gap-3 pt-2 text-[11px] text-phorium-light/82 sm:grid-cols-3">
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-3 py-3">
              <p className="mb-0.5 font-semibold text-phorium-accent">
                1 · Du beskriver behovet
              </p>
              <p>
                Produkt, kategori, kampanje eller annonse. Jo tydeligere du er, jo bedre
                blir resultatet.
              </p>
            </div>
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-3 py-3">
              <p className="mb-0.5 font-semibold text-phorium-accent">
                2 · Phorium tolker og strukturerer
              </p>
              <p>
                Prompten din pakkes inn i Phoriums egne regler for språk, lengde og stil.
              </p>
            </div>
            <div className="rounded-2xl border border-phorium-off/35 bg-phorium-dark px-3 py-3">
              <p className="mb-0.5 font-semibold text-phorium-accent">
                3 · Du får klart resultat
              </p>
              <p>
                Tekster returneres som ren norsk, strukturert og klar til publisering
                eller eksport via API.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hvordan Phorium tenker */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-4 rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-6 py-7 text-phorium-light shadow-[0_18px_70px_rgba(0,0,0,0.55)] sm:px-8"
        >
          <h2 className="text-xl font-semibold text-phorium-accent">
            Hva Phorium er trent til å gjøre
          </h2>
          <p className="max-w-3xl text-[12px] text-phorium-light/80">
            Under panseret bruker Phorium moderne språkmodeller kombinert med egne
            rammer for norsk språk, e-handel og SEO. Det betyr:
          </p>
          <ul className="grid gap-3 text-[12px] text-phorium-light/82 sm:grid-cols-2">
            <li className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-3 py-3">
              <span className="font-semibold text-phorium-accent">
                Presis kommersiell tone.
              </span>{" "}
              Ingen romantiske romaner. Fokus på konvertering, tydelighet og troverdighet.
            </li>
            <li className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-3 py-3">
              <span className="font-semibold text-phorium-accent">
                Strukturert output.
              </span>{" "}
              Tekster kan leveres som ren tekst eller strukturert JSON for enkel
              integrasjon.
            </li>
            <li className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-3 py-3">
              <span className="font-semibold text-phorium-accent">Norsk først.</span>{" "}
              Optimalisert for norske nettbutikker, valuta, frakt, retur og begreper.
            </li>
            <li className="rounded-2xl border border-phorium-off/30 bg-phorium-dark px-3 py-3">
              <span className="font-semibold text-phorium-accent">
                Kontrollert kreativitet.
              </span>{" "}
              Du styrer lengde, tone, fokus og kan låse stil mot din merkevare.
            </li>
          </ul>
        </motion.div>

        {/* Gode prompts vs dårlige */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid gap-5 lg:grid-cols-[1.3fr,1.7fr]"
        >
          {/* Tips-blokk */}
          <div className="space-y-3 rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-6 py-6 text-phorium-light shadow-[0_16px_60px_rgba(0,0,0,0.5)]">
            <h2 className="text-lg font-semibold text-phorium-accent">
              Slik skriver du prompts som gir gode tekster
            </h2>
            <ul className="space-y-2 text-[12px] text-phorium-light/82">
              <li>
                ✅ <strong>Spesifiser kontekst:</strong> produktnavn, kategori, målgruppe.
              </li>
              <li>
                ✅ <strong>Angi lengde:</strong> f.eks. 60–80 ord, 2 setninger, 3 varianter.
              </li>
              <li>
                ✅ <strong>Definer tone:</strong> nøktern, teknisk, varm, premium, direkte.
              </li>
              <li>
                ✅ <strong>Fortell hva som er viktig:</strong> materiale, levering, pris,
                bærekraft, garanti.
              </li>
              <li>
                ✅ <strong>Be om det du trenger:</strong> produkttekst, bullet points,
                meta-tittel, meta-beskrivelse.
              </li>
              <li>
                🚫 Unngå: "skriv noe kult" / "lag en tekst". Si heller hva teksten skal gjøre.
              </li>
            </ul>
          </div>

          {/* Eksempler-blokk */}
          <div className="space-y-3">
            {promptExamples.map((ex, idx) => (
              <motion.div
                key={ex.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.12 + idx * 0.05 }}
                className="rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-5 py-4 text-[11px] text-phorium-light/85 shadow-[0_14px_50px_rgba(0,0,0,0.45)]"
              >
                <p className="mb-1 font-semibold text-phorium-accent/95">
                  {ex.title}
                </p>
                <p className="mb-1 text-[11px] text-phorium-light/65">
                  Dårlig:{" "}
                  <span className="italic text-phorium-light/75">"{ex.bad}"</span>
                </p>
                <p>
                  Bedre:{" "}
                  <span className="text-phorium-light">"{ex.good}"</span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Teknisk / Trygghet */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="space-y-2 rounded-3xl border border-phorium-off/30 bg-phorium-surface/97 px-6 py-7 text-[11px] text-phorium-light/82 shadow-[0_16px_60px_rgba(0,0,0,0.5)] sm:px-8"
        >
          <h2 className="mb-1 text-sm font-semibold text-phorium-accent">
            Bak kulissene (for deg som vil vite det)
          </h2>
          <p>
            Phorium bruker moderne språkmodeller levert av OpenAI, pakket inn i et eget lag
            for norsk e-handel. Vi lagrer kun det som trengs for å levere tjenesten, og du
            beholder eierskap til tekstene du genererer.
          </p>
          <p>
            For byråer og tekniske team tilbyr vi Phorium Nexus — et API-lag som gir deg de
            samme strukturerte tekstene direkte inn i dine egne systemer, med tydelig
            kredittmodell og kontroll.
          </p>
          <p className="mt-2 text-phorium-accent/85">
            Kort sagt: Du skriver tydelig hva du trenger. Phorium gjør resten.
          </p>
        </motion.div>
      </section>
    </main>
  );
}
