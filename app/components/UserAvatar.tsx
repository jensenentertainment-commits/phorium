// components/UserAvatar.tsx
import { PLAN_COLORS, type PlanName } from "@/components/PlanBadge";

type UserAvatarProps = {
  email: string | null;
  plan: string | null; // raw fra DB
  size?: "sm" | "md";
};

export function UserAvatar({ email, plan, size = "sm" }: UserAvatarProps) {
  const normalizedPlan = (plan?.toLowerCase() || "source") as PlanName;
  const palette = PLAN_COLORS[normalizedPlan];

  const initial =
    email?.trim().charAt(0).toUpperCase() || normalizedPlan.charAt(0).toUpperCase();

  const dimension = size === "md" ? "h-9 w-9 text-[12px]" : "h-8 w-8 text-[11px]";

  return (
    <div
      className={`flex items-center justify-center rounded-full border font-semibold ${dimension} shadow-[0_10px_30px_rgba(0,0,0,0.55)]`}
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.ring,
        color: palette.text,
      }}
    >
      {initial}
    </div>
  );
}
