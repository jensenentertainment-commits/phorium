import Link from "next/link";
import { Sparkles, Target, Users, Building2 } from "lucide-react";
import { PlanBadge, type PlanName } from "app/components/PlanBadge";
import { SectionHeader } from "@/app/components/ui/SectionHeader";
import { Card } from "@/app/components/ui/Card";

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
    <main className="min-h-screen bg-phorium-dark pt-20 pb-24">
      <section className="mx-auto max-w-6xl px-4">
        {/* Toppseksjon – bruker SectionHeader for å matche Studio */}
        <SectionHeader
          label="Priser"
          title="Velg planen som matcher din vekst"
          description="Phorium lanserer et enkelt og forutsigbart kredittsystem tilpasset norske nettbutikker og byråer. Alle genereringer koster kreditter – du betaler bare for faktisk bruk."
        />

        {/* Kreditt-pill */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-phorium-accent/40 bg-phorium-accent/15 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-phorium-accent/95">
            <span className="h-1.5 w-1.5 rounded-full bg-phorium-accent" />
            Kredittbasert · Forutsigbart · Bygd for nettbutikker
          </div>
        </div>

        {/* Plan-grid */}
         <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPrimary = plan.ctaType === "primary";

            // Forenklet routing:
            // - primary => rett til login (for å starte)
            // - contact => kontakt-siden
            const href = isPrimary ? "/login" : "/kontakt";

            return (
              <Card
                key={plan.slug}
                className={`flex h-full flex-col justify-between p-6 text-left shadow-[0_22px_60px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.7)] ${
                  plan.highlight
                    ? "border-phorium-accent/70 ring-1 ring-phorium-accent/60 bg-phorium-surface/95"
                    : "border-phorium-off/25 bg-phorium-surface/90"
                }`}
              >
                <div>
                  {/* Topp: ikon + navn + badge */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-phorium-off/30 bg-phorium-dark text-phorium-accent shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-phorium-light">
                          {plan.name}
                        </h2>
                        <p className="text-[11px] text-phorium-light/60">
                          {plan.tag}
                        </p>
                      </div>
                    </div>

                    <PlanBadge
                      plan={plan.slug}
                      size="sm"
                      showDescription={false}
                      className="whitespace-nowrap"
                    />
                  </div>

                  {/* Pris + beskrivelse */}
                  <p className="mb-1 text-[15px] font-medium text-phorium-accent/95">
                    {plan.price}
                  </p>

                  <p className="mb-5 text-[13px] leading-relaxed text-phorium-light/85">
                    {plan.desc}
                  </p>

                  {/* Features */}
                  <ul className="mb-5 space-y-2 text-[13px] text-phorium-light/80">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-phorium-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  href={href}
                  className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-center text-[13px] font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-phorium-accent text-phorium-dark shadow-[0_14px_40px_rgba(0,0,0,0.7)] hover:bg-phorium-accent/90"
                      : isPrimary
                      ? "border border-phorium-accent/80 bg-phorium-accent/10 text-phorium-accent/95 hover:bg-phorium-accent/20"
                      : "border border-phorium-off/50 text-phorium-light/85 hover:border-phorium-accent/60 hover:text-phorium-accent/95"
                  }`}
                >
                  {plan.button}
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Fotnote om kredittsystem */}
        <p className="mt-14 sm:mt-16 text-center text-[11px] text-phorium-light/60">
          Alle planer følger samme prinsipp: kredittbasert bruk, full oversikt –
          ingen binding og ingen støy. Eksakte kredittnivåer og priser publiseres
          ved åpen launch.
        </p>
      </section>
    </main>
  );
}
