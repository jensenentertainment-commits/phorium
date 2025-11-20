"use client";

import { useEffect, useState } from "react";

export type BrandProfile = {
  storeName: string;
  industry: string;
  tone: string;
  primaryColor?: string;
  accentColor?: string;
  styleNotes?: string;
  style?: string;
};

type BrandSource = "manual" | "auto" | "unknown";

const STORAGE_KEY = "phorium_brand_profile_global";

export default function useBrandProfile() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [source, setSource] = useState<BrandSource>("unknown");
  const [loading, setLoading] = useState<boolean>(true);

  // ------------------------------------------------
  // Last fra localStorage
  // ------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        if (parsed.brand) {
          setBrand(parsed.brand);
          setSource(parsed.source ?? "manual");
        } else {
          setBrand(parsed as BrandProfile);
          setSource("manual");
        }
      }
    } catch {
      // ignorer
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------
  // Persister til localStorage
  // ------------------------------------------------
  function persist(nextBrand: BrandProfile, nextSource: BrandSource) {
    setBrand(nextBrand);
    setSource(nextSource);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ brand: nextBrand, source: nextSource })
      );
    }
  }

  // ------------------------------------------------
  // Manuell oppdatering
  // ------------------------------------------------
  async function updateBrand(partial: Partial<BrandProfile>) {
    setBrand((prev) => {
      const base: BrandProfile = {
        storeName: "",
        industry: "",
        tone: "",
        ...prev,
      };

      const next: BrandProfile = { ...base, ...partial };
      const nextSource: BrandSource =
        source === "unknown" ? "manual" : source;

      persist(next, nextSource);
      return next;
    });
  }

  // ------------------------------------------------
  // 🔥 AUTO: Generering av brandprofil fra Shopify
  // ------------------------------------------------
  async function autoGenerateBrandProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify/auto-brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!data.success || !data.brand) {
        throw new Error(data.error || "Kunne ikke auto-analysere butikken.");
      }

      const p = data.brand;

      const profile: BrandProfile = {
        storeName: p.storeName ?? "",
        industry: p.industry ?? "",
        tone: p.tone ?? "",
        primaryColor: p.primaryColor,
        accentColor: p.accentColor,
        styleNotes: p.notes,
        style: p.style,
      };

      persist(profile, "auto");
      return profile;
    } finally {
      setLoading(false);
    }
  }

  return {
    brand,
    loading,
    updateBrand,
    source,
    autoGenerateBrandProfile,
  };
}
