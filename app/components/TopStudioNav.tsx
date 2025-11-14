"use client";
import Link from "next/link";
import { Home, FileText, Image as ImageIcon, Link2 } from "lucide-react";

export default function TopStudioNav({ active }: { active: "text" | "visuals" | "hub" }) {
  const base = "inline-flex items-center gap-2 px-3 py-1.5 rounded-full";
  const neutral = `${base} bg-[#23271D] border border-[#3B4032] text-[#ECE8DA]/80 hover:border-[#C8B77A] hover:text-[#E3D8AC] transition`;
  const activeCls = `${base} bg-[#C8B77A] text-[#1C1F18] font-semibold hover:bg-[#E3D8AC] transition shadow-sm`;

  return (
    <div className="flex flex-wrap gap-3 mb-8 text-[11px]">
      <Link href="/dashboard" className={active === "hub" ? activeCls : neutral}>
        <Home className="w-3.5 h-3.5" />
        Studio-oversikt
      </Link>
      <Link href="/dashboard/text" className={active === "text" ? activeCls : neutral}>
        <FileText className="w-3.5 h-3.5" />
        Tekst
      </Link>
      <Link href="/dashboard/visuals" className={active === "visuals" ? activeCls : neutral}>
        <ImageIcon className="w-3.5 h-3.5" />
        Visuals
      </Link>
      <Link href="/dashboard/store-connect" className={neutral}>
        <Link2 className="w-3.5 h-3.5" />
        Koble til nettbutikk
      </Link>
    </div>
  );
}
