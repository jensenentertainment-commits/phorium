"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Item = {
  href: string;
  label: string;
};

const items: Item[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Brukere" },
  { href: "/admin/errors", label: "Errors" },
  { href: "/admin/credits", label: "Kreditter" },
  { href: "/admin/activity", label: "Aktivitet" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-2 text-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-lg">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          pathname?.startsWith(item.href + "/");

        return (
          <AdminNavButton key={item.href} href={item.href} active={active}>
            {item.label}
          </AdminNavButton>
        );
      })}
    </nav>
  );
}

function AdminNavButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1 transition font-medium",
        active
          ? "bg-phorium-accent text-phorium-dark shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
          : "bg-transparent text-phorium-light/75 hover:bg-phorium-light/10 hover:text-phorium-light",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
