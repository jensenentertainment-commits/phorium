import Link from "next/link";
import { Sparkles, Target, Users, Building2 } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Source",
      tag: "Lukket beta",
      badgeTone: "beta",
      icon: Sparkles,
      price: "Gratis (intern)",
      desc: "Brukes til å teste Phorium internt før vi åpner for faktiske kunder.",
      features: [
        "Tilgang til dashboard og nye funksjoner først",
        "Begrenset antall genereringer per måned",
        "Kun for utvalgte testmiljøer og samarbeidspartnere",
      ],
      button: "Brukes til intern testing",
      ctaType: "disabled" as const,
      highlight: false,
    },
    {
      name: "Core",
      tag: "For nettbutikker",
      badgeTone: "primary",
      icon: Target,
      price: "Pris annonseres",
      desc: "For nettbutikker som vil bruke AI fast i hverdagen – uten støy og overraskelser.",
      features: [
        "Fast kredittpott per måned",
        "Tekstpakker for produkt, kategori, SEO og kampanje",
        "Tydelig forbruk og kostnadskontroll",
      ],
      button: "Registrer interesse",
      ctaType: "contact" as const,
      highlight: true,
    },
    {
      name: "Studio",
      tag: "Byrå / multi-store",
      badgeTone: "secondary",
      icon: Users,
      price: "Pris annonseres",
      desc: "For byråer, kjeder og aktører som jobber med flere butikker og språk.",
      features: [
        "Organisering per kunde/prosjekt",
        "Felles brandprofiler og maler på tvers av butikker",
        "Dialog om funksjoner tilpasset arbeidsflyten deres",
      ],
      button: "Snakk om byråbruk",
      ctaType: "contact" as const,
      highlight: false,
    },
    {
      name: "Nexus",
      tag: "Enterprise",
      badgeTone: "outline",
      icon: Building2,
      price: "Tilpasses",
      desc: "For større miljøer som trenger egne instanser, integrasjoner og rammer.",
      features: [
        "Egne instanser/domener og integrasjoner",
        "Tilpasning mot interne systemer og rutiner",
        "SLA, sikkerhet og teknisk sparring ved behov",
      ],
      button: "Ta kontakt",
      ctaType: "contact" as const,
      highlight: false,
    },
  ];

  return (
    <main className="min-h-screen bg-phorium-dark px-4 pb-24 pt-20">
      <section className="mx-auto max-w-6xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/15 px-4 py-1 text-[11px] font-medium tracking-[0.18em] text-phorium-accent/95 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
          Kredittbasert · forutsigbart · laget for nettbutikker
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-phorium-light sm:text-4xl md:text-5xl">
          Planer for team som tar innhold på alvor
        </h1>

        <p className="mx-auto mb-3 max-w-2xl text-[14px] leading-relaxed text-phorium-light/80">
          Phorium lanseres med kredittbaserte planer tilpasset norske nettbutikker,
          byråer og større miljøer. I beta inviterer vi inn noen få om gangen – slik
          at vi kan justere funksjoner og nivåer sammen med dere.
        </p>

        <p className="mx-auto mb-14 max-w-xl text-[12px] text-phorium-light/60">
          Endelige priser og kredittnivåer publiseres ved åpen lansering. Allerede
          nå kan du registrere interesse, så tar vi kontakt når vi åpner opp for
          flere i din kategori.
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`
                  flex h-full flex-col justify-between
                  rounded-3xl border border-phorium-off/25 bg-phorium-surface/95
                  p-6 text-left shadow-[0_22px_60px_rgba(0,0,0,0.45)]
                  transition-all duration-150 ease-out
                  hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.7)]
                  ${plan.highlight ? "ring-1 ring-phorium-accent/55" : ""}
                `}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-phorium-off/30 bg-phorium-dark text-phorium-accent shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h2 className="text-xl font-semibold text-phorium-light">
                        {plan.name}
                      </h2>
                    </div>

                    <span
                      className={`
                        rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]
                        ${
                          plan.badgeTone === "primary"
                            ? "border border-phorium-accent/60 bg-phorium-accent/12 text-phorium-accent/95"
                            : plan.badgeTone === "beta"
                            ? "border border-phorium-off/50 bg-phorium-dark/70 text-phorium-light/80"
                            : plan.badgeTone === "secondary"
                            ? "border border-phorium-off/40 bg-phorium-surface text-phorium-light/85"
                            : "border border-phorium-off/40 bg-transparent text-phorium-light/70"
                        }
                      `}
                    >
                      {plan.tag}
                    </span>
                  </div>

                  <p className="mb-1 text-[15px] font-medium text-phorium-accent/95">
                    {plan.price}
                  </p>

                  <p className="mb-6 text-[13px] leading-relaxed text-phorium-light/85">
                    {plan.desc}
                  </p>

                  <ul className="mb-6 space-y-2 text-[13px] text-phorium-light/80">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-phorium-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Knapp nederst */}
                {plan.ctaType === "disabled" ? (
                  <button
                    className="mt-auto w-full cursor-not-allowed rounded-full bg-phorium-accent/40 px-5 py-2.5 text-[13px] font-semibold text-phorium-dark/80"
                    type="button"
                  >
                    {plan.button}
                  </button>
                ) : (
                  <Link
                    href="/kontakt"
                    className={`mt-auto w-full rounded-full px-5 py-2.5 text-center text-[13px] font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-phorium-accent text-phorium-dark shadow-[0_14px_40px_rgba(0,0,0,0.7)] hover:bg-phorium-accent/90"
                        : "border border-phorium-accent/55 text-phorium-accent/90 hover:bg-phorium-accent/10"
                    }`}
                  >
                    {plan.button}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-[11px] text-phorium-light/60">
          Alle planer vil bygge på samme prinsipp: kredittbasert bruk, tydelig
          oversikt og ingen lange bindingstider.
        </p>
      </section>
    </main>
  );
}
