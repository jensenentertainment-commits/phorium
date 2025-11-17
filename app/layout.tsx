import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppShell from "./AppShell";

export const metadata: Metadata = {
  title: "Phorium",
  description: "AI-verktøy for norske nettbutikker og skapere.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <body className="min-h-screen flex flex-col antialiased bg-[#EEE3D3]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
