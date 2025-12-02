import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


type SearchParams = {
  type?: string;
  email?: string;
  days?: string;
};

type ActivityRow = {
  id: string;
  user_id: string | null;
  email_snapshot: string | null;
  event_type: string;
  meta: any;
  created_at: string;
};

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const typeFilter = (searchParams.type || "ALL").toUpperCase();
  const emailFilter = (searchParams.email || "").trim().toLowerCase();
  const days = Number(searchParams.days || "7");
  const daysLimit = Number.isFinite(days) && days > 0 ? days : 7;

  const now = new Date();
  const sinceDate = new Date(
    now.getTime() - daysLimit * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Bygg Supabase-spørring basert på filter
  let query = supabaseAdmin
    .from("activity_log")
    .select("*")
    .gte("created_at", sinceDate)
    .order("created_at", { ascending: false })
    .limit(200);

  if (typeFilter !== "ALL") {
    query = query.eq("event_type", typeFilter);
  }

  if (emailFilter) {
    query = query.ilike("email_snapshot", `%${emailFilter}%`);
  }

  const { data, error } = await query;
  const logs = (data ?? []) as ActivityRow[];

  return (
    <main className="min-h-screen bg-phorium-dark pt-0 pb-16 text-phorium-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4">
        {/* Admin-nav */}
      

        {/* Header + filter */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-phorium-light/50">
              Admin
            </p>
            <h1 className="text-2xl font-semibold text-phorium-accent">
              Aktivitetslogg
            </h1>
            <p className="text-[12px] text-phorium-light/70">
              Viser de siste hendelsene fra activity_log. Du kan filtrere på
              type, e-post og tidsrom.
            </p>
          </div>

          {/* Filter-form (GET) */}
          <form
            className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-3 py-2 text-[11px]"
            method="GET"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-phorium-light/60">
                Type
              </label>
              <select
                name="type"
                defaultValue={typeFilter}
                className="rounded-md border border-phorium-off/40 bg-phorium-dark px-2 py-1 text-[11px] outline-none"
              >
                <option value="ALL">Alle</option>
                <option value="TEXT_GENERATED">TEXT_GENERATED</option>
                <option value="IMAGE_GENERATED">IMAGE_GENERATED</option>
                <option value="CAMPAIGN_GENERATED">CAMPAIGN_GENERATED</option>
                <option value="CREDITS_CHANGED">CREDITS_CHANGED</option>
                <option value="LOGIN">LOGIN</option>
                <option value="SIGNUP">SIGNUP</option>
                <option value="ERROR">ERROR</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-phorium-light/60">
                E-post
              </label>
              <input
                type="text"
                name="email"
                defaultValue={emailFilter}
                placeholder="filtrer på e-post"
                className="w-44 rounded-md border border-phorium-off/40 bg-phorium-dark px-2 py-1 text-[11px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wide text-phorium-light/60">
                Dager
              </label>
              <input
                type="number"
                min={1}
                max={90}
                name="days"
                defaultValue={daysLimit}
                className="w-20 rounded-md border border-phorium-off/40 bg-phorium-dark px-2 py-1 text-[11px] outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="rounded-full bg-phorium-accent px-3 py-1 text-[11px] font-semibold text-phorium-dark shadow-sm hover:brightness-105"
              >
                Oppdater
              </button>
            </div>
          </form>
        </header>

        {error && (
          <p className="text-sm text-red-400">
            Feil ved henting av logg: {error.message}
          </p>
        )}

        {/* Tabell */}
        <section className="overflow-x-auto rounded-2xl border border-phorium-off/30 bg-phorium-dark/80">
          <table className="w-full text-[11px]">
            <thead className="bg-phorium-dark/80 text-phorium-light/60">
              <tr>
                <th className="px-2 py-2 text-left">Tid</th>
                <th className="px-2 py-2 text-left">E-post</th>
                <th className="px-2 py-2 text-left">Type</th>
                <th className="px-2 py-2 text-left">Detaljer</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => {
                const when = new Date(row.created_at).toLocaleString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={row.id}
                    className="border-t border-phorium-off/20 hover:bg-phorium-dark/60"
                  >
                    <td className="px-2 py-2 align-top text-[11px]">{when}</td>
                    <td className="px-2 py-2 align-top text-[11px]">
                      {row.email_snapshot || (
                        <span className="opacity-50">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 align-top text-[11px] font-semibold text-phorium-accent/90">
                      {row.event_type}
                    </td>
                    <td className="px-2 py-2 align-top text-[11px] text-phorium-light/80">
                      {row.meta && Object.keys(row.meta).length > 0 ? (
                        <pre className="max-h-32 overflow-auto whitespace-pre-wrap text-[10px] leading-tight">
                          {JSON.stringify(row.meta, null, 2)}
                        </pre>
                      ) : (
                        <span className="opacity-50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-[12px] text-phorium-light/60"
                  >
                    Ingen hendelser funnet for valgt filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
