// components/StudioHeader.tsx
import { PlanBadge, type PlanName } from "app/components/PlanBadge";
import { PLAN_CREDITS } from "@/lib/billing";

type StudioHeaderProps = {
  plan: string | null;        // profiles.plan
  credits: number;            // credits.balance
};

export function StudioHeader({ plan, credits }: StudioHeaderProps) {
  const normalizedPlan = (plan?.toLowerCase() || "source") as PlanName;
  const maxCredits = PLAN_CREDITS[normalizedPlan] ?? 300;

  const ratio = Math.max(0, Math.min(1, credits / maxCredits));
  const percent = Math.round(ratio * 100);

  return (
    <header className="flex items-start justify-between gap-4 rounded-3xl border border-phorium-off/35 bg-phorium-dark/70 px-5 py-4 shadow-[0_22px_70px_rgba(0,0,0,0.6)]">
      {/* Venstre: tittel + intro */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-phorium-light/60">
          Phorium Studio
        </p>
        <h1 className="mt-1 text-lg font-semibold text-phorium-light">
          Velg hva du vil jobbe med i butikken din.
        </h1>
        <p className="mt-1 text-[12px] text-phorium-light/70 max-w-md">
          Snarveier til tekst, visuals, brandprofil og produkter – med full
          kontroll på plan og kreditter.
        </p>
      </div>

      {/* Høyre: plan + kreditter */}
      <div className="flex flex-col items-end gap-2 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-4 py-3 min-w-[220px]">
        <div className="flex items-center gap-2">
          <PlanBadge plan={normalizedPlan} />
        </div>

        <div className="mt-1 w-full">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-phorium-light/60">
            <span>Kreditter</span>
            <span className="font-semibold text-phorium-light/80">
              {credits}/{maxCredits}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-phorium-off/20">
            <div
              className="h-full rounded-full bg-phorium-accent"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="mt-1 text-right text-[11px] text-phorium-light/65">
            Du har <span className="font-semibold">{credits}</span> igjen av{" "}
            <span className="font-semibold">{maxCredits}</span> denne perioden.
          </p>
        </div>
      </div>
    </header>
  );
}
