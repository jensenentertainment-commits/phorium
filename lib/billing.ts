// lib/billing.ts
import type { PlanName } from "app/components/PlanBadge";

export const PLAN_CREDITS: Record<PlanName, number> = {
  source: 200,
  flow: 750,
  pulse: 2000,
  nexus: 5000,
};
