"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import StudioAuthGate from "../studio/StudioAuthGate";
import CreditsBadge from "../components/CreditsBadge";
import Link from "next/link";
import { ChangePasswordSection } from "@/app/components/ChangePasswordSection";
import { PlanBadge, type PlanName } from "@/app/components/PlanBadge";
import CreditHistory from "@/app/components/CreditHistory";

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

  // Håndter oppdatering av brukernavn
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

  // Håndter oppdatering av e-post
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

  return (
    <StudioAuthGate>
      <main className="min-h-screen bg-phorium-dark pt-24 pb-24 text-phorium-light">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header */}
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-phorium-light/50">
              Konto
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Min Phorium-konto</h1>
            <p className="mt-2 text-[13px] text-phorium-light/70">
              Oversikt over innlogging, plan og kredittbruk i betaversjonen.
            </p>
          </div>

          {/* Hovedkort */}
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            {loading ? (
              <p className="text-sm text-phorium-light/70">
                Laster kontoinformasjon …
              </p>
            ) : (
              <div className="space-y-6">
                {/* Innlogging */}
                <section>
                  <h2 className="text-sm font-semibold text-phorium-light">
                    Innlogging
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
                        Bruker opprettet:{" "}
                        {new Date(info.createdAt).toLocaleDateString("nb-NO", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Endre e-post */}
                  <div className="mt-4 border-t border-phorium-off/20 pt-3">
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
                        className="rounded-lg border border-blue-400/70 px-3 py-1.5 text-[13px] font-medium text-blue-200 hover:bg-blue-500/10 transition"
                      >
                        Oppdater e-post
                      </button>
                    </form>

                    {emailMessage && (
                      <p className="mt-1 text-[12px] text-phorium-light/70">
                        {emailMessage}
                      </p>
                    )}
                  </div>
                </section>

                {/* Brukernavn */}
                <section className="border-t border-phorium-off/20 pt-4">
                  <h2 className="text-sm font-semibold text-phorium-light">
                    Brukernavn
                  </h2>
                  <p className="mt-1 text-[12px] text-phorium-light/70">
                    Et eget brukernavn gjør det enklere å kjenne igjen kontoen
                    din i Phorium. Må være unikt.
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
                      className="rounded-lg border border-phorium-accent/70 px-3 py-1.5 text-[13px] font-medium text-phorium-accent hover:bg-phorium-accent/10 transition"
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

                {/* Kreditter & plan */}
                <section className="border-t border-phorium-off/20 pt-4">
                  <h2 className="text-sm font-semibold text-phorium-light">
                    Kreditter & plan
                  </h2>
                  <p className="mt-1 text-[12px] text-phorium-light/75">
                    Under ser du plan-badge, nåværende kreditter og historikk
                    for bruk og tildelinger.
                  </p>

                  {/* Plan-badge */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[12px] text-phorium-light/55">
                      Plan:
                    </span>
                    <PlanBadge plan={info.plan} />
                  </div>

                  {/* Kreditt-status */}
                  <div className="mt-3">
                    <CreditsBadge />
                  </div>

                  {/* Kreditt-historikk */}
                  <div className="mt-4 rounded-xl border border-phorium-off/25 bg-phorium-dark/70 p-4">
                    <h3 className="text-[13px] font-semibold text-phorium-light">
                      Kreditt-historikk
                    </h3>
                    <p className="mt-1 text-[12px] text-phorium-light/70">
                      Viser siste bevegelser på kredittsaldoen din (tildelinger
                      og bruk).
                    </p>

                    <CreditHistory />
                  </div>
                </section>

                {/* Navigasjon / kontakt */}
                <section className="border-t border-phorium-off/20 pt-4 flex flex-wrap items-center gap-3 text-[13px]">
                  <Link
                    href="/studio"
                    className="inline-flex items-center rounded-full bg-phorium-accent px-4 py-1.5 font-medium text-phorium-dark shadow-[0_8px_28px_rgba(0,0,0,0.55)] hover:bg-phorium-accent/90 transition"
                  >
                    Tilbake til Studio
                  </Link>

                  <span className="text-phorium-light/50">
                    Trenger du hjelp?{" "}
                    <Link
                      href="/kontakt"
                      className="underline underline-offset-2 hover:text-phorium-accent"
                    >
                      Kontakt oss
                    </Link>
                    .
                  </span>
                </section>
              </div>
            )}
          </div>

          {/* Endre passord-seksjon (som du allerede hadde) */}
          <ChangePasswordSection />
        </div>
      </main>
    </StudioAuthGate>
  );
}
