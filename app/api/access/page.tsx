"use client";

import { useState } from "react";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      window.location.href = "/"; // send videre til forsiden
    } else {
      setError(data.error || "Feil kode");
    }
  }

  return (
    <main className="min-h-screen bg-[#EEE3D3] flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-[300px] text-center">
        <h1 className="text-phorium-light text-xl mb-4">Skriv inn tilgangskode</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Tilgangskode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-md p-2 bg-white/20 text-phorium-light focus:outline-none focus:ring-2 focus:ring-phorium-accent"
          />

          {error && <p className="text-red-300 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-phorium-accent text-phorium-dark font-semibold py-2 rounded-md hover:bg-phorium-accent/80 transition"
          >
            {loading ? "Sjekker…" : "Fortsett"}
          </button>
        </form>
      </div>
    </main>
  );
}
