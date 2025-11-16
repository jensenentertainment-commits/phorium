import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Personvern & bruksvilkår | Phorium",
  description:
    "Personvernerklæring og bruksvilkår for Phorium i lukket beta – hvordan vi behandler data og hvilke rettigheter du har.",
};

export default function PersonvernPage() {
  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-phorium-dark pt-20 pb-24">
      {/* Subtil bakgrunn / glow – samme som Kontakt */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(200,183,122,0.16),transparent_75%)] mix-blend-screen" />

      <section className="w-full max-w-3xl px-4">
        {/* Intro – samme stil som Kontakt */}
        <div className="mb-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/10 px-4 py-1 text-[11px] tracking-wide text-phorium-accent/95 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
            Personvern & bruksvilkår
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-phorium-light sm:text-4xl">
            Slik behandler Phorium data i beta
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-phorium-light/75">
            Her finner du en oversikt over hvordan Phorium brukes, hvilke
            opplysninger som kan behandles, og hvilke rettigheter du har som
            bruker i den lukkede beta-perioden.
          </p>
          <p className="mt-2 text-[11px] text-phorium-light/55">
            <strong>Merk:</strong> Denne teksten er et praktisk utgangspunkt.
            Endelig versjon bør gjennomgås av juridisk rådgiver før full
            lansering.
          </p>
        </div>

        {/* Kort – matcher Kontakt visuelt */}
        <div className="space-y-6 rounded-3xl border border-phorium-off/30 bg-phorium-surface px-6 py-7 text-[13px] leading-relaxed text-phorium-light shadow-[0_20px_80px_rgba(0,0,0,0.7)] sm:px-8 sm:py-8">
          {/* 1. Om Phorium */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              1. Om Phorium og behandlingsansvarlig
            </h2>
            <p className="mb-2 text-phorium-light/85">
              Phorium er et norsk verktøy for å generere tekst og visuelle
              elementer til nettbutikker, byråer og skapere. Per nå kjøres
              Phorium som en <strong>lukket beta</strong> med et begrenset
              antall testbrukere.
            </p>
            <p className="mb-1.5 text-phorium-light/80">
              Behandlingsansvarlig for personopplysninger som behandles gjennom
              Phorium er:
            </p>
            <ul className="space-y-1.5 text-phorium-light/80">
              <li>• Firmanavn: Jensen Digital</li>
              <li>• Org.nr: 997509307 </li>
              <li>• E-post: kontakt@phorium.no</li>
              <li>• Adresse: Torneroseveien 20, 3055 Krokstadelva</li>
            </ul>
          </section>

          {/* 2. Hvilke opplysninger */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              2. Hvilke opplysninger vi behandler
            </h2>
            <p className="mb-2 text-phorium-light/82">
              I beta-versjonen forsøker vi å begrense mengden personopplysninger
              mest mulig. Typisk kan vi behandle:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• E-postadresse når du kontakter oss eller registrerer interesse.</li>
              <li>• Tekst du selv skriver inn i prompts (produktdata, beskrivelser, kampanjer osv.).</li>
              <li>• Bilder du frivillig laster opp for å generere nye varianter eller bannere.</li>
              <li>• Enkle tekniske data om bruk av tjenesten (brukslogg, aggregert statistikk).</li>
            </ul>
            <p className="text-phorium-light/80">
              Vi ber om at du <strong>ikke</strong> legger inn sensitive
              personopplysninger (f.eks. helseopplysninger, fødselsnummer eller
              informasjon om barn) i Phorium.
            </p>
          </section>

          {/* 3. Formål og grunnlag */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              3. Formål og behandlingsgrunnlag
            </h2>
            <p className="mb-2 text-phorium-light/82">
              Vi behandler opplysninger for å:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• Levere selve tjenesten (tekst- og bildegenerering).</li>
              <li>• Administrere betatilgang og følge opp henvendelser.</li>
              <li>• Forbedre stabilitet, kvalitet og brukeropplevelse.</li>
            </ul>
            <p className="mb-1.5 text-phorium-light/80">
              Behandlingsgrunnlaget vil normalt være:
            </p>
            <ul className="space-y-1.5 text-phorium-light/80">
              <li>• <strong>Avtale</strong> – når vi gir deg tilgang til Phorium.</li>
              <li>• <strong>Berettiget interesse</strong> – for å måle bruk og forbedre tjenesten.</li>
              <li>• <strong>Samtykke</strong> – f.eks. dersom du melder deg på nyheter/oppdateringer.</li>
            </ul>
          </section>

          {/* 4. Lagring og sletting */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              4. Lagring og sletting
            </h2>
            <p className="mb-2 text-phorium-light/82">
              Phorium-beta er lagt opp slik at mest mulig lagres{" "}
              <strong>lokalt i nettleseren din</strong>:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• Butikkprofil, brandprofil og historikk lagres i localStorage hos deg.</li>
              <li>• Du kan selv tømme dette via nettleserens innstillinger.</li>
            </ul>
            <p className="text-phorium-light/80">
              Dersom vi lagrer e-post og henvendelser i egne systemer, beholder
              vi disse så lenge det er nødvendig for å administrere betaen og
              følge opp dialog. Du kan be om sletting der lovverket tillater det.
            </p>
          </section>

          {/* 5. Databehandlere */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              5. Bruk av underleverandører (databehandlere)
            </h2>
            <p className="mb-2 text-phorium-light/82">
              For å levere tjenesten kan vi bruke eksterne leverandører til bl.a.:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• Generering av tekst og bilder (f.eks. via OpenAI).</li>
              <li>• Hosting og teknisk drift av løsning og API.</li>
              <li>• E-post, feillogging og support.</li>
            </ul>
            <p className="text-phorium-light/80">
              Der data behandles utenfor EU/EØS vil vi som minimum benytte
              standardkontrakter (Standard Contractual Clauses) eller tilsvarende
              godkjente mekanismer.
            </p>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              6. Informasjonskapsler (cookies)
            </h2>
            <p className="mb-2 text-phorium-light/82">
              Phorium kan bruke nødvendige og funksjonelle cookies for å:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• Huske innstillinger og flyt i dashboardet.</li>
              <li>• Håndtere innlogging når dette aktiveres.</li>
              <li>• Gi anonymisert, aggregert statistikk på bruk.</li>
            </ul>
            <p className="text-phorium-light/80">
              Ved full lansering kommer en tydelig cookie-oversikt og samtykkeløsning.
            </p>
          </section>

          {/* 7. Bruksvilkår */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              7. Bruksvilkår og ansvar
            </h2>
            <p className="mb-2 text-phorium-light/82">
              Phorium gir forslag til tekst og bilder. Du er selv ansvarlig for å:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• Kvalitetssikre alt innhold før publisering.</li>
              <li>• Sørge for at innholdet følger gjeldende lovverk og plattformregler.</li>
              <li>• Ikke bruke Phorium til ulovlig, skadelig eller diskriminerende innhold.</li>
            </ul>
            <p className="text-phorium-light/80">
              Tjenesten leveres «som den er» i beta, uten garanti for
              tilgjengelighet eller feilfrihet, og kan endres eller stanses
              når som helst.
            </p>
          </section>

          {/* 8. Rettigheter */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              8. Dine rettigheter
            </h2>
            <p className="mb-2 text-phorium-light/82">
              Du har blant annet rett til:
            </p>
            <ul className="mb-2 space-y-1.5 text-phorium-light/80">
              <li>• Innsyn i hvilke personopplysninger vi har om deg.</li>
              <li>• Retting av feilaktige eller ufullstendige opplysninger.</li>
              <li>• Sletting der vi ikke lenger har grunnlag for å lagre dem.</li>
              <li>• Å protestere mot behandling basert på berettiget interesse.</li>
            </ul>
            <p className="text-phorium-light/80">
              Ta kontakt på{" "}
              <a
                href="mailto:kontakt@phorium.no"
                className="underline underline-offset-4 text-phorium-accent hover:text-phorium-accent/80"
              >
                kontakt@phorium.no
              </a>{" "}
              dersom du vil bruke rettighetene dine eller har spørsmål.
            </p>
          </section>

          {/* 9. Endringer */}
          <section>
            <h2 className="mb-1 text-[13px] font-semibold text-phorium-accent/95">
              9. Endringer i denne siden
            </h2>
            <p className="text-phorium-light/82">
              Vi kan oppdatere denne siden når vi videreutvikler Phorium. Ved
              større endringer vil vi oppdatere datoen under og kunne varsle i
              selve løsningen.
            </p>
            <p className="mt-3 text-[11px] text-phorium-light/55">
              Sist oppdatert: {new Date().toLocaleDateString("no-NO")}
            </p>
          </section>

          {/* Bunn-linje – matcher stil fra Kontakt */}
          <div className="mt-4 flex items-center justify-between border-t border-phorium-off/25 pt-3 text-[12px] text-phorium-light/75">
            <Link
              href="/"
              className="underline underline-offset-4 text-phorium-accent hover:text-phorium-accent/80"
            >
              ← Tilbake til forsiden
            </Link>
            <Link
              href="/kontakt"
              className="hover:text-phorium-accent/85"
            >
              Spørsmål? Kontakt oss
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
