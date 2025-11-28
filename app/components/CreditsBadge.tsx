"use client";

import { Info } from "lucide-react";

type CreditsBadgeProps = {
  balance: number; // f.eks. 86
  quota?: number;  // f.eks. 300 (default)
};

export default function CreditsBadge({
  balance,
  quota = 300,
}: CreditsBadgeProps) {
  const safeQuota = quota > 0 ? quota : 1;
  const percentage = Math.min(100, Math.max(0, (balance / safeQuota) * 100));

  // Dynamiske farger basert på nivå
  let barColor = "bg-phorium-accent";
  let dotColor = "bg-phorium-accent";
  let labelColor = "text-phorium-accent";

  if (percentage <= 20) {
    // Lavt
    barColor = "bg-red-500";
    dotColor = "bg-red-500";
    labelColor = "text-red-400";
  } else if (percentage <= 50) {
    // Medium
    barColor = "bg-amber-400";
    dotColor = "bg-amber-400";
    labelColor = "text-amber-300";
  }

  return (
    <div className="w-full max-w-xs rounded-2xl border border-phorium-off/40 bg-phorium-dark/70 px-4 py-3 text-[11px]">
      {/* Topp-linje med label, dot og tooltip */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />

          <span className="uppercase tracking-[0.18em] text-[9px] text-phorium-light/70">
            Kreditter igjen
          </span>

          {/* Tooltip */}
          <div className="relative group">
            <button
              type="button"
              className="flex h-4 w-4 items-center justify-center rounded-full border border-phorium-off/40 bg-phorium-dark/80 text-[10px] text-phorium-light/70 hover:text-phorium-accent"
              aria-label="Hva koster en generering?"
            >
              <Info className="h-3 w-3" />
            </button>

            {/* Tooltip-boble */}
            <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden max-w-[220px] rounded-xl border border-phorium-off/40 bg-phorium-dark/95 px-3 py-2 text-[10px] text-phorium-light/80 shadow-[0_18px_40px_rgba(0,0,0,0.75)] group-hover:block">
              <div className="mb-1 font-semibold text-phorium-accent/90">
                Ca. bruk av kreditter:
              </div>
              <ul className="list-disc space-y-[2px] pl-4">
                <li>Tekstpakke ≈ 2 kreditter</li>
                <li>Banner ≈ 4 kreditter</li>
                <li>Produktscene ≈ 5 kreditter</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`text-[12px] font-semibold ${labelColor}`}>
          {balance}
          <span className="text-[11px] text-phorium-light/55"> / {quota}</span>
        </div>
      </div>

      {/* Progressbar – med smooth animasjon */}
      <div className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-phorium-off/20">
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-600 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Liten forklaring under */}
      <p className="mt-2 text-[10px] text-phorium-light/65">
        Du har <span className="font-semibold">{balance}</span> igjen av{" "}
        <span className="font-semibold">{quota}</span>.
      </p>
    </div>
  );
}
