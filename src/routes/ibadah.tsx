import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";


export const Route = createFileRoute("/ibadah")({
  head: () => ({
    meta: [
      { title: "ইবাদত ও নামাজ শিক্ষা — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      { name: "description", content: "নামাজ শিক্ষা, বিভিন্ন ইবাদত কার্যক্রম ও গুরুত্বপূর্ণ দোয়া অর্থসহ এক জায়গায়।" },
    ],
  }),
  component: Ibadah,
});

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 mt-10 text-center first:mt-0">
      <h2 className="text-xl font-bold text-primary">{children}</h2>
      <div className="mx-auto mt-2 h-1 w-14 rounded-full gradient-gold" />
    </div>
  );
}

function Ibadah() {
  const { ibadah } = useSiteContent();
  return (
    <Layout>
      <PageHeader
        title="ইবাদত ও নামাজ শিক্ষা"
        subtitle={ibadah.subtitle}
      />

      <section className="px-4 py-10">
        {/* Namaz shikkha */}
        <Heading>{ibadah.stepsTitle}</Heading>
        <div className="space-y-4">
          {ibadah.steps.map((s, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-gold text-lg font-bold text-gold-foreground">
                {s.step}
              </span>
              <div>
                <h3 className="font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ibadah programs */}
        <Heading>{ibadah.programsTitle}</Heading>
        <div className="space-y-4">
          {ibadah.programs.map((p, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-bold text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Duas with meaning */}
        <Heading>{ibadah.duasTitle}</Heading>
        <div className="space-y-3">
          {ibadah.duas.map((d, i) => (
            <div key={i} className="rounded-2xl gradient-emerald p-4 text-primary-foreground shadow-soft">
              <h3 className="font-bold text-gold">{d.title}</h3>
              <p className="mt-1.5 text-base font-semibold leading-relaxed">{d.arabic}</p>
              <p className="mt-2 border-t border-primary-foreground/20 pt-2 text-sm text-primary-foreground/90">
                <span className="font-semibold text-gold">অর্থ:</span> {d.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
