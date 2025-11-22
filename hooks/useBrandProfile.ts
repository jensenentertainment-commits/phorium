"use client";

import { useEffect, useState } from "react";

export type BrandProfile = {
  storeName?: string;
  primaryColor?: string;
  accentColor?: string;
  tone?: string; // f.eks. "nøytral", "lekent", "eksklusivt"
  industry?: string;
  style?: string;
  styleNotes?: string;
};

export type BrandSource = "none" | "local" | "auto" | "unknown";

type StoredBrandProfile = {
  brand: BrandProfile;
  source: BrandSource;
  updatedAt: string;
};

const STORAGE_KEY = "phorium_brand_profile_v1";

function loadFromStorage(): StoredBrandProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBrandProfile;

    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.brand) return null;

    return {
      brand: parsed.brand,
      source: parsed.source ?? "local",
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function persist(brand: BrandProfile, source: BrandSource) {
  if (typeof window === "undefined") return;

  const payload: StoredBrandProfile = {
    brand,
    source,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // stille feil
  }
}

export default function useBrandProfile() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [source, setSource] = useState<BrandSource>("unknown");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Last fra localStorage ved oppstart
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = loadFromStorage();
    if (stored) {
      setBrand(stored.brand);
      setSource(stored.source || "local");
    } else {
      setSource("none");
    }

    setLoading(false);
  }, []);

  // Manuell oppdatering (fra UI) – brukes i BrandProfileCard, osv.
  function updateBrand(changes: Partial<BrandProfile>) {
    setBrand((prev) => {
      const next: BrandProfile = {
        ...(prev || {}),
        ...changes,
      };

      // Når brukeren endrer ting i UI → dette er en lokal profil
      setSource("local");
      persist(next, "local");

      return next;
    });
  }

  // Hent/oppdater brandprofil fra Shopify (auto)
  async function autoGenerateBrandProfile() {
    if (typeof window === "undefined") return null;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shopify/brand-profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        // 404 / 400 betyr ofte at vi ikke har koblet butikk eller ikke fant data
        let message = "Kunne ikke hente brandprofil fra Shopify.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignorér JSON-feil
        }
        setError(message);
        return null;
      }

      const payload = await res.json();

      const p = payload.profile || payload.brand || payload; // litt tolerant
      if (!p) {
        setError("Fant ingen brandprofil-data fra Shopify.");
        return null;
      }

      const profile: BrandProfile = {
        storeName: p.storeName || p.shopName || brand?.storeName || "",
        tone: p.tone ?? brand?.tone ?? "nøytral",
        industry: p.industry ?? brand?.industry,
        style: p.style ?? brand?.style,
        primaryColor: p.primaryColor ?? brand?.primaryColor,
        accentColor: p.accentColor ?? brand?.accentColor,
        styleNotes: p.styleNotes ?? brand?.styleNotes,
      };

      setBrand(profile);
      setSource("auto");
      persist(profile, "auto");

      return profile;
    } catch (err) {
      setError("Uventet feil ved henting av brandprofil.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // "refresh" alias – brukes i BrandProfileCard etc.
  const refresh = autoGenerateBrandProfile;

  return {
    brand,
    source,
    loading,
    error,
    updateBrand,
    autoGenerateBrandProfile,
    refresh,
  };
}
