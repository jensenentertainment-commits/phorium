// app/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./components/Navbar";

function Footer() {
  return (
    <footer className="mt-0 border-t border-[#D3C4AA] bg-[#F5E7D4] text-[#3B4032]/80 text-[11px] shadow-[0_-2px_10px_rgba(0,0,0,0.16)]">
      <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Venstre side */}
        <span className="whitespace-nowrap">
          © {new Date().getFullYear()} Phorium. Utviklet av Jensen Digital
        </span>

        {/* Høyre side – lenker med • separator */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <a href="/personvern" className="hover:text-[#17211C] transition">Personvern</a>

          <span className="opacity-40">•</span>

          <a href="/retningslinjer" className="hover:text-[#17211C] transition">Retningslinjer</a>

          <span className="opacity-40">•</span>

          <a href="/cookies" className="hover:text-[#17211C] transition">Cookies</a>
        </div>

      </div>
    </footer>
  );
}




export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMaintenance = pathname === "/maintenance";

  // På /maintenance → ingen navbar, ingen footer
  if (isMaintenance) {
    return <>{children}</>;
  }

  // På alle andre sider → vanlig layout
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-10 pb-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
