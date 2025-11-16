import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-phorium-sand pt-20 pb-24">
      {/* Subtil bakgrunnsglow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_0%,rgba(0,0,0,0.25),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_10%,rgba(200,183,122,0.18),transparent_75%)] mix-blend-overlay" />

      <div className="text-center px-4">
        <h1 className="text-6xl font-semibold text-[#1C1F18] tracking-tight mb-2">
          404
        </h1>
        <p className="text-[15px] text-[#4A4438] max-w-md mx-auto leading-relaxed mb-6">
          Siden du ser etter finnes ikke i Phorium (enda). Kan hende den er på
          roadmapen — eller så har den aldri eksistert.....
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-phorium-accent text-phorium-dark text-[14px] font-semibold shadow-sm hover:bg-phorium-accent/90 transition"
        >
          Tilbake til forsiden
        </Link>

        <div className="mt-4 text-[11px] text-[#7F7764]">
          Eller ta en titt på{" "}
          <Link
            href="/studio"
            className="underline underline-offset-2 hover:text-phorium-accent transition"
          >
            Studio
          </Link>{" "}
          mens du er her.
        </div>
      </div>
    </main>
  );
}
