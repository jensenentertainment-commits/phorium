// lib/billing.ts
import type { PlanName } from "app/components/PlanBadge";

// phorium/lib/billing.ts

export type PlanName = "source" | "flow" | "pulse" | "nexus";

export const PLAN_QUOTAS: Record<PlanName, number> = {
  source: 300,
  flow: 1200,
  pulse: 3000,
  nexus: 10000,
};

export function getQuotaForPlan(plan: string | null | undefined): number {
  if (!plan) return PLAN_QUOTAS.source;

  const normalized = plan.toLowerCase().trim();
  if (normalized === "flow") return PLAN_QUOTAS.flow;
  if (normalized === "pulse") return PLAN_QUOTAS.pulse;
  if (normalized === "nexus") return PLAN_QUOTAS.nexus;

  return PLAN_QUOTAS.source;
}
