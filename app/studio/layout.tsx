// app/studio/layout.tsx
import type { ReactNode } from "react";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#073131 text-[#ECE8DA]">
      <main className="w-full max-w-6xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  );
}
