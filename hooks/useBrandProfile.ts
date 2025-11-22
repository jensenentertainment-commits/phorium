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

type StoredValue =
  | BrandProfile
  | {
      brand: BrandProfile | null;
      source: BrandSource;
    };

export default function useBrandProfile() {
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [source, setSource] = useState<BrandSource>("unknown");
  const [loading, setLoading] = useState(true);

  function persist(nextBrand: BrandProfile | null, nextSource: BrandSource) {
    if (typeof window === "undefined") return;

    try {
      const payload: StoredValue = {
        brand: nextBrand,
        source: nextSource,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Kunne ikke lagre brandprofil i localStorage", err);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1) Les fra localStorage først (så siden føles kjapp)
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            try {
              const parsed: StoredValue = JSON.parse(raw);

              if (parsed && typeof parsed === "object") {
                if ("brand" in parsed) {
                  if (!cancelled) {
                    setBrand(parsed.brand ?? null);
                    setSource(parsed.source ?? "manual");
                  }
                } else {
                  if (!cancelled) {
                    setBrand(parsed as BrandProfile);
                    setSource("manual");
                  }
                }
              }
            } catch (err) {
              console.error(
                "Kunne ikke parse lagret brandprofil fra localStorage",
                err,
              );
            }
          }
        }

        // 2) Prøv å hente oppdatert profil fra backend (Shopify-koblet butikk)
        try {
          const res = await fetch("/api/shopify/brand-profile", {
            method: "GET",
            cache: "no-store",
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.success && data.profile) {
              const p = data.profile;

              const serverBrand: BrandProfile = {
                storeName: p.store_name ?? p.storeName ?? "",
                industry: p.industry ?? "",
                tone: p.tone ?? "",
                primaryColor: p.primary_color ?? p.primaryColor ?? undefined,
                accentColor: p.accent_color ?? p.accentColor ?? undefined,
                styleNotes: p.style_notes ?? p.styleNotes ?? undefined,
              };

              const serverSource: BrandSource =
                p.source === "auto" || p.source === "manual"
                  ? p.source
                  : "manual";

              if (!cancelled) {
                setBrand(serverBrand);
                setSource(serverSource);
              }

              // Synk ned til localStorage også
              persist(serverBrand, serverSource);
            }
          }
        } catch (err) {
          console.warn("Kunne ikke hente brandprofil fra server", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function updateBrand(partial: Partial<BrandProfile>) {
    setBrand((prev) => {
      const base: BrandProfile = prev ?? {
        storeName: "",
        industry: "",
        tone: "",
        primaryColor: undefined,
        accentColor: undefined,
        styleNotes: undefined,
      };

      const next: BrandProfile = { ...base, ...partial };
      const nextSource: BrandSource =
        source === "unknown" ? "manual" : source;

      setSource(nextSource);
      persist(next, nextSource);

      // Fire-and-forget lagring til backend
      (async () => {
        try {
          await fetch("/api/shopify/brand-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storeName: next.storeName,
              industry: next.industry,
              tone: next.tone,
              primaryColor: next.primaryColor,
              accentColor: next.accentColor,
              styleNotes: next.styleNotes,
              source: nextSource,
            }),
          });
        } catch (err) {
          console.error("Kunne ikke lagre brandprofil til server", err);
        }
      })();

      return next;
    });
  }

  async function autoGenerateBrandProfile(): Promise<BrandProfile | null> {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify/auto-brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        let message = "Klarte ikke å auto-analysere brandprofil.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignorér parse-feil
        }
        throw new Error(message);
      }

      const data = await res.json();
      if (!data?.success || !data.profile) {
        throw new Error(
          data?.error || "Mangler brandprofil i svar fra server.",
        );
      }

      const profile: BrandProfile = {
        storeName: data.profile.storeName ?? "",
        industry: data.profile.industry ?? "",
        tone: data.profile.tone ?? "",
        primaryColor: data.profile.primaryColor ?? undefined,
        accentColor: data.profile.accentColor ?? undefined,
        styleNotes: data.profile.styleNotes ?? undefined,
      };

      setBrand(profile);
      setSource("auto");
      persist(profile, "auto");

      // Lagre også i Supabase
      try {
        await fetch("/api/shopify/brand-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profile,
            source: "auto",
          }),
        });
      } catch (err) {
        console.error("Kunne ikke lagre auto-brandprofil til server", err);
      }

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
