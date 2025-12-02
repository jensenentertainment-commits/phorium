import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import ErrorsClient from "./ErrorsClient";

type SearchParams = {
  severity?: string;
  resolved?: string;
};

export type ErrorRow = {
  id: string;
  created_at: string;
  user_id: string | null;
  context: string | null;
  path: string | null;
  severity: string;
  message: string;
  resolved: boolean;
  stack: string | null;
  meta: any;
};

export default async function AdminErrorsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // --- Admin-sjekk (samme stil som de andre admin-sidene) ---
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("phorium_admin")?.value === "1";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const severityFilter = (searchParams?.severity ?? "ALL").toUpperCase();
  const showResolved = searchParams?.resolved === "1";

  // Hent errors
  let query = supabaseAdmin
    .from("error_log")
    .select(
      "id, created_at, user_id, context, path, severity, message, resolved, stack, meta",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (severityFilter !== "ALL") {
    query = query.eq("severity", severityFilter.toLowerCase());
  }

  if (!showResolved) {
    query = query.eq("resolved", false);
  }

  const { data, error } = await query;
  const errors = (data ?? []) as ErrorRow[];

  const totalErrors = errors.length;
  const unresolvedErrors = errors.filter((e) => !e.resolved).length;

  return (
    <main className="min-h-screen bg-phorium-dark pt-0 pb-16 text-phorium-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
     

        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-phorium-light/50">
              Admin
            </p>
            <h1 className="text-2xl font-semibold text-phorium-light">
              Error logg
            </h1>
            <p className="text-[12px] text-phorium-light/70">
              Oversikt over registrerte feil i Phorium. Fint å sjekke når noe
              oppfører seg rart.
            </p>
          </div>
        </header>

        {/* Stats-rad */}
        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            <p className="text-[11px] text-phorium-light/60">
              Viste errors (med filter)
            </p>
            <p className="mt-1 text-2xl font-semibold text-phorium-light">
              {totalErrors}
            </p>
          </div>

          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            <p className="text-[11px] text-phorium-light/60">
              Uløste errors
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-300">
              {unresolvedErrors}
            </p>
          </div>

          <div className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            <p className="text-[11px] text-phorium-light/60">Filter</p>
            <p className="mt-1 text-[12px] text-phorium-light/70">
              {severityFilter === "ALL"
                ? "Alle severities"
                : `Severity: ${severityFilter}`}
              {" · "}
              {showResolved ? "Viser også løste" : "Skjuler løste"}
            </p>
          </div>
        </section>

        {/* Filter-form */}
        <section className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <form className="flex flex-wrap items-center gap-3 text-[12px]">
            <label className="flex items-center gap-2">
              <span className="text-phorium-light/70">Severity</span>
              <select
                name="severity"
                defaultValue={severityFilter}
                className="rounded-full border border-phorium-off/40 bg-phorium-dark px-3 py-1 text-[12px] text-phorium-light/90"
              >
                <option value="ALL">Alle</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-phorium-light/70">
              <input
                type="checkbox"
                name="resolved"
                value="1"
                defaultChecked={showResolved}
                className="h-3 w-3 rounded border border-phorium-off/60 bg-phorium-dark"
              />
              Vis løste
            </label>

            <button
              type="submit"
              className="rounded-full border border-phorium-off/50 bg-phorium-dark px-4 py-1 text-[11px] font-medium uppercase tracking-wide text-phorium-light/80 transition hover:border-phorium-accent/80 hover:text-phorium-accent"
            >
              Oppdater
            </button>

            {error && (
              <span className="text-[11px] text-red-300">
                Kunne ikke hente errors: {error.message}
              </span>
            )}
          </form>
        </section>

        {/* Liste + modal (client) */}
        <section className="rounded-2xl border border-phorium-off/30 bg-phorium-dark/80 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
          <h2 className="text-sm font-semibold text-phorium-light">
            Siste errors
          </h2>
          <p className="mt-1 text-[12px] text-phorium-light/65">
            Viser opptil 200 rader, nyere først. Klikk på &quot;Detaljer&quot;
            for å se full stack og meta.
          </p>

          <ErrorsClient errors={errors} />
        </section>
      </div>
    </main>
  );
}
