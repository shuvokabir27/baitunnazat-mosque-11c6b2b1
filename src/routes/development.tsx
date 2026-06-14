import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Hammer, CircleDashed } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";

export const Route = createFileRoute("/development")({
  head: () => ({
    meta: [
      { title: "উন্নয়ন কাজ — বায়তুল মামুর জামে মসজিদ" },
      { name: "description", content: "মসজিদের চলমান ও পরিকল্পিত উন্নয়ন কাজের তথ্য ও অগ্রগতি।" },
    ],
  }),
  component: Development,
});

const projects = [
  { title: "দ্বিতীয় তলা সম্প্রসারণ", status: "চলমান", progress: 65, icon: Hammer },
  { title: "ওযুখানা ও টয়লেট সংস্কার", status: "সম্পন্ন", progress: 100, icon: CheckCircle2 },
  { title: "নতুন এয়ার কন্ডিশনার স্থাপন", status: "চলমান", progress: 40, icon: Hammer },
  { title: "মিনার ও গম্বুজ সংস্কার", status: "পরিকল্পিত", progress: 10, icon: CircleDashed },
];

function Development() {
  return (
    <Layout>
      <PageHeader
        title="উন্নয়ন কাজ"
        subtitle="মুসল্লিদের সহযোগিতায় মসজিদের সৌন্দর্য ও সুবিধা বৃদ্ধির চলমান প্রচেষ্টা।"
      />
      <section className="space-y-5 px-4 py-10">
        {projects.map((p) => (
          <div key={p.title} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <span className="text-xs font-semibold text-primary">{p.status}</span>
              </div>
              <span className="text-sm font-bold text-gold">{p.progress}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full gradient-gold" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
