"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login request (demo):", email);
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
            Logg inn · lukket beta
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-phorium-light sm:text-[2.1rem]">
            Tilgang for inviterte brukere
          </h1>
          <p className="mt-2 text-[14px] text-phorium-light/75">
            Phorium er i lukket beta. Bruk e-postadressen du ble registrert med
            for å logge inn når ekte autentisering er på plass.
          </p>
        </div>

        {/* Kort */}
        <div className="rounded-3xl border border-phorium-off/30 bg-phorium-surface px-6 py-7 text-phorium-light shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium">
                  E-post
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

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-phorium-accent px-6 py-2.5 text-[14px] font-semibold text-phorium-dark shadow-md transition hover:bg-phorium-accent/90"
              >
                Send innloggingslenke (demo)
              </button>

              <p className="mt-1 text-[10px] text-phorium-light/65">
                Dette er kun en visuell flyt i beta-versjonen. Ekte innlogging
                kobles på senere, og lenken vil da føre deg rett til Phorium
                Studio.
              </p>
            </form>
          ) : (
            <div className="py-6 text-center">
              <h2 className="mb-2 text-[18px] font-semibold text-phorium-accent">
                Om dette var live, hadde du fått en lenke nå.
              </h2>
              <p className="text-[13px] text-phorium-light/85">
                Når autentisering aktiveres, blir dette inngangen til
                dashboardet ditt og Phorium Studio.
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
          Har du ikke tilgang ennå?{" "}
          <Link
            href="/sign-up"
            className="text-phorium-accent hover:text-phorium-accent/80"
          >
            Registrer interesse her
          </Link>
        </p>
      </section>
    </main>
  );
}
