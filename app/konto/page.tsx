"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StudioAuthGate from "../studio/StudioAuthGate";
import CreditsBadge from "../components/CreditsBadge";
import Link from "next/link";

type AccountInfo = {
  email: string | null;
  createdAt: string | null;
};

export default function AccountPage() {
  const [info, setInfo] = useState<AccountInfo>({
    email: null,
    createdAt: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setInfo({
          email: data.user.email ?? null,
          createdAt: data.user.created_at ?? null,
        });
      }

      setLoading(false);
    }

    void loadUser();
  }, []);

  return (
    <StudioAuthGate>
      <main className="min-h-screen bg-phorium-dark pt-24 pb-24 text-phorium-light">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-phorium-light/50">
              Konto
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Min Phorium-konto
            </h1>
            <p className="mt-2 text-[13px] text-phorium-light/70">
              Her ser du detaljene for innloggingen din og kredittstatus i
              betaversjonen.
            </p>
          </div>

          {/* Kort */}
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            {loading ? (
              <p className="text-sm text-phorium-light/70">
                Laster kontoinformasjon …
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-phorium-light">
                    Innlogging
                  </h2>
                  <div className="mt-2 space-y-1 text-[13px] text-phorium-light/80">
                    <p>
                      <span className="text-phorium-light/60">E-post:&nbsp;</span>
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
                </div>

                <div className="border-t border-phorium-off/20 pt-4">
                  <h2 className="text-sm font-semibold text-phorium-light">
                    Kreditter & plan
                  </h2>
                  <p className="mt-2 text-[13px] text-phorium-light/75">
                    Under ser du hvor mange kreditter du har tilgjengelig nå i
                    betaversjonen av Phorium.
                  </p>

                  <div className="mt-3">
                    <CreditsBadge />
                  </div>

                  <p className="mt-2 text-[12px] text-phorium-light/55">
                    Plan:&nbsp;
                    <span className="font-medium text-phorium-light/80">
                      Beta-tilgang
                    </span>
                  </p>
                </div>

                <div className="border-t border-phorium-off/20 pt-4 flex flex-wrap items-center gap-3 text-[13px]">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </StudioAuthGate>
  );
}
