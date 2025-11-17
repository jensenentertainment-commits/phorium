// app/AppShell.tsx
"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "./components/Navbar";

function Footer() {
  return (
    <footer className="mt-10 border-t border-[#3B4032] text-[10px] text-[#ECE8DA]/60">
      <div className="w-full max-w-6xl mx-auto px-4 py-4 flex justify-between gap-4">
        <span>© {new Date().getFullYear()} Phorium</span>
        <span className="hidden sm:inline">
          Bygget for norske nettbutikker.
        </span>
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
