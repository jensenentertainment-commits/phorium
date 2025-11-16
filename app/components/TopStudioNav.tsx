"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Image as ImageIcon, Link2 } from "lucide-react";

export default function TopStudioNav() {
  const pathname = usePathname();

  // Hvilken side er aktiv?
  const isHub = pathname === "/studio";
  const isText = pathname.startsWith("/studio/text");
  const isVisuals = pathname.startsWith("/studio/visuals");
  const isConnect = pathname.startsWith("/studio/koble-nettbutikk");

  const neutral =
    "inline-flex items-center gap-2 rounded-full border border-[#1F3C3C] bg-[#0D2424] px-4 py-1.5 text-[12px] text-[#9FB9B9] transition hover:text-white hover:border-phorium-accent/60";
  const activeCls =
    "inline-flex items-center gap-2 rounded-full bg-phorium-accent px-4 py-1.5 text-[12px] font-semibold text-[#11140F] shadow-md shadow-phorium-accent/40 border border-phorium-accent";

  return (
    <nav className="mb-8 flex flex-wrap gap-3">
      <Link href="/studio" className={isHub ? activeCls : neutral}>
        <Home className="h-3.5 w-3.5" />
        Studio-oversikt
      </Link>

      <Link href="/studio/text" className={isText ? activeCls : neutral}>
        <FileText className="h-3.5 w-3.5" />
        Tekst
      </Link>

      <Link href="/studio/visuals" className={isVisuals ? activeCls : neutral}>
        <ImageIcon className="h-3.5 w-3.5" />
        Visuals
      </Link>

      <Link
        href="/studio/koble-nettbutikk"
        className={isConnect ? activeCls : neutral}
      >
        <Link2 className="h-3.5 w-3.5" />
        Koble til nettbutikk
      </Link>
    </nav>
  );
}
