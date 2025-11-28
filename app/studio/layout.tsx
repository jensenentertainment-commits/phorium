"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import TopStudioNav from "../components/TopStudioNav";
import StudioCard from "./StudioCard";
import StudioAuthGate from "./StudioAuthGate";
import CreditErrorBox from "../components/CreditErrorBox";
import { CreditErrorContext } from "./CreditErrorContext";

export default function StudioLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== "/studio";

  const [creditError, setCreditError] = useState<string | null>(null);

  useEffect(() => {
    if (creditError) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [creditError]);

  return (
    <StudioAuthGate>
      <CreditErrorContext.Provider value={{ creditError, setCreditError }}>
        <div className="relative min-h-screen overflow-hidden bg-phorium-dark pt-20 pb-32">
          {/* Bakgrunnsgradient */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.35),transparent_70%)]" />

          <div className="mx-auto max-w-6xl px-4">
            {/* Navigasjonskortet — vises kun på undersider */}
            {showNav && (
              <div className="mb-4">
                <TopStudioNav />
              </div>
            )}

            {/* Global kreditt-feil rett under nav */}
            {creditError && (
              <div className="mb-4">
                <CreditErrorBox
                  message={creditError}
                  onClose={() => setCreditError(null)}
                />
              </div>
            )}

            {/* Innholdet i det store kortet på ALLE sider */}
            <StudioCard>{children}</StudioCard>
          </div>
        </div>
      </CreditErrorContext.Provider>
    </StudioAuthGate>
  );
}
