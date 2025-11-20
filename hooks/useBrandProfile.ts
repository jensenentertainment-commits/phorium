"use client";

import { useEffect, useState } from "react";

export interface BrandProfile {
  storeName?: string;
  industry?: string;
  style?: string;
  tone?: "nøytral" | "lekent" | "eksklusivt" | string;
  primaryColor?: string;
  accentColor?: string;
}

const LOCAL_KEY = "phorium_store_profile";

export default function useBrandProfile() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"local" | "auto" | "none">("none");

  // 1) Prøv localStorage først → hvis ingenting, auto fra Shopify
  useEffect(() => {
    let didCancel = false;

    async function init() {
      try {
        const raw = typeof window !== "undefined"
          ? window.localStorage.getItem(LOCAL_KEY)
          : null;

        if (raw) {
          const parsed = JSON.parse(raw) as BrandProfile;
          if (!didCancel) {
            setBrand(parsed);
            setSource("local");
            setLoading(false);
          }
          return;
        }
      } catch {
        // ignorér
      }

      // Ingen lokal profil → hent auto
      await fetchAutoProfile(didCancel);
    }

    async function fetchAutoProfile(cancelFlag: boolean) {
      try {
        if (cancelFlag) return;
        setLoading(true);

        const res = await fetch("/api/shopify/auto-brand-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          setSource("none");
          return;
        }

        const data = await res.json();
        if (cancelFlag) return;

        if (data.success && data.profile) {
          setBrand(data.profile as BrandProfile);
          setSource("auto");
          try {
            window.localStorage.setItem(LOCAL_KEY, JSON.stringify(data.profile));
          } catch {}
        } else {
          setSource("none");
        }
      } catch {
        if (!cancelFlag) setSource("none");
      } finally {
        if (!cancelFlag) setLoading(false);
      }
    }

    init();

    return () => {
      didCancel = true;
    };
  }, []);

  function updateBrand(changes: Partial<BrandProfile>) {
    setBrand((prev) => {
      const base: BrandProfile = prev || {
        storeName: "",
        industry: "",
        style: "",
        tone: "nøytral",
        primaryColor: "#C8B77A",
        accentColor: "#ECE8DA",
      };

      const updated = { ...base, ...changes };
      try {
        window.localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (source === "auto") {
      setSource("local");
    }
  }

  async function refresh() {
    try {
      setLoading(true);
      const res = await fetch("/api/shopify/auto-brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.profile) {
        setBrand(data.profile as BrandProfile);
        setSource("auto");
        try {
          window.localStorage.setItem(LOCAL_KEY, JSON.stringify(data.profile));
        } catch {}
      }
    } catch {
      // ignorér
    } finally {
      setLoading(false);
    }
  }

  return {
    brand,
    loading,
    source,
    updateBrand,
    refresh,
  };
}
