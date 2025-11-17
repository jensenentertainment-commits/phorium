"use client";

import { useEffect, useState, type FormEvent } from "react";

const CHANGELOG_MESSAGES = [
  "Justerer promptmotoren for norske produktnavn.",
  "Finjusterer tone-of-voice for butikktekster.",
  "Trimmer bort unødvendig engelsk AI-språk.",
  "Tester nye bannerforslag mot ekte kampanjer.",
  "Lærer forskjellen på salg, tilbud og lagertømming.",
  "Optimaliserer forslag for Black Week og januarsalg.",
];

const STATUS_MESSAGES = [
  "Klargjør skrivehumør …",
  "Laster butikkdata og produkttyper …",
  "Tuner overskrifter og undertitler …",
  "Fjerner overflødig buzzwords …",
  "Finpusser norsk grammatikk …",
  "Tester nye banner-layouts …",
];

export default function MaintenancePage() {
  const [changelog, setChangelog] = useState(CHANGELOG_MESSAGES[0]);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [attempts, setAttempts] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [code, setCode] = useState("");

  // Les forsøk fra localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("phorium_attempts");
    if (stored) {
      const n = Number(stored);
      if (!Number.isNaN(n)) setAttempts(n);
    }
  }, []);

  // Roterende changelog-linje
  useEffect(() => {
    const interval = setInterval(() => {
      setChangelog((prev) => {
        const currentIndex = CHANGELOG_MESSAGES.indexOf(prev);
        const nextIndex =
          currentIndex === -1 || currentIndex === CHANGELOG_MESSAGES.length - 1
            ? 0
            : currentIndex + 1;
        return CHANGELOG_MESSAGES[nextIndex];
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Roterende statusindikator
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusText((prev) => {
        const currentIndex = STATUS_MESSAGES.indexOf(prev);
        const nextIndex =
          currentIndex === -1 || currentIndex === STATUS_MESSAGES.length - 1
            ? 0
            : currentIndex + 1;
        return STATUS_MESSAGES[nextIndex];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!code.trim()) {
      e.preventDefault();
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("phorium_attempts", String(nextAttempts));
    }

    // viser bare portal-effekten – lar browseren gjøre GET /?code=...
    setIsUnlocking(true);
  }

  const attemptsMessage =
    attempts >= 5
      ? "Du liker tydeligvis å prøve deg. AI-en heier på deg, men koden må fortsatt være riktig 😅"
      : attempts >= 3
      ? "Ikke riktig kode ennå. Caps Lock er av, sant?"
      : attempts >= 1
      ? "Hvis koden ikke fungerer, gi oss et hint – eller sjekk at du skrev den helt likt."
      : "";

  return (
    <main className="min-h-screen pb-20 bg-[#EEE3D3] flex items-center justify-center relative overflow-hidden">
      {/* Store bakgrunnsblokken som matcher forsiden */}
      <div className="absolute inset-0 bg-[#003F3C] rounded-b-[32px] sm:rounded-b-[42px] md:rounded-b-[60px]" />

      {/* Subtil “nordlys”-glow som beveger seg litt */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] bg-[#072E2B] blur-[140px] rounded-full animate-[pulse_16s_ease-in-out_infinite]" />
      </div>

      {/* Unlock-portal overlay */}
      {isUnlocking && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full border border-[#D6C074] shadow-[0_0_60px_rgba(214,192,116,0.8)] animate-[ping_0.6s_ease-out_1]" />
        </div>
      )}

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
        <p className="text-[#D9D5C8] text-lg max-w-2xl leading-relaxed mb-8">
          Vi gjør klar neste versjon av Phorium – et fokusert AI-verktøy for
          norske nettbutikker. Plattformen er midlertidig lukket mens vi tester
          med et lite utvalg butikker.
        </p>

        {/* Liten “Hva jobber vi med nå?”-linje */}
        <div className="mb-10 text-xs text-[#F5F2E7]/70 flex items-center gap-2">
          <span className="uppercase tracking-[0.22em] text-[#D9D5C8]/80">
            NÅ JOBBER VI MED
          </span>
          <span className="h-[1px] flex-1 bg-[#EEE3D3]/15" />
          <span className="text-[11px] text-[#EEE3D3]/80 italic">
            {changelog}
          </span>
        </div>

        {/* 2-kolonners layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-8 items-start">
          {/* Venstre: “Hvorfor Phorium” */}
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
                  Produkttekster som er skrevet for å selge, ikke bare
                  beskrive.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
                <p>
                  Bannere og kampanjebilder klare for bruk i Shopify og andre
                  nettbutikker.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#D6C074]" />
                <p>
                  Norsk språk, norske referanser og trygg håndtering av
                  merkevaren din.
                </p>
              </li>
            </ul>

            {/* Status-indikator */}
            <div className="mt-6 rounded-2xl bg-[#072E2B]/80 border border-[#0B3835] p-4">
              <div className="flex items-center justify-between mb-2 text-[11px] text-[#D9D5C8]/80 uppercase tracking-[0.18em]">
                <span>AI-STATUS</span>
                <span className="text-[#D6C074]">Under utvikling</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#031F1E] overflow-hidden mb-2">
                <div className="h-full w-1/2 bg-[#D6C074] animate-[pulse_3.5s_ease-in-out_infinite]" />
              </div>
              <p className="text-[11px] text-[#EEE3D3]/80">{statusText}</p>
            </div>
          </div>

          {/* Høyre: statuskort + kodefelt */}
          <div className="space-y-4">
            {/* Kort */}
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
                  Phorium testes nå med et begrenset antall nettbutikker. Vi
                  justerer språk, forslag og arbeidsflyt basert på ekte bruk i
                  hverdagen.
                </p>
                <p>
                  Når vi er fornøyde, åpner vi for flere – først invitert beta,
                  deretter en bredere lansering i Norge.
                </p>
              </div>
            </div>

            {/* Kode-innlogging */}
            <div className="rounded-3xl bg-[#072E2B]/90 border border-[#0B3835] p-5 sm:p-6 flex flex-col gap-4">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#D9D5C8] mb-1">
                  HAR DU FÅTT TILGANG?
                </p>
                <p className="text-sm text-[#F5F2E7]/85">
                  Skriv inn tilgangskoden du har fått fra oss for å åpne
                  Phorium.
                </p>
              </div>

              <form
                method="GET"
                action="/"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
              >
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Tilgangskode"
                  className="flex-1 rounded-full border border-[#EEE3D3]/40 bg-[#031F1E] px-4 py-2 text-sm text-[#F5F2E7] placeholder:text-[#D9D5C8]/60 outline-none focus:border-[#D6C074] focus:ring-2 focus:ring-[#D6C074]/60 transition-shadow"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="rounded-full px-5 py-2 text-sm font-medium bg-[#D6C074] text-[#17211C] hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!code.trim() || isUnlocking}
                >
                  Åpne Phorium
                </button>
              </form>

              {attemptsMessage && (
                <p className="text-[11px] text-[#D9D5C8]/75">
                  {attemptsMessage}
                </p>
              )}
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
