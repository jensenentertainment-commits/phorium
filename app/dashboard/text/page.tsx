"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Image as ImageIcon,
  Link2,
  Copy,
  Check,
} from "lucide-react";

type HistoryItem = {
  prompt: string;
  result: string;
};

function PhoriumLoader({
  label = "Genererer tekst … finpusser struktur og språk",
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Spinner som spinner OG pulserer */}
      <motion.div className="relative h-10 w-10" aria-label="Laster">
        {/* Ytre ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-phorium-accent/70 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }}
        />
        {/* Indre puls */}
        <motion.div
          className="absolute inset-2 rounded-full border border-phorium-accent/40"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Tekst */}
      <p className="text-center text-[12.5px] text-phorium-accent/95">{label}</p>

      {/* Fremdriftsstripe (evig shimmer) */}
      <div className="h-2 w-48 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
        <motion.div
          className="h-full bg-phorium-accent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ width: "55%" }}
        />
      </div>

      {/* Mikro-hint */}
      <p className="text-[10px] tracking-wide text-phorium-light/55">
        Phorium Core aktiv …
      </p>
    </div>
  );
}

// Gir mer menneskelige feilmeldinger basert på statuskode
function friendlyErrorMessage(status: number, raw?: string) {
  if (status === 429) {
    return "Liten pause – du har sendt litt mange forespørsler på kort tid. Vent noen sekunder og prøv igjen.";
  }

  if (status === 400 || status === 422) {
    return "Innholdet var litt for kort eller uklart. Prøv å legge til 1–2 konkrete detaljer (produkt, målgruppe, lengde).";
  }

  if (status >= 500) {
    return "Tjeneren hadde et problem. Prøv igjen om et lite øyeblikk.";
  }

  return raw || "Noe gikk galt. Prøv igjen om litt.";
}

