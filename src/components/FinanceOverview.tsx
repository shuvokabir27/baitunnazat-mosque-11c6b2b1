import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Landmark, HandCoins, Coins, MoonStar } from "lucide-react";
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

type Entry = { year: number; month: number; kind: string; amount: number };

type Row = {
  key: string;
  label: string;
  opening: number;
  income: number;
  totalIncome: number;
  expense: number;
  closing: number;
};

export function FinanceOverview() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("finance_entries")
        .select("year, month, kind, amount")
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
    const map = new Map<string, { year: number; month: number; income: number; expense: number }>();
    for (const e of entries) {
      const key = `${e.year}-${e.month}`;
      const cur = map.get(key) ?? { year: e.year, month: e.month, income: 0, expense: 0 };
      if (e.kind === "income") cur.income += Number(e.amount);
      else if (e.kind === "expense") cur.expense += Number(e.amount);
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

      {/* টেবিল */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[540px] text-xs sm:text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-2.5 py-2.5 text-left font-semibold sm:px-3 sm:py-3">মাস</th>
              <th className="px-2.5 py-2.5 text-right font-semibold sm:px-3 sm:py-3">গত মাসের জের</th>
              <th className="px-2.5 py-2.5 text-right font-semibold sm:px-3 sm:py-3">এ মাসের আয়</th>
              <th className="px-2.5 py-2.5 text-right font-semibold sm:px-3 sm:py-3">মোট আয়</th>
              <th className="px-2.5 py-2.5 text-right font-semibold sm:px-3 sm:py-3">এ মাসের ব্যয়</th>
              <th className="px-2.5 py-2.5 text-right font-semibold sm:px-3 sm:py-3">স্থিতি</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key} className={i % 2 ? "bg-muted/40" : "bg-card"}>
                <td className="px-2.5 py-2.5 font-medium text-foreground sm:px-3">{r.label}</td>
                <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-600 sm:px-3">{money(r.opening)}</td>
                <td className="px-2.5 py-2.5 text-right tabular-nums text-emerald-700 sm:px-3">{money(r.income)}</td>
                <td className="px-2.5 py-2.5 text-right tabular-nums font-medium text-foreground sm:px-3">{money(r.totalIncome)}</td>
                <td className="px-2.5 py-2.5 text-right tabular-nums text-rose-700 sm:px-3">{money(r.expense)}</td>
                <td className="px-2.5 py-2.5 text-right tabular-nums font-bold text-lime-700 sm:px-3">{money(r.closing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        প্রতি মাসের ১ তারিখে গত মাসের স্থিতি স্বয়ংক্রিয়ভাবে পরের মাসের জের হিসেবে যোগ হয়।
      </p>
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
