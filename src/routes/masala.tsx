import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";
import { staffImages } from "@/lib/site-content";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircleQuestion, Send, BadgeCheck, ChevronDown, BookOpen } from "lucide-react";

const toBengaliNum = (n: number) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

export const Route = createFileRoute("/masala")({
  head: () => ({
    meta: [
      { title: "সরাসরি প্রশ্ন উত্তর — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      {
        name: "description",
        content:
          "ইমাম ও খতিবের কাছ থেকে শরয়ী মাসয়ালা জানুন। প্রশ্ন লিখে সরাসরি হোয়াটসঅ্যাপে পাঠান।",
      },
    ],
  }),
  component: Masala,
});

function Masala() {
  const { staff } = useSiteContent();
  const scholars = useMemo(
    () =>
      staff.filter(
        (s) => typeof s.whatsapp === "string" && s.whatsapp.trim().length >= 8,
      ),
    [staff],
  );

  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  type QaItem = { id: string; question: string; answer: string; category_id: string | null };
  type Cat = { id: string; name: string };
  const [qa, setQa] = useState<QaItem[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [qaRes, catRes] = await Promise.all([
        supabase
          .from("qa_entries")
          .select("id, question, answer, category_id")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase
          .from("qa_categories")
          .select("id, name")
          .eq("published", true)
          .order("sort_order", { ascending: true }),
      ]);
      if (!cancelled) {
        setQa((qaRes.data as QaItem[]) ?? []);
        setCats((catRes.data as Cat[]) ?? []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedQa = useMemo(() => {
    const groups: { id: string; name: string; items: QaItem[] }[] = [];
    for (const c of cats) {
      const items = qa.filter((q) => q.category_id === c.id);
      if (items.length) groups.push({ id: c.id, name: c.name, items });
    }
    const uncategorized = qa.filter(
      (q) => !q.category_id || !cats.some((c) => c.id === q.category_id),
    );
    if (uncategorized.length)
      groups.push({ id: "__none__", name: "অন্যান্য", items: uncategorized });
    return groups;
  }, [qa, cats]);


  const activeSlug = selected || scholars[0]?.slug || "";

  const handleSend = () => {
    const q = question.trim();
    if (!q) {
      setError("অনুগ্রহ করে আপনার মাসয়ালা/প্রশ্নটি লিখুন।");
      return;
    }
    const scholar = scholars.find((s) => s.slug === activeSlug);
    if (!scholar || !scholar.whatsapp) {
      setError("অনুগ্রহ করে একজন আলেম নির্বাচন করুন।");
      return;
    }
    setError("");

    const text = `আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।\n\nমুহতারাম ${scholar.name} (${scholar.role}), আশা করি মহান আল্লাহর রহমতে আপনি ভালো আছেন। হুজুর, আপনার কাছে আমার একটি শরয়ী মাসয়ালা জানার ছিল।\n\nমাসয়ালা: ${q}\n\nবিষয়টি জানালে অনেক উপকৃত হতাম। জাযাকাল্লাহু খায়রান।`;
    const url = `https://wa.me/${scholar.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;

    // আবেদনটি ব্যাকেন্ডে সংরক্ষণ (fire-and-forget যাতে হোয়াটসঅ্যাপ খুলতে দেরি না হয়)
    void supabase.from("masala_requests").insert({
      scholar_slug: scholar.slug,
      scholar_name: scholar.name,
      scholar_role: scholar.role,
      subject: q,
    });

    window.open(url, "_blank", "noopener,noreferrer");
    setFormOpen(false);
    setQuestion("");
  };

  return (
    <Layout>
      <PageHeader
        title="প্রশ্ন ও উত্তর"
        subtitle="ইমাম ও খতিবের কাছ থেকে শরয়ী মাসয়ালা জেনে নিন।"
      />

      <div className="px-4 pb-10">
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-all active:scale-[0.98]"
        >
          <MessageCircleQuestion className="h-5 w-5" /> সরাসরি প্রশ্ন করুন
        </button>

        {qa.length > 0 && (
          <div className="mb-5 space-y-5">
            {groupedQa.map((group) => (
              <div key={group.id}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h2 className="text-base font-bold text-primary">{group.name}</h2>
                </div>
                <div className="space-y-2.5">
                  {group.items.map((item, idx) => {
                    const open = openId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : item.id)}
                          className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
                        >
                          <span className="text-sm font-bold text-foreground">
                            {toBengaliNum(idx + 1)}। {item.question}
                          </span>
                          <ChevronDown
                            className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {open && (
                          <div className="border-t border-border px-4 py-3.5">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}


        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <MessageCircleQuestion className="h-5 w-5" /> আপনার প্রশ্ন লিখুন
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                কোন বিষয়ে মাসয়ালা জানতে চান লিখুন, এরপর ইমাম বা খতিব নির্বাচন করে
                হোয়াটসঅ্যাপে পাঠান।
              </p>
            </DialogHeader>

            {scholars.length === 0 ? (
              <p className="mt-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                এই মুহূর্তে কোনো আলেমের হোয়াটসঅ্যাপ নম্বর যুক্ত করা হয়নি। অনুগ্রহ করে পরে
                চেষ্টা করুন।
              </p>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-foreground">
                    মাসয়ালা / প্রশ্ন
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value.slice(0, 1000))}
                    rows={5}
                    placeholder="যেমন: মুসাফির অবস্থায় নামাজ কসর করার নিয়ম কী?"
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <div className="mt-1 text-right text-xs text-muted-foreground">
                    {question.length}/১০০০
                  </div>
                </div>

                <div className="mt-1">
                  <label className="mb-2 block text-sm font-bold text-foreground">
                    কাকে জিজ্ঞাসা করবেন?
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {scholars.map((s) => {
                      const active = activeSlug === s.slug;
                      const img = s.image ?? staffImages[s.slug];
                      return (
                        <button
                          key={s.slug}
                          type="button"
                          onClick={() => setSelected(s.slug)}
                          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                            active
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={s.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-sm font-bold text-foreground">
                              {s.name.charAt(0)}
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                              {s.name}
                              {active && <BadgeCheck className="h-4 w-4 text-primary" />}
                            </span>
                            <span className="block text-xs text-muted-foreground">{s.role}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="button"
                  onClick={handleSend}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" /> হোয়াটসঅ্যাপে পাঠান
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  “হোয়াটসঅ্যাপে পাঠান” বাটনে ক্লিক করলে নির্বাচিত আলেমের হোয়াটসঅ্যাপ খুলবে
                  এবং আপনার প্রশ্নটি লেখা অবস্থায় থাকবে।
                </p>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
