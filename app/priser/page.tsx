import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Source",
      tag: "Intern / dev",
      price: "Gratis (lukket)",
      desc: "For testing av Phorium internt før full utrulling.",
      features: [
        "Tilgang til dashboard i beta",
        "Begrenset antall genereringer",
        "Kun for utvalgte testmiljøer",
      ],
      button: "Brukes for intern beta",
      highlight: true,
    },
    {
      name: "Core",
      tag: "Anbefalt",
      price: "Kommer",
      desc: "For nettbutikker som vil bruke AI fast i hverdagen uten støy.",
      features: [
        "Fast kredittpott per måned",
        "Maler for produkt-, kategori- og kampanjetekster",
        "Tydelig forbruk og kostnadskontroll",
      ],
      button: "Registrer interesse",
    },
    {
      name: "Studio",
      tag: "Byrå / multi-store",
      price: "Kommer",
      desc: "For byråer, kjeder og merkevarer med flere butikker og språk.",
      features: [
        "Team og roller på tvers av kunder",
        "Kreditter per prosjekt eller klient",
        "Prioritert dialog om funksjoner",
      ],
      button: "Registrer interesse",
    },
    {
      name: "Nexus",
      tag: "Enterprise",
      price: "Kontakt",
      desc: "For større miljøer som trenger dedikerte løsninger.",
      features: [
        "Egne instanser og domener",
        "Integrasjoner mot interne systemer",
        "SLA, sikkerhet og teknisk sparring",
      ],
      button: "Snakk med oss",
    },
  ];

  return (
    <main className="min-h-screen bg-phorium-dark px-4 pb-24 pt-20">
      <section className="mx-auto max-w-6xl text-center">
        <div className="mb-8 inline-block rounded-full border border-phorium-accent/40 bg-phorium-accent/15 px-4 py-1 text-[13px] font-medium text-phorium-accent/95">
          Kredittbasert · forutsigbart · bygget for profesjonelle team
        </div>

        <h1 className="mb-4 text-3xl font-bold tracking-tight text-phorium-light sm:text-4xl md:text-5xl">
          Planer for team som tar innhold på alvor
        </h1>

        <p className="mx-auto mb-16 max-w-2xl text-[15px] leading-relaxed text-phorium-light/80">
          Phorium lanseres med kredittbaserte planer tilpasset norske nettbutikker,
          byråer og større miljøer. I beta inviterer vi utvalgte aktører inn – med
          samme struktur som senere rulles ut bredt.
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                flex h-full flex-col justify-between
                rounded-3xl border border-phorium-off/25 bg-phorium-surface
                p-8 shadow-[0_22px_60px_rgba(0,0,0,0.45)]
                transition-all duration-150 ease-out
                hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.7)]
                ${plan.highlight ? "ring-1 ring-phorium-accent/45" : ""}
              `}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-phorium-light">
                    {plan.name}
                  </h2>
                  <span className="rounded-full border border-phorium-accent/40 bg-phorium-accent/15 px-3 py-1 text-[11px] font-medium text-phorium-accent/95">
                    {plan.tag}
                  </span>
                </div>

                <p className="mb-2 text-[16px] font-medium text-phorium-accent/95">
                  {plan.price}
                </p>

                <p className="mb-6 text-[15px] leading-relaxed text-phorium-light/85">
                  {plan.desc}
                </p>

                <ul className="mb-8 space-y-2 text-[14px] text-phorium-light/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-[2px] text-phorium-accent">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Knapp nederst */}
              {plan.name === "Source" ? (
                <button
                  className="mt-auto w-full cursor-default rounded-full bg-phorium-accent px-5 py-2.5 text-[14px] font-semibold text-phorium-dark"
                  type="button"
                >
                  {plan.button}
                </button>
              ) : plan.name === "Nexus" ? (
                <Link
                  href="/kontakt"
                  className="mt-auto w-full rounded-full border border-phorium-accent/70 px-5 py-2.5 text-center text-[14px] font-semibold text-phorium-accent/95 transition-colors hover:bg-phorium-accent/10"
                >
                  {plan.button}
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="mt-auto w-full rounded-full border border-phorium-accent/50 px-5 py-2.5 text-center text-[14px] font-semibold text-phorium-accent/90 transition-colors hover:bg-phorium-accent/10"
                >
                  {plan.button}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
