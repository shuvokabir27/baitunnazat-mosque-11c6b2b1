import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Loader2, CheckCircle2, Search, UserCheck, UserX } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "সদস্য — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      { name: "description", content: "মসজিদের সদস্য হিসেবে আপনার তথ্য যুক্ত করুন।" },
    ],
  }),
  component: Members,
});

type AddressOption = { id: string; label: string };

type MemberInfo = { name: string; father_name: string; address: string };

function Members() {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressSel, setAddressSel] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // verification state
  const [checkMobile, setCheckMobile] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<MemberInfo | null>(null);
  const [notMember, setNotMember] = useState(false);

  const loadAddresses = useCallback(async () => {
    const { data } = await supabase
      .from("member_addresses")
      .select("id, label")
      .order("label", { ascending: true });
    setAddresses(data ?? []);
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedFather = fatherName.trim();
    const trimmedMobile = mobile.trim();
    const address = addressSel.trim();

    if (!trimmedName || !trimmedFather) {
      setError("নাম ও পিতার নাম দিন।");
      return;
    }
    if (trimmedMobile.length < 6) {
      setError("সঠিক মোবাইল নম্বর দিন।");
      return;
    }
    if (!address) {
      setError("ঠিকানা নির্বাচন করুন।");
      return;
    }

    setSaving(true);
    try {
      const { error: insertError } = await supabase.from("members").insert({
        name: trimmedName,
        father_name: trimmedFather,
        mobile: trimmedMobile,
        address,
      });
      if (insertError) throw insertError;

      setName("");
      setFatherName("");
      setMobile("");
      setAddressSel("");
      setDone(true);
    } catch {
      setError("জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="সদস্য হোন"
        subtitle="মসজিদের সদস্য হিসেবে আপনার তথ্য যুক্ত করুন।"
      />

      <div className="px-4 pb-10">
        {done ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-emerald text-primary-foreground">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-primary">জাজাকাল্লাহু খাইরান</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              আপনাকে অসংখ্য ধন্যবাদ ও শুকরিয়া। আপনার তথ্য সফলভাবে যুক্ত হয়েছে। আল্লাহ আপনার নেক ইচ্ছা কবুল করুন।
            </p>
            <button
              onClick={() => setDone(false)}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl gradient-emerald px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              <Plus className="h-4 w-4" /> আরেকজন যুক্ত করুন
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-primary">নতুন সদস্য যুক্ত করুন</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  ঠিকানা ড্রপডাউন থেকে নির্বাচন করুন এবং তথ্য পূরণ করুন।
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-4 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="সদস্যের নাম"
                maxLength={100}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="পিতার নাম"
                maxLength={100}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="মোবাইল নম্বর"
                maxLength={20}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <select
                value={addressSel}
                onChange={(e) => setAddressSel(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="" disabled>
                  ঠিকানা নির্বাচন করুন
                </option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.label}>
                    {a.label}
                  </option>
                ))}
              </select>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                সদস্য যুক্ত করুন
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
