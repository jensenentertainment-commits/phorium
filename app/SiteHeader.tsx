"use client";

import Link from "next/link";

export default function SiteHeader({ isAdmin }: { isAdmin: boolean }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-phorium-off/30 bg-phorium-dark">
      {/* logo / navn */}
      <Link href="/" className="text-sm font-semibold text-phorium-light">
        Phorium
      </Link>

      <nav className="flex items-center gap-3 text-[12px]">
        {/* vanlige linker */}
        <Link
          href="/app"
          className="text-phorium-light/75 hover:text-phorium-accent transition"
        >
          App
        </Link>

        <Link
          href="/pricing"
          className="text-phorium-light/75 hover:text-phorium-accent transition"
        >
          Priser
        </Link>

        {/* 👇 Kun når du er admin (phorium_admin=1) */}
        {isAdmin && (
          <Link
            href="/admin"
            className="rounded-full border border-phorium-accent px-3 py-1 text-[11px] text-phorium-accent hover:bg-phorium-accent/10 transition"
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
