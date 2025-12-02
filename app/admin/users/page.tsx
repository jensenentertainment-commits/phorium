import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PlanBadge, type PlanName } from "app/components/PlanBadge";

type ActivityAggRow = {
  user_id: string;
  events: number;
  last_activity: string | null;
};

type ProfileRow = {
  user_id: string;
  plan: string | null;
};

export default async function AdminUsersPage() {
  // --- Admin-sjekk ---
  const headerList = await headers();
  const cookie = headerList.get("cookie") ?? "";
  const isAdmin = cookie.includes("phorium_admin=1");

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);

  // Hent aktivitet, auth-brukere og profiler i parallell
  const [activityAggRes, authUsersRes, profilesRes] = await Promise.all([
    supabaseAdmin
      .from("admin_user_activity")
      .select("user_id, events, last_activity")
      .then(
        (res) =>
          res as {
            data: ActivityAggRow[] | null;
            error: any;
          },
      ),

    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 500 }),

    supabaseAdmin
      .from("profiles")
      .select("user_id, plan")
      .then(
        (res) =>
          res as {
            data: ProfileRow[] | null;
            error: any;
          },
      ),
  ]);

  const activityRows = activityAggRes.data ?? [];
  const authUsers = authUsersRes.data?.users ?? [];
  const profileRows = profilesRes.data ?? [];

  // Map aktivitet per bruker
  const activityMap = new Map<string, ActivityAggRow>();
  for (const row of activityRows) {
    activityMap.set(row.user_id, row);
  }

  // Map plan per bruker
  const profileMap = new Map<string, string | null>();
  for (const row of profileRows) {
    profileMap.set(row.user_id, row.plan);
  }

  const users = authUsers.map((u) => {
    const act = activityMap.get(u.id);

    const lastActivityDate = act?.last_activity
      ? new Date(act.last_activity)
      : null;

    const isActiveLast7 =
      lastActivityDate !== null && lastActivityDate > since7d;

    const rawPlan = profileMap.get(u.id) ?? null;
    // Normaliser til lowercase for PlanBadge: 'source' | 'flow' | 'pulse' | 'nexus'
    const plan = rawPlan ? rawPlan.toLowerCase() : null;

    return {
      id: u.id,
      email: (u.email ?? "").toLowerCase(),
      createdAt: u.created_at ? new Date(u.created_at) : null,
      lastSignInAt: u.last_sign_in_at ? new Date(u.last_sign_in_at) : null,
      totalEvents: act?.events ?? 0,
      lastActivity: lastActivityDate,
      isActiveLast7,
      plan,
    };
  });

  // Sorter: mest nylig aktive brukere først
  users.sort((a, b) => {
    const aTime = a.lastActivity?.getTime() ?? 0;
    const bTime = b.lastActivity?.getTime() ?? 0;
    return bTime - aTime;
  });

  const totalUsers = users.length;
  const activeLast7 = users.filter((u) => u.isActiveLast7).length;

  return (
    <main className="min-h-screen bg-[#071F1B] px-4 py-6 text-phorium-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-phorium-accent">
              Admin · Brukere
            </h1>
            <p className="text-sm text-phorium-light/70">
              Oversikt over alle Phorium-brukere og aktivitetsnivå.
            </p>
          </div>
        </header>

        {/* Stats-rad */}
        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-phorium-off/40 bg-phorium-dark/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-phorium-light/60">
              Totalt antall brukere
            </p>
            <p className="mt-1 text-2xl font-semibold text-phorium-accent">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-phorium-off/40 bg-phorium-dark/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-phorium-light/60">
              Aktive siste 7 dager
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-300">
              {activeLast7}
            </p>
          </div>

          <div className="rounded-2xl border border-phorium-off/40 bg-phorium-dark/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-phorium-light/60">
              Brukere med aktivitet
            </p>
            <p className="mt-1 text-2xl font-semibold text-sky-300">
              {activityRows.length}
            </p>
          </div>
        </section>

        {/* Tabell */}
        <section className="rounded-2xl border border-phorium-off/40 bg-phorium-dark/70 p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-phorium-accent">
              Brukeroversikt
            </h2>
            <p className="text-[11px] text-phorium-light/60">
              E-post, plan, innlogging og aktivitet.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-phorium-off/30 text-phorium-light/60">
                  <th className="px-2 py-2 text-left">E-post</th>
                  <th className="px-2 py-2 text-left">Plan</th>
                  <th className="px-2 py-2 text-left">Opprettet</th>
                  <th className="px-2 py-2 text-left">Sist innlogget</th>
                  <th className="px-2 py-2 text-right">Events</th>
                  <th className="px-2 py-2 text-left">Siste aktivitet</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-2 py-4 text-center text-phorium-light/60"
                    >
                      Ingen brukere funnet.
                    </td>
                  </tr>
                )}

                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-phorium-off/15 last:border-b-0"
                  >
                    {/* E-post + ID */}
                    <td className="px-2 py-2 align-top">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="flex flex-col group hover:text-phorium-accent transition"
                      >
                        <span className="font-medium text-phorium-light group-hover:text-phorium-accent">
                          {u.email || "—"}
                        </span>
                        <span className="text-[10px] text-phorium-light/55 group-hover:text-phorium-accent/80">
                          {u.id}
                        </span>
                      </Link>
                    </td>

                    {/* Plan */}
                    <td className="px-2 py-2 align-top">
                      <PlanBadge plan={(u.plan as PlanName) || null} />
                    </td>

                    {/* Opprettet */}
                    <td className="px-2 py-2">
                      {u.createdAt
                        ? u.createdAt.toLocaleDateString("nb-NO")
                        : "—"}
                    </td>

                    {/* Sist innlogget */}
                    <td className="px-2 py-2">
                      {u.lastSignInAt
                        ? u.lastSignInAt.toLocaleDateString("nb-NO")
                        : "—"}
                    </td>

                    {/* Events */}
                    <td className="px-2 py-2 text-right">
                      {u.totalEvents}
                    </td>

                    {/* Siste aktivitet */}
                    <td className="px-2 py-2">
                      {u.lastActivity
                        ? u.lastActivity.toLocaleDateString("nb-NO")
                        : "—"}

                      {u.isActiveLast7 && (
                        <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                          Aktiv (7d)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
