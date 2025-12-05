"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Lock, Mail, KeyRound, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
          return;
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
          // Ikke vis feil til bruker – kan fikses manuelt
        }

        setMessage("Konto opprettet! Du kan nå logge inn.");
        setMode("login");
        setPassword("");
        setInviteCode("");
        return;
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

          return;
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

  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md rounded-2xl border border-phorium-off/30 bg-phorium-dark/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
        {/* Topptekst – matcher admin-layout */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-phorium-light/55">
            Phorium · Beta-tilgang
          </p>
          <h1 className="mt-1 text-lg font-semibold text-phorium-light">
            {isLogin ? "Logg inn i Phorium Studio" : "Opprett konto i Phorium Studio"}
          </h1>
          <p className="mt-1 text-[12px] text-phorium-light/70">
            Tilgang til tekststudio, visuals og kredittsystemet – kun for
            inviterte testere.
          </p>
        </div>

        {/* Mode-toggle (Logg inn / Opprett konto) */}
        <div className="mb-4 inline-flex w-full rounded-full border border-phorium-off/30 bg-phorium-dark/80 p-1 text-[12px]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
              isLogin
                ? "bg-phorium-accent text-phorium-dark shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                : "text-phorium-light/70 hover:text-phorium-light"
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
            className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
              !isLogin
                ? "bg-phorium-accent text-phorium-dark shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                : "text-phorium-light/70 hover:text-phorium-light"
            }`}
          >
            Opprett konto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* E-post */}
          <div className="space-y-1">
            <label className="text-[12px] text-phorium-light/80">E-post</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-phorium-light/45">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark px-9 py-2 text-[13px] text-phorium-light placeholder:text-phorium-light/40 outline-none focus:border-phorium-accent/80 focus:ring-2 focus:ring-phorium-accent/20"
                placeholder="deg@butikk.no"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Passord + vis/skjul */}
          <div className="space-y-1">
            <label className="text-[12px] text-phorium-light/80">Passord</label>
            <div className="relative">
              {/* Venstre ikon */}
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-phorium-light/45">
                <Lock className="h-4 w-4" />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark px-9 pr-9 py-2 text-[13px] text-phorium-light placeholder:text-phorium-light/40 outline-none focus:border-phorium-accent/80 focus:ring-2 focus:ring-phorium-accent/20"
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />

              {/* Høyre ikon (vis/skjul) */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-phorium-light/50 transition hover:text-phorium-accent"
                aria-label={showPassword ? "Skjul passord" : "Vis passord"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {isLogin && (
              <div className="mt-1 text-right">
                <a
                  href="/glemt-passord"
                  className="text-[11px] text-phorium-accent hover:underline"
                >
                  Glemt passord?
                </a>
              </div>
            )}
          </div>

          {/* Invite-kode – kun signup */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[12px] text-phorium-light/80">
                Beta-kode
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-phorium-light/45">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full rounded-xl border border-phorium-off/40 bg-phorium-dark px-9 py-2 text-[13px] text-phorium-light placeholder:text-phorium-light/40 outline-none focus:border-phorium-accent/80 focus:ring-2 focus:ring-phorium-accent/20"
                  placeholder="Invite-kode du fikk fra Lars"
                />
              </div>
            </div>
          )}

          {/* Meldinger */}
          {error && (
            <p className="text-[12px] text-red-400">{error}</p>
          )}
          {message && (
            <p className="text-[12px] text-emerald-300">{message}</p>
          )}

          {/* CTA-knapp */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-phorium-accent py-2.5 text-[13px] font-semibold text-phorium-dark shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition hover:bg-phorium-accent/95 disabled:opacity-60 disabled:hover:bg-phorium-accent"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Logg inn" : "Opprett konto"}
          </button>

          <p className="mt-2 text-center text-[11px] text-phorium-light/55">
            Dette er en tidlig beta. Ikke del kontoen din – hver bruker får egne
            kreditter, brandprofiler og historikk.
          </p>
        </form>
      </div>
    </main>
  );
}
