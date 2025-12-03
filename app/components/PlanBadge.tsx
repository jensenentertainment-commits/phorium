// components/PlanBadge.tsx
import { cn } from "@/lib/utils";

export type PlanName = "source" | "flow" | "pulse" | "nexus"  | "admin";


export const PLAN_COLORS: Record<
  PlanName,
  { bg: string; ring: string; text: string }
> = {
  source: {
    bg: "rgba(9, 35, 32, 0.9)",
    ring: "rgba(122, 159, 146, 0.7)",
    text: "rgba(220, 232, 226, 0.9)",
  },
  flow: {
    bg: "rgba(200, 183, 122, 0.16)",
    ring: "rgba(200, 183, 122, 0.85)",
    text: "rgba(200, 183, 122, 0.98)",
  },
  pulse: {
    bg: "rgba(56, 189, 248, 0.12)",
    ring: "rgba(56, 189, 248, 0.7)",
    text: "rgba(186, 230, 253, 1)",
  },
  nexus: {
    bg: "rgba(140, 89, 255, 0.16)",
    ring: "rgba(140, 89, 255, 0.85)",
    text: "rgba(198, 184, 255, 1)",
  },

  // Admin – gull/Phorium-accent
  admin: {
    bg: "rgba(200, 183, 122, 0.14)",
    ring: "rgba(200, 183, 122, 0.8)",
    text: "rgba(200, 183, 122, 0.98)",
  },
};


// ... resten av PlanBadge-komponenten din

const PLAN_META: Record<
  PlanName,
  {
    label: string;
    description: string;
  }
> = {
  source: {
    label: "Source",
    description: "Mindre nettbutikker / testing",
  },
  flow: {
    label: "Flow",
    description: "Aktive nettbutikker",
  },
  pulse: {
    label: "Pulse",
    description: "Byrå / multi-store",
  },
  nexus: {
    label: "Nexus",
    description: "Enterprise / tilpasning",
  },
  admin: {
    label: "Admin",
    description: "Intern administratortilgang",
  },
};



type PlanBadgeProps = {
  plan: PlanName | null | undefined;
  size?: "sm" | "md";
  showDescription?: boolean;
  className?: string;
};

export function PlanBadge({
  plan,
  size = "sm",
  showDescription = false,
  className,
}: PlanBadgeProps) {
  if (!plan || !(plan in PLAN_META)) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-phorium-off/40 bg-phorium-dark/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-phorium-light/70",
          className
        )}
      >
        Uten plan
      </span>
    );
  }

  const meta = PLAN_META[plan];
  const palette = PLAN_COLORS[plan];

  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]";
  const sizeClass = size === "md" ? "px-3 py-1.5 text-[11px]" : "";

  return (
    <span
      className={cn(base, sizeClass, className)}
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.ring,
        color: palette.text,
      }}
    >
      <span>{meta.label}</span>
      {showDescription && (
        <span className="hidden text-[9px] normal-case text-phorium-light/60 sm:inline">
          · {meta.description}
        </span>
      )}
    </span>
  );
}
