import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Loader2, FileSpreadsheet, FileDown } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { mosque } from "@/lib/mosque-data";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "সদস্য তালিকা — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      { name: "description", content: "মসজিদের সদস্যদের তথ্য যুক্ত করুন এবং সদস্য তালিকা এক্সেল বা পিডিএফ আকারে ডাউনলোড করুন।" },
    ],
  }),
  component: Members,
});

type Member = {
  id: string;
  name: string;
  father_name: string;
  mobile: string;
  address: string;
  created_at: string;
};

type AddressOption = { id: string; label: string };



function Members() {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [addressSel, setAddressSel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    const { data } = await supabase
      .from("member_addresses")
      .select("id, label")
      .order("label", { ascending: true });
    setAddresses(data ?? []);
  }, []);

  const loadMembers = useCallback(async () => {
    const { data } = await supabase
      .from("members")
      .select("id, name, father_name, mobile, address, created_at")
      .order("created_at", { ascending: false });
    setMembers(data ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadAddresses(), loadMembers()]);
      setLoading(false);
    })();
  }, [loadAddresses, loadMembers]);

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
      await loadMembers();
    } catch {
      setError("জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  const downloadExcel = () => {
    const header = ["ক্রমিক", "নাম", "পিতার নাম", "মোবাইল", "ঠিকানা"];
    const rows = members.map((m, i) => [
      String(i + 1),
      m.name,
      m.father_name,
      m.mobile,
      m.address,
    ]);
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    // UTF-8 BOM যাতে বাংলা এক্সেলে ঠিক দেখায়
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "সদস্য-তালিকা.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const rows = members
      .map(
        (m, i) =>
          `<tr><td>${i + 1}</td><td>${m.name}</td><td>${m.father_name}</td><td>${m.mobile}</td><td>${m.address}</td></tr>`,
      )
      .join("");
    const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>সদস্য তালিকা</title>
      <style>
        body{font-family:'Noto Sans Bengali','Segoe UI',sans-serif;padding:24px;color:#1a1a1a}
        h1{font-size:18px;text-align:center;margin:0 0 4px}
        p{text-align:center;margin:0 0 16px;color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #999;padding:6px 8px;text-align:left}
        th{background:#0f6e4f;color:#fff}
      </style></head><body>
      <h1>${mosque.name}</h1>
      <p>সদস্য তালিকা — মোট ${members.length} জন</p>
      <table><thead><tr><th>ক্রমিক</th><th>নাম</th><th>পিতার নাম</th><th>মোবাইল</th><th>ঠিকানা</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <Layout>
      <PageHeader
        title="সদস্য তালিকা"
        subtitle="মসজিদের সদস্যদের তথ্য যুক্ত করুন এবং তালিকা ডাউনলোড করুন।"
      />

      <div className="px-4 pb-10">
        {/* ফর্ম */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-primary">নতুন সদস্য যুক্ত করুন</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                ঠিকানা ড্রপডাউন থেকে নির্বাচন করুন অথবা নতুন ঠিকানা যুক্ত করুন।
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

        {/* তালিকা ও ডাউনলোড */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-primary">
              সদস্য তালিকা ({members.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={downloadExcel}
                disabled={members.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-soft disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" /> এক্সেল
              </button>
              <button
                onClick={downloadPdf}
                disabled={members.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-soft disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" /> পিডিএফ
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              এখনো কোনো সদস্য যুক্ত করা হয়নি।
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">নাম</th>
                    <th className="py-2 pr-2">পিতার নাম</th>
                    <th className="py-2 pr-2">মোবাইল</th>
                    <th className="py-2">ঠিকানা</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={m.id} className="border-b border-border/60">
                      <td className="py-2 pr-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 pr-2 font-medium text-foreground">{m.name}</td>
                      <td className="py-2 pr-2 text-foreground">{m.father_name}</td>
                      <td className="py-2 pr-2 text-foreground">{m.mobile}</td>
                      <td className="py-2 text-muted-foreground">{m.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
