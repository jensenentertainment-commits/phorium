// app/studio/StudioCard.tsx
import type { ReactNode } from "react";

export default function StudioCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-phorium-off/25 bg-phorium-surface px-6 py-9 text-phorium-light shadow-[0_24px_90px_rgba(0,0,0,0.65)] sm:px-10">
      {children}
    </div>
  );
}
