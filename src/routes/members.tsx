import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { Users, Plus, Loader2, CheckCircle2, Search, UserCheck, UserX, Download, Moon } from "lucide-react";
import { toPng } from "html-to-image";
import { Layout, PageHeader } from "@/components/Layout";
import { mosque } from "@/lib/mosque-data";
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

type MemberInfo = { member_no: number; name: string; father_name: string; address: string; monthly_donation: number };

function Members() {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressSel, setAddressSel] = useState("");
  const [donationSel, setDonationSel] = useState("");
  const [monthlyDonation, setMonthlyDonation] = useState("");
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);
  const [done, setDone] = useState(false);
  const [newMember, setNewMember] = useState<MemberInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileExists, setMobileExists] = useState(false);

  // verification state
  const [checkMobile, setCheckMobile] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<MemberInfo | null>(null);
  const [notMember, setNotMember] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.download = `সদস্য-কার্ড-${checkResult?.member_no ?? ""}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      /* ignore */
    } finally {
      setDownloading(false);
    }
  }, [checkResult]);

  const loadAddresses = useCallback(async () => {
    const { data } = await supabase
      .from("member_addresses")
      .select("id, label")
      .order("label", { ascending: true });
    const list = data ?? [];
    const isMohipur = (a: AddressOption) => /\(মহিপুর\)\s*$/.test(a.label.trim());
    const sorted = [...list].sort((x, y) => {
      const mx = isMohipur(x);
      const my = isMohipur(y);
      if (mx !== my) return mx ? -1 : 1;
      return x.label.localeCompare(y.label, "bn");
    });
    setAddresses(sorted);
  }, []);


  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    const trimmedName = name.trim();
    const trimmedFather = fatherName.trim();
    const trimmedMobile = mobile.trim();
    const address = addressSel.trim();

    if (!trimmedName || !trimmedFather) {
      setError("নাম ও পিতার নাম দিন।");
      return;
    }
    if (trimmedMobile.length !== 11) {
      setError("মোবাইল নম্বর অবশ্যই ১১ ডিজিট হতে হবে।");
      return;
    }
    if (!address) {
      setError("ঠিকানা নির্বাচন করুন।");
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    try {
      const { data: existing, error: dupError } = await supabase
        .from("members")
        .select("id")
        .eq("mobile", trimmedMobile)
        .limit(1);
      if (dupError) throw dupError;
      if (existing && existing.length > 0) {
        setError("এই মোবাইল নম্বরটি ইতিমধ্যে যুক্ত আছে।");
        setSaving(false);
        submittingRef.current = false;
        return;
      }

      const donationRaw = donationSel === "other" ? monthlyDonation : donationSel;
      const donation = Math.max(0, Number(donationRaw) || 0);
      const { error: insertError } = await supabase.from("members").insert({
        name: trimmedName,
        father_name: trimmedFather,
        mobile: trimmedMobile,
        address,
        monthly_donation: donation,
      });
      if (insertError) {
        if (insertError.code === "23505") {
          setError("এই মোবাইল নম্বরটি ইতিমধ্যে যুক্ত আছে।");
          return;
        }
        throw insertError;
      }

      // fetch the permanent member number that was generated
      const { data: verified } = await supabase.rpc("verify_member_by_mobile", {
        _mobile: trimmedMobile,
      });
      const newRow = (verified ?? [])[0] as MemberInfo | undefined;
      setNewMember(newRow ?? null);

      setName("");
      setFatherName("");
      setMobile("");
      setAddressSel("");
      setDonationSel("");
      setMonthlyDonation("");
      setDone(true);
    } catch {
      setError("জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  const runVerify = useCallback(async (m: string) => {
    setChecking(true);
    setCheckResult(null);
    setNotMember(false);
    try {
      const { data, error: rpcError } = await supabase.rpc("verify_member_by_mobile", {
        _mobile: m,
      });
      if (rpcError) throw rpcError;
      const row = (data ?? [])[0] as MemberInfo | undefined;
      if (row) {
        setCheckResult(row);
      } else {
        setNotMember(true);
      }
    } catch {
      setNotMember(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (checkMobile.length !== 11) {
      setCheckResult(null);
      setNotMember(false);
      return;
    }
    const t = setTimeout(() => runVerify(checkMobile), 300);
    return () => clearTimeout(t);
  }, [checkMobile, runVerify]);

  useEffect(() => {
    if (mobile.length !== 11) {
      setMobileExists(false);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("members")
        .select("id")
        .eq("mobile", mobile)
        .limit(1);
      if (active) setMobileExists(!!data && data.length > 0);
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [mobile]);


  return (
    <Layout>
      <PageHeader
        title="সদস্য হোন"
        subtitle="মসজিদের সদস্য হিসেবে আপনার তথ্য যুক্ত করুন।"
      />

      <div className="px-4 pb-10">
        <div className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground">
              <Search className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-primary">সদস্য যাচাই করুন</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                মোবাইল নম্বর দিন, আপনার তথ্য স্বয়ংক্রিয়ভাবে দেখানো হবে।
              </p>
            </div>
          </div>

          <div className="mt-4">
            <input
              type="tel"
              inputMode="numeric"
              value={checkMobile}
              onChange={(e) =>
                setCheckMobile(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
              placeholder="মোবাইল নম্বর দিন (১১ ডিজিট)"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <div className="mt-2 flex h-5 items-center gap-2 text-xs text-muted-foreground">
              {checking && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> যাচাই করা হচ্ছে...
                </>
              )}
              {!checking && checkMobile.length > 0 && checkMobile.length !== 11 && (
                <span className="text-destructive">আরও {11 - checkMobile.length} ডিজিট দিন।</span>
              )}
            </div>
          </div>


          {checkResult && (
            <div className="mt-4">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <UserCheck className="h-5 w-5" />
                <span className="text-sm font-bold">আপনি একজন নিবন্ধিত সদস্য</span>
              </div>

              {/* Downloadable membership card */}
              <div
                ref={cardRef}
                className="relative overflow-hidden rounded-2xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #065f46 0%, #047857 55%, #0d9488 100%)" }}
              >
                {/* decorative circles */}
                <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/5" />

                {/* header */}
                <div className="relative flex items-center gap-3 border-b border-white/20 px-5 py-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
                    <Moon className="h-6 w-6 text-white" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-base font-extrabold leading-tight">{mosque.name}</h4>
                    <p className="text-[11px] text-white/80">সদস্য পরিচয় কার্ড · প্রতিষ্ঠাকাল {mosque.established}</p>
                  </div>
                </div>

                {/* body */}
                <div className="relative px-5 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-white/15 px-3 py-2">
                    <span className="text-xs font-medium text-white/80">সদস্য নম্বর</span>
                    <span className="text-xl font-extrabold tracking-wide">{checkResult.member_no}</span>
                  </div>

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/75">নাম</dt>
                      <dd className="text-right font-bold">{checkResult.name}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/75">পিতার নাম</dt>
                      <dd className="text-right font-bold">{checkResult.father_name}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/75">ঠিকানা</dt>
                      <dd className="text-right font-bold">{checkResult.address}</dd>
                    </div>
                  </dl>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
                    <span className="text-sm font-bold text-emerald-800">মাসিক দান</span>
                    <span className="text-lg font-extrabold text-emerald-700">{checkResult.monthly_donation ?? 0} ৳</span>
                  </div>
                </div>

                {/* footer */}
                <div className="relative border-t border-white/20 px-5 py-2.5 text-center text-[11px] text-white/80">
                  {mosque.tagline}
                </div>
              </div>

              <button
                onClick={downloadCard}
                disabled={downloading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                কার্ড ডাউনলোড করুন
              </button>
            </div>
          )}


          {notMember && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                <span className="text-sm font-bold">আপনি এখনো সদস্য নন</span>
              </div>
              <p className="mt-1.5 text-sm">
                এই মোবাইল নম্বরে কোনো সদস্য পাওয়া যায়নি। অনুগ্রহ করে নিচের ফর্মটি পূরণ করে সদস্য হিসেবে যুক্ত হোন।
              </p>
            </div>
          )}
        </div>


        {done ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-emerald text-primary-foreground">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-primary">জাজাকাল্লাহু খাইরান</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              আপনাকে অসংখ্য ধন্যবাদ ও শুকরিয়া। আপনার তথ্য সফলভাবে যুক্ত হয়েছে। আল্লাহ আপনার নেক ইচ্ছা কবুল করুন।
            </p>
            {newMember && (
              <div className="mx-auto mt-4 max-w-xs rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">আপনার সদস্য নম্বর</p>
                <p className="mt-1 text-2xl font-extrabold text-primary">{newMember.member_no} নং</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{newMember.name}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  এই নম্বরটি স্থায়ীভাবে আপনার নামের সাথে যুক্ত থাকবে।
                </p>
              </div>
            )}
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
              <div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="মোবাইল নম্বর (১১ ডিজিট)"
                  required
                  className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none ${
                    (mobile.length > 0 && mobile.length !== 11) || mobileExists
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                />
                {mobile.length > 0 && mobile.length !== 11 && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    মোবাইল নম্বর অবশ্যই ১১ ডিজিট হতে হবে। (এখন {mobile.length} ডিজিট)
                  </p>
                )}
                {mobile.length === 11 && mobileExists && (
                  <p className="mt-1 text-xs font-medium text-destructive">
                    এই মোবাইল নম্বরটি ইতিমধ্যে সদস্য হিসেবে যুক্ত আছে।
                  </p>
                )}
              </div>
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
              <select
                value={donationSel}
                onChange={(e) => setDonationSel(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="" disabled>
                  মাসিক দানের পরিমাণ নির্বাচন করুন
                </option>
                <option value="100">১০০ টাকা</option>
                <option value="200">২০০ টাকা</option>
                <option value="500">৫০০ টাকা</option>
                <option value="1000">১০০০ টাকা</option>
                <option value="other">অন্যান্য</option>
              </select>
              {donationSel === "other" && (
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    inputMode="numeric"
                    value={monthlyDonation}
                    onChange={(e) => setMonthlyDonation(e.target.value)}
                    placeholder="টাকার পরিমাণ লিখুন"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-primary"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    টাকা
                  </span>
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={saving || mobileExists}
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
