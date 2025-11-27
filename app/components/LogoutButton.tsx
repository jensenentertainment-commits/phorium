"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // Send brukeren ut av Studio
      router.push("/login");
    } catch (error) {
      console.error("Feil ved utlogging:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/80 hover:border-phorium-accent/70 hover:text-phorium-accent transition"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{loading ? "Logger ut…" : "Logg ut"}</span>
    </button>
  );
}
