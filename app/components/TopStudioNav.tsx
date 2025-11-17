"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Image as ImageIcon, Link2 } from "lucide-react";

export default function TopStudioNav() {
  const pathname = usePathname();

  const isHub = pathname === "/studio";
  const isText = pathname.startsWith("/studio/text");
  const isVisuals = pathname.startsWith("/studio/visuals");
  const isConnect = pathname.startsWith("/studio/koble-nettbutikk");

  return (
    <div className="mb-8 rounded-3xl border border-phorium-off/25 bg-phorium-surface px-5 py-4 shadow-[0_18px_70px_rgba(0,0,0,0.55)] flex justify-center">
      <nav className="flex flex-wrap gap-3 items-center">
        <Link
          href="/studio"
          className={`btn-tab ${isHub ? "btn-tab-active" : ""}`}
        >
          <Home />
          Studio-oversikt
        </Link>

        <Link
          href="/studio/text"
          className={`btn-tab ${isText ? "btn-tab-active" : ""}`}
        >
          <FileText />
          Tekst
        </Link>

        <Link
          href="/studio/visuals"
          className={`btn-tab ${isVisuals ? "btn-tab-active" : ""}`}
        >
          <ImageIcon />
          Visuals
        </Link>

        <Link
          href="/studio/koble-nettbutikk"
          className={`btn-tab ${isConnect ? "btn-tab-active" : ""}`}
        >
          <Link2 />
          Koble til nettbutikk
        </Link>
      </nav>
    </div>
  );
}
