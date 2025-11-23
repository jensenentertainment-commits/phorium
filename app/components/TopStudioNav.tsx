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

type StudioNavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const items: StudioNavItem[] = [
  {
    href: "/studio",
    label: "Oversikt",
    description: "Snarveier og status for butikken",
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

export default function TopStudioNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  }

  return (
    <nav className="mb-4 rounded-2xl border border-phorium-off/35 bg-phorium-dark/80 px-3 py-2 sm:px-4 sm:py-3">
      {/* Tittel / intro */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-phorium-light/50">
            Phorium Studio
          </p>
          <p className="text-[12px] text-phorium-light/75">
            Velg hva du vil jobbe med i butikken din.
          </p>
        </div>
      </div>

      {/* Meny-knapper */}
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex min-w-[150px] flex-1 cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-left
                transition transition-shadow transition-transform
                hover:shadow-lg hover:shadow-black/30 hover:scale-[1.02]
                ${
                  active
                    ? "border-phorium-accent bg-phorium-accent/10"
                    : "border-phorium-off/35 bg-phorium-dark/60 hover:border-phorium-accent/60 hover:bg-phorium-dark"
                }
              `}
            >
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-2xl border text-[11px] transition
                  group-hover:border-phorium-accent/60 group-hover:text-phorium-accent
                  ${
                    active
                      ? "border-phorium-accent/80 bg-phorium-accent/15 text-phorium-accent"
                      : "border-phorium-off/40 bg-phorium-dark text-phorium-light/80"
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
  );
}
