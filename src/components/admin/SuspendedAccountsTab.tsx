import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, UserX, UserCheck, HandCoins, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  member_no: number;
  name: string;
  mobile: string;
  address: string;
  monthly_donation: number;
  created_at: string;
  account_override: string | null;
  account_note: string | null;
};

type Slot = { year: number; month: number };

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const bn = (n: number | string) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const slotLabel = (s: Slot) => `${BN_MONTHS[s.month - 1]} ${bn(s.year)}`;

// আদায় কার্যক্রম শুরু: জুলাই ২০২৬
const START_YEAR = 2026;
const START_MONTH = 7;

/** চলতি মাস বাদে সম্পন্ন মাসগুলোর তালিকা (সদস্য যোগদানের পর থেকে) */
function completedMonths(createdAt: string | null): Slot[] {
  const now = new Date();
  let y = START_YEAR;
  let m = START_MONTH;
  const created = createdAt ? new Date(createdAt) : null;
  if (created) {
    const cy = created.getFullYear();
    const cm = created.getMonth() + 1;
    if (cy * 12 + cm > y * 12 + m) {
      y = cy;
      m = cm;
    }
  }
  const endIdx = now.getFullYear() * 12 + now.getMonth(); // চলতি মাসের আগের মাস
  const out: Slot[] = [];
  let idx = y * 12 + m;
  while (idx <= endIdx && out.length < 120) {
    out.push({ year: Math.floor((idx - 1) / 12), month: ((idx - 1) % 12) + 1 });
    idx += 1;
  }
  return out;
}

