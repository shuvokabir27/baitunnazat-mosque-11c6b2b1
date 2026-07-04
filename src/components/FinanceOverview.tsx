import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Landmark, HandCoins, Coins, MoonStar, ChevronDown, FileDown } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
} from "recharts";

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

const bn = (n: number) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
export const money = (n: number) => {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "৳ " + s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
};

type Entry = { year: number; month: number; kind: string; amount: number; note: string | null };
type Item = { note: string; amount: number };

type Row = {
  key: string;
  label: string;
  opening: number;
  income: number;
  totalIncome: number;
  expense: number;
  closing: number;
  incomeItems: Item[];
  expenseItems: Item[];
};

export function FinanceOverview() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("finance_entries")
        .select("year, month, kind, amount, note")
        .order("year", { ascending: true })
        .order("month", { ascending: true });
      if (!cancelled) {
        setEntries((data as Entry[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo<Row[]>(() => {
    type Agg = { year: number; month: number; income: number; expense: number; incomeItems: Item[]; expenseItems: Item[] };
    const map = new Map<string, Agg>();
    for (const e of entries) {
      const key = `${e.year}-${e.month}`;
      const cur = map.get(key) ?? { year: e.year, month: e.month, income: 0, expense: 0, incomeItems: [], expenseItems: [] };
      const item: Item = { note: (e.note ?? "").trim(), amount: Number(e.amount) };
      if (e.kind === "income") {
        cur.income += Number(e.amount);
        cur.incomeItems.push(item);
      } else if (e.kind === "expense") {
        cur.expense += Number(e.amount);
        cur.expenseItems.push(item);
      }
      map.set(key, cur);
    }
    const sorted = [...map.values()].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month,
    );
    let opening = 0;
    return sorted.map((m) => {
      const totalIncome = opening + m.income;
      const closing = totalIncome - m.expense;
      const row: Row = {
        key: `${m.year}-${m.month}`,
        label: `${BN_MONTHS[m.month - 1]} ${bn(m.year)}`,
        opening,
        income: m.income,
        totalIncome,
        expense: m.expense,
        closing,
        incomeItems: m.incomeItems,
        expenseItems: m.expenseItems,
      };
      opening = closing;
      return row;
    });
  }, [entries]);

  const latest = rows[rows.length - 1];

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        name: r.label,
        আয়: Math.round(r.income),
        ব্যয়: Math.round(r.expense),
        স্থিতি: Math.round(r.closing),
      })),
    [rows],
  );

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">লোড হচ্ছে…</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        এখনো কোনো হিসাব যুক্ত করা হয়নি।
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* সারাংশ কার্ড — চলতি মাস */}
      {latest && (
        <div>
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            সর্বশেষ মাস: <span className="font-bold text-foreground">{latest.label}</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
            <SummaryCard
              icon={<Landmark className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="গত মাসের জের"
              value={money(latest.opening)}
              tone="bg-slate-100 text-slate-700"
            />
            <SummaryCard
              icon={<HandCoins className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="এ মাসের আয়"
              value={money(latest.income)}
              tone="bg-emerald-100 text-emerald-700"
            />
            <SummaryCard
              icon={<Coins className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="এ মাসের ব্যয়"
              value={money(latest.expense)}
              tone="bg-rose-100 text-rose-700"
            />
            <SummaryCard
              icon={<MoonStar className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="বর্তমান স্থিতি"
              value={money(latest.closing)}
              tone="bg-lime-100 text-lime-700"
            />
          </div>
        </div>
      )}

      {/* চার্ট */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <h3 className="mb-4 text-center text-base font-bold text-foreground sm:text-lg">
          আয়-ব্যয় ও স্থিতির চিত্র
        </h3>
        <div className="h-64 w-full sm:h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} width={44} tickFormatter={(v) => bn(v as number)} />
              <Tooltip formatter={(v: number) => money(v)} labelStyle={{ fontWeight: 700 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="আয়" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ব্যয়" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="স্থিতি" stroke="#65a30d" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* মাসভিত্তিক তালিকা — মোবাইলে কার্ড (স্ক্রল ছাড়াই সব দেখা যায়) */}
      <div className="space-y-3 sm:hidden">
        {[...rows].reverse().map((r) => {
          const open = expanded === r.key;
          const hasDetail = r.incomeItems.length > 0 || r.expenseItems.length > 0;
          return (
            <div
              key={r.key}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              {/* হেডার — মাস + আয় ও ব্যয় */}
              <button
                type="button"
                onClick={() => hasDetail && setExpanded(open ? null : r.key)}
                className="flex w-full items-center gap-2 px-3 py-3 text-left sm:px-4"
              >
                {hasDetail && (
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-foreground sm:text-base">
                  {r.label}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700 sm:text-xs">
                    আয় {money(r.income)}
                  </span>
                  <span className="rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700 sm:text-xs">
                    ব্যয় {money(r.expense)}
                  </span>
                </span>
              </button>

              {/* বিস্তারিত */}
              {open && (
                <div className="border-t border-border bg-muted/20 px-3 py-3 sm:px-4">
                  <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniStat label="গত মাসের জের" value={money(r.opening)} className="text-slate-600" />
                    <MiniStat label="মোট আয়" value={money(r.totalIncome)} className="text-emerald-700" />
                    <MiniStat label="মোট ব্যয়" value={money(r.expense)} className="text-rose-700" />
                    <MiniStat label="স্থিতি" value={money(r.closing)} className="font-bold text-lime-700" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <BreakdownList title="কি বাবদ আয়" titleClass="text-emerald-700" items={r.incomeItems} />
                    <BreakdownList title="কি বাবদ ব্যয়" titleClass="text-rose-700" items={r.expenseItems} />
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadMonthPdf(r)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    <FileDown className="h-4 w-4" />
                    এই মাসের হিসাব পিডিএফ ডাউনলোড
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        প্রতিটি মাসে ক্লিক করে কি বাবদ আয় ও ব্যয় হয়েছে তার বিস্তারিত দেখুন ও পিডিএফ ডাউনলোড করুন। প্রতি মাসের ১ তারিখে গত মাসের স্থিতি স্বয়ংক্রিয়ভাবে পরের মাসের জের হিসেবে যোগ হয়।
      </p>
    </div>
  );
}

function downloadMonthPdf(r: Row) {
  const rowsHtml = (items: Item[]) =>
    items.length === 0
      ? `<tr><td colspan="2" style="padding:8px;color:#888;">কোনো তথ্য নেই।</td></tr>`
      : items
          .map(
            (it) =>
              `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">${escapeHtml(it.note || "বিবরণ নেই")}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${money(it.amount)}</td></tr>`,
          )
          .join("");

  const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8" />
<title>${r.label} — আয়-ব্যয় হিসাব</title>
<style>
  * { font-family: 'Noto Sans Bengali', 'SolaimanLipi', system-ui, sans-serif; }
  body { margin: 32px; color: #1a1a1a; }
  h1 { text-align: center; font-size: 20px; margin: 0 0 4px; }
  .sub { text-align: center; color: #555; margin: 0 0 20px; font-size: 13px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .stat { border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
  .stat b { display: block; font-size: 11px; color: #666; font-weight: normal; }
  .stat span { font-size: 16px; font-weight: bold; }
  h2 { font-size: 14px; margin: 16px 0 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; background: #1a7a4c; color: #fff; padding: 6px 8px; }
  th:last-child { text-align: right; }
</style></head><body>
<h1>${r.label}</h1>
<p class="sub">আয়-ব্যয় হিসাব</p>
<div class="grid">
  <div class="stat"><b>গত মাসের জের</b><span>${money(r.opening)}</span></div>
  <div class="stat"><b>এ মাসের আয়</b><span>${money(r.income)}</span></div>
  <div class="stat"><b>মোট আয়</b><span>${money(r.totalIncome)}</span></div>
  <div class="stat"><b>এ মাসের ব্যয়</b><span>${money(r.expense)}</span></div>
  <div class="stat"><b>স্থিতি</b><span>${money(r.closing)}</span></div>
</div>
<h2>কি বাবদ আয়</h2>
<table><tr><th>বিবরণ</th><th>পরিমাণ</th></tr>${rowsHtml(r.incomeItems)}</table>
<h2>কি বাবদ ব্যয়</h2>
<table><tr><th>বিবরণ</th><th>পরিমাণ</th></tr>${rowsHtml(r.expenseItems)}</table>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function MiniStat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2 text-center">
      <p className="text-[10px] text-muted-foreground sm:text-[11px]">{label}</p>
      <p className={`mt-0.5 text-xs tabular-nums sm:text-sm ${className ?? ""}`}>{value}</p>
    </div>
  );
}

function BreakdownList({
  title,
  titleClass,
  items,
}: {
  title: string;
  titleClass: string;
  items: Item[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <h4 className={`mb-2 text-sm font-bold ${titleClass}`}>{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">কোনো তথ্য নেই।</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <span className="min-w-0 truncate text-foreground">
                {it.note || "বিবরণ নেই"}
              </span>
              <span className="shrink-0 tabular-nums font-medium text-foreground">{money(it.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-2.5 text-center shadow-sm sm:p-3">
      <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9 ${tone}`}>
        {icon}
      </div>
      <p className="text-[11px] text-muted-foreground sm:text-xs">{label}</p>
      <p className="mt-0.5 text-xs font-bold tabular-nums text-foreground sm:text-sm">{value}</p>
    </div>
  );
}
