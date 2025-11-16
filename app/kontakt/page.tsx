import type { Metadata } from "next";
import Link from "next/link";

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

      <section className="w-full max-w-3xl px-4">
        {/* Intro */}
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/10 px-4 py-1 text-[11px] tracking-wide text-phorium-accent/95 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
            Kontakt Phorium
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-phorium-light sm:text-4xl">
            Ta kontakt før vi åpner bredt
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-[14px] sm:text-[15px] leading-relaxed text-phorium-light/75">
            Phorium er i kontrollert utrulling. Har du en nettbutikk, et byrå
            eller et prosjekt der dette kan passe inn, send en kort forespørsel –
            så vurderer vi deg for tidlig tilgang.
          </p>
        </div>

        {/* Kort */}
        <div className="space-y-6 rounded-3xl border border-phorium-off/30 bg-phorium-surface px-6 py-7 text-phorium-light shadow-[0_20px_80px_rgba(0,0,0,0.7)] sm:px-8 sm:py-8">
          {/* E-post */}
          <div>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              E-post
            </h2>
            <p className="text-[14px] text-phorium-light/82">
              Beskriv kort hvem du er og hvordan du ønsker å bruke Phorium.
              Vi svarer normalt raskt i beta-perioden.
            </p>
            <a
              href="mailto:kontakt@phorium.no"
              className="mt-2 inline-block text-[14px] font-medium text-phorium-accent underline underline-offset-4 hover:text-phorium-accent/80"
            >
              kontakt@phorium.no
            </a>
          </div>

          {/* Hva vi vil vite */}
          <div>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              Greit om du inkluderer
            </h2>
            <ul className="space-y-1.5 text-[13px] text-phorium-light/80">
              <li>• Lenke til nettbutikk eller prosjekt</li>
              <li>• Om du er byrå, soloaktør eller kjede</li>
              <li>• Ca. antall produkter, språk og markeder</li>
              <li>• Hvordan du ser for deg å bruke Phorium i hverdagen</li>
            </ul>
          </div>

          {/* CTA / lenker */}
          <div className="flex flex-wrap gap-3 text-[11px] text-phorium-light/70">
            <Link
              href="/pricing"
              className="rounded-full border border-phorium-off/40 px-3 py-1.5 hover:border-phorium-accent hover:text-phorium-accent transition-colors"
            >
              Se planene før du tar kontakt
            </Link>
            <Link
              href="/studio"
              className="rounded-full border border-phorium-off/40 px-3 py-1.5 hover:border-phorium-accent hover:text-phorium-accent transition-colors"
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
