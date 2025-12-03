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
import { useEffect, useState } from "react";

import CreditsBadge from "@/app/components/CreditsBadge";
import CreditErrorBox from "@/app/components/CreditErrorBox";
import {
  PlanBadge,
  type PlanName,
} from "@/app/components/PlanBadge";
import { supabase } from "@/lib/supabaseClient";

type StudioNavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export default function TopStudioNav({
  creditError,
  setCreditError,
}: {
  creditError: string | null;
  setCreditError: (msg: string | null) => void;
}) {
  const pathname = usePathname();

  const [plan, setPlan] = useState<PlanName | null>(null);

  function isActive(href: string) {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  }

  // Scroll til toppen hvis vi har en global kreditt-feil
  useEffect(() => {
    if (creditError) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [creditError]);

  // Hent innlogget bruker + plan fra Supabase
  useEffect(() => {
    const run = async () => {
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr) {
          console.error("Feil ved henting av bruker i TopStudioNav:", userErr);
        }

        if (!user) {
          // Ikke innlogget → vis "Uten plan"
          setPlan(null);
          return;
        }

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileErr) {
          console.error(
            "Feil ved henting av profil/plan i TopStudioNav:",
            profileErr,
          );
          setPlan(null);
          return;
        }

        if (profile?.plan) {
          const normalized = String(profile.plan).toLowerCase().trim();
          const validPlans: PlanName[] = ["source", "flow", "pulse", "nexus"];

          if (validPlans.includes(normalized as PlanName)) {
            setPlan(normalized as PlanName);
          } else {
            console.warn(
              "Ukjent planverdi i DB, fallback til source:",
              profile.plan,
            );
            setPlan("source");
          }
        } else {
          // Ingen plan satt i DB → default til Source
          setPlan("source");
        }
      } catch (err) {
        console.error("Uventet feil i plan-load i TopStudioNav:", err);
        setPlan(null);
      }
    };

    run();
  }, []);

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
      {/* Global "tom for kreditter"-varsel */}
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

          {/* Høyre: Plan + Kreditter */}
          <div className="flex flex-col items-end gap-2 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-4 py-3 min-w-[220px]">
            {/* PlanBadge viser riktig plan, eller "Uten plan" som fallback */}
            <PlanBadge plan={plan} />

            <CreditsBadge quota={300} />
          </div>
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
