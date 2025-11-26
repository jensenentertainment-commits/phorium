"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  BadgeDollarSign,
  Info,
  BookOpenText,
  Mail,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";



type NavItem = {
  href: string;
  label: string;
  isApp?: boolean;
  icon?: LucideIcon;
};

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user || null);
  });
}, []);


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

  const navItems: NavItem[] = [
    { href: "/", label: "Forside", icon: Home },
    { href: "/priser", label: "Priser", icon: BadgeDollarSign },
    { href: "/om", label: "Om", icon: Info },
    { href: "/guide", label: "Guide", icon: BookOpenText },
    { href: "/kontakt", label: "Kontakt", icon: Mail },
    { href: "/studio", label: "Studio", isApp: true, icon: LayoutDashboard },
  ];

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-40 border-b bg-[#F5E9D8]/90 backdrop-blur-xl transition-shadow",
        "border-phorium-off/30",
        scrolled ? "shadow-[0_4px_18px_rgba(0,0,0,0.18)]" : "shadow-none",
      ].join(" ")}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/favicon.ico"
            alt="Phorium logo"
            className="h-10 w-10 object-contain transition-transform group-hover:scale-[1.05]"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-phorium-dark">
              Phorium
            </span>
            <span className="text-[10px] text-phorium-dark/60">
              AI for nettbutikker
            </span>
          </div>
        </Link>

        {/* Desktop-nav */}
        <div className="hidden items-center gap-3 text-[12px] sm:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.isApp && pathname.startsWith("/studio"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-nav inline-flex items-center gap-1.5 ${
                  active ? "btn-nav-active" : ""
                }`}
              >
                {Icon && (
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      active ? "text-phorium-dark" : "text-phorium-dark/60"
                    }`}
                  />
                )}
                <span>{item.label}</span>
              
              </Link>
            );
          })}

          {/* Logg inn CTA */}
          
 {user ? (
  // INNLOGGET → STUDIO SOM CTA-KNAPP
  <Link
    href="/studio"
    className="inline-flex items-center rounded-full bg-phorium-dark px-5 py-1.5 text-[13px] font-semibold text-phorium-light shadow-[0_4px_10px_rgba(0,0,0,0.35)] hover:bg-phorium-dark/90 hover:shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition"
  >
    STUDIO
  </Link>
) : (
  // UINNLOGGET → LOGG INN SOM VANLIG MENY-LENKE
  <Link
    href="/login"
    className="inline-flex items-center gap-1 text-[13px] text-phorium-dark hover:text-phorium-accent transition"
  >
    <LogIn className="h-4 w-4" />
    <span>Logg inn</span>
  </Link>
)}


        </div>

        {/* Mobil: burger-knapp */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full border border-phorium-off/60 bg-[#F5E9D8]/90 p-1.5 text-[#3E3A30] shadow-sm hover:bg-phorium-off/40 sm:hidden"
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
                  (item.isApp && pathname.startsWith("/studio"));
                const Icon = item.icon;

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
                    <span className="flex items-center gap-1.5">
                      {Icon && (
                        <Icon
                          className={`h-4 w-4 ${
                            active
                              ? "text-phorium-light"
                              : "text-[#3E3A30]/70"
                          }`}
                        />
                      )}
                      {item.label}
                    </span>
                    {item.isApp && (
                      <span className="rounded-full bg-phorium-dark/10 px-2 py-0.5 text-[10px] text-phorium-dark/80">
                        Studio
                      </span>
                    )}
                  </Link>
                );
              })}

             
              {user ? (
  <Link
    href="/studio"
    className="rounded-full border border-phorium-off/50 px-4 py-1.5 text-[13px] text-phorium-light hover:border-phorium-accent/70 hover:text-phorium-accent transition"
  >
    Studio
  </Link>
) : (
  <Link
    href="/login"
    className="rounded-full border border-phorium-off/50 px-4 py-1.5 text-[13px] text-phorium-light hover:border-phorium-accent/70 hover:text-phorium-accent transition"
  >
    Logg inn
  </Link>
)}

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
