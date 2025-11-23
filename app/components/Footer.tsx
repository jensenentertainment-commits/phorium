"use client";

import Link from "next/link";
import {
  Shield,
  ScrollText,
  FileCheck,
  Cookie,
  Info,
  Mail,
  BadgeDollarSign,
} from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="
        mt-0 px-4 py-10
        border-t border-phorium-off/25
        bg-phorium-surface/95
        text-phorium-dark
        shadow-[0_-18px_60px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      "
    >
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-8 text-[12px] sm:flex-row sm:justify-between sm:items-start">
        
        {/* Venstre */}
        <div className="flex flex-col gap-3">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="Phorium logo"
              className="h-9 w-9 rounded-xl shadow-sm"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-[0.16em] uppercase text-phorium-dark">
                Phorium
              </span>
              <span className="text-[11px] text-phorium-dark/60">
                AI for norske nettbutikker
              </span>
            </div>
          </div>

          <span className="mt-2 max-w-sm text-phorium-dark/70">
            © {new Date().getFullYear()} Phorium — utviklet av Jensen Digital.
            Laget med fokus på tydelig norsk tone, brukervennlighet og gode
            resultater i e-handel.
          </span>
        </div>

        {/* Høyre */}
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-12">
          {/* Retningslinjer block */}
          <div className="flex flex-col gap-2">
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-phorium-dark/70">
              Retningslinjer
            </span>
            <FooterLink href="/personvern" icon={<Shield className="h-3.5 w-3.5" />}>
              Personvern
            </FooterLink>
            <FooterLink href="/vilkar" icon={<ScrollText className="h-3.5 w-3.5" />}>
              Vilkår
            </FooterLink>
            <FooterLink href="/retningslinjer" icon={<FileCheck className="h-3.5 w-3.5" />}>
              Retningslinjer
            </FooterLink>
            <FooterLink href="/cookies" icon={<Cookie className="h-3.5 w-3.5" />}>
              Cookies
            </FooterLink>
          </div>

          {/* Navigasjon block */}
          <div className="flex flex-col gap-2">
            <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-phorium-dark/70">
              Navigasjon
            </span>
            <FooterLink href="/om" icon={<Info className="h-3.5 w-3.5" />}>
              Om
            </FooterLink>
            <FooterLink href="/kontakt" icon={<Mail className="h-3.5 w-3.5" />}>
              Kontakt
            </FooterLink>
            <FooterLink href="/priser" icon={<BadgeDollarSign className="h-3.5 w-3.5" />}>
              Priser
            </FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Reusable link component with icon */
function FooterLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group inline-flex items-center gap-2 rounded-lg py-0.5
        text-phorium-dark/70 transition
        hover:text-phorium-dark hover:underline underline-offset-2
      "
    >
      <span className="text-phorium-dark/45 transition group-hover:text-phorium-dark">
        {icon}
      </span>
      {children}
    </Link>
  );
}
