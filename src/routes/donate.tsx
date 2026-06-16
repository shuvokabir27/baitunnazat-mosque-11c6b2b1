import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Smartphone, Building2, BookOpen, HeartHandshake, Loader2 } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";
import type { DonateIcon } from "@/lib/site-content";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

function VolunteerLeadForm() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (trimmed.length < 6) {
      setError("সঠিক মোবাইল নম্বর দিন।");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from("volunteer_leads")
        .upsert({ name: name.trim() || null, phone: trimmed }, { onConflict: "phone", ignoreDuplicates: true });
      if (insertError) throw insertError;
      setDone(true);
    } catch {
      setError("জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full gradient-emerald text-primary-foreground">
          <HeartHandshake className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-primary">জাজাকাল্লাহু খাইরান</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          আপনাকে অসংখ্য ধন্যবাদ ও শুকরিয়া। আল্লাহ আপনার নেক ইচ্ছা কবুল করুন। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে ইনশাআল্লাহ।
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-gold text-gold-foreground">
          <HeartHandshake className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-primary">মসজিদের কাজে যুক্ত হোন</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            আল্লাহর ঘর মসজিদের সেবায় শরিক হতে আপনার মোবাইল নম্বর দিন — আমরা আপনার সাথে যোগাযোগ করব ইনশাআল্লাহ।
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="আপনার নাম (ঐচ্ছিক)"
          maxLength={100}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="মোবাইল নম্বর"
          maxLength={20}
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          জমা দিন
        </button>
      </form>
    </div>
  );
}

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
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-primary">{m.title}</h3>
                {m.value && <p className="font-medium text-foreground">{m.value}</p>}
                {(m.bankName || m.branch || m.routingNumber || m.holderName || m.accountNumber) && (
                  <dl className="mt-1 space-y-1 text-sm">
                    {m.bankName && (
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">ব্যাংক:</dt>
                        <dd className="font-medium text-foreground">{m.bankName}</dd>
                      </div>
                    )}
                    {m.branch && (
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">শাখা:</dt>
                        <dd className="font-medium text-foreground">{m.branch}</dd>
                      </div>
                    )}
                    {m.holderName && (
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">হোল্ডার নাম:</dt>
                        <dd className="font-medium text-foreground">{m.holderName}</dd>
                      </div>
                    )}
                    {m.accountNumber && (
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">একাউন্ট নম্বর:</dt>
                        <dd className="font-medium text-foreground">{m.accountNumber}</dd>
                      </div>
                    )}
                    {m.routingNumber && (
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">রাউটিং নম্বর:</dt>
                        <dd className="font-medium text-foreground">{m.routingNumber}</dd>
                      </div>
                    )}
                  </dl>
                )}
                {m.note && <p className="mt-1 text-sm text-muted-foreground">{m.note}</p>}
              </div>
            </div>
          );
        })}

        <VolunteerLeadForm />

        <div className="rounded-3xl gradient-emerald p-6 text-center text-primary-foreground shadow-soft">
          <BookOpen className="mx-auto h-7 w-7 text-gold" />
          <p className="mt-3 text-sm text-primary-foreground/90">{donate.footerNote}</p>
        </div>
      </section>
    </Layout>
  );
}
