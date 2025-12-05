import * as React from "react";

type SectionHeaderProps = {
  label?: string;          // f.eks "Studio · Tekst"
  title: string;           // hovedoverskrift
  description?: string;    // liten intro-tekst
  rightSlot?: React.ReactNode; // f.eks brandprofil-pill
  className?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  rightSlot,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={
        "mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between " +
        (className ?? "")
      }
    >
      <div className="space-y-1.5">
        {label && (
          <p className="text-[11px] uppercase tracking-[0.16em] text-phorium-light/55">
            {label}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-phorium-light">
          {title}
        </h1>
        {description && (
          <p className="max-w-xl text-[12px] text-phorium-light/80">
            {description}
          </p>
        )}
      </div>

      {rightSlot && (
        <div className="sm:self-end">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
