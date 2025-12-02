import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import UserAdminClient from "../AdminUsersClient";
import { PlanBadge, type PlanName } from "app/components/PlanBadge";

type ActivityRow = {
  id: string;
  user_id: string | null;
  email_snapshot: string | null;
  event_type: string;
  meta: any;
  created_at: string;
};

type AdminActionRow = {
  id: string;
  created_at: string;
  action: string;
  delta_credits: number | null;
  old_plan: string | null;
  new_plan: string | null;
  admin_label: string | null;
};

type UserErrorRow = {
  id: string;
  created_at: string;
  user_id?: string | null;
  context?: string | null;
  severity?: string | null;
  resolved?: boolean | null;
  location?: string | null;
  message?: string | null;
  meta?: any;
};

export default async function AdminUserDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  // ⬇️ Nytt Next-mønster: params som Promise
  const { params } = props;
  const { id } = await params;
  const userId = id;

  // 🔐 Admin-sjekk
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  // Enkel UUID-sjekk – beskytter mot helt ødelagte URL-er
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!UUID_REGEX.test(userId)) {
    redirect("/admin/users");
  }

  // 🧵 1: Hent auth-user (myk håndtering ved feil)
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.getUserById(userId);
  const user = authData?.user ?? null;
  if (authError) {
    console.error("Feil ved getUserById:", authError);
  }

  // 🧵 2–5: Hent data fra Supabase-tabeller i parallell
  const [activityRes, errorsRes, adminActionsRes, creditsRes, profileRes] =
    await Promise.all([
      supabaseAdmin
        .from("activity_log")
        .select("id, user_id, email_snapshot, event_type, meta, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),

      supabaseAdmin
        .from("error_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),

      supabaseAdmin
        .from("admin_actions")
        .select(
          "id, created_at, action, delta_credits, old_plan, new_plan, admin_label"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),

      supabaseAdmin
        .from("credits")
        .select("balance, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),

      supabaseAdmin
        .from("profiles")
        .select("plan")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const activity = (activityRes.data ?? []) as ActivityRow[];
  if (activityRes.error) {
    console.error("Feil ved henting av activity_log:", activityRes.error);
  }

  const userErrors = (errorsRes.data ?? []) as UserErrorRow[];
  if (errorsRes.error) {
    console.error("Feil ved henting av error_log:", errorsRes.error);
  }

  const adminActions = (adminActionsRes.data ?? []) as AdminActionRow[];
  if (adminActionsRes.error && adminActionsRes.error.message) {
  console.error("Feil ved henting av admin_actions:", adminActionsRes.error);
}


  const creditsRow = creditsRes.data as
    | { balance: number; updated_at: string }
    | null;
  if (creditsRes.error) {
    console.error("Feil ved henting av credits:", creditsRes.error);
  }

  const profileRow = profileRes.data as { plan?: string | null } | null;
  if (profileRes.error && profileRes.error.message) {
  console.error("Feil ved henting av profiles:", profileRes.error);
}


  const creditBalance = creditsRow?.balance ?? 0;
  const creditUpdatedAt = creditsRow?.updated_at ?? null;
  const plan = profileRow?.plan ?? "";

  const totalEvents = activity.length;
  const totalErrors = userErrors.length;
  const totalAdminActions = adminActions.length;

  const lastEventAt = activity[0]?.created_at ?? null;
  const lastErrorAt = userErrors[0]?.created_at ?? null;

  const email =
    user?.email ??
    activity.find((row) => row.email_snapshot)?.email_snapshot ??
    "Ukjent bruker";

  return (
    <main className="min-h-screen bg-phorium-dark pt-0 pb-16 text-phorium-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        {/* Header */}
        <header className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-phorium-light/60">
            Admin · Bruker
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-phorium-light">
            {email}
          </h1>
          <p className="mt-1 text-[12px] text-phorium-light/70">
            ID:{" "}
            <span className="font-mono text-[11px] text-phorium-light/80">
              {userId}
            </span>
          </p>
          {user?.created_at && (
            <p className="mt-0.5 text-[11px] text-phorium-light/55">
              Opprettet:{" "}
              {new Date(user.created_at).toLocaleString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </header>

        {/* Info-kort */}
        <section className="grid gap-4 md:grid-cols-4">
        <UserStatCard
  label="Plan"
  value={
    plan ? (
      <PlanBadge plan={plan as PlanName} size="md" showDescription />
    ) : (
      "Ingen (beta / free)"
    )
  }
  helper="Basert på profiles.plan"
/>
          <UserStatCard
            label="Credits-saldo"
            value={creditBalance}
            helper={
              creditUpdatedAt
                ? `Sist oppdatert: ${new Date(
                    creditUpdatedAt
                  ).toLocaleString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Ingen registrert credits-rad ennå"
            }
          />
          <UserStatCard
            label="Loggede events"
            value={totalEvents}
            helper={
              lastEventAt
                ? `Sist aktiv: ${new Date(lastEventAt).toLocaleString(
                    "nb-NO",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}`
                : "Ingen aktivitet registrert"
            }
          />
          <UserStatCard
            label="Errors"
            value={totalErrors}
            helper={
              lastErrorAt
                ? `Siste error: ${new Date(lastErrorAt).toLocaleString(
                    "nb-NO",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}`
                : "Ingen errors registrert"
            }
          />
        </section>

        {/* Plan & credits – med UserAdminClient */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            <h2 className="text-sm font-semibold text-phorium-light">
              Plan & kreditter
            </h2>
            <p className="mt-1 text-[12px] text-phorium-light/65">
              Juster brukerens plan og kredittsaldo. Endringer logges i
              admin-historikken.
            </p>

            <div className="mt-4">
              <UserAdminClient
                userId={userId}
                initialPlan={plan || null}
                initialBalance={creditBalance}
              />
            </div>
          </div>

          {/* Kort sammendrag av admin-historikk */}
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            <h2 className="text-sm font-semibold text-phorium-light">
              Admin-historikk (kort)
            </h2>
            <p className="mt-1 text-[12px] text-phorium-light/65">
              Siste plan-/kredittendringer gjort av admin.
            </p>

            {adminActions.length === 0 ? (
              <p className="mt-4 text-[12px] text-phorium-light/60">
                Ingen admin-handlinger registrert ennå.
              </p>
            ) : (
              <div className="mt-3 space-y-2 text-[12px]">
                {adminActions.slice(0, 5).map((a) => {
                  const when = new Date(a.created_at).toLocaleString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border border-phorium-off/30 bg-phorium-dark/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-phorium-light">
                          {a.action}
                        </span>
                        <span className="text-[11px] text-phorium-light/55">
                          {when}
                        </span>
                      </div>
                      {a.delta_credits !== null && (
                        <p className="mt-1 text-[11px] text-phorium-light/70">
                          Delta credits:{" "}
                          <span className="font-mono">
                            {a.delta_credits > 0 ? "+" : ""}
                            {a.delta_credits}
                          </span>
                        </p>
                      )}
                      {(a.old_plan || a.new_plan) && (
                        <p className="mt-0.5 text-[11px] text-phorium-light/70">
                          Plan: {a.old_plan ?? "—"} → {a.new_plan ?? "—"}
                        </p>
                      )}
                      {a.admin_label && (
                        <p className="mt-0.5 text-[11px] text-phorium-light/60">
                          Notat: {a.admin_label}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Aktivitet */}
        <section className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <h2 className="text-sm font-semibold text-phorium-light">
            Siste aktivitet (siste 50)
          </h2>
          <p className="mt-1 text-[12px] text-phorium-light/65">
            Viser hendelser for denne brukeren, nyeste først.
          </p>

          {activity.length === 0 ? (
            <p className="mt-4 text-[12px] text-phorium-light/60">
              Ingen registrert aktivitet ennå for denne brukeren.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {activity.map((row) => {
                const when = new Date(row.created_at).toLocaleString("nb-NO", {
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
                      <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap text-[10px] leading-tight text-phorium-light/70">
                        {JSON.stringify(row.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Errors for denne brukeren */}
        <section className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <h2 className="text-sm font-semibold text-phorium-light">
            Errors for denne brukeren
          </h2>
          <p className="mt-1 text-[12px] text-phorium-light/65">
            Siste errors hvor denne brukeren er knyttet til error_log.
          </p>

          {userErrors.length === 0 ? (
            <p className="mt-4 text-[12px] text-phorium-light/60">
              Ingen errors registrert for denne brukeren.
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-[12px]">
              {userErrors.map((err) => {
                const when = new Date(err.created_at).toLocaleString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={err.id}
                    className="rounded-xl border border-red-500/30 bg-red-950/30 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-red-200">
                        {err.severity ?? "ERROR"}
                      </span>
                      <span className="text-[11px] text-phorium-light/55">
                        {when}
                      </span>
                    </div>
                    {err.location && (
                      <p className="mt-1 text-[11px] text-phorium-light/70">
                        Location: {err.location}
                      </p>
                    )}
                    {err.context && (
                      <p className="mt-0.5 text-[11px] text-phorium-light/70">
                        Context: {err.context}
                      </p>
                    )}
                    {err.message && (
                      <p className="mt-0.5 text-[11px] text-phorium-light/80">
                        {err.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Full admin-historikk */}
        <section className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <h2 className="text-sm font-semibold text-phorium-light">
            Admin-historikk (full)
          </h2>
          <p className="mt-1 text-[12px] text-phorium-light/65">
            Alle registrerte admin-handlinger for denne brukeren (limit 25).
          </p>

          {adminActions.length === 0 ? (
            <p className="mt-4 text-[12px] text-phorium-light/60">
              Ingen admin-handlinger registrert.
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-[12px]">
              {adminActions.map((a) => {
                const when = new Date(a.created_at).toLocaleString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-phorium-off/30 bg-phorium-dark/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-phorium-light">
                        {a.action}
                      </span>
                      <span className="text-[11px] text-phorium-light/55">
                        {when}
                      </span>
                    </div>
                    {a.delta_credits !== null && (
                      <p className="mt-1 text-[11px] text-phorium-light/70">
                        Delta credits:{" "}
                        <span className="font-mono">
                          {a.delta_credits > 0 ? "+" : ""}
                          {a.delta_credits}
                        </span>
                      </p>
                    )}
                    {(a.old_plan || a.new_plan) && (
                      <p className="mt-0.5 text-[11px] text-phorium-light/70">
                        Plan: {a.old_plan ?? "—"} → {a.new_plan ?? "—"}
                      </p>
                    )}
                    {a.admin_label && (
                      <p className="mt-0.5 text-[11px] text-phorium-light/60">
                        Notat: {a.admin_label}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-phorium-light/45">
                      ID: {a.id}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function UserStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
      <p className="text-[11px] text-phorium-light/60">{label}</p>
      <p className="mt-1 text-xl font-semibold text-phorium-light">{value}</p>
      {helper && (
        <p className="mt-1 text-[11px] text-phorium-light/45">{helper}</p>
      )}
    </div>
  );
}
