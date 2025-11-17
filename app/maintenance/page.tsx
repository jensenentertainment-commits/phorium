import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phorium – kommer snart",
  description: "Vi bygger en AI-plattform for norske nettbutikker.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#131510] text-[#ECE8DA] flex items-center justify-center px-4">
      <div className="relative w-full max-w-3xl mx-auto">
        {/* Bakgrunnsglow */}
        <div className="pointer-events-none absolute -inset-20 opacity-40 blur-3xl">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,#C8B77A33_0,#131510_55%,#000000_100%)]" />
        </div>

        {/* Kort */}
        <section className="relative border border-[#3B4032]/70 bg-[#1C2017]/95 backdrop-blur-sm rounded-3xl px-6 sm:px-10 py-10 sm:py-12 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          {/* Topp-tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C8B77A33] bg-[#11130E] px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-[#C8B77A] mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8B77A]" />
            <span>Phorium for nettbutikker</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-semibold tracking-tight leading-tight">
            Vi skrur på neste generasjon
            <span className="block text-[#C8B77A]">
              AI-plattform for norske nettbutikker
            </span>
          </h1>

          {/* Intro */}
          <p className="mt-4 text-sm sm:text-base text-[#ECE8DA]/75 max-w-xl">
            Phorium er et fokusert AI-verktøy for nettbutikker som vil jobbe
            raskere med tekst, bilder og kampanjer – uten å miste den norske
            tonen på veien.
          </p>

          {/* “Hva som kommer” */}
          <div className="mt-7 grid gap-4 text-sm sm:text-[13px] text-[#ECE8DA]/80">
            <div className="flex items-start gap-3">
              <span className="mt-[4px] h-1.5 w-1.5 rounded-full bg-[#C8B77A]" />
              <p>
                <span className="font-medium text-[#ECE8DA]">Tekst som treffer. </span>
                Produkttekster, kampanjer og e-postutkast tilpasset norske kunder –
                på sekunder.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-[4px] h-1.5 w-1.5 rounded-full bg-[#C8B77A]" />
              <p>
                <span className="font-medium text-[#ECE8DA]">Bilder og bannere klare for nettbutikk. </span>
                Generer og tilpass kampanjebilder, headers og produktvisualer rettet mot nordisk design.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-[4px] h-1.5 w-1.5 rounded-full bg-[#C8B77A]" />
              <p>
                <span className="font-medium text-[#ECE8DA]">Dyp Shopify-integrasjon. </span>
                Phorium skal forstå butikken din – ikke bare prompten din.
              </p>
            </div>
          </div>

          {/* Beta-info / glimt i øyet */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-[11px] sm:text-xs text-[#ECE8DA]/70">
              <p className="font-medium text-[#ECE8DA]">
                Siden er midlertidig lukket mens vi tester internt.
              </p>
              <p className="mt-1">
                Et lite utvalg butikker har tidlig tilgang.  
                Resten av Norge slipper inn snart – vi lover å ikke bruke{" "}
                <span className="italic">altfor</span> mange versjoner før lansering.
              </p>
            </div>

            <div className="shrink-0 text-right text-[11px] sm:text-xs text-[#ECE8DA]/60">
              <p className="uppercase tracking-[0.18em]">Status</p>
              <p className="mt-1 font-medium text-[#C8B77A]">Under utvikling · Privat beta</p>
            </div>
          </div>

          {/* Footer-linje */}
          <div className="mt-8 pt-5 border-t border-[#3B4032]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] sm:text-[11px] text-[#ECE8DA]/55">
            <span>© {new Date().getFullYear()} Phorium. Bygget i Norge for nettbutikker.</span>
            <span className="sm:text-right">
              Har du fått beta-tilgang?  
              <span className="ml-1 text-[#C8B77A]">Logg inn via din personlige lenke.</span>
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