export function SuspendedAccountsTab() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Row[]>([]);
  const [paidKeys, setPaidKeys] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"suspended" | "all">("suspended");
  const [payTarget, setPayTarget] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [mRes, cRes] = await Promise.all([
      supabase
        .from("members")
        .select(
          "id, member_no, name, mobile, address, monthly_donation, created_at, account_override, account_note",
        )
        .order("member_no", { ascending: true }),
      supabase.from("donation_collections").select("member_id, year, month"),
    ]);
    setMembers(((mRes.data as Row[] | null) ?? []).map((m) => m));
    const set = new Set<string>();
    (cRes.data ?? []).forEach((c: { member_id: string | null; year: number; month: number }) => {
      if (c.member_id) set.add(`${c.member_id}|${c.year}|${c.month}`);
    });
    setPaidKeys(set);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .map((m) => {
        const due = completedMonths(m.created_at).filter(
          (s) => !paidKeys.has(`${m.id}|${s.year}|${s.month}`),
        );
        // স্বয়ংক্রিয় সাসপেন্ড আপাতত অফ — শুধু ম্যানুয়াল সাসপেন্ড চালু।
        const autoSuspended = false;
        const effective = m.account_override === "suspended";
        return { m, due, autoSuspended, effective };

      })
      .filter((r) => (filter === "suspended" ? r.effective : r.due.length > 0 || r.effective))
      .filter((r) =>
        q
          ? String(r.m.member_no).includes(q) ||
            (r.m.mobile ?? "").includes(q) ||
            (r.m.name ?? "").toLowerCase().includes(q)
          : true,
      );
  }, [members, paidKeys, query, filter]);

  const setOverride = async (m: Row, value: "active" | "suspended" | null) => {
    setBusyId(m.id);
    const { error } = await supabase
      .from("members")
      .update({ account_override: value } as never)
      .eq("id", m.id);
    setBusyId(null);
    if (error) {
      toast.error("পরিবর্তন সংরক্ষণ করা যায়নি।");
      return;
    }
    setMembers((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, account_override: value } : x)),
    );
    toast.success(
      value === "active"
        ? "একাউন্ট সচল করা হয়েছে।"
        : value === "suspended"
          ? "একাউন্ট বন্ধ করা হয়েছে।"
          : "স্বয়ংক্রিয় নিয়মে ফিরিয়ে আনা হয়েছে।",
    );
  };

  const totalDueAmount = rows.reduce(
    (s, r) => s + r.due.length * (Number(r.m.monthly_donation) || 0),
    0,
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম / মোবাইল / সদস্য নম্বর"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-9 text-sm outline-none focus:border-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "suspended" | "all")}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        >
          <option value="suspended">শুধু বন্ধ একাউন্ট</option>
          <option value="all">বকেয়া সহ সবাই</option>
        </select>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" /> রিফ্রেশ
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
          <p className="text-xs text-rose-700">বন্ধ একাউন্ট</p>
          <p className="text-xl font-extrabold text-rose-900">
            {bn(rows.filter((r) => r.effective).length)} জন
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-700">মোট বকেয়া মাস</p>
          <p className="text-xl font-extrabold text-amber-900">
            {bn(rows.reduce((s, r) => s + r.due.length, 0))}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:col-span-1">
          <p className="text-xs text-emerald-700">আনুমানিক বকেয়া টাকা</p>
          <p className="text-xl font-extrabold text-emerald-900">{bn(totalDueAmount)} ৳</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
        </div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">কোনো তথ্য নেই।</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.m.id}
              className={`rounded-2xl border p-3 ${r.effective ? "border-rose-200 bg-rose-50/60" : "border-border bg-card"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {r.m.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (নং {bn(r.m.member_no)})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{bn(r.m.mobile)} · {r.m.address}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.effective ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}
                >
                  {r.effective ? "বন্ধ" : "সচল"}
                  {r.m.account_override ? " (ম্যানুয়াল)" : ""}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                বকেয়া মাস: {r.due.length ? r.due.map(slotLabel).join(", ") : "নেই"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={r.due.length === 0}
                  onClick={() => setPayTarget(r.m)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                >
                  <HandCoins className="h-4 w-4" /> বকেয়া আদায়
                </button>
                {r.effective ? (
                  <button
                    type="button"
                    disabled={busyId === r.m.id}
                    onClick={() => setOverride(r.m, "active")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <UserCheck className="h-4 w-4" /> একাউন্ট সচল করুন
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === r.m.id}
                    onClick={() => setOverride(r.m, "suspended")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <UserX className="h-4 w-4" /> একাউন্ট বন্ধ করুন
                  </button>
                )}
                {r.m.account_override && (
                  <button
                    type="button"
                    disabled={busyId === r.m.id}
                    onClick={() => setOverride(r.m, null)}
                    className="rounded-xl border border-border px-3 py-2 text-xs font-bold hover:bg-muted disabled:opacity-50"
                  >
                    স্বয়ংক্রিয় নিয়মে ফেরান
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {payTarget && (
        <DuesDialog
          member={payTarget}
          due={completedMonths(payTarget.created_at).filter(
            (s) => !paidKeys.has(`${payTarget.id}|${s.year}|${s.month}`),
          )}
          onClose={() => setPayTarget(null)}
          onDone={async () => {
            setPayTarget(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function DuesDialog({
  member,
  due,
  onClose,
  onDone,
}: {
  member: Row;
  due: Slot[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [picked, setPicked] = useState<string[]>(due.map((s) => `${s.year}-${s.month}`));
  const [amount, setAmount] = useState(String(Number(member.monthly_donation) || 0));
  const [note, setNote] = useState("");
  const [activate, setActivate] = useState(true);
  const [saving, setSaving] = useState(false);

  const perMonth = Number(amount) || 0;
  const total = perMonth * picked.length;

  const toggle = (key: string) =>
    setPicked((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));

  const save = async () => {
    if (picked.length === 0) {
      toast.error("অন্তত একটি মাস নির্বাচন করুন।");
      return;
    }
    if (perMonth <= 0) {
      toast.error("সঠিক টাকার পরিমাণ দিন।");
      return;
    }
    setSaving(true);
    const rows = picked.map((k) => {
      const [y, m] = k.split("-").map(Number);
      return {
        member_id: member.id,
        member_no: member.member_no,
        member_name: member.name,
        mobile: member.mobile,
        amount: perMonth,
        year: y,
        month: m,
        note: note.trim() || "বকেয়া আদায়",
      };
    });
    const { error } = await supabase.from("donation_collections").insert(rows);
    if (!error && activate) {
      await supabase.from("members").update({ account_override: null } as never).eq("id", member.id);
    }
    setSaving(false);
    if (error) {
      toast.error("আদায় সংরক্ষণ করা যায়নি।");
      return;
    }
    toast.success("বকেয়া আদায় সংরক্ষণ করা হয়েছে।");
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-card p-4 sm:max-w-lg sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-extrabold">বকেয়া আদায় — {member.name}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          {due.map((s) => {
            const key = `${s.year}-${s.month}`;
            const on = picked.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
              >
                {slotLabel(s)}
              </button>
            );
          })}
        </div>

        <label className="mb-1 block text-xs font-bold text-muted-foreground">
          প্রতি মাসের পরিমাণ (৳)
        </label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />

        <label className="mb-1 block text-xs font-bold text-muted-foreground">নোট</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="বকেয়া আদায়"
          className="mb-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />

        <label className="mb-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activate}
            onChange={(e) => setActivate(e.target.checked)}
            className="h-4 w-4"
          />
          আদায়ের পর একাউন্ট সচল করুন
        </label>

        <div className="mb-3 rounded-xl bg-muted px-3 py-2 text-sm font-bold">
          মোট: {bn(total)} ৳ ({bn(picked.length)} মাস)
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCoins className="h-4 w-4" />}
          আদায় সংরক্ষণ করুন
        </button>
      </div>
    </div>
  );
}
