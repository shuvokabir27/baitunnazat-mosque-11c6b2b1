import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Smartphone, Building2, BookOpen } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "দান করুন — বায়তুল মামুর জামে মসজিদ" },
      { name: "description", content: "মসজিদের উন্নয়ন ও পরিচালনায় দান করুন। বিকাশ, নগদ ও ব্যাংকের মাধ্যমে সহজে দান করার তথ্য।" },
    ],
  }),
  component: Donate,
});

const methods = [
  { icon: Smartphone, title: "বিকাশ", value: "০১৭xx-xxxxxx", note: "পার্সোনাল / সেন্ড মানি" },
  { icon: Smartphone, title: "নগদ", value: "০১৮xx-xxxxxx", note: "পার্সোনাল / সেন্ড মানি" },
  { icon: Landmark, title: "ব্যাংক", value: "ইসলামী ব্যাংক — হিসাব নং ১২৩৪৫৬৭৮৯", note: "মিরপুর শাখা" },
  { icon: Building2, title: "সরাসরি", value: "মসজিদ অফিসে যোগাযোগ করুন", note: "দান বাক্সে দান করুন" },
];

function Donate() {
  return (
    <Layout>
      <PageHeader
        title="দান করুন"
        subtitle="“যে ব্যক্তি আল্লাহর সন্তুষ্টির জন্য একটি মসজিদ নির্মাণ করে, আল্লাহ তার জন্য জান্নাতে অনুরূপ ঘর নির্মাণ করেন।”"
      />
      <section className="space-y-4 px-4 py-10">
        {methods.map((m) => (
          <div key={m.title} className="flex items-start gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-gold text-gold-foreground">
              <m.icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-primary">{m.title}</h3>
              <p className="font-medium text-foreground">{m.value}</p>
              <p className="text-sm text-muted-foreground">{m.note}</p>
            </div>
          </div>
        ))}
        <div className="rounded-3xl gradient-emerald p-6 text-center text-primary-foreground shadow-soft">
          <BookOpen className="mx-auto h-7 w-7 text-gold" />
          <p className="mt-3 text-sm text-primary-foreground/90">
            আপনার সদকা ও দান মসজিদের বিদ্যুৎ বিল, ইমাম-মুয়াজ্জিনের সম্মানী ও উন্নয়ন কাজে ব্যয় হয়।
          </p>
        </div>
      </section>
    </Layout>
  );
}
