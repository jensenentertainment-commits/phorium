// app/maintenance/page.tsx

export default function MaintenancePage() {
  return (
    <main className="min-h-screen pb-20 bg-[#EEE3D3] flex items-center justify-center relative overflow-hidden">

      {/* Store bakgrunnsblokken som matcher forsiden */}
      <div className="absolute inset-0 bg-[#003F3C] rounded-b-[32px] sm:rounded-b-[42px] md:rounded-b-[60px]" />

      {/* Glow som matcher forsiden */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] bg-[#072E2B] blur-[140px] rounded-full" />
      </div>

      {/* Innhold */}
      <div className="relative z-10 px-6 sm:px-10 w-full max-w-6xl mx-auto pt-28">

        {/* Topp-tag */}
        <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-[#D6C07455] bg-[#072E2B] px-4 py-1 text-[11px] tracking-[0.22em] uppercase text-[#D6C074]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
          <span>AI bygget for norske nettbutikker</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-[#F5F2E7] mb-5 max-w-3xl">
          Tekst og bannere som
          <span className="block text-[#D6C074]">
            snart er klare for butikken din
          </span>
        </h1>

        {/* Intro */}
        <p className="text-[#D9D5C8] text-lg max-w-2xl leading-relaxed mb-10">
          Vi gjør klar neste versjon av Phorium – et fokusert AI-verktøy for norske nettbutikker.
          Plattformen er midlertidig lukket mens vi tester med et lite utvalg butikker.
        </p>

        {/* 2-kolonners layout som minner om forsiden */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 items-start">

          {/* Venstre side – “Hvorfor Phorium” */}
          <div className="space-y-5 text-sm text-[#F5F2E7]/85">
            <div className="space-y-2">
              <p className="text-[11px] tracking-[0.22em] uppercase text-[#D9D5C8]">
                HVORFOR PHORIUM?
              </p>
              <h2 className="text-xl font-semibold text-[#F5F2E7]">
                Mindre tomme felter. Mer ferdig innhold.
              </h2>
            </div>

            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
                <p>
                  Produkttekster som er skrevet for å selge, ikke bare beskrive.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
                <p>
                  Bannere og kampanjebilder klare for bruk i Shopify og andre nettbutikker.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
                <p>
                  Norsk språk, norske referanser og trygg håndtering av merkevaren din.
                </p>
              </li>
            </ul>
          </div>

          {/* Høyre side – kort + kodefelt */}
          <div className="space-y-4">
            {/* Kort som matcher hero-kortet på forsiden */}
            <div className="rounded-3xl bg-[#072E2B]/95 border border-[#0B3835] shadow-[0_0_60px_rgba(0,0,0,0.45)] p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#D9D5C8]">
                  Phorium status
                </p>
                <span className="px-3 py-1 rounded-full text-[10px] bg-[#EEE3D3]/10 text-[#EEE3D3] border border-[#EEE3D3]/20">
                  Privat beta
                </span>
              </div>

              <div className="space-y-3 text-sm text-[#F5F2E7]/80">
                <p>
                  Phorium testes nå med et begrenset antall nettbutikker. Vi justerer språk,
                  forslag og arbeidsflyt basert på ekte bruk i hverdagen.
                </p>
                <p>
                  Når vi er fornøyde, åpner vi for flere – først invitert beta, deretter
                  en bredere lansering i Norge.
                </p>
              </div>
            </div>

            {/* Kode-innlogging – matcher stil */}
            <div className="rounded-3xl bg-[#072E2B]/90 border border-[#0B3835] p-5 sm:p-6 flex flex-col gap-4">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#D9D5C8] mb-1">
                  HAR DU FÅTT TILGANG?
                </p>
                <p className="text-sm text-[#F5F2E7]/85">
                  Skriv inn tilgangskoden du har fått fra oss for å åpne Phorium.
                </p>
              </div>

              <form
                method="GET"
                action="/"
                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
              >
                <input
                  type="text"
                  name="code"
                  placeholder="Tilgangskode"
                  className="flex-1 rounded-full border border-[#EEE3D3]/40 bg-[#031F1E] px-4 py-2 text-sm text-[#F5F2E7] placeholder:text-[#D9D5C8]/60 outline-none focus:border-[#D6C074] focus:ring-1 focus:ring-[#D6C074]/70"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 text-sm font-medium bg-[#D6C074] text-[#17211C] hover:brightness-105 transition"
                >
                  Åpne Phorium
                </button>
              </form>

              <p className="text-[11px] text-[#D9D5C8]/70">
                Har du ikke fått kode ennå? Vi åpner for flere butikker senere.
              </p>
            </div>
          </div>
        </div>

        {/* Liten footer-linje */}
        <div className="text-[#F5F2E7]/50 text-xs mt-12">
          © {new Date().getFullYear()} Phorium – under utvikling
        </div>
      </div>
    </main>
  );
}
