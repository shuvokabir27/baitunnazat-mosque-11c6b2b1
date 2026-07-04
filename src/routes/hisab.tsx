import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { FinanceOverview } from "@/components/FinanceOverview";

export const Route = createFileRoute("/hisab")({
  head: () => ({
    meta: [
      { title: "মাসিক আয়-ব্যয় হিসাব — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      {
        name: "description",
        content:
          "মসজিদের প্রতি মাসের আয়, ব্যয় ও স্থিতির স্বচ্ছ হিসাব। গত মাসের জের সহ মাসভিত্তিক সম্পূর্ণ আর্থিক বিবরণ।",
      },
    ],
  }),
  component: Hisab,
});

function Hisab() {
  return (
    <Layout>
      <PageHeader
        title="মাসিক আয়-ব্যয় হিসাব"
        subtitle="মসজিদের প্রতি মাসের আয়, ব্যয় ও স্থিতির স্বচ্ছ বিবরণ"
      />
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <FinanceOverview />
      </div>
    </Layout>
  );
}
