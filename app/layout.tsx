import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppShell from "./AppShell";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Phorium",
  description: "AI-verktøy for norske nettbutikker og skapere.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  return (
    <html lang="no">
      <body className="min-h-screen flex flex-col antialiased bg-[#EEE3D3]">
        <AuthProvider>
          <AppShell isAdmin={isAdmin}>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
