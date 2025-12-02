import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ActivityRow = {
  id: string;
  created_at: string;
  event_type: string;
  meta: any;
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const since30d = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 1) Aktivitet + errors + series for graf
  const [activity24hRes, errors24hRes, activity30dRes] = await Promise.all([
    supabaseAdmin
      .from("activity_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabaseAdmin
      .from("error_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabaseAdmin
      .from("activity_log")
      .select("id, created_at, event_type, meta")
      .gte("created_at", since30d)
      .order("created_at", { ascending: true }),
  ]);

  const events24h = activity24hRes?.count ?? 0;
  const errors24h = errors24hRes?.count ?? 0;

  const activity30d = (activity30dRes.data ?? []) as ActivityRow[];

  // 2) Siste 10 events
  const last10Res = await supabaseAdmin
    .from("activity_log")
    .select("id, created_at, event_type, meta")
    .order("created_at", { ascending: false })
    .limit(10);

  const last10 = (last10Res.data ?? []) as ActivityRow[];

  // 3) Brukere (total + nye siste 7 dager)
  const listUsersRes = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  });

  const users = listUsersRes?.data?.users ?? [];
  const totalUsers = users.length;

  const newUsers7d = users.filter((u) => {
    if (!u.created_at) return false;
    return new Date(u.created_at) >= new Date(since7d);
  }).length;

  // 4) Bygg daglig serie for siste 14 dager (til graf)
  const daysBack = 14;
  const dayLabels: string[] = [];
  const perDayMap = new Map<string, number>();

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    dayLabels.push(key);
    perDayMap.set(key, 0);
  }

  for (const row of activity30d) {
    const key = row.created_at.slice(0, 10);
    if (perDayMap.has(key)) {
      perDayMap.set(key, (perDayMap.get(key) ?? 0) + 1);
    }
  }

  const series = dayLabels.map((date) => ({
    date,
    count: perDayMap.get(date) ?? 0,
  }));

  const maxCount = series.reduce(
    (max, p) => (p.count > max ? p.count : max),
    0,
  );

  return (
    <div className="pt-0 pb-12">
      {/* Header */}
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-phorium-light/60">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-phorium-light">
          Oversikt
        </h1>
        <p className="mt-1 text-[12px] text-phorium-light/70">
          Rask status på brukere, aktivitet og feil siste døgn.
        </p>
      </header>

      {/* KPI-kort */}
      <section className="grid gap-4 md:grid-cols-4">
        <DashboardCard label="Totalt brukere" value={totalUsers} />
        <DashboardCard label="Nye brukere (7 dager)" value={newUsers7d} />
        <DashboardCard label="Events siste 24 timer" value={events24h} />
        <DashboardCard label="Errors siste 24 timer" value={errors24h} danger />
      </section>

      {/* Graf + siste events */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Graf */}
        <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <h2 className="text-sm font-semibold text-phorium-light">
            Aktivitet siste {daysBack} dager
          </h2>
          <p className="mt-1 text-[12px] text-phorium-light/65">
            Antall loggede events per dag.
          </p>

          {series.length === 0 ? (
            <p className="mt-4 text-[12px] text-phorium-light/60">
              Ingen data ennå.
            </p>
          ) : (
            <div className="mt-4 flex h-40 items-end gap-1">
              {series.map((point) => {
                const height =
                  maxCount === 0
                    ? 4
                    : Math.max(4, (point.count / maxCount) * 64);

                const label = new Date(point.date).toLocaleDateString(
                  "nb-NO",
                  {
                    day: "2-digit",
                    month: "2-digit",
                  },
                );

                return (
                  <div
                    key={point.date}
                    className="flex flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div
                      className="w-full rounded-t-full bg-phorium-accent/70"
                      style={{ height }}
                      aria-label={`${point.count} events`}
                    />
                    <span className="text-[9px] text-phorium-light/55">
                      {label}
                    </span>
                    <span className="text-[9px] text-phorium-light/70">
                      {point.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Siste events */}
        <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <h2 className="text-sm font-semibold text-phorium-light">
            Siste aktivitet
          </h2>
          <p className="mt-1 text-[12px] text-phorium-light/65">
            De 10 siste eventene på tvers av brukere.
          </p>

          {last10.length === 0 ? (
            <p className="mt-4 text-[12px] text-phorium-light/60">
              Ingen registrert aktivitet ennå.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {last10.map((row) => {
                const when = new Date(
                  row.created_at,
                ).toLocaleString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={row.id}
                    className="rounded-xl border border-phorium-off/25 bg-phorium-dark/80 p-3 text-[12px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-phorium-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-phorium-accent">
                        {row.event_type}
                      </span>
                      <span className="text-[11px] text-phorium-light/55">
                        {when}
                      </span>
                    </div>
                    {row.meta && Object.keys(row.meta).length > 0 && (
                      <pre className="mt-2 max-h-20 overflow-auto whitespace-pre-wrap text-[10px] leading-tight text-phorium-light/70">
                        {JSON.stringify(row.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
      <p className="text-[11px] text-phorium-light/60">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          danger ? "text-red-300" : "text-phorium-light"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
