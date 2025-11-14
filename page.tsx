"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sender");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/studio`,
      },
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Vi har sendt deg en innloggingslenke på e-post.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-180px)] flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="max-w-sm w-full bg-[#2A2E26] border border-[#A39C84]/50 rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-lg font-semibold text-[#ECE8DA]">
          Logg inn til Phorium Studio
        </h1>
        <p className="text-[11px] text-[#ECE8DA]/70">
          Skriv inn e-postadressen din, så sender vi en magisk innloggingslenke.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@butikk.no"
          className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
        />
        <button
          type="submit"
          disabled={status === "sender"}
          className="w-full py-2.5 rounded-full bg-[#C8B77A] text-[#2A2E26] text-sm font-semibold hover:bg-[#E3D8AC] transition disabled:opacity-60"
        >
          {status === "sender" ? "Sender lenke..." : "Send magisk lenke"}
        </button>
        {status && status !== "sender" && (
          <p className="text-[10px] text-[#ECE8DA]/70">{status}</p>
        )}
      </form>
    </main>
  );
}
