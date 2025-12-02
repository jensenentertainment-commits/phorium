"use client";

import { useState } from "react";
import Link from "next/link";
import type { ErrorRow } from "./page";

type Props = {
  errors: ErrorRow[];
};

export default function ErrorsClient({ errors }: Props) {
  const [selected, setSelected] = useState<ErrorRow | null>(null);

  if (errors.length === 0) {
    return (
      <p className="mt-4 text-[12px] text-phorium-light/60">
        Ingen errors med disse filtrene. Enten er alt perfekt – eller så
        logger vi ikke riktig ennå 😅
      </p>
    );
  }

  return (
    <>
      <div className="mt-4 space-y-2">
        {errors.map((err) => {
          const when = new Date(err.created_at).toLocaleString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

          const severityColor =
            err.severity === "error"
              ? "bg-red-500/20 text-red-200"
              : err.severity === "warning"
              ? "bg-amber-500/20 text-amber-200"
              : "bg-phorium-accent/20 text-phorium-accent";

          return (
            <div
              key={err.id}
              className="rounded-xl border border-phorium-off/30 bg-phorium-dark/90 p-3 text-[12px]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityColor}`}
                  >
                    {err.severity || "error"}
                  </span>

                  {err.context && (
                    <span className="rounded-full bg-phorium-off/20 px-2 py-0.5 text-[10px] text-phorium-light/80">
                      {err.context}
                    </span>
                  )}

                  {err.path && (
                    <span className="rounded-full bg-phorium-off/10 px-2 py-0.5 text-[10px] text-phorium-light/70">
                      {err.path}
                    </span>
                  )}

                  {err.resolved && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                      Løst
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-phorium-light/55">
                  {when}
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-[12px] text-phorium-light/95">
                {err.message}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-phorium-light/60">
                <div className="flex items-center gap-2">
                  {err.user_id ? (
                    <Link
                      href={`/admin/users/${err.user_id}`}
                      className="font-mono text-[10px] text-phorium-accent underline"
                    >
                      {err.user_id}
                    </Link>
                  ) : (
                    <span className="text-phorium-light/50">Ingen user_id</span>
                  )}

                  <span className="text-[10px] text-phorium-light/50">
                    ID: {err.id}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(err)}
                  className="rounded-full border border-phorium-off/40 px-3 py-1 text-[11px] text-phorium-light/85 transition hover:border-phorium-accent/80 hover:text-phorium-accent"
                >
                  Detaljer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-phorium-off/40 bg-phorium-dark shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-phorium-off/30 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.14em] text-phorium-light/50">
                  Error-detaljer
                </span>
                <span className="text-[13px] text-phorium-light/90">
                  {selected.message.slice(0, 80)}
                  {selected.message.length > 80 ? "…" : ""}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-phorium-off/40 px-3 py-1 text-[11px] text-phorium-light/80 hover:border-phorium-accent/80 hover:text-phorium-accent"
              >
                Lukk
              </button>
            </div>

            {/* Body */}
            <div className="grid max-h-[80vh] grid-cols-1 gap-4 overflow-y-auto px-4 py-4 md:grid-cols-2">
              {/* Meta-info */}
              <div className="space-y-2 text-[12px]">
                <SectionLabel>Info</SectionLabel>
                <InfoRow label="ID" value={selected.id} />
                <InfoRow
                  label="Tid"
                  value={new Date(
                    selected.created_at,
                  ).toLocaleString("nb-NO")}
                />
                <InfoRow
                  label="Severity"
                  value={selected.severity || "error"}
                />
                <InfoRow label="Context" value={selected.context ?? "—"} />
                <InfoRow label="Path" value={selected.path ?? "—"} />
                <InfoRow
                  label="User ID"
                  value={selected.user_id ?? "Ingen user_id"}
                />
                <InfoRow
                  label="Status"
                  value={selected.resolved ? "Løst" : "Ikke løst"}
                />
              </div>

              {/* Stack + meta */}
              <div className="space-y-4 text-[12px]">
                <div>
                  <SectionLabel>Stack trace</SectionLabel>
                  {selected.stack ? (
                    <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-black/40 p-2 text-[11px] leading-snug text-phorium-light/80">
                      {selected.stack}
                    </pre>
                  ) : (
                    <p className="mt-1 text-[11px] text-phorium-light/60">
                      Ingen stack lagret.
                    </p>
                  )}
                </div>

                <div>
                  <SectionLabel>Meta</SectionLabel>
                  {selected.meta ? (
                    <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-black/40 p-2 text-[11px] leading-snug text-phorium-light/80">
                      {JSON.stringify(selected.meta, null, 2)}
                    </pre>
                  ) : (
                    <p className="mt-1 text-[11px] text-phorium-light/60">
                      Ingen meta-data lagret.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-phorium-light/55">
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-phorium-light/55">{label}</span>
      <span className="font-mono text-[11px] text-phorium-light/90 break-all">
        {value}
      </span>
    </div>
  );
}
