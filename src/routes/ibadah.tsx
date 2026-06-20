import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";


export const Route = createFileRoute("/ibadah")({
  head: () => ({
    meta: [
      { title: "ইবাদত ও নামাজ শিক্ষা — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      { name: "description", content: "নামাজ শিক্ষা, বিভিন্ন ইবাদত কার্যক্রম ও গুরুত্বপূর্ণ দোয়া অর্থসহ এক জায়গায়।" },
    ],
  }),
  component: Ibadah,
});

const steps = [
  { step: "১", title: "ওযু করা", detail: "নিয়তসহ হাত, মুখ, বাহু, মাথা মাসেহ ও পা ধৌত করা।" },
  { step: "২", title: "নিয়ত করা", detail: "কোন ওয়াক্তের কত রাকাত নামাজ পড়বেন তা মনে স্থির করা।" },
  { step: "৩", title: "তাকবিরে তাহরিমা", detail: "“আল্লাহু আকবার” বলে হাত বাঁধা।" },
  { step: "৪", title: "ক্বিরাত", detail: "সূরা ফাতিহা ও তার সাথে অন্য সূরা পাঠ করা।" },
  { step: "৫", title: "রুকু ও সিজদা", detail: "রুকু ও দুই সিজদা যথাযথভাবে আদায় করা।" },
  { step: "৬", title: "তাশাহহুদ ও সালাম", detail: "শেষ বৈঠকে তাশাহহুদ, দরুদ পড়ে সালাম ফেরানো।" },
];

const programs = [
  { title: "পাঁচ ওয়াক্ত জামাত", detail: "প্রতিদিন নির্ধারিত সময়ে জামাতে নামাজ আদায়।" },
  { title: "জুমার নামাজ", detail: "প্রতি শুক্রবার খুতবাসহ জুমার জামাত।" },
  { title: "তারাবিহ", detail: "রমজান মাসে খতমে তারাবিহর আয়োজন।" },
  { title: "তাফসির মাহফিল", detail: "প্রতি সপ্তাহে কুরআনের তাফসির আলোচনা।" },
  { title: "যিকির ও দোয়া", detail: "ফজর ও মাগরিবের পর সম্মিলিত যিকির।" },
];

const duas = [
  {
    title: "সানা",
    arabic: "সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা ওয়া তাবা-রকাসমুকা ওয়া তাআ-লা জাদ্দুকা ওয়া লা ইলা-হা গায়রুক।",
    meaning: "হে আল্লাহ! তোমার প্রশংসাসহ তোমার পবিত্রতা ঘোষণা করছি, তোমার নাম বরকতময়, তোমার মর্যাদা সুউচ্চ এবং তুমি ছাড়া কোনো উপাস্য নেই।",
  },
  {
    title: "রুকুর তাসবিহ",
    arabic: "সুবহানা রব্বিয়াল আযীম (৩ বার)",
    meaning: "আমার মহান রবের পবিত্রতা ঘোষণা করছি।",
  },
  {
    title: "সিজদার তাসবিহ",
    arabic: "সুবহানা রব্বিয়াল আ’লা (৩ বার)",
    meaning: "আমার সর্বোচ্চ রবের পবিত্রতা ঘোষণা করছি।",
  },
  {
    title: "খাবারের পূর্বে",
    arabic: "বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।",
    meaning: "আল্লাহর নামে এবং আল্লাহর দেওয়া বরকত নিয়ে (শুরু করছি)।",
  },
  {
    title: "ঘুমানোর দোয়া",
    arabic: "আল্লাহুম্মা বিইসমিকা আমূতু ওয়া আহইয়া।",
    meaning: "হে আল্লাহ! তোমারই নামে আমি মরি ও বাঁচি।",
  },
];

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 mt-10 text-center first:mt-0">
      <h2 className="text-xl font-bold text-primary">{children}</h2>
      <div className="mx-auto mt-2 h-1 w-14 rounded-full gradient-gold" />
    </div>
  );
}

function Ibadah() {
  return (
    <Layout>
      <PageHeader
        title="ইবাদত ও নামাজ শিক্ষা"
        subtitle="নামাজ শিক্ষা, বিভিন্ন ইবাদত ও দোয়া অর্থসহ এক জায়গায়।"
      />

      <section className="px-4 py-10">
        {/* Namaz shikkha */}
        <Heading>নামাজ আদায়ের ধাপসমূহ</Heading>
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

        {/* Ibadah programs */}
        <Heading>বিভিন্ন ইবাদত কার্যক্রম</Heading>
        <div className="space-y-4">
          {programs.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-bold text-foreground">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Duas with meaning */}
        <Heading>গুরুত্বপূর্ণ দোয়া (অর্থসহ)</Heading>
        <div className="space-y-3">
          {duas.map((d) => (
            <div key={d.title} className="rounded-2xl gradient-emerald p-4 text-primary-foreground shadow-soft">
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