export default function PhoriumTextPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hent historikk + sjekk om nettbutikk er koblet
  useEffect(() => {
    try {
      const saved = localStorage.getItem("phorium_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}

    try {
      const stored = localStorage.getItem("phorium_store_profile");
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile?.url) setIsConnected(true);
      }
    } catch {}
  }, []);

  // Lagre historikk
  useEffect(() => {
    try {
      localStorage.setItem("phorium_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  async function handleGenerate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setCopied(false);
    setResult("");
    setError(null);

    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: prompt }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // hvis backend ikke sender JSON, la data være null
      }

      // Hvis API svarer med feilstatus -> pen feilmelding
      if (!res.ok) {
        const msg = friendlyErrorMessage(res.status, data?.error);
        setError(msg);
        setResult(null);
        return;
      }

      if (data?.success) {
        const out = data.data;
        const text = `${out.title}\n\n${out.description}\n\nMeta-tittel: ${out.meta_title}\nMeta-beskrivelse: ${out.meta_description}`;

        // Typing-effekt
        let index = 0;
        const interval = setInterval(() => {
          setResult(text.slice(0, index) || "");
          index++;
          if (index > text.length) {
            clearInterval(interval);
            setHistory((prev) => {
              const updated = [{ prompt, result: text }, ...prev].slice(0, 3);
              return updated;
            });
          }
        }, 8);
      } else {
        const msg = data?.error || "Kunne ikke generere tekst nå.";
        setError(msg);
        setResult(null);
      }
    } catch {
      setError("Feil ved tilkobling til Phorium Core. Sjekk nett eller prøv igjen.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyCurrent() {
    if (!result) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function handleHistoryReuse(item: HistoryItem) {
    setPrompt(item.prompt);
    setResult(item.result);
    setCopied(false);
    setError(null);
  }

  function handleHistoryCopy(item: HistoryItem) {
    if (!item.result) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(item.result);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-phorium-dark pt-20 pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <section className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-10 text-phorium-light shadow-[0_22px_80px_rgba(0,0,0,0.55)] sm:px-10"
        >
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Phorium Tekst
              </h1>
              <p className="max-w-xl text-[15px] text-phorium-light/80">
                Generer produkt- og kategoritekster til nettbutikk på norsk – klare
                til å lime rett inn.
              </p>
              {!isConnected && (
                <p className="mt-2 text-[11px] text-phorium-light/60">
                  Tips: Koble til nettbutikken i{" "}
                  <Link
                    href="/dashboard/store-connect"
                    className="underline decoration-phorium-accent/60 underline-offset-2 hover:text-phorium-accent"
                  >
                    Phorium Connect
                  </Link>{" "}
                  for mer treffsikre forslag.
                </p>
              )}
            </div>

            {/* Kredittindikator (dummy) */}
            <div className="mt-6 sm:mt-0">
              <div className="mb-1 text-[11px] text-phorium-accent/90">
                Kreditter: <span className="font-semibold">996 / 1000</span>
              </div>
              <div className="h-2 w-40 overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-dark">
                <motion.div
                  className="h-full bg-phorium-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: "99.6%" }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Top navigation / actions – samsvarer med Visuals */}
          <div className="mb-8 flex flex-wrap gap-3 text-[11px]">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-light/80"
            >
              <Home className="h-3.5 w-3.5 text-phorium-accent" />
              Studio-oversikt
            </Link>

            <Link
              href="/dashboard/text"
              className="inline-flex items-center gap-2 rounded-full bg-phorium-accent px-3 py-1.5 text-[11px] font-semibold text-phorium-dark shadow-sm transition hover:bg-phorium-accent/90"
            >
              <FileText className="h-3.5 w-3.5 text-phorium-dark" />
              Tekst
            </Link>

            <Link
              href="/dashboard/visuals"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-accent transition hover:border-phorium-accent hover:text-phorium-light"
            >
              <ImageIcon className="h-3.5 w-3.5 text-phorium-accent" />
              Visuals
            </Link>

            <Link
              href="/dashboard/store-connect"
              className="inline-flex items-center gap-2 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1.5 text-phorium-accent transition hover:border-phorium-accent hover:text-phorium-light"
            >
              <Link2 className="h-3.5 w-3.5 text-phorium-accent" />
              Koble til nettbutikk
            </Link>
          </div>

          {/* Grid: prompt + resultat */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Prompt */}
            <div>
              <label className="mb-2 block text-[13px] text-phorium-light/85">
                Hva ønsker du å generere?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Eks: «Lag en norsk produkttekst for en 1 L termokopp i stål. 80–100 ord, konkret, uten klisjeer.»'
                className="h-64 w-full resize-none rounded-2xl border border-phorium-accent/40 bg-phorium-light px-4 py-3 text-[15px] text-phorium-dark outline-none placeholder:text-[#8F8A7A] focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/20"
                onKeyDown={(e) => {
                  const isMac = navigator.platform.toUpperCase().includes("MAC");
                  const submitCombo =
                    (isMac && e.metaKey && e.key === "Enter") ||
                    (!isMac && e.ctrlKey && e.key === "Enter");
                  if (submitCombo && !loading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                {[
                  "Produktbeskrivelse",
                  "Kategoritekst",
                  "Kampanjetekst",
                  "Nyhetsbrev",
                  "Google Ads",
                  "Meta Ads",
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-phorium-light/82 transition hover:border-phorium-accent hover:text-phorium-accent"
                    onClick={() =>
                      setPrompt(
                        `Lag en norsk ${label.toLowerCase()} basert på et konkret produkt, kategori eller kampanje. Profesjonell, tydelig og tilpasset nettbutikk.`,
                      )
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="mt-4 w-full rounded-full bg-phorium-accent px-6 py-2.5 text-[14px] font-semibold text-phorium-dark shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto hover:bg-phorium-accent/90"
              >
                {loading ? "Genererer…" : "Generer tekst"}
              </button>
              <p className="mt-2 text-[10px] text-phorium-light/55">
                Tips: Bruk ⌘+Enter (Mac) eller Ctrl+Enter (Windows) for å generere raskt.
              </p>
            </div>

            {/* Resultat */}
            <div>
              <label className="mb-2 block text-[13px] text-phorium-light/85">
                Resultat
              </label>
              <div className="relative">
                {/* Feilmelding */}
                {error && (
                  <div className="mb-2 rounded-2xl border border-phorium-accent/50 bg-phorium-accent/10 px-3 py-2 text-[11px] text-phorium-light">
                    {error}
                  </div>
                )}

                <div className="h-64 w-full overflow-y-auto whitespace-pre-wrap rounded-2xl border border-phorium-off/40 bg-phorium-light px-4 py-3 text-[15px] text-phorium-dark">
                  {!result && !loading && !error && (
                    <span className="text-[#8F8A7A]">
                      Resultatet vises her …
                    </span>
                  )}
                  {result && !loading && <span>{result}</span>}
                  {loading && (
                    <div className="flex h-full items-center justify-center">
                      <PhoriumLoader label="Genererer tekst … tilpasser språk og struktur" />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-phorium-accent px-3 py-1 text-[12px] text-phorium-dark shadow"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Kopiert
                    </motion.div>
                  )}
                </AnimatePresence>
                {result && !loading && (
                  <button
                    onClick={handleCopyCurrent}
                    className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[11px] text-phorium-accent transition hover:bg-phorium-accent/10"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Kopier
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Historikk */}
          <div className="mt-10 border-t border-phorium-off/30 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-phorium-accent">
              Historikk (siste 3)
            </h2>
            {history.length === 0 && (
              <p className="text-[13px] text-phorium-light/70">
                Ingen genereringer ennå. Når du har laget tekster, dukker de opp her.
              </p>
            )}
            <ul className="space-y-3">
              {history.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-phorium-off/30 bg-phorium-dark p-4 text-sm text-phorium-light/90"
                >
                  <p className="mb-1 font-semibold text-phorium-accent/90">
                    Prompt:
                  </p>
                  <p className="mb-2 line-clamp-2 text-phorium-light/85">
                    {item.prompt}
                  </p>
                  <p className="mb-3 text-[12px] leading-relaxed text-phorium-light/80">
                    {item.result.slice(0, 160)}
                    {item.result.length > 160 ? "..." : ""}
                  </p>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      onClick={() => handleHistoryReuse(item)}
                      className="rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1 text-phorium-accent transition hover:bg-phorium-accent/10"
                    >
                      🔁 Bruk igjen
                    </button>
                    <button
                      onClick={() => handleHistoryCopy(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-phorium-off/35 bg-phorium-dark px-3 py-1 text-phorium-light/80 transition hover:bg-phorium-light/10"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Kopier
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Mini-guide */}
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-phorium-off/30 bg-phorium-dark px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-phorium-accent">
                Mini-guide
              </p>
              <p className="text-[12px] text-phorium-light/82">
                For best resultat: beskriv produktet, målgruppen, ønsket lengde
                og tone. Unngå «skriv noe kult». Si hva teksten skal gjøre.
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-phorium-light/72">
                <li>
                  • «Lag en norsk produkttekst for en premium kontorstol. 80–100
                  ord. Fokus på ergonomi og garanti.»
                </li>
                <li>
                  • «Skriv en kort kategori-intro for vinterjakker til herre.
                  70–90 ord. Tydelig, konkret, ingen klisjeer.»
                </li>
              </ul>
            </div>
            <Link
              href="/guide"
              className="self-start rounded-full bg-phorium-accent px-4 py-2 text-[11px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90 sm:self-auto"
            >
              Se full guide
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
