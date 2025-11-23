import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Store, Users, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt | Phorium",
  description:
    "Ta kontakt med Phorium for spørsmål, samarbeid eller tidlig tilgang i beta-perioden.",
};

export default function KontaktPage() {
  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-phorium-dark pt-20 pb-24">
      {/* Subtil bakgrunn / glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(200,183,122,0.16),transparent_75%)] mix-blend-screen" />

      <section className="w-full max-w-4xl px-4">
        {/* Intro */}
        <div className="mb-9 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/10 px-4 py-1 text-[11px] uppercase tracking-[0.18em] text-phorium-accent/95">
            <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
            Kontakt Phorium
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-phorium-light sm:text-4xl">
            Ta kontakt før vi åpner bredt
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-[14px] leading-relaxed text-phorium-light/75 sm:text-[15px]">
            Phorium er i kontrollert utrulling. Har du en nettbutikk, et byrå
            eller et prosjekt der dette kan passe inn, send en kort forespørsel –
            så vurderer vi deg for tidlig tilgang.
          </p>
        </div>

        {/* Kort */}
        <div className="space-y-6 rounded-3xl border border-phorium-off/30 bg-phorium-surface/95 px-6 py-7 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.78)] backdrop-blur-xl sm:px-8 sm:py-8">
          {/* Øvre del – to kolonner på desktop */}
          <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
            {/* E-post */}
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-phorium-accent/95">
                <Mail className="h-4 w-4" />
                E-post
              </h2>
              <p className="text-[14px] text-phorium-light/82">
                Beskriv kort hvem du er og hvordan du ønsker å bruke Phorium.
                Vi svarer normalt raskt i beta-perioden.
              </p>
              <a
                href="mailto:kontakt@phorium.no"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-phorium-dark px-4 py-2 text-[13px] font-medium text-phorium-accent shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition hover:bg-black hover:text-phorium-accent/90"
              >
                kontakt@phorium.no
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Hva vi vil vite */}
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-phorium-accent/95">
                <Sparkles className="h-4 w-4" />
                Greit om du inkluderer
              </h2>
              <ul className="space-y-1.5 text-[13px] text-phorium-light/80">
                <li>• Lenke til nettbutikk eller prosjekt</li>
                <li>• Om du er byrå, soloaktør eller kjede</li>
                <li>• Ca. antall produkter, språk og markeder</li>
                <li>• Hvordan du ser for deg å bruke Phorium i hverdagen</li>
              </ul>
            </div>
          </div>

          {/* “Who you are” / kontekst */}
          <div className="grid gap-4 text-[13px] text-phorium-light/80 sm:grid-cols-2">
            <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/90 px-4 py-4 shadow-[0_16px_55px_rgba(0,0,0,0.7)]">
              <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-phorium-accent">
                <Store className="h-4 w-4" />
                Nettbutikk
              </div>
              <p>
                Driver du egen nettbutikk? Si gjerne litt om bransje,
                nåværende løsning (Shopify, WooCommerce osv.) og hvor du
                opplever mest friksjon i innholdsarbeidet.
              </p>
            </div>

            <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/90 px-4 py-4 shadow-[0_16px_55px_rgba(0,0,0,0.7)]">
              <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-phorium-accent">
                <Users className="h-4 w-4" />
                Byrå / frilans
              </div>
              <p>
                Jobber du med flere kunder? Fortell kort hva slags type
                oppdrag du gjør, og hvordan du tror Phorium kan hjelpe deg
                i arbeidet.
              </p>
            </div>
          </div>

          {/* CTA / lenker */}
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-phorium-light/70">
            <Link
              href="/priser"
              className="rounded-full border border-phorium-off/40 bg-phorium-dark/80 px-3 py-1.75 transition hover:border-phorium-accent hover:text-phorium-accent"
            >
              Se planene før du tar kontakt
            </Link>
            <Link
              href="/studio"
              className="rounded-full border border-phorium-off/40 bg-phorium-dark/80 px-3 py-1.75 transition hover:border-phorium-accent hover:text-phorium-accent"
            >
              Forhåndsvis dashboard (demo)
            </Link>
          </div>

          {/* Beta label */}
          <p className="text-[10px] text-phorium-light/55">
            Dette er en lukket beta. Vi åpner gradvis for flere brukere med
            konkrete behov der Phorium faktisk kan spare tid og gi bedre innhold.
          </p>
        </div>
      </section>
    </main>
  );
}
