import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Smartphone, Building2, BookOpen } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";
import type { DonateIcon } from "@/lib/site-content";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "দান করুন — বায়তুল মামুর জামে মসজিদ" },
      { name: "description", content: "মসজিদের উন্নয়ন ও পরিচালনায় দান করুন। বিকাশ, নগদ ও ব্যাংকের মাধ্যমে সহজে দান করার তথ্য।" },
    ],
  }),
  component: Donate,
});

const ICONS: Record<DonateIcon, typeof Smartphone> = {
  smartphone: Smartphone,
  bank: Landmark,
  building: Building2,
};

const BRAND_STYLES: Record<string, { bg: string; text: string }> = {
  বিকাশ: { bg: "linear-gradient(135deg, #E2136E, #C20F5E)", text: "#ffffff" },
  নগদ: { bg: "linear-gradient(135deg, #F7931E, #E07D0A)", text: "#ffffff" },
  ব্যাংক: { bg: "linear-gradient(135deg, #0066B2, #004C8C)", text: "#ffffff" },
};

function Donate() {
  const { donate } = useSiteContent();
  return (
    <Layout>
      <PageHeader title="দান করুন" subtitle={donate.subtitle} />
      <section className="space-y-4 px-4 py-10">
        {donate.methods.map((m, i) => {
          const Icon = ICONS[m.icon] ?? Smartphone;
          const brand = BRAND_STYLES[m.title];
          return (
            <div key={i} className="flex items-start gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
              <span
                className={
                  brand
                    ? "grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                    : "grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-gold text-gold-foreground"
                }
                style={
                  brand
                    ? { backgroundImage: brand.bg, color: brand.text }
                    : undefined
                }
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-primary">{m.title}</h3>
                <p className="font-medium text-foreground">{m.value}</p>
                <p className="text-sm text-muted-foreground">{m.note}</p>
              </div>
            </div>
          );
        })}
        <div className="rounded-3xl gradient-emerald p-6 text-center text-primary-foreground shadow-soft">
          <BookOpen className="mx-auto h-7 w-7 text-gold" />
          <p className="mt-3 text-sm text-primary-foreground/90">{donate.footerNote}</p>
        </div>
      </section>
    </Layout>
  );
}
