import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";
import { staffImages } from "@/lib/site-content";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircleQuestion, Send, BadgeCheck, ChevronDown, BookOpen } from "lucide-react";

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

  type QaItem = { id: string; question: string; answer: string };
  const [qa, setQa] = useState<QaItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("qa_entries")
        .select("id, question, answer")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (!cancelled) setQa((data as QaItem[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  };

  return (
    <Layout>
      <PageHeader
        title="সরাসরি প্রশ্ন উত্তর"
        subtitle="ইমাম ও খতিবের কাছ থেকে শরয়ী মাসয়ালা জেনে নিন।"
      />

      <div className="px-4 pb-10">
        <div className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground">
              <MessageCircleQuestion className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-primary">আপনার প্রশ্ন লিখুন</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                কোন বিষয়ে মাসয়ালা জানতে চান লিখুন, এরপর ইমাম বা খতিব নির্বাচন করে
                হোয়াটসঅ্যাপে পাঠান।
              </p>
            </div>
          </div>

          {scholars.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              এই মুহূর্তে কোনো আলেমের হোয়াটসঅ্যাপ নম্বর যুক্ত করা হয়নি। অনুগ্রহ করে পরে
              চেষ্টা করুন।
            </p>
          ) : (
            <>
              <div className="mt-4">
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

              <div className="mt-3">
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

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

              <button
                type="button"
                onClick={handleSend}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3 text-sm font-bold text-primary-foreground transition-all active:scale-[0.98]"
              >
                <Send className="h-4 w-4" /> হোয়াটসঅ্যাপে পাঠান
              </button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                “হোয়াটসঅ্যাপে পাঠান” বাটনে ক্লিক করলে নির্বাচিত আলেমের হোয়াটসঅ্যাপ খুলবে
                এবং আপনার প্রশ্নটি লেখা অবস্থায় থাকবে।
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
