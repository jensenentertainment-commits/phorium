"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [role, setRole] = useState("eier");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Demo – her kan du senere sende til et API / Notion / Sheet osv.
    console.log("Phorium beta signup (demo):", {
      email,
      storeName,
      storeUrl,
      role,
    });

    setSent(true);
  };

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-phorium-dark pt-20 pb-24">
      {/* Subtil bakgrunn / glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(200,183,122,0.16),transparent_75%)] mix-blend-screen" />

      <section className="w-full max-w-md px-4">
        {/* Overskrift */}
        <div className="mb-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/10 px-4 py-1 text-[11px] tracking-wide text-phorium-accent/95 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
            Registrer interesse · lukket beta
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-phorium-light sm:text-[2.1rem]">
            Bli med i tidlig tilgang
          </h1>
          <p className="mt-2 text-[14px] text-phorium-light/75">
            Vi inviterer inn et begrenset antall nettbutikker og byråer i starten.
            Legg igjen e-posten din, så tar vi kontakt når det er aktuelt.
          </p>
        </div>

        {/* Kort */}
        <div className="rounded-3xl border border-phorium-off/30 bg-phorium-surface px-6 py-7 text-phorium-light shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">
                  E-post*
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-phorium-accent/40 bg-phorium-light px-3 py-2.5 text-[14px] text-phorium-dark outline-none transition focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/20"
                  placeholder="din@butikk.no"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium">
                  Butikknavn / firma (valgfritt)
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-2xl border border-phorium-off/40 bg-phorium-dark/40 px-3 py-2.5 text-[14px] text-phorium-light outline-none transition focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/15"
                  placeholder="Eks: Varekompaniet"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium">
                  Nettbutikkadresse (valgfritt)
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full rounded-2xl border border-phorium-off/40 bg-phorium-dark/40 px-3 py-2.5 text-[14px] text-phorium-light outline-none transition focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/15"
                  placeholder="https://dinbutikk.no"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium">
                  Rolle (valgfritt)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-2xl border border-phorium-off/40 bg-phorium-dark/40 px-3 py-2.5 text-[13px] text-phorium-light outline-none transition focus:border-phorium-accent focus:ring-2 focus:ring-phorium-accent/15"
                >
                  <option value="eier">Eier / daglig leder</option>
                  <option value="marked">Markedsfører / innhold</option>
                  <option value="byra">Byrå / konsulent</option>
                  <option value="annet">Annet</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-phorium-accent px-6 py-2.5 text-[14px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90"
              >
                Registrer interesse (demo)
              </button>

              <p className="mt-1 text-[10px] text-phorium-light/65">
                I denne beta-versjonen sendes ingenting faktisk inn – dette er kun
                en visuell flyt. Senere kobles dette mot ekte påmelding / CRM.
              </p>
            </form>
          ) : (
            <div className="py-6 text-center">
              <h2 className="mb-2 text-[18px] font-semibold text-phorium-accent">
                Takk! Du står nå på interesselisten.
              </h2>
              <p className="text-[13px] text-phorium-light/85">
                Når vi åpner for flere butikker og byråer, bruker vi denne listen
                først. Du kan når som helst komme tilbake hit og oppdatere info.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-[13px] text-phorium-accent hover:text-phorium-accent/80"
              >
                ← Tilbake til forsiden
              </Link>
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] text-phorium-light/65">
          Har du allerede tilgang?{" "}
          <Link
            href="/sign-in"
            className="text-phorium-accent hover:text-phorium-accent/80"
          >
            Logg inn her
          </Link>
        </p>
      </section>
    </main>
  );
}
