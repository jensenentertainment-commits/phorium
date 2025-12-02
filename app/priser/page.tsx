import Link from "next/link";
import { Sparkles, Target, Users, Building2 } from "lucide-react";
import { PlanBadge, type PlanName } from "app/components/PlanBadge";

type PlanConfig = {
  slug: PlanName;
  name: string;
  tag: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  price: string;
  desc: string;
  features: string[];
  button: string;
  ctaType: "primary" | "contact";
  highlight?: boolean;
};

export default function PricingPage() {
  const plans: PlanConfig[] = [
    {
      slug: "source",
      name: "Source",
      tag: "Starter",
      icon: Sparkles,
      price: "Fra 0 kr (beta)",
      desc: "For deg som vil teste Phorium og skape godt innhold uten forpliktelser. Perfekt for mindre nettbutikker som ønsker et solid verktøy uten komplekse behov.",
      features: [
        "Begrenset kredittpott per måned",
        "Tilgang til produkt- og SEO-generering",
        "Tilgang til Phorium Studio (begrenset)",
        "Passer for mindre nettbutikker",
      ],
      button: "Start med Source",
      ctaType: "primary",
    },
    {
      slug: "flow",
      name: "Flow",
      tag: "For nettbutikker",
      icon: Target,
      price: "Publiseres ved launch",
      desc: "Planen for nettbutikker som vil ha stabil flyt av produkttekster, SEO-innhold og kampanjemateriell – uten overraskelser og uten AI-hype.",
      features: [
        "Fast kredittpott hver måned",
        "Full tilgang til tekstgenerering",
        "Forbedrede merkeprofiler",
        "Bedre kontroll på konvertering og konsistens",
        "Forutsigbar kostnad – laget for hverdagsdrift",
      ],
      button: "Registrer interesse",
      ctaType: "contact",
      highlight: true,
    },
    {
      slug: "pulse",
      name: "Pulse",
      tag: "Byrå / multi-store",
      icon: Users,
      price: "Publiseres ved launch",
      desc: "Planen for byråer, kjeder og miljøer som jobber på tvers av flere nettbutikker. Gir fleksibilitet, samarbeid og høy kapasitet.",
      features: [
        "Organisering på tvers av kunder og prosjekter",
        "Dype merkeprofiler og tilpassede mal-strukturer",
        "Utvidede kredittgrenser",
        "Prioritert support og dialog underveis",
      ],
      button: "Snakk med oss",
      ctaType: "contact",
    },
    {
      slug: "nexus",
      name: "Nexus",
      tag: "Enterprise",
      icon: Building2,
      price: "Tilpasses",
      desc: "For større aktører som trenger egne instanser, avansert sikkerhet, integrasjoner eller tekniske avtaler. Høy kapasitet og tilpasning.",
      features: [
        "Egne instanser / dedikert miljø",
        "Integrasjoner mot interne systemer",
        "SLA-avtaler og teknisk sparring",
        "Full fleksibilitet – skreddersydd oppsett",
      ],
      button: "Kontakt oss",
      ctaType: "contact",
    },
  ];

  return (
    <main className="min-h-screen bg-phorium-dark px-4 pb-24 pt-20">
      <section className="mx-auto max-w-6xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/15 px-4 py-1 text-[11px] font-medium tracking-[0.18em] text-phorium-accent/95 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
          Kredittbasert · Forutsigbart · Bygd for nettbutikker
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight text-phorium-light sm:text-4xl md:text-5xl">
          Velg planen som matcher din vekst
        </h1>

        <p className="mx-auto mb-3 max-w-2xl text-[14px] leading-relaxed text-phorium-light/80">
          Phorium lanserer et enkelt og forutsigbart kredittsystem tilpasset
          norske nettbutikker, byråer og større miljøer. Alle genereringer
          koster kreditter – du betaler bare for faktisk bruk.
        </p>

        <p className="mx-auto mb-14 max-w-xl text-[12px] text-phorium-light/60">
          Lanseringspriser og kredittnivåer publiseres ved åpen launch. I dag
          kan du registrere interesse – så gir vi deg tilgang når din kategori
          åpnes.
        </p>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.slug}
                className={`flex h-full flex-col justify-between rounded-3xl border border-phorium-off/25 bg-phorium-surface/95 p-6 text-left shadow-[0_22px_60px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.7)] ${
                  plan.highlight ? "ring-1 ring-phorium-accent/55" : ""
                }`}
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

                    <PlanBadge
                      plan={plan.slug}
                      size="sm"
                      showDescription={false}
                      className="whitespace-nowrap"
                    />
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
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-[11px] text-phorium-light/60">
          Alle planer følger samme prinsipp: kredittbasert bruk, full oversikt –
          ingen binding og ingen støy.
        </p>
      </section>
    </main>
  );
}
