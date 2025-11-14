"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lukk meny når man navigerer til ny route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Forside" },
    { href: "/pricing", label: "Priser" },
    { href: "/om", label: "Om" },
    { href: "/guide", label: "Guide" },
    { href: "/kontakt", label: "Kontakt" },
    { href: "/dashboard", label: "Studio", isApp: true },
  ];

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-40 border-b bg-[#F5E9D8]/90 backdrop-blur-xl transition-shadow",
        "border-phorium-off/30",
        scrolled ? "shadow-[0_4px_18px_rgba(0,0,0,0.08)]" : "shadow-none",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-6 w-6 rounded-full bg-phorium-dark shadow-[0_0_0_2px_rgba(28,31,24,0.12)] transition-transform group-hover:scale-[1.05]" />
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-phorium-dark">
            Phorium
          </span>
        </Link>

        {/* Desktop-nav */}
        <div className="hidden items-center gap-3 text-[12px] sm:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.isApp && pathname.startsWith("/dashboard"));

            const baseClasses =
              "px-2 py-1 rounded-full transition-all whitespace-nowrap";

            const activeClasses = item.isApp
              ? "bg-phorium-dark text-phorium-light shadow-sm"
              : "bg-phorium-dark text-phorium-light shadow-sm";

            const inactiveClasses = item.isApp
              ? "border border-phorium-off/40 text-[#3E3A30] hover:border-phorium-dark hover:bg-phorium-off/40 hover:text-phorium-dark"
              : "text-[#3E3A30] hover:text-phorium-dark hover:bg-phorium-off/40";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  baseClasses,
                  active ? activeClasses : inactiveClasses,
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Logg inn CTA */}
          <Link
            href="/sign-in"
            className="ml-1 rounded-full bg-phorium-dark px-3 py-1.5 text-[11px] font-semibold text-phorium-light shadow-sm transition hover:bg-black/85"
          >
            Logg inn
          </Link>
        </div>

        {/* Mobil: burger-knapp */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full border border-phorium-off/60 bg-[#F5E9D8]/90 p-1.5 text-[#3E3A30] hover:bg-phorium-off/40 sm:hidden"
          aria-label="Åpne / lukk meny"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      {/* Mobil-meny */}
      {open && (
        <div className="sm:hidden">
          <div className="mx-auto max-w-6xl px-4 pb-3 pt-1">
            <div className="space-y-1 rounded-2xl border border-phorium-off/40 bg-[#F5E9D8] p-2 text-[13px] shadow-lg">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.isApp && pathname.startsWith("/dashboard"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center justify-between rounded-full px-3 py-1.5 transition",
                      active
                        ? "bg-phorium-dark text-phorium-light"
                        : "text-[#3E3A30] hover:bg-phorium-off/40 hover:text-phorium-dark",
                    ].join(" ")}
                  >
                    <span>{item.label}</span>
                    {item.isApp && (
                      <span className="rounded-full bg-phorium-dark/10 px-2 py-0.5 text-[10px] text-phorium-dark/80">
                        Studio
                      </span>
                    )}
                  </Link>
                );
              })}

              <Link
                href="/sign-in"
                className="mt-1 flex items-center justify-center rounded-full bg-phorium-dark px-3 py-1.5 text-[12px] font-semibold text-phorium-light hover:bg-black/85"
              >
                Logg inn
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
