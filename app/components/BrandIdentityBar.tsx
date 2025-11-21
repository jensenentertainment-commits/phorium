"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Sparkles } from "lucide-react";
import type { BrandProfile } from "@/hooks/useBrandProfile";

type BrandSource = "manual" | "auto" | "unknown";

type Props = {
  brand: BrandProfile | null;
  source: BrandSource;
};

type ShopIdentity = {
  name: string;
  domain?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
};

let cachedIdentity: ShopIdentity | null = null;

export default function BrandIdentityBar({ brand, source }: Props) {
  const [shop, setShop] = useState<ShopIdentity | null>(cachedIdentity);
  const [loading, setLoading] = useState<boolean>(!cachedIdentity);

  useEffect(() => {
    if (shop) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/shopify/store-identity");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.success || !data.shop || cancelled) return;

        cachedIdentity = data.shop as ShopIdentity;
        setShop(data.shop);
      } catch {
        // ikke kritisk
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [shop]);

  const displayName =
    brand?.storeName ||
    shop?.name ||
    "Brandprofil ikke satt enda";

  const detailsParts: string[] = [];
  if (brand?.industry) detailsParts.push(brand.industry);
  if (brand?.tone) detailsParts.push(`Tone: ${brand.tone}`);
  const subtitle =
    detailsParts.join(" · ") ||
    "Sett bransje og tone i brandprofil – Phorium bruker det automatisk.";

  const avatarUrl = shop?.logoUrl || shop?.faviconUrl || null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-4 py-3 text-[11px] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-phorium-off/40 bg-phorium-surface/80">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Store className="h-4 w-4 text-phorium-light/70" />
          )}
        </div>

        {/* Tekst */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold text-phorium-light">
              {displayName}
            </span>

            {source === "auto" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-phorium-surface px-2 py-0.5 text-[10px] text-phorium-light/80">
                <Sparkles className="h-3 w-3" />
                <span>Auto fra Shopify</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-phorium-light/65">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Høyreside: domene + link */}
      <div className="flex flex-wrap items-center gap-2">
        {shop?.domain && (
          <span className="hidden rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[10px] text-phorium-light/70 sm:inline">
            {shop.domain}
          </span>
        )}

        <Link
          href="/studio/brandprofil"
          className="btn btn-sm btn-ghost text-[11px]"
        >
          Juster brandprofil
        </Link>
      </div>
    </div>
  );
}
