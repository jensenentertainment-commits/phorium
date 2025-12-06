"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabaseClient";
import StudioAuthGate from "../studio/StudioAuthGate";
import CreditsBadge from "../components/CreditsBadge";
import { ChangePasswordSection } from "@/app/components/ChangePasswordSection";
import { PlanBadge, type PlanName } from "@/app/components/PlanBadge";
import CreditHistory from "@/app/components/CreditHistory";

import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Card } from "@/app/components/ui/Card";

type AccountInfo = {
  email: string | null;
  createdAt: string | null;
  plan: PlanName | null;
  username: string | null;
};

export default function AccountPage() {
  const [info, setInfo] = useState<AccountInfo>({
    email: null,
    createdAt: null,
    plan: null,
    username: null,
  });
  const [loading, setLoading] = useState(true);

  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        let plan: PlanName | null = null;
        let username: string | null = null;

        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("plan, username")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (error) {
            console.error("Feil ved henting av profile på konto-siden:", error);
          }

          if (profile?.plan) {
            const p = profile.plan.toLowerCase();
            if (p === "source" || p === "flow" || p === "pulse" || p === "nexus") {
              plan = p as PlanName;
            }
          }

          if (profile?.username) {
            username = profile.username;
          }
        } catch (err) {
          console.error("Uventet feil ved henting av profile:", err);
        }

        setInfo({
          email: data.user.email ?? null,
          createdAt: data.user.created_at ?? null,
          plan,
          username,
        });
      }

      setLoading(false);
    }

    void loadUser();
  }, []);

  // Oppdater brukernavn
  const handleUsernameSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameMessage(null);

    const form = e.currentTarget;
    const input = form.elements.namedItem("username") as HTMLInputElement;
    const newUsername = input.value.trim();

    if (!newUsername) {
      setUsernameMessage("Brukernavn kan ikke være tomt.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUsernameMessage("Du må være logget inn.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("user_id", user.id);

    if (error) {
      if (
        error.code === "23505" ||
        (error.message && error.message.toLowerCase().includes("duplicate"))
      ) {
        setUsernameMessage("Brukernavnet er allerede i bruk.");
      } else {
        console.error("Feil ved oppdatering av brukernavn:", error);
        setUsernameMessage("Noe gikk galt. Prøv igjen.");
      }
      return;
    }

    setInfo((prev) => ({ ...prev, username: newUsername }));
    setUsernameMessage("Brukernavnet ble oppdatert.");
  };

  // Oppdater e-post
  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailMessage(null);

    const input = e.currentTarget.elements.namedItem(
      "newEmail",
    ) as HTMLInputElement;
    const newEmail = input.value.trim();

    if (!newEmail) {
      setEmailMessage("Skriv inn en gyldig e-post.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      console.error("Feil ved oppdatering av e-post:", error);
      setEmailMessage(error.message || "Noe gikk galt. Prøv igjen.");
      return;
    }

    setEmailMessage(
      "Vi har sendt en e-post for å bekrefte den nye adressen. Følg instruksjonene der.",
    );
  };

  const friendlyName = info.username || info.email || "kontoen din";

  return (
    <StudioAuthGate>
      <main className="relative min-h-screen bg-phorium-dark pt-24 pb-24 text-phorium-light">
        {/* Subtil bakgrunnsglow */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(0,0,0,0.4),transparent_60%),radial-gradient(circle_at_100%_0%,rgba(0,0,0,0.35),transparent_55%)]" />

        <div className="mx-auto max-w-5xl px-4">
          {/* Header */}
          <SectionHeader
            label="Konto"
            title="Min Phorium-konto"
            description={`Her administrerer du ${friendlyName} – innlogging, plan og kredittbruk i betaversjonen.`}
          />

          {loading ? (
            <Card className="mt-4 p-6 text-sm text-phorium-light/70">
              Laster kontoinformasjon …
            </Card>
          ) : (
            <>
              {/* To hovedkort i grid */}
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {/* Venstre: Konto & innlogging */}
                <Card className="p-6 space-y-6">
                  <section>
                    <h2 className="text-sm font-semibold text-phorium-light">
                      Innlogging & konto
                    </h2>
                    <div className="mt-2 space-y-1 text-[13px] text-phorium-light/80">
                      <p>
                        <span className="text-phorium-light/60">
                          E-post:&nbsp;
                        </span>
                        <span className="font-medium">
                          {info.email ?? "—"}
                        </span>
                      </p>
                      {info.createdAt && (
                        <p className="text-phorium-light/60">
                          Konto opprettet:{" "}
                          {new Date(info.createdAt).toLocaleDateString(
                            "nb-NO",
                            {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            },
                          )}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Endre e-post */}
                  <section className="border-t border-phorium-off/20 pt-4">
                    <h3 className="text-[13px] font-semibold text-phorium-light">
                      Endre innloggings-e-post
                    </h3>
                    <p className="mt-1 text-[12px] text-phorium-light/65">
                      Vi sender en bekreftelsesmail til den nye adressen før
                      endringen trer i kraft.
                    </p>

                    <form
                      onSubmit={handleEmailSubmit}
                      className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <input
                        type="email"
                        name="newEmail"
                        placeholder="ny@epost.no"
                        className="flex-1 rounded-lg border border-phorium-off/40 bg-phorium-dark/60 px-3 py-1.5 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-blue-400/70 px-4 py-1.5 text-[13px] font-medium text-blue-200 hover:bg-blue-500/10 transition"
                      >
                        Oppdater e-post
                      </button>
                    </form>

                    {emailMessage && (
                      <p className="mt-1 text-[12px] text-phorium-light/70">
                        {emailMessage}
                      </p>
                    )}
                  </section>

                  {/* Brukernavn */}
                  <section className="border-t border-phorium-off/20 pt-4">
                    <h3 className="text-[13px] font-semibold text-phorium-light">
                      Brukernavn
                    </h3>
                    <p className="mt-1 text-[12px] text-phorium-light/70">
                      Et eget brukernavn gjør det enklere å kjenne igjen konto
                      og historikk i Phorium. Må være unikt.
                    </p>

                    <form
                      onSubmit={handleUsernameSubmit}
                      className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <input
                        type="text"
                        name="username"
                        defaultValue={info.username ?? ""}
                        placeholder="f.eks. jensenstudio"
                        className="flex-1 rounded-lg border border-phorium-off/40 bg-phorium-dark/60 px-3 py-1.5 text-[13px] text-phorium-light outline-none focus:border-phorium-accent/80"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-phorium-accent/70 px-4 py-1.5 text-[13px] font-medium text-phorium-accent hover:bg-phorium-accent/10 transition"
                      >
                        Lagre brukernavn
                      </button>
                    </form>

                    {usernameMessage && (
                      <p className="mt-1 text-[12px] text-phorium-light/70">
                        {usernameMessage}
                      </p>
                    )}

                    {info.username && (
                      <p className="mt-1 text-[12px] text-phorium-light/55">
                        Ditt nåværende brukernavn:{" "}
                        <span className="font-medium">@{info.username}</span>
                      </p>
                    )}
                  </section>

                  {/* Endre passord inne i samme kort */}
                  <section className="border-t border-phorium-off/20 pt-4">
                    <ChangePasswordSection />
                  </section>
                </Card>

                {/* Høyre: Plan & kreditter */}
                <Card className="p-6 space-y-5">
                  <section>
                    <h2 className="text-sm font-semibold text-phorium-light">
                      Plan & kredittnivå
                    </h2>
                    <p className="mt-1 text-[12px] text-phorium-light/70">
                      Betaen bruker kreditter per generering. Etter lansering
                      vil planene styre hvor mange kreditter du får hver måned.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[12px] text-phorium-light/55">
                        Nåværende plan:
                      </span>
                      <PlanBadge plan={info.plan} />
                    </div>
                  </section>

                  {/* Kredittstatus */}
                  <section className="border-t border-phorium-off/20 pt-4">
                    <h3 className="text-[13px] font-semibold text-phorium-light">
                      Kredittstatus
                    </h3>
                    <p className="mt-1 text-[12px] text-phorium-light/70">
                      Dette er din nåværende saldo. I beta kan saldoen justeres
                      manuelt av deg som admin.
                    </p>

                    <div className="mt-3">
                      <CreditsBadge />
                    </div>
                  </section>

                  {/* Kreditt-historikk */}
                  <section className="border-t border-phorium-off/20 pt-4">
                    <h3 className="text-[13px] font-semibold text-phorium-light">
                      Kreditt-historikk
                    </h3>
                    <p className="mt-1 text-[12px] text-phorium-light/70">
                      Viser siste bevegelser på kredittsaldoen din (tildelinger
                      og bruk).
                    </p>
                    <div className="mt-3 rounded-xl border border-phorium-off/25 bg-phorium-dark/70 p-3">
                      <CreditHistory />
                    </div>
                  </section>
                </Card>
              </div>

              {/* Admin / navigasjon / “meta” */}
              <div className="mt-6 grid gap-4 md:grid-cols-[2fr,1fr]">
                <Card className="p-5 space-y-2 text-[12px] text-phorium-light/80">
                  <h3 className="text-[13px] font-semibold text-phorium-light">
                    Oppgradering & fakturering
                  </h3>
                  <p>
                    Når Phorium lanseres offentlig, kan du oppgradere plan og
                    administrere fakturering via Stripe. I beta holder vi ting
                    enkle.
                  </p>
                  <p className="text-phorium-light/65">
                    Har du lyst til å teste en annen plan allerede nå, kan du ta
                    kontakt – så justerer vi det manuelt.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href="/priser"
                      className="inline-flex items-center rounded-full bg-phorium-accent px-4 py-1.5 text-[12px] font-semibold text-phorium-dark shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:bg-phorium-accent/90"
                    >
                      Se planene
                    </Link>
                    <Link
                      href="/kontakt"
                      className="inline-flex items-center rounded-full border border-phorium-off/50 bg-phorium-dark px-4 py-1.5 text-[12px] text-phorium-light hover:border-phorium-accent hover:text-phorium-accent"
                    >
                      Ta kontakt om plan
                    </Link>
                  </div>
                </Card>

                <Card className="p-5 space-y-2 text-[12px] text-phorium-light/80">
                  <h3 className="text-[13px] font-semibold text-phorium-light">
                    Hjelp & sikkerhet
                  </h3>
                  <p>
                    Opplever du noe rart med kontoen, kredittbruk eller
                    innlogging, vil vi gjerne høre om det.
                  </p>
                  <p className="text-[11px] text-phorium-light/65">
                    For sletting av konto (GDPR) eller andre forespørsler, send
                    en e-post til{" "}
                    <a
                      href="mailto:support@phorium.no"
                      className="underline underline-offset-2 hover:text-phorium-accent"
                    >
                      support@phorium.no
                    </a>
                    .
                  </p>
                  <div className="mt-2">
                    <Link
                      href="/studio"
                      className="inline-flex items-center rounded-full border border-phorium-off/50 bg-phorium-dark px-4 py-1.5 text-[12px] text-phorium-light hover:border-phorium-accent hover:text-phorium-accent"
                    >
                      Tilbake til Studio
                    </Link>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </StudioAuthGate>
  );
}
