"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Lock, Mail, KeyRound } from "lucide-react";

type Mode = "login" | "signup";

const BETA_CODE = process.env.NEXT_PUBLIC_BETA_INVITE_CODE || "";
const INITIAL_CREDITS = 300; // juster om du vil

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hvis bruker allerede er logget inn → rett til /studio
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/studio");
      }
    }
    void checkUser();
  }, [router]);

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setMessage(null);
  setError(null);

  try {
    if (!email.trim() || !password.trim()) {
      setError("Skriv inn både e-post og passord.");
      return;
    }

    if (mode === "signup") {
      // 🔐 Sjekk invite-kode først
      if (!inviteCode.trim()) {
        setError("Du må skrive inn invite-koden.");
        return;
      }

      if (BETA_CODE && inviteCode.trim() !== BETA_CODE) {
        setError("Feil invite-kode. Dobbeltsjekk eller kontakt Lars.");
        return;
      }

      // 🧾 Opprett bruker i Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error);
        setError(error.message || "Kunne ikke opprette konto.");
        return; // ⛔️ VIKTIG: stopp her hvis det feilet
      }

      // (Valgfritt) Gi startkreditter – hvis dette feiler, skal ikke signup ryke
      try {
        await fetch("/api/credits/give", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            amount: INITIAL_CREDITS,
            reason: "beta_signup",
          }),
        });
      } catch (creditError) {
        console.error("Feil ved tildeling av kreditter:", creditError);
        // Ikke sett error til bruker – kreditter kan du fikse manuelt om det knoter
      }

      setMessage("Konto opprettet! Du kan nå logge inn.");
      setMode("login");
      setPassword("");
      setInviteCode("");
      return; // ⛔️ Ferdig med signup
    }

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);

        if (error.message === "Invalid login credentials") {
          setError("Feil e-post eller passord.");
        } else {
          setError(error.message || "Kunne ikke logge inn.");
        }

        return; // stopp her
      }

      // Alt ok → inn i appen
      router.push("/studio");
    }
  } catch (err) {
    console.error("Uventet feil i handleSubmit:", err);
    setError("Noe gikk galt. Prøv igjen om litt.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#1A4242] via-[#06231E] to-[#071F1B]">
      <div className="w-full max-w-md rounded-2xl border border-phorium-off/40 bg-[#1A4242]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-phorium-accent/80">
            Phorium Beta
          </p>
          <h1 className="mt-1 text-xl font-semibold text-phorium-light">
            {mode === "login" ? "Logg inn" : "Opprett beta-konto"}
          </h1>
          <p className="mt-1 text-[12px] text-phorium-light/70">
            {mode === "login"
              ? "Bruk e-post og passordet du har fått tilsendt."
              : "Kun for inviterte testere. Du trenger beta-koden fra Lars."}
          </p>
        </div>

        <div className="mb-4 inline-flex rounded-full bg-[#0D1713] p-1 text-[11px] text-phorium-light/70">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-full px-3 py-1 transition ${
              mode === "login"
                ? "bg-phorium-accent text-phorium-dark font-semibold"
                : "bg-transparent"
            }`}
          >
            Logg inn
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-full px-3 py-1 transition ${
              mode === "signup"
                ? "bg-phorium-accent text-phorium-dark font-semibold"
                : "bg-transparent"
            }`}
          >
            Opprett konto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] text-phorium-light/80">
              E-post
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-phorium-light/40">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-phorium-off/40 bg-white px-9 py-2 text-[13px] text-[#0f1512] placeholder:text-[#6c7a75] focus:border-phorium-accent/80 focus:outline-none focus:ring-2 focus:ring-phorium-accent/20"
                placeholder="deg@butikk.no"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-phorium-light/80">
              Passord
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-phorium-light/40">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-phorium-off/40 bg-white px-9 py-2 text-[13px] text-[#0f1512] placeholder:text-[#6c7a75] focus:border-phorium-accent/80 focus:outline-none focus:ring-2 focus:ring-phorium-accent/20"
                placeholder={
                  mode === "login"
                    ? "Passordet du har fått"
                    : "Minst 6 tegn"
                }
              />
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-[11px] text-phorium-light/80">
                Beta-kode
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-phorium-light/40">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full rounded-xl border border-phorium-off/40 bg-white px-9 py-2 text-[13px] text-[#0f1512] placeholder:text-[#6c7a75] focus:border-phorium-accent/80 focus:outline-none focus:ring-2 focus:ring-phorium-accent/20"
                  placeholder="Koden du har fått fra Lars"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-[12px] text-red-300">{error}</p>
          )}
          {message && (
            <p className="text-[12px] text-emerald-300">{message}</p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              !password.trim() ||
              (mode === "signup" && !inviteCode.trim())
            }
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-phorium-accent py-2.5 text-[14px] font-semibold text-phorium-dark disabled:cursor-not-allowed disabled:bg-phorium-accent/40"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Logger inn…" : "Oppretter konto…"}
              </>
            ) : mode === "login" ? (
              "Logg inn"
            ) : (
              "Opprett konto"
            )}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-phorium-light/50">
          Dette er en tidlig beta. Del ikke kontoen din med andre – hver bruker
          får egne kreditter og historikk.
        </p>
      </div>
    </main>
  );
}
