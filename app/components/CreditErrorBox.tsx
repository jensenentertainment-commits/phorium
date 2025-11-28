"use client";

import { X, AlertTriangle } from "lucide-react";

export default function CreditErrorBox({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  if (!message) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-[13px] text-amber-100">
      <div className="mt-0.5">
        <AlertTriangle className="h-4 w-4 text-amber-300" />
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/90">
          Tom for kreditter
        </p>
        <p className="mt-1 text-[13px] leading-snug text-amber-100/90">
          {message}
        </p>
        <p className="mt-1 text-[11px] text-amber-200/80">
          Sjekk <span className="font-semibold">kredittindikatoren</span> øverst i Studio,
          eller gi beskjed til Lars for å få fylt på i betaen.
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded-full p-1 text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-50 transition"
          aria-label="Lukk varsel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
