"use client";

import { useEffect, useState } from "react";

export type BrandProfile = {
  storeName: string;
  industry: string;
  tone: string;
  primaryColor?: string;
  accentColor?: string;
  styleNotes?: string;
};

export type BrandSource = "manual" | "auto" | "unknown";

const STORAGE_KEY = "phorium_brand_profile_global";

export default function useBrandProfile() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [source, setSource] = useState<BrandSource>("unknown");
  const [loading, setLoading] = useState<boolean>(true);

  // Last fra localStorage ved oppstart
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(raw);

      // Støtt både gammel form (ren profil) og ny ({ brand, source })
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

  function persist(nextBrand: BrandProfile, nextSource: BrandSource) {
    setBrand(nextBrand);
    setSource(nextSource);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ brand: nextBrand, source: nextSource }),
      );
    }
  }

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

  // 🔥 Automatisk Shopify-analyse
  async function autoGenerateBrandProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify/auto-brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!data.success || !data.profile) {
        throw new Error(
          data.error || "Kunne ikke auto-analysere butikken.",
        );
      }

      const p = data.profile;

      const profile: BrandProfile = {
        storeName: p.storeName ?? p.store_name ?? "",
        industry: p.industry ?? "",
        tone: p.tone ?? "",
        primaryColor: p.primaryColor,
        accentColor: p.accentColor,
        styleNotes: p.styleNotes,
      };

      persist(profile, "auto");
      return profile;
    } finally {
      setLoading(false);
    }
  }

  return {
    brand,
    source,
    loading,
    updateBrand,
    autoGenerateBrandProfile,
  };
}
