import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-phorium-off/25 bg-phorium-dark text-phorium-light/75">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Venstre side */}
        <div className="space-y-2">
          <p className="text-[11px] sm:text-[12px]">
            © {year} Phorium. Bygget i Norge for nettbutikker, byråer og skapere.
          </p>
          <p className="text-[10px] sm:text-[11px] text-phorium-light/55">
            Demo-versjon uten ekte innlogging og API. Først får vi på plass
            flyt, design og struktur – så kommer motoren under panseret.
          </p>

          <p className="pt-1 text-[10px] text-phorium-light/45">
            Utviklet av:{" "}
            <span className="font-medium text-phorium-light/70">
              Jensen Digital
            </span>
          </p>
        </div>

        {/* Høyre side */}
        <div className="flex flex-wrap gap-3 text-[10px] sm:text-[11px] sm:justify-end">
          <Link href="/" className="hover:text-phorium-accent transition-colors">
            Forside
          </Link>
          <Link
            href="/pricing"
            className="hover:text-phorium-accent transition-colors"
          >
            Priser
          </Link>
          <Link
            href="/om"
            className="hover:text-phorium-accent transition-colors"
          >
            Om
          </Link>
          <Link
            href="/guide"
            className="hover:text-phorium-accent transition-colors"
          >
            Guide
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-phorium-accent transition-colors"
          >
            Studio
          </Link>
          <Link
            href="/kontakt"
            className="hover:text-phorium-accent transition-colors"
          >
            Kontakt
          </Link>

          <Link
  href="/personvern-vilkar"
  className="hover:text-[#C8B77A] transition-colors"
>
  Personvern & vilkår
</Link>


  
        </div>
      </div>
    </footer>
  );
}
