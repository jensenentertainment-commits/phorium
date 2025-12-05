"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/providers/AuthProvider";
import { Settings } from "lucide-react";
import { PLAN_COLORS, type PlanName } from "app/components/PlanBadge";



type NavItem = {
  href: string;
  label: string;
  isApp?: boolean;
  icon?: LucideIcon;
};

export default function Navbar() {

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { user, loading: authChecking } = useAuth();
const [plan, setPlan] = useState<PlanName | null>(null);

// Kun du er admin – bytt til din faktiske e-post
const isAdmin = !!user && user.email === "jensen.entertainment@gmail.com";


  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  if (!user) {
    setPlan(null);
    return;
  }

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Feil ved henting av plan i Navbar:", error);
        setPlan(null);
        return;
      }

      if (data?.plan) {
        const normalized = data.plan.toLowerCase();
        if (
          normalized === "source" ||
          normalized === "flow" ||
          normalized === "pulse" ||
          normalized === "nexus"
        ) {
          setPlan(normalized as PlanName);
        } else {
          setPlan(null);
        }
      } else {
        setPlan(null);
      }
    } catch (err) {
      console.error("Uventet feil ved henting av plan i Navbar:", err);
      setPlan(null);
    }
  };

  fetchPlan();
}, [user?.id]);


  // Scroll-shadow
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lukk mobilmeny ved route-endring
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

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Feil ved utlogging:", err);
    }
  }

  function handleLogin() {
    router.push("/login");
  }

  // Avatar-initial basert på e-post
const email = (user?.email as string | undefined) ?? null;
const initial = email ? email.charAt(0).toUpperCase() : "?";

const palette = plan ? PLAN_COLORS[plan] : null;
const avatarStyle = palette
  ? {
      backgroundColor: palette.bg,
      borderColor: palette.ring,
      color: palette.text,
    }
  : undefined;

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
            <span className="text-[10px] text-phorium-dark/60"></span>
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
                      active ? "text-phorium-white" : "text-phorium-white/60"
                    }`}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* ADMIN – alltid synlig for admin, uansett login-state */}
          {isAdmin && (
  <Link
    href="/admin"
    aria-label="Admin"
    className="flex items-center justify-center h-8 w-8 rounded-full border border-phorium-accent/70 text-phorium-accent hover:bg-phorium-accent/10 transition"
  >
    <Settings className="h-6 w-6" />
  </Link>
)}


          {/* Høyreside: login / avatar + logg ut */}
          {!authChecking &&
            (user ? (
              <div className="flex items-center gap-3">
                {/* Avatar – klikker til Konto */}
                <Link
  href="/konto"
  className="flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition hover:scale-[1.03]"
  style={avatarStyle}
  aria-label="Gå til Konto"
>
  {initial}
</Link>


                {/* Logg ut */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-phorium-off/60 bg-[#F5E9D8] px-3 py-1.5 text-[11px] text-phorium-dark/80 hover:border-phorium-accent/80 hover:text-phorium-accent transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logg ut</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-1.5 rounded-full border border-phorium-off/60 bg-[#F5E9D8] px-4 py-1.5 text-[13px] text-phorium-dark hover:border-phorium-accent/80 hover:text-phorium-accent transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Logg inn</span>
              </button>
            ))}
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

              {/* Mobil: ADMIN-knapp */}
              {isAdmin && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/admin"
                    className="rounded-full border border-phorium-accent/70 px-4 py-1.5 text-[13px] text-phorium-accent text-center hover:bg-phorium-accent/10 transition"
                  >
                    Adminpanel
                  </Link>
                </div>
              )}

              {/* Mobil: login / studio + logg ut */}
              {!authChecking &&
                (user ? (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      href="/studio"
                      className="rounded-full bg-phorium-dark px-4 py-1.5 text-center text-[13px] font-semibold text-phorium-light hover:bg-phorium-dark/90 transition"
                    >
                      Åpne Studio
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-full border border-phorium-off/50 px-4 py-1.5 text-[13px] text-[#3E3A30] hover:border-phorium-accent/70 hover:text-phorium-accent transition"
                    >
                      Logg ut
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="w-full rounded-full border border-phorium-off/50 px-4 py-1.5 text-[13px] text-[#3E3A30] hover:border-phorium-accent/70 hover:text-phorium-accent transition"
                  >
                    Logg inn
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
