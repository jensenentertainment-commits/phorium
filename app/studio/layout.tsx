"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import TopStudioNav from "../components/TopStudioNav";
import StudioCard from "./StudioCard";

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Skal IKKE vise TopStudioNav på forsiden (/studio)
  const showNav = pathname !== "/studio";

  return (
    <div className="relative min-h-screen overflow-hidden bg-phorium-dark pt-20 pb-32">
      {/* Bakgrunnsgradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

      <div className="mx-auto max-w-6xl px-4">

        {/* Navigasjonskortet — vises kun på undersider */}
    {showNav && (
  <div className="mb-6">
    <TopStudioNav />
  </div>
)}



        {/* Innholdet i det store kortet på ALLE sider */}
        <StudioCard>
          {children}
        </StudioCard>
      </div>
    </div>
  );
}
