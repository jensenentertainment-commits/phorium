// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "Phorium",
  description: "AI-verktøy for norske nettbutikker og skapere.",
};

// Setter Geist Sans + Geist Mono som CSS-variabler
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="no"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
