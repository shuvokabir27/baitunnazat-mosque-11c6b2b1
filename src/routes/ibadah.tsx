import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { prayerTimes } from "@/lib/mosque-data";

export const Route = createFileRoute("/ibadah")({
  head: () => ({
    meta: [
      { title: "ইবাদত — বায়তুল মামুর জামে মসজিদ" },
      { name: "description", content: "নামাজ, কুরআন তিলাওয়াত, যিকির ও মসজিদের নিয়মিত ইবাদত কার্যক্রমের তথ্য।" },
    ],
  }),
  component: Ibadah,
});

const programs = [
  { title: "পাঁচ ওয়াক্ত জামাত", detail: "প্রতিদিন নির্ধারিত সময়ে জামাতে নামাজ আদায়।" },
  { title: "জুমার নামাজ", detail: "প্রতি শুক্রবার খুতবাসহ জুমার জামাত।" },
  { title: "তারাবিহ", detail: "রমজান মাসে খতমে তারাবিহর আয়োজন।" },
  { title: "তাফসির মাহফিল", detail: "প্রতি সপ্তাহে কুরআনের তাফসির আলোচনা।" },
  { title: "যিকির ও দোয়া", detail: "ফজর ও মাগরিবের পর সম্মিলিত যিকির।" },
];

function Ibadah() {
  return (
    <Layout>
      <PageHeader
        title="ইবাদত"
        subtitle="মসজিদে নিয়মিত অনুষ্ঠিত ইবাদত ও দ্বীনি কার্যক্রম।"
      />

      <section className="px-4 py-10">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-center text-xl font-bold text-primary">নামাজের সময়সূচি</h2>
          <ul className="divide-y divide-border">
            {prayerTimes.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-3">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="font-bold text-primary">{p.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          {programs.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-bold text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
