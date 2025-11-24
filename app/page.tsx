"use client";

import Link from "next/link";
import { Sparkles, Boxes, ShieldCheck } from "lucide-react";
import { usePhoriumUser } from "@/hooks/usePhoriumUser";


export default function HomePage() {
  return (
    
    <main className="min-h-[80vh] bg-phorium-dark">
      {/* HERO */}
      <section className="relative px-4 py-16 sm:py-20">
        {/* Soft spotlight bak kortet */}
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div className="h-[420px] w-[92%] max-w-4xl rounded-[56px] bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.32),_transparent_60%)] opacity-80" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
          {/* Venstre kolonne – tekst */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-phorium-off/30 bg-phorium-surface/70 px-3 py-1 text-[11px] text-phorium-light/80 backdrop-blur">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-phorium-accent" />
              <span>AI bygget for norske nettbutikker</span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-phorium-light sm:text-4xl lg:text-[2.7rem]">
              Tekst og bannere som faktisk er
              <span className="text-phorium-accent"> laget for butikken din</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm text-phorium-light/80 sm:text-[15px]">
              Phorium hjelper deg å skrive produkttekster, kategorisider, kampanjer
              og bannere på norsk – med riktig tone, riktig lengde og klar for bruk
              i Shopify eller andre nettbutikker.
            </p>

            <ul className="mt-5 space-y-2 text-[13px] text-phorium-light/80">
              <li className="flex items-start gap-2">
                <Sparkles className="mt-[2px] h-4 w-4 text-phorium-accent" />
                <span>Produkttekster som er skrevet for å selge, ikke bare beskrive.</span>
              </li>
              <li className="flex items-start gap-2">
                <Boxes className="mt-[2px] h-4 w-4 text-phorium-accent" />
                <span>Bannere og kampanjebilder klare til bruk i nettbutikken.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-[2px] h-4 w-4 text-phorium-accent" />
                <span>Norsk språk, norske referanser og trygg håndtering av brandet ditt.</span>
              </li>
            </ul>

            {/* CTA-knapper */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/studio" className="btn btn-primary btn-lg">
                Åpne Phorium Studio
              </Link>
              <Link href="/priser" className="btn btn-secondary btn-lg">
                Se planene
              </Link>
              <p className="text-[11px] text-phorium-light/55">
                Ingen kortinformasjon for å teste beta-versjonen.
              </p>
            </div>
          </div>

          {/* Høyre kolonne – “preview” av Studio (skjules på mobil) */}
          <div className="hidden flex-1 rounded-[28px] border border-phorium-off/30 bg-phorium-surface/50 p-[2px] shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-md lg:block">
            <div className="h-full rounded-[26px] bg-phorium-dark/90 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
              <div className="mb-4 flex items-center justify-between text-[11px] text-phorium-light/60">
                <span>Phorium Studio</span>
                <span className="rounded-full bg-phorium-accent/15 px-3 py-1 text-[10px] font-medium text-phorium-accent">
                  Live preview
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-[18px] border border-phorium-off/35 bg-phorium-surface px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.55)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-phorium-accent">
                    Produkttekst
                  </p>
                  <p className="mt-2 text-[12px] text-phorium-light/85">
                    “En robust, nordisk inspirert kjøkkenmaskin for hverdagsbruk –
                    skrevet for å konvertere, ikke bare beskrive.”
                  </p>
                </div>

                <div className="rounded-[18px] border border-phorium-off/35 bg-phorium-surface px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.55)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-phorium-accent">
                    Kampanjebanner
                  </p>
                  <p className="mt-2 text-[12px] text-phorium-light/85">
                    “Høstkampanje – 20% på utvalgte favoritter. Klar til bruk i
                    nyhetsbrev, sosiale medier og på forsiden.”
                  </p>
                </div>

                <div className="rounded-[18px] border border-phorium-off/35 bg-phorium-surface px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.55)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-phorium-accent">
                    Tone-of-voice
                  </p>
                  <p className="mt-2 text-[12px] text-phorium-light/85">
                    “Raust, tydelig og hjelpsomt språk – tilpasset en norsk
                    nettbutikk som vil være mer personlig enn katalog.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seksjon: Hvorfor Phorium */}
      <section className="border-t border-phorium-off/20 bg-phorium-surface/40 px-4 py-12 sm:py-14">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.26em] text-phorium-accent">
              Hvorfor Phorium?
            </p>
            <h2 className="mt-3 text-xl font-semibold text-phorium-light sm:text-2xl">
              Mindre blanke felter. Mer ferdig innhold.
            </h2>
            <p className="mt-3 text-sm text-phorium-light/80">
              Du trenger ikke enda et komplisert verktøy – du trenger hjelp til å
              fylle nettbutikken med godt innhold, raskt. Phorium er bygget rundt
              det du faktisk gjør i hverdagen.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Produkt- og kategoritekster",
                tag: "Tekst",
                body: "Skriv tekster som matcher brandet ditt og er klare til å lime rett inn i Shopify eller andre plattformer.",
              },
              {
                title: "Kampanjer uten kaos",
                tag: "Kampanjer",
                body: "Lag tekster til forsiden, nyhetsbrev, sosiale medier og annonser på samme sted – med konsistent budskap.",
              },
              {
                title: "Bannere og kampanjebilder",
                tag: "Visuals",
                body: "Generer enkle bannere og kampanjebilder med norsk tekst, tilpasset butikken din – ikke generisk stock.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-phorium-off/28 bg-phorium-surface/95 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition-transform transition-shadow hover:-translate-y-[2px] hover:shadow-[0_24px_70px_rgba(0,0,0,0.75)]"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-phorium-accent">
                  {card.tag}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-phorium-light">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs text-phorium-light/80">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seksjon: Hvem er det for? */}
      <section className="px-4 py-12 sm:py-14">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.26em] text-phorium-accent">
              Hvem bruker Phorium?
            </p>
            <h2 className="mt-3 text-xl font-semibold text-phorium-light sm:text-2xl">
              Laget for nettbutikker og små team.
            </h2>
            <p className="mt-3 text-sm text-phorium-light/80">
              Enten du driver en egen nettbutikk eller jobber i et lite markedsførings­
              team, er Phorium laget for å være lett å komme i gang med – og lett å
              dele med andre.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-phorium-off/28 bg-phorium-surface/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition-transform transition-shadow hover:-translate-y-[2px] hover:shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
              <h3 className="text-sm font-semibold text-phorium-light">
                Nettbutikker
              </h3>
              <p className="mt-2 text-xs text-phorium-light/80">
                Få hjelp til å skrive tekster når du legger inn nye produkter, kjører
                kampanjer eller skal rydde opp i gamle kategorisider.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] text-phorium-light/75">
                <li>• Raskere lansering av nye produkter</li>
                <li>• Mer konsistent språk i hele butikken</li>
                <li>• Mindre “jeg tar det senere”-innhold</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-phorium-off/28 bg-phorium-surface/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition-transform transition-shadow hover:-translate-y-[2px] hover:shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
              <h3 className="text-sm font-semibold text-phorium-light">
                Byråer og frilansere
              </h3>
              <p className="mt-2 text-xs text-phorium-light/80">
                Bruk Phorium som et ekstra verktøy når du skriver for flere kunder
                – med fokus på nordisk språk og tydelig struktur.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] text-phorium-light/75">
                <li>• Raskere førsteutkast til tekster</li>
                <li>• Enklere å tilpasse tone-of-voice per kunde</li>
                <li>• Mindre manuelt copy-paste-kaos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bunn-CTA */}
      <section className="border-t border-phorium-off/20 bg-phorium-surface/40 px-4 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-start gap-5 rounded-3xl border border-phorium-off/30 bg-phorium-dark/90 px-5 py-6 shadow-[0_22px_70px_rgba(0,0,0,0.7)] sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-phorium-accent">
                Klar når du er
              </p>
              <h2 className="mt-3 text-lg font-semibold text-phorium-light sm:text-xl">
                Test Phorium Studio og se om det passer for deg.
              </h2>
              <p className="mt-2 text-sm text-phorium-light/80">
                Du kan starte i Studio og prøve tekst og visuals, og heller ta en
                prat med oss før du velger plan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/studio" className="btn btn-primary btn-lg">
                Gå til Studio
              </Link>
              <Link href="/kontakt" className="btn btn-secondary btn-lg">
                Ta en prat først
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
