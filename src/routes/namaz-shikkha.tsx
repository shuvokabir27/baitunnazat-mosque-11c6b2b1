import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";

export const Route = createFileRoute("/namaz-shikkha")({
  head: () => ({
    meta: [
      { title: "নামাজ শিক্ষা — বায়তুল মামুর জামে মসজিদ" },
      { name: "description", content: "ধাপে ধাপে নামাজ শিক্ষা — ওযু, নিয়ত ও নামাজ আদায়ের সঠিক নিয়ম।" },
    ],
  }),
  component: NamazShikkha,
});

const steps = [
  { step: "১", title: "ওযু করা", detail: "নিয়তসহ হাত, মুখ, বাহু, মাথা মাসেহ ও পা ধৌত করা।" },
  { step: "২", title: "নিয়ত করা", detail: "কোন ওয়াক্তের কত রাকাত নামাজ পড়বেন তা মনে স্থির করা।" },
  { step: "৩", title: "তাকবিরে তাহরিমা", detail: "“আল্লাহু আকবার” বলে হাত বাঁধা।" },
  { step: "৪", title: "ক্বিরাত", detail: "সূরা ফাতিহা ও তার সাথে অন্য সূরা পাঠ করা।" },
  { step: "৫", title: "রুকু ও সিজদা", detail: "রুকু ও দুই সিজদা যথাযথভাবে আদায় করা।" },
  { step: "৬", title: "তাশাহহুদ ও সালাম", detail: "শেষ বৈঠকে তাশাহহুদ, দরুদ পড়ে সালাম ফেরানো।" },
];

const duas = [
  { title: "সানা", text: "সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা..." },
  { title: "রুকুর তাসবিহ", text: "সুবহানা রব্বিয়াল আযীম (৩ বার)" },
  { title: "সিজদার তাসবিহ", text: "সুবহানা রব্বিয়াল আ’লা (৩ বার)" },
];

function NamazShikkha() {
  return (
    <Layout>
      <PageHeader
        title="নামাজ শিক্ষা"
        subtitle="সহজ ধাপে নামাজ আদায়ের সঠিক নিয়ম শিখুন।"
      />

      <section className="px-4 py-10">
        <h2 className="mb-5 text-center text-xl font-bold text-primary">নামাজ আদায়ের ধাপসমূহ</h2>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
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

        <h2 className="mb-5 mt-10 text-center text-xl font-bold text-primary">গুরুত্বপূর্ণ দোয়া</h2>
        <div className="space-y-3">
          {duas.map((d) => (
            <div key={d.title} className="rounded-2xl gradient-emerald p-4 text-primary-foreground shadow-soft">
              <h3 className="font-bold text-gold">{d.title}</h3>
              <p className="mt-1 text-sm text-primary-foreground/90">{d.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
