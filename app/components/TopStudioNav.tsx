"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ImageIcon,
  Settings2,
  Store,
  LayoutDashboard,
} from "lucide-react";
import CreditsBadge from "@/app/components/CreditsBadge";
import CreditErrorBox from "@/app/components/CreditErrorBox";
import { useEffect } from "react";

type StudioNavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// 👇 LEGG TIL: props med creditError + setCreditError
// ...

// 👇 LEGG TIL: props med creditError + setCreditError + credits
export default function TopStudioNav({
  creditError,
  setCreditError,
  credits,
}: {
  creditError: string | null;
  setCreditError: (msg: string | null) => void;
  credits: number | null;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  }

  // ...


  // 👇 Hvis feilmelding dukker opp, scroll til toppen
  useEffect(() => {
    if (creditError) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [creditError]);

  const items: StudioNavItem[] = [
    {
      href: "/studio",
      label: "Oversikt",
      description: "Snarveier og status for butikken din",
      icon: LayoutDashboard,
    },
    {
      href: "/studio/tekst",
      label: "Tekststudio",
      description: "Produkttekster, SEO og annonser",
      icon: Sparkles,
    },
    {
      href: "/studio/visuals",
      label: "Visuals",
      description: "Produktbilder, bannere og kampanjer",
      icon: ImageIcon,
    },
    {
      href: "/studio/brandprofil",
      label: "Brandprofil",
      description: "Farger, tone-of-voice og stil",
      icon: Settings2,
    },
    {
      href: "/studio/produkter",
      label: "Produkter",
      description: "Liste fra Shopify-butikken din",
      icon: Store,
    },
  ];

  return (
    <>
      {/* 👇 GLOBAL "Tom for kreditter"-varsel */}
      {creditError && (
        <div className="mb-4">
          <CreditErrorBox
            message={creditError}
            onClose={() => setCreditError(null)}
          />
        </div>
      )}

      <nav className="mb-4 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-3 py-3 sm:px-4 sm:py-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-[18px] font-semibold uppercase tracking-[0.16em] text-phorium-light/90">
              Phorium Studio
            </p>
            <p className="text-[12px] text-phorium-light/60">
              Velg hva du vil jobbe med i butikken din.
            </p>
          </div>
          <CreditsBadge balance={credits ?? 0} quota={300} />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex min-w-[160px] flex-1 cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 text-left
                  transition-all duration-150
                  hover:-translate-y-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.45),0_6px_12px_rgba(0,0,0,0.35)]
                  ${
                    active
                      ? "border-phorium-accent/80 bg-phorium-accent/12 shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
                      : "border-phorium-off/35 bg-phorium-surface/90 hover:border-phorium-accent/70"
                  }
                `}
              >
                <div
                  className={`
                    flex h-9 w-9 items-center justify-center rounded-2xl border text-[11px] transition-all
                    shadow-[0_6px_18px_rgba(0,0,0,0.35)]
                    ${
                      active
                        ? "border-phorium-accent/70 bg-phorium-dark text-phorium-accent"
                        : "border-phorium-off/40 bg-phorium-dark text-phorium-light/80 group-hover:border-phorium-accent/60 group-hover:text-phorium-accent"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex min-w-0 flex-col">
                  <span
                    className={`truncate text-[12px] font-medium ${
                      active ? "text-phorium-accent" : "text-phorium-light/90"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="truncate text-[10px] text-phorium-light/60">
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
