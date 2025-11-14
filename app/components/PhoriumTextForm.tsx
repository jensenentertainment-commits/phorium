"use client";

import { useState } from "react";

export default function PhoriumTextForm() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          category,
          tone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Ukjent feil");
      } else {
        setResult(data.data);
      }
    } catch (err: any) {
      setError("Kunne ikke kontakte API-et.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto bg-[#2A2E26]/95 border border-[#A39C84]/40 rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[#ECE8DA]">Phorium Tekstgenerator</h2>
      <p className="text-[12px] text-[#ECE8DA]/70">
        Fyll inn produktnavn og trykk på “Generer tekst”. Test direkte mot Phorium Core.
      </p>

      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Produktnavn (obligatorisk)"
        className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
      />

      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Kategori (valgfritt)"
        className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
      />

      <input
        type="text"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
        placeholder="Tone (f.eks. moderne, teknisk, humoristisk)"
        className="w-full px-3 py-2 rounded-lg bg-[#11140F] text-[#ECE8DA] text-sm border border-[#A39C84]/40 focus:outline-none focus:border-[#C8B77A]"
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !productName}
        className="w-full py-2.5 rounded-full bg-[#C8B77A] text-[#2A2E26] text-sm font-semibold hover:bg-[#E3D8AC] transition disabled:opacity-60"
      >
        {loading ? "Genererer..." : "Generer tekst"}
      </button>

      {error && (
        <p className="text-red-400 text-[12px] bg-red-900/30 rounded-lg p-2">{error}</p>
      )}

      {result && (
        <div className="mt-4 bg-[#11140F] border border-[#A39C84]/40 rounded-xl p-4 text-left space-y-2 text-[#ECE8DA]/90 text-sm">
          <p className="text-[#C8B77A] font-semibold">{result.title}</p>
          <p>{result.description}</p>
          <div className="text-[11px] text-[#ECE8DA]/60 border-t border-[#A39C84]/30 pt-2 mt-2">
            <p><strong>Meta-tittel:</strong> {result.meta_title}</p>
            <p><strong>Meta-beskrivelse:</strong> {result.meta_description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
