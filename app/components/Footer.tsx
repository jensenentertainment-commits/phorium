"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="
        mt-0 px-4 py-6
        border-t border-phorium-off/25
        bg-phorium-surface
        text-phorium-dark
        shadow-[0_-10px_40px_rgba(0,0,0,0.28)]
      "
    >
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-[12px]">
        
        {/* Venstre side */}
        <div className="flex flex-col gap-1">
          <span className="text-phorium-dark/70">
            © {new Date().getFullYear()} Phorium — Bygget for norske nettbutikker. Utviklet av Jensen Digital
          </span>

          {/* Retningslinjer */}
          <div className="flex flex-wrap gap-4 text-phorium-dark/60">
            <Link 
              href="/personvern" 
              className="transition hover:text-phorium-dark hover:underline underline-offset-2"
            >
              Personvern
            </Link>

            <Link 
              href="/vilkar" 
              className="transition hover:text-phorium-dark hover:underline underline-offset-2"
            >
              Vilkår
            </Link>

            <Link 
              href="/retningslinjer" 
              className="transition hover:text-phorium-dark hover:underline underline-offset-2"
            >
              Retningslinjer
            </Link>

            <Link 
              href="/cookies" 
              className="transition hover:text-phorium-dark hover:underline underline-offset-2"
            >
              Cookies
            </Link>
          </div>
        </div>

        {/* Høyre side */}
        <div className="flex gap-4 text-phorium-dark/70">
          <Link 
            href="/om" 
            className="transition hover:text-phorium-dark hover:underline underline-offset-2"
          >
            Om
          </Link>

          <Link 
            href="/kontakt"
            className="transition hover:text-phorium-dark hover:underline underline-offset-2"
          >
            Kontakt
          </Link>

          <Link 
            href="/priser"
            className="transition hover:text-phorium-dark hover:underline underline-offset-2"
          >
            Priser
          </Link>
        </div>
      </div>
    </footer>
  );
}
