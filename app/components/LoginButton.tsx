"use client";

import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  const router = useRouter();

  function handleLogin() {
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogin}
      className="inline-flex items-center gap-1.5 rounded-full border border-phorium-off/40 
                 bg-phorium-dark px-3 py-1.5 text-[11px] text-phorium-light/80
                 hover:border-phorium-accent/70 hover:text-phorium-accent transition"
    >
      <LogIn className="h-3.5 w-3.5" />
      <span>Logg inn</span>
    </button>
  );
}
