import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  listStaffAccounts,
  createStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  type StaffAccount,
} from "@/lib/staff-accounts.functions";
import {
  LogOut,
  Save,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  LayoutDashboard,
  Images,
  FileText,
  Clock,
  Users,
  UsersRound,
  Home,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HardHat,
  Settings,
  HandCoins,
  ExternalLink,
  X,
  Phone,
  MapPin,
  UserPlus,
  FileSpreadsheet,
  FileDown,
  Pencil,
  Check,
  MessageCircleQuestion,
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  ScrollText,
  UserCog,
  KeyRound,


} from "lucide-react";
import { mosque } from "@/lib/mosque-data";
import { defaultContent, mergeContent, type SiteContent } from "@/lib/site-content";
import { ImageCropUpload } from "@/components/ImageCropUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "অ্যাডমিন প্যানেল" }] }),
  component: AdminPage,
});

type Status = "loading" | "denied" | "ready";
type UserRole = "admin" | "finance";

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<Status>("loading");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [tab, setTab] = useState<Tab>("mosque");
  const [role, setRole] = useState<UserRole>("admin");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Wait until the auth session is restored so the bearer token is
      // attached to server-function calls (avoids a false "denied" right
      // after login).
      let session = (await supabase.auth.getSession()).data.session;
      for (let i = 0; i < 10 && !session; i++) {
        await new Promise((r) => setTimeout(r, 200));
        session = (await supabase.auth.getSession()).data.session;
      }
      if (cancelled) return;
      if (!session) {
        navigate({ to: "/auth" });
        return;
      }

      // Retry the role check a couple of times in case the token is still
      // propagating to the server.
      let roles: string[] | null = null;
      for (let i = 0; i < 3; i++) {
        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          if (error) throw error;
          roles = (data ?? []).map((r) => r.role as string);
          break;
        } catch {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      if (cancelled) return;
      const isAdmin = roles?.includes("admin") ?? false;
      const isFinance = roles?.includes("finance") ?? false;
      if (!isAdmin && !isFinance) {
        setStatus("denied");
        return;
      }
      const resolvedRole: UserRole = isAdmin ? "admin" : "finance";
      setRole(resolvedRole);
      if (resolvedRole === "finance") setTab("collections");

      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("content")
          .eq("id", 1)
          .maybeSingle();
        if (error) throw error;
        const loaded = mergeContent((data?.content as Partial<SiteContent>) ?? null);
        if (cancelled) return;
        setContent(loaded);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const clean = mergeContent(content);
      const { error } = await supabase
        .from("site_content")
        .update({ content: clean, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      setContent(clean);
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setShowVisit(true);
      setTimeout(() => setShowVisit(false), 5000);
    } catch (e) {
      alert("সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary/30 px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">
          আপনার এই পেজে প্রবেশের অনুমতি নেই।
        </p>
        <button onClick={signOut} className="rounded-xl bg-card px-5 py-2 text-sm font-semibold text-primary shadow-soft">
          লগ আউট
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#1d2327]">
      {/* Top admin bar (WordPress style) */}
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-[#1d2327] px-3 text-white">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Home className="h-4 w-4" />
            বায়তুন নাজাত
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ExternalLink className="h-4 w-4" />
            সাইট ভিজিট
          </a>
          {role === "admin" && (
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded bg-[#2271b1] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#135e96] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              পরিবর্তন সংরক্ষণ
            </button>
          )}
          <button
            onClick={signOut}
            className="grid h-8 w-8 place-items-center rounded text-white/80 hover:bg-white/10"
            aria-label="লগ আউট"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {showVisit && (
        <div className="fixed bottom-5 right-5 z-[60] w-72 animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-[#c3c4c7] bg-white p-4 shadow-lg">
          <button
            onClick={() => setShowVisit(false)}
            className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded text-[#646970] hover:bg-[#f0f0f1]"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-[#1d2327]">সফলভাবে সংরক্ষিত হয়েছে ✓</p>
          <p className="mt-1 text-xs text-[#646970]">পরিবর্তনগুলো সাইটে দেখুন।</p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded bg-[#2271b1] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#135e96]"
          >
            <ExternalLink className="h-4 w-4" />
            সাইট ভিজিট করুন
          </a>
        </div>
      )}

      {saved && (
        <p className="bg-[#00a32a] py-1.5 text-center text-xs font-semibold text-white">
          সফলভাবে সংরক্ষিত হয়েছে ✓
        </p>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar tab={tab} setTab={setTab} role={role} />

        {/* Content area */}
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 text-2xl font-normal text-[#1d2327]">{TAB_LABELS[tab]}</h2>
            <div className="rounded border border-[#c3c4c7] bg-white p-5 shadow-sm">
              <div className="space-y-6">
                {tab === "site" && <SiteTab content={content} setContent={setContent} />}
                {tab === "mosque" && <MosqueTab content={content} setContent={setContent} />}
                {tab === "slider" && <SliderTab content={content} setContent={setContent} />}
                {tab === "sections" && <SectionsTab content={content} setContent={setContent} />}
                {tab === "marquee" && <MarqueeTab content={content} setContent={setContent} />}
                {tab === "prayer" && <PrayerTab content={content} setContent={setContent} />}
                {tab === "staff" && <StaffTab content={content} setContent={setContent} />}
                {tab === "committee" && <CommitteeTab content={content} setContent={setContent} />}
                {tab === "footer" && <FooterTab content={content} setContent={setContent} />}
                {tab === "ibadah" && <IbadahTab content={content} setContent={setContent} />}
                {tab === "development" && <DevelopmentTab content={content} setContent={setContent} />}
                {tab === "donate" && <DonateTab content={content} setContent={setContent} />}
                {tab === "leads" && <LeadsTab />}
                {tab === "masala" && <MasalaTab />}
                {tab === "qa" && <QaTab />}
                {tab === "addresses" && <AddressesTab />}
                {tab === "members" && <MembersTab role={role} />}
                {tab === "collections" && <CollectionsTab role={role} />}
                {tab === "finance" && <FinanceTab role={role} />}
                {tab === "users" && role === "admin" && <StaffAccountsTab />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

type Tab = "site" | "mosque" | "slider" | "sections" | "marquee" | "prayer" | "staff" | "committee" | "ibadah" | "development" | "donate" | "footer" | "leads" | "masala" | "qa" | "addresses" | "members" | "collections" | "finance" | "users";

// Tabs a "finance" role staff user is allowed to access.
const FINANCE_TABS: Tab[] = ["members", "collections", "finance"];
const TAB_LABELS: Record<Tab, string> = {
  site: "সাইট সেটিংস",
  mosque: "মসজিদ",
  slider: "স্লাইডার",
  sections: "সেকশন লেখা",
  marquee: "স্ক্রোলিং টাইটেল",
  prayer: "নামাজ",
  staff: "দায়িত্বপ্রাপ্ত",
  committee: "কমিটি",
  ibadah: "ইবাদত পেজ",
  development: "উন্নয়ন কাজ",
  donate: "দান",
  footer: "ফুটার",
  leads: "যোগাযোগ তালিকা",
  masala: "মাসয়ালা আবেদন",
  qa: "সরাসরি প্রশ্ন উত্তর",
  addresses: "ঠিকানা তালিকা",
  members: "সদস্য তালিকা",
  collections: "দান আদায়",
  finance: "আয়-ব্যয় হিসাব",
  users: "ইউজার ও রোল",
};

const TAB_ICONS: Record<Tab, typeof LayoutDashboard> = {
  site: Settings,
  mosque: LayoutDashboard,
  slider: Images,
  sections: FileText,
  marquee: ScrollText,
  prayer: Clock,
  staff: Users,
  committee: UsersRound,
  ibadah: BookOpen,
  development: HardHat,
  donate: HandCoins,
  footer: MessageSquare,
  leads: Phone,
  masala: MessageCircleQuestion,
  qa: MessageCircleQuestion,
  addresses: MapPin,
  members: UserPlus,
  collections: HandCoins,
  finance: Wallet,
  users: UserCog,
};

const TAB_GROUPS: {
  label: string;
  tabs: Tab[];
  labelColor: string;
  activeBg: string;
  itemText: string;
  hoverBg: string;
  accentBar: string;
  tint: string;
}[] = [
  {
    label: "ওয়েবসাইট কন্টেন্ট",
    tabs: ["site", "mosque", "slider", "sections", "marquee", "prayer", "ibadah", "footer"],
    labelColor: "text-[#72aee6]",
    activeBg: "bg-[#2271b1]",
    itemText: "text-[#9cc8ee]",
    hoverBg: "hover:bg-[#2271b1]/20 hover:text-white",
    accentBar: "bg-[#2271b1]",
    tint: "bg-[#2271b1]/10",
  },
  {
    label: "মানুষ ও কমিটি",
    tabs: ["staff", "committee", "members"],
    labelColor: "text-[#a78bdb]",
    activeBg: "bg-[#7c5cbf]",
    itemText: "text-[#c6b3ec]",
    hoverBg: "hover:bg-[#7c5cbf]/20 hover:text-white",
    accentBar: "bg-[#7c5cbf]",
    tint: "bg-[#7c5cbf]/10",
  },
  {
    label: "দান ও উন্নয়ন",
    tabs: ["donate", "development", "collections", "finance"],
    labelColor: "text-[#4ab89a]",
    activeBg: "bg-[#1f9d78]",
    itemText: "text-[#7ad6bd]",
    hoverBg: "hover:bg-[#1f9d78]/20 hover:text-white",
    accentBar: "bg-[#1f9d78]",
    tint: "bg-[#1f9d78]/10",
  },
  {
    label: "আবেদন ও যোগাযোগ",
    tabs: ["leads", "masala", "qa", "addresses"],
    labelColor: "text-[#e0a458]",
    activeBg: "bg-[#cc7a22]",
    itemText: "text-[#f0c184]",
    hoverBg: "hover:bg-[#cc7a22]/20 hover:text-white",
    accentBar: "bg-[#cc7a22]",
    tint: "bg-[#cc7a22]/10",
  },
  {
    label: "ব্যবহারকারী",
    tabs: ["users"],
    labelColor: "text-[#e06a6a]",
    activeBg: "bg-[#c0392b]",
    itemText: "text-[#eda6a6]",
    hoverBg: "hover:bg-[#c0392b]/20 hover:text-white",
    accentBar: "bg-[#c0392b]",
    tint: "bg-[#c0392b]/10",
  },
];

function Sidebar({ tab, setTab, role }: { tab: Tab; setTab: (t: Tab) => void; role: UserRole }) {
  const groups =
    role === "finance"
      ? TAB_GROUPS.map((g) => ({ ...g, tabs: g.tabs.filter((t) => FINANCE_TABS.includes(t)) })).filter(
          (g) => g.tabs.length > 0,
        )
      : TAB_GROUPS;
  return (
    <nav className="flex shrink-0 gap-3 overflow-x-auto bg-[#1d2327] p-1.5 text-[#f0f0f1] md:w-52 md:flex-col md:gap-2 md:overflow-visible md:p-2 md:py-3 md:min-h-[calc(100vh-3rem)]">
      {groups.map((group) => (
        <div
          key={group.label}
          className={`flex shrink-0 gap-1 rounded-lg md:flex-col md:gap-0.5 md:p-1.5 ${group.tint}`}
        >
          <span className={`hidden items-center gap-2 px-2 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider md:flex ${group.labelColor}`}>
            <span className={`h-3 w-1 rounded-full ${group.accentBar}`} />
            {group.label}
          </span>
          {group.tabs.map((t) => {
            const Icon = TAB_ICONS[t];
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors md:w-full md:py-2.5 ${
                  active
                    ? `${group.activeBg} font-semibold text-white shadow-sm`
                    : `${group.itemText} ${group.hoverBg}`
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {TAB_LABELS[t]}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}


type Lead = { id: string; name: string | null; phone: string; created_at: string; called: boolean };

function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("volunteer_leads")
      .select("id, name, phone, created_at, called")
      .order("created_at", { ascending: false });
    if (e) setError("তালিকা লোড করা যায়নি।");
    else setLeads((data as Lead[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleCalled = async (id: string, current: boolean) => {
    const next = !current;
    const { error: e } = await supabase.from("volunteer_leads").update({ called: next }).eq("id", id);
    if (e) {
      alert("আপডেট করা যায়নি।");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, called: next } : l)));
  };

  const startEdit = (l: Lead) => {
    setEditingId(l.id);
    setEditValue(l.name ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveName = async (id: string) => {
    const trimmed = editValue.trim();
    const next = trimmed.length > 0 ? trimmed.slice(0, 100) : null;
    setSavingName(true);
    const { error: e } = await supabase.from("volunteer_leads").update({ name: next }).eq("id", id);
    setSavingName(false);
    if (e) {
      alert("নাম সংরক্ষণ করা যায়নি।");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, name: next } : l)));
    cancelEdit();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-destructive">{error}</p>;
  }

  if (leads.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">এখনও কোনো নম্বর জমা পড়েনি।</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">মোট {leads.length} জন আগ্রহী ব্যক্তি যোগাযোগের জন্য নম্বর দিয়েছেন।</p>
      <div className="divide-y divide-border rounded-xl border border-border">
        {leads.map((l) => (
          <div key={l.id} className={`flex items-center justify-between gap-3 p-3 ${l.called ? "bg-emerald-50/50" : ""}`}>
            <div className="min-w-0 flex-1">
              {editingId === l.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName(l.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    maxLength={100}
                    placeholder="নাম লিখুন"
                    className="w-full min-w-0 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => saveName(l.id)}
                    disabled={savingName}
                    className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {savingName ? "..." : "সংরক্ষণ"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    বাতিল
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className={`truncate font-semibold ${l.name ? "text-foreground" : "text-muted-foreground italic"}`}>
                    {l.name || "নাম দেননি"}
                  </p>
                  <button
                    onClick={() => startEdit(l)}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    {l.name ? "এডিট" : "নাম যুক্ত করুন"}
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{l.phone}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(l.created_at).toLocaleString("bn-BD")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={`tel:${l.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg gradient-emerald px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <Phone className="h-4 w-4" />
                কল
              </a>
              <button
                onClick={() => toggleCalled(l.id, l.called)}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  l.called
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                aria-label={l.called ? "কল করা হয়েছে" : "কল করা হয়নি"}
              >
                {l.called ? "✓ কল করা হয়েছে" : "কল করুন"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type MasalaRow = {
  id: string;
  scholar_slug: string;
  scholar_name: string;
  scholar_role: string;
  subject: string;
  created_at: string;
};

type MasalaPeriod = "week" | "month" | "year" | "all";

function MasalaTab() {
  const [rows, setRows] = useState<MasalaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<MasalaPeriod>("month");
  const [scholarFilter, setScholarFilter] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<MasalaRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: e } = await supabase
      .from("masala_requests")
      .select("id, scholar_slug, scholar_name, scholar_role, subject, created_at")
      .order("created_at", { ascending: false });
    if (e) setError("তালিকা লোড করা যায়নি।");
    else setRows((data as MasalaRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const periodStart = (p: MasalaPeriod): number => {
    if (p === "all") return 0;
    const d = new Date();
    if (p === "week") d.setDate(d.getDate() - 7);
    else if (p === "month") d.setMonth(d.getMonth() - 1);
    else if (p === "year") d.setFullYear(d.getFullYear() - 1);
    return d.getTime();
  };

  const scholarOptions = Array.from(new Set(rows.map((r) => r.scholar_name).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "bn"),
  );

  const start = periodStart(period);
  const filtered = rows.filter((r) => {
    if (start && new Date(r.created_at).getTime() < start) return false;
    if (scholarFilter && r.scholar_name !== scholarFilter) return false;
    return true;
  });

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    const { error: e } = await supabase.from("masala_requests").delete().eq("id", confirmTarget.id);
    setDeleting(false);
    if (e) {
      alert("মুছে ফেলা যায়নি।");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== confirmTarget.id));
    setConfirmTarget(null);
  };

  const periodLabel: Record<MasalaPeriod, string> = {
    week: "সাপ্তাহিক",
    month: "মাসিক",
    year: "বাৎসরিক",
    all: "সর্বমোট",
  };

  const downloadExcel = () => {
    const header = ["তারিখ", "যাকে জিজ্ঞাসা", "পদবি", "মাসয়ালার বিষয়"];
    const rowsCsv = filtered.map((r) => [
      new Date(r.created_at).toLocaleString("bn-BD"),
      r.scholar_name,
      r.scholar_role,
      r.subject,
    ]);
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rowsCsv].map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `মাসয়ালা-আবেদন-${periodLabel[period]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const body = filtered
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${new Date(r.created_at).toLocaleString("bn-BD")}</td><td>${r.scholar_name} (${r.scholar_role})</td><td>${r.subject}</td></tr>`,
      )
      .join("");
    const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>মাসয়ালা আবেদন তালিকা</title>
      <style>
        body{font-family:'Noto Sans Bengali','Segoe UI',sans-serif;padding:24px;color:#1a1a1a}
        h1{font-size:18px;text-align:center;margin:0 0 4px}
        p{text-align:center;margin:0 0 16px;color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #999;padding:6px 8px;text-align:left;vertical-align:top}
        th{background:#0f6e4f;color:#fff}
      </style></head><body>
      <h1>${mosque.name}</h1>
      <p>মাসয়ালা আবেদন তালিকা (${periodLabel[period]}) — মোট ${filtered.length} টি</p>
      <table><thead><tr><th>ক্রম</th><th>তারিখ</th><th>যাকে জিজ্ঞাসা</th><th>মাসয়ালার বিষয়</th></tr></thead>
      <tbody>${body}</tbody></table>
      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {periodLabel[period]} মোট {filtered.length} টি আবেদন{filtered.length !== rows.length ? ` (সর্বমোট ${rows.length})` : ""}।
        </p>
        <div className="flex gap-2">
          <button
            onClick={downloadExcel}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" /> এক্সেল
          </button>
          <button
            onClick={downloadPdf}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" /> পিডিএফ / প্রিন্ট
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">সময়কাল</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as MasalaPeriod)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="week">সাপ্তাহিক (গত ৭ দিন)</option>
            <option value="month">মাসিক (গত ৩০ দিন)</option>
            <option value="year">বাৎসরিক (গত ১ বছর)</option>
            <option value="all">সর্বমোট</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">আলেম</label>
          <select
            value={scholarFilter}
            onChange={(e) => setScholarFilter(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">সবাই</option>
            {scholarOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">এই সময়কালে কোনো মাসয়ালা আবেদন নেই।</p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {r.scholar_name} <span className="text-xs font-normal text-muted-foreground">({r.scholar_role})</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{r.subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("bn-BD")}</p>
              </div>
              <button
                onClick={() => setConfirmTarget(r)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"
                aria-label="মুছুন"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <p className="text-sm font-semibold text-foreground">এই আবেদনটি মুছে ফেলবেন?</p>
            <p className="mt-1 text-xs text-muted-foreground">এই কাজটি ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "..." : "মুছে ফেলুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const toBengaliNum = (n: number) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

type QaCategory = { id: string; name: string; sort_order: number; published: boolean };
type QaRow = { id: string; question: string; answer: string; sort_order: number; published: boolean; category_id: string | null };

function QaTab() {
  const [rows, setRows] = useState<QaRow[]>([]);
  const [cats, setCats] = useState<QaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<QaRow | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<QaRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Category management
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [editCat, setEditCat] = useState<QaCategory | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [confirmCat, setConfirmCat] = useState<QaCategory | null>(null);

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  const load = async () => {
    setLoading(true);
    setError(null);
    const [catRes, qaRes] = await Promise.all([
      supabase
        .from("qa_categories")
        .select("id, name, sort_order, published")
        .order("sort_order", { ascending: true }),
      supabase
        .from("qa_entries")
        .select("id, question, answer, sort_order, published, category_id")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);
    if (catRes.error || qaRes.error) setError("তালিকা লোড করা যায়নি।");
    else {
      setCats((catRes.data as QaCategory[]) ?? []);
      setRows((qaRes.data as QaRow[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setCategoryId("");
    setPublished(true);
  };

  const startEdit = (r: QaRow) => {
    setEditing(r);
    setQuestion(r.question);
    setAnswer(r.answer);
    setCategoryId(r.category_id ?? "");
    setPublished(r.published);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async () => {
    const q = question.trim();
    const a = answer.trim();
    if (!q || !a) {
      toast.error("প্রশ্ন ও উত্তর দুটোই লিখুন।");
      return;
    }
    setSaving(true);
    if (editing) {
      const { error: e } = await supabase
        .from("qa_entries")
        .update({ question: q, answer: a, published, category_id: categoryId || null })
        .eq("id", editing.id);
      setSaving(false);
      if (e) {
        toast.error("সংরক্ষণ করা যায়নি।");
        return;
      }
      toast.success("আপডেট হয়েছে।");
    } else {
      const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
      const { error: e } = await supabase
        .from("qa_entries")
        .insert({ question: q, answer: a, published, sort_order: nextOrder, category_id: categoryId || null });
      setSaving(false);
      if (e) {
        toast.error("সংরক্ষণ করা যায়নি।");
        return;
      }
      toast.success("যুক্ত হয়েছে।");
    }
    resetForm();
    load();
  };

  const togglePublished = async (r: QaRow) => {
    const { error: e } = await supabase
      .from("qa_entries")
      .update({ published: !r.published })
      .eq("id", r.id);
    if (e) {
      toast.error("পরিবর্তন করা যায়নি।");
      return;
    }
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, published: !x.published } : x)));
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    const { error: e } = await supabase.from("qa_entries").delete().eq("id", confirmTarget.id);
    setDeleting(false);
    if (e) {
      toast.error("মুছে ফেলা যায়নি।");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== confirmTarget.id));
    setConfirmTarget(null);
  };

  // Reorder a question within its category group (swap sort_order with neighbour)
  const moveRow = async (groupItems: QaRow[], index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= groupItems.length) return;
    const a = groupItems[index];
    const b = groupItems[target];
    setRows((prev) =>
      prev.map((r) =>
        r.id === a.id ? { ...r, sort_order: b.sort_order } : r.id === b.id ? { ...r, sort_order: a.sort_order } : r,
      ),
    );
    await Promise.all([
      supabase.from("qa_entries").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("qa_entries").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  };

  const addCategory = async () => {
    const n = catName.trim();
    if (!n) {
      toast.error("ক্যাটাগরির নাম লিখুন।");
      return;
    }
    setCatSaving(true);
    const nextOrder = cats.length ? Math.max(...cats.map((c) => c.sort_order)) + 1 : 0;
    const { error: e } = await supabase
      .from("qa_categories")
      .insert({ name: n, sort_order: nextOrder });
    setCatSaving(false);
    if (e) {
      toast.error("ক্যাটাগরি যুক্ত করা যায়নি।");
      return;
    }
    setCatName("");
    load();
  };

  const saveCatEdit = async () => {
    if (!editCat) return;
    const n = editCatName.trim();
    if (!n) return;
    const { error: e } = await supabase
      .from("qa_categories")
      .update({ name: n })
      .eq("id", editCat.id);
    if (e) {
      toast.error("সংরক্ষণ করা যায়নি।");
      return;
    }
    setEditCat(null);
    load();
  };

  const toggleCatPublished = async (c: QaCategory) => {
    const { error: e } = await supabase
      .from("qa_categories")
      .update({ published: !c.published })
      .eq("id", c.id);
    if (e) {
      toast.error("পরিবর্তন করা যায়নি।");
      return;
    }
    setCats((prev) => prev.map((x) => (x.id === c.id ? { ...x, published: !x.published } : x)));
  };

  const moveCat = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= cats.length) return;
    const a = cats[index];
    const b = cats[target];
    setCats((prev) => {
      const next = [...prev];
      next[index] = { ...b };
      next[target] = { ...a };
      return next;
    });
    await Promise.all([
      supabase.from("qa_categories").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("qa_categories").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    load();
  };

  const deleteCat = async () => {
    if (!confirmCat) return;
    const { error: e } = await supabase.from("qa_categories").delete().eq("id", confirmCat.id);
    if (e) {
      toast.error("মুছে ফেলা যায়নি।");
      return;
    }
    setConfirmCat(null);
    load();
  };

  // Group questions by category (in category sort order), each group ordered by its own sort_order

  const groupedRows: { id: string; name: string; items: QaRow[] }[] = (() => {
    const groups: { id: string; name: string; items: QaRow[] }[] = [];
    for (const c of cats) {
      const items = rows.filter((r) => r.category_id === c.id);
      if (items.length) groups.push({ id: c.id, name: c.name, items });
    }
    const none = rows.filter((r) => !r.category_id || !cats.some((c) => c.id === r.category_id));
    if (none.length) groups.push({ id: "__none__", name: "ক্যাটাগরিবিহীন", items: none });
    return groups;
  })();


  return (
    <div>
      {/* Category management */}
      <div className="mb-6 rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">ক্যাটাগরি ব্যবস্থাপনা</h3>
        <div className="flex gap-2">
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="নতুন ক্যাটাগরির নাম"
            className={inputCls}
          />
          <button
            onClick={addCategory}
            disabled={catSaving}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {catSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            যুক্ত
          </button>
        </div>
        {cats.length > 0 && (
          <div className="mt-3 space-y-2">
            {cats.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveCat(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30"
                    title="উপরে"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveCat(i, 1)}
                    disabled={i === cats.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30"
                    title="নিচে"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                {editCat?.id === c.id ? (
                  <input
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <span className="flex-1 text-sm font-semibold text-foreground">
                    {toBengaliNum(i + 1)}। {c.name}
                  </span>
                )}
                <button
                  onClick={() => toggleCatPublished(c)}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    c.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                </button>
                {editCat?.id === c.id ? (
                  <>
                    <button
                      onClick={saveCatEdit}
                      className="shrink-0 rounded-lg bg-primary p-1.5 text-primary-foreground"
                      title="সংরক্ষণ"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditCat(null)}
                      className="shrink-0 rounded-lg bg-muted p-1.5 text-muted-foreground"
                      title="বাতিল"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditCat(c);
                        setEditCatName(c.name);
                      }}
                      className="shrink-0 rounded-lg bg-muted p-1.5 text-muted-foreground hover:text-primary"
                      title="সম্পাদনা"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmCat(c)}
                      className="shrink-0 rounded-lg bg-muted p-1.5 text-muted-foreground hover:text-destructive"
                      title="মুছুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">
          {editing ? "প্রশ্ন-উত্তর সম্পাদনা" : "নতুন প্রশ্ন-উত্তর যুক্ত করুন"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">ক্যাটাগরি</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">ক্যাটাগরিবিহীন</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">প্রশ্ন</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              placeholder="প্রশ্নটি লিখুন"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">উত্তর</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              placeholder="উত্তরটি লিখুন"
              className={inputCls}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4"
            />
            ওয়েবসাইটে প্রকাশ করুন
          </label>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editing ? "আপডেট করুন" : "যুক্ত করুন"}
            </button>
            {editing && (
              <button
                onClick={resetForm}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                বাতিল
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-destructive">{error}</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো প্রশ্ন-উত্তর যুক্ত করা হয়নি।</p>
      ) : (
        <div className="space-y-6">
          {groupedRows.map((group) => (
            <div key={group.id}>
              <h4 className="mb-2 text-sm font-bold text-primary">{group.name}</h4>
              <div className="space-y-3">
                {group.items.map((r, i) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2">
                        <div className="flex flex-col">
                          <button
                            onClick={() => moveRow(group.items, i, -1)}
                            disabled={i === 0}
                            className="rounded p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30"
                            title="উপরে"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveRow(group.items, i, 1)}
                            disabled={i === group.items.length - 1}
                            className="rounded p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30"
                            title="নিচে"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {toBengaliNum(i + 1)}। {r.question}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => startEdit(r)}
                          className="rounded-lg bg-muted p-1.5 text-muted-foreground hover:text-primary"
                          title="সম্পাদনা"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmTarget(r)}
                          className="rounded-lg bg-muted p-1.5 text-muted-foreground hover:text-destructive"
                          title="মুছুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.answer}</p>
                    <button
                      onClick={() => togglePublished(r)}
                      className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.published ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {r.published ? "প্রকাশিত" : "অপ্রকাশিত"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <p className="text-sm font-semibold text-foreground">এই প্রশ্ন-উত্তরটি মুছে ফেলবেন?</p>
            <p className="mt-1 text-xs text-muted-foreground">এই কাজটি ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "..." : "মুছে ফেলুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <p className="text-sm font-semibold text-foreground">এই ক্যাটাগরিটি মুছে ফেলবেন?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              এর প্রশ্ন-উত্তরগুলো ক্যাটাগরিবিহীন হয়ে যাবে।
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmCat(null)}
                className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground"
              >
                বাতিল
              </button>
              <button
                onClick={deleteCat}
                className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-white"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



type AddressRow = { id: string; label: string };

function AddressesTab() {
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: addrData }, { data: memberData }] = await Promise.all([
      supabase.from("member_addresses").select("id, label").order("label", { ascending: true }),
      supabase.from("members").select("address"),
    ]);
    setAddresses((addrData as AddressRow[]) ?? []);
    const map: Record<string, number> = {};
    ((memberData as { address: string }[]) ?? []).forEach((m) => {
      map[m.address] = (map[m.address] ?? 0) + 1;
    });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    const { error: e1 } = await supabase.from("member_addresses").insert({ label: trimmed.slice(0, 150) });
    setSaving(false);
    if (e1) {
      setError(e1.code === "23505" ? "এই ঠিকানা ইতিমধ্যে আছে।" : "যুক্ত করা যায়নি।");
      return;
    }
    setLabel("");
    await load();
  };

  const startEdit = (a: AddressRow) => {
    setEditId(a.id);
    setEditLabel(a.label);
    setError(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditLabel("");
  };

  const saveEdit = async (a: AddressRow) => {
    const trimmed = editLabel.trim().slice(0, 150);
    if (!trimmed || trimmed === a.label) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    setError(null);
    const { error: e1 } = await supabase
      .from("member_addresses")
      .update({ label: trimmed })
      .eq("id", a.id);
    if (e1) {
      setEditSaving(false);
      setError(e1.code === "23505" ? "এই ঠিকানা ইতিমধ্যে আছে।" : "সম্পাদনা করা যায়নি।");
      return;
    }
    // keep members in sync with the renamed address label
    await supabase.from("members").update({ address: trimmed }).eq("address", a.label);
    setEditSaving(false);
    cancelEdit();
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("এই ঠিকানা মুছে ফেলবেন?")) return;
    const { error: e1 } = await supabase.from("member_addresses").delete().eq("id", id);
    if (e1) {
      alert("মুছে ফেলা যায়নি।");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const downloadExcel = () => {
    const header = ["ক্রমিক", "ঠিকানা", "সদস্য সংখ্যা"];
    const rows = addresses.map((a, i) => [String(i + 1), a.label, String(counts[a.label] ?? 0)]);
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ঠিকানা-ডাটাশিট.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const rows = addresses
      .map((a, i) => `<tr><td>${i + 1}</td><td>${a.label}</td><td>${counts[a.label] ?? 0}</td></tr>`)
      .join("");
    const total = addresses.reduce((s, a) => s + (counts[a.label] ?? 0), 0);
    const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>ঠিকানা ডাটাশিট</title>
      <style>
        body{font-family:'Noto Sans Bengali','Segoe UI',sans-serif;padding:24px;color:#1a1a1a}
        h1{font-size:18px;text-align:center;margin:0 0 4px}
        p{text-align:center;margin:0 0 16px;color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #999;padding:6px 8px;text-align:left}
        th{background:#0f6e4f;color:#fff}
      </style></head><body>
      <h1>${mosque.name}</h1>
      <p>ঠিকানা ডাটাশিট — মোট ${addresses.length} টি ঠিকানা · ${total} জন সদস্য</p>
      <table><thead><tr><th>ক্রমিক</th><th>ঠিকানা</th><th>সদস্য সংখ্যা</th></tr></thead>
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        এখানে যুক্ত করা ঠিকানাগুলো সদস্য পেজের ড্রপডাউনে পাবলিক দেখতে পাবে।
      </p>
      <form onSubmit={add} className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="নতুন ঠিকানা লিখুন"
          maxLength={150}
          className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          যুক্ত করুন
        </button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">মোট {addresses.length} টি ঠিকানা।</p>
        <div className="flex gap-2">
          <button
            onClick={downloadExcel}
            disabled={addresses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" /> এক্সেল
          </button>
          <button
            onClick={downloadPdf}
            disabled={addresses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" /> পিডিএফ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো ঠিকানা যুক্ত করা হয়নি।</p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-3">
              {editId === a.id ? (
                <>
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    maxLength={150}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(a);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-primary bg-background px-3 py-1.5 text-sm outline-none"
                  />
                  <button
                    onClick={() => saveEdit(a)}
                    disabled={editSaving}
                    className="shrink-0 rounded-lg bg-emerald-600/10 p-2 text-emerald-600 hover:bg-emerald-600/20 disabled:opacity-60"
                    aria-label="সংরক্ষণ"
                  >
                    {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="shrink-0 rounded-lg bg-muted p-2 text-muted-foreground hover:bg-muted/70"
                    aria-label="বাতিল"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{a.label}</span>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {counts[a.label] ?? 0} জন
                  </span>
                  <button
                    onClick={() => startEdit(a)}
                    className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20"
                    aria-label="সম্পাদনা"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="shrink-0 rounded-lg bg-destructive/10 p-2 text-destructive hover:bg-destructive/20"
                    aria-label="মুছুন"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Member = {
  id: string;
  member_no: number;
  name: string;
  father_name: string;
  mobile: string;
  address: string;
  monthly_donation: number;
  created_at: string;
};

function MembersTab({ role }: { role: UserRole }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", father_name: "", mobile: "", address: "", monthly_donation: "" });
  const [saving, setSaving] = useState(false);
  const [addressFilter, setAddressFilter] = useState("");
  const [donationFilter, setDonationFilter] = useState("");
  const [addressList, setAddressList] = useState<string[]>([]);

  const addressOptions = Array.from(
    new Set([...addressList, ...members.map((m) => m.address).filter(Boolean)]),
  ).sort((a, b) => a.localeCompare(b, "bn"));

  const donationOptions = Array.from(new Set(members.map((m) => Number(m.monthly_donation) || 0))).sort(
    (a, b) => a - b,
  );

  const filtered = members.filter((m) => {
    if (addressFilter && m.address !== addressFilter) return false;
    if (donationFilter !== "" && (Number(m.monthly_donation) || 0) !== Number(donationFilter)) return false;
    return true;
  });

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: addrs }] = await Promise.all([
      supabase
        .from("members")
        .select("id, member_no, name, father_name, mobile, address, monthly_donation, created_at")
        .order("member_no", { ascending: true }),
      supabase.from("member_addresses").select("label").order("label", { ascending: true }),
    ]);
    setMembers((data as Member[]) ?? []);
    setAddressList(((addrs as { label: string }[]) ?? []).map((a) => a.label).filter(Boolean));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("members").delete().eq("id", confirmTarget.id);
    setDeleting(false);
    if (error) {
      toast.error("মুছে ফেলা যায়নি।");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== confirmTarget.id));
    setConfirmTarget(null);
    toast.success("সদস্য মুছে ফেলা হয়েছে।");
  };

  const openEdit = (m: Member) => {
    setEditTarget(m);
    setEditForm({
      name: m.name ?? "",
      father_name: m.father_name ?? "",
      mobile: m.mobile ?? "",
      address: m.address ?? "",
      monthly_donation: String(m.monthly_donation ?? 0),
    });
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    const updates = {
      name: editForm.name.trim(),
      father_name: editForm.father_name.trim(),
      mobile: editForm.mobile.trim(),
      address: editForm.address.trim(),
      monthly_donation: Number(editForm.monthly_donation) || 0,
    };
    const { error } = await supabase.from("members").update(updates).eq("id", editTarget.id);
    setSaving(false);
    if (error) {
      toast.error("সংরক্ষণ করা যায়নি।");
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === editTarget.id ? { ...m, ...updates } : m)));
    setEditTarget(null);
    toast.success("পরিবর্তন সংরক্ষণ করা হয়েছে।");
  };

  const downloadExcel = () => {
    const header = ["সদস্য নম্বর", "নাম", "পিতার নাম", "মোবাইল", "ঠিকানা", "মাসিক দান (টাকা)"];
    const rows = filtered.map((m) => [String(m.member_no), m.name, m.father_name, m.mobile, m.address, String(m.monthly_donation ?? 0)]);
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "সদস্য-তালিকা.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const rows = filtered
      .map(
        (m) =>
          `<tr><td>${m.member_no}</td><td>${m.name}</td><td>${m.father_name}</td><td>${m.mobile}</td><td>${m.address}</td><td>${m.monthly_donation ?? 0}</td></tr>`,
      )
      .join("");
    const total = filtered.reduce((s, m) => s + (Number(m.monthly_donation) || 0), 0);
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
      <p>সদস্য তালিকা — মোট ${filtered.length} জন · মাসিক দান মোট ${total} টাকা</p>
      <table><thead><tr><th>সদস্য নম্বর</th><th>নাম</th><th>পিতার নাম</th><th>মোবাইল</th><th>ঠিকানা</th><th>মাসিক দান (টাকা)</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const resetFilters = () => {
    setAddressFilter("");
    setDonationFilter("");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-4 text-center">
        <p className="text-xs font-medium text-muted-foreground">মোট মাসিক দানের পরিমাণ</p>
        <p className="mt-1 text-2xl font-extrabold text-emerald-700">
          {filtered.reduce((s, m) => s + (Number(m.monthly_donation) || 0), 0).toLocaleString("bn-BD")} ৳
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          মোট {filtered.length} জন সদস্য{filtered.length !== members.length ? ` (সর্বমোট ${members.length})` : ""}।
        </p>

        <div className="flex gap-2">
          <button
            onClick={downloadExcel}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" /> এক্সেল
          </button>
          <button
            onClick={downloadPdf}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" /> পিডিএফ
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">ঠিকানা</label>
          <select
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">সব ঠিকানা</option>
            {addressOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">দান পরিমাণ</label>
          <select
            value={donationFilter}
            onChange={(e) => setDonationFilter(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">সব দান</option>
            {donationOptions.map((d) => (
              <option key={d} value={String(d)}>
                {d} ৳
              </option>
            ))}
          </select>
        </div>
        {(addressFilter || donationFilter !== "") && (
          <div className="sm:col-span-2">

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              ফিল্টার মুছুন
            </button>
          </div>
        )}
      </div>


      {members.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">এখনো কোনো সদস্য যুক্ত করা হয়নি।</p>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">এই ফিল্টারে কোনো সদস্য পাওয়া যায়নি।</p>
      ) : (
        <>
        {/* mobile cards */}
        <div className="space-y-2 sm:hidden">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs font-semibold text-primary">#{m.member_no}</p>
                </div>
                {role === "admin" && (
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => openEdit(m)}
                      className="rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary/20"
                      aria-label="সম্পাদনা"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmTarget(m)}
                      className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                      aria-label="মুছুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <p className="text-muted-foreground">পিতা: <span className="text-foreground">{m.father_name}</span></p>
                <p className="text-muted-foreground">মোবাইল: <span className="text-foreground">{m.mobile}</span></p>
                <p className="text-muted-foreground">ঠিকানা: <span className="text-foreground">{m.address}</span></p>
                <p className="text-muted-foreground">দান: <span className="font-semibold text-foreground">{m.monthly_donation ?? 0} ৳</span></p>
              </div>
            </div>
          ))}
        </div>
        {/* desktop table */}
        <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="p-2">সদস্য নম্বর</th>
                <th className="p-2">নাম</th>
                <th className="p-2">পিতার নাম</th>
                <th className="p-2">মোবাইল</th>
                <th className="p-2">ঠিকানা</th>
                <th className="p-2">মাসিক দান</th>
                {role === "admin" && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/60">
                  <td className="p-2 font-semibold text-primary">{m.member_no}</td>
                  <td className="p-2 font-medium text-foreground">{m.name}</td>
                  <td className="p-2 text-foreground">{m.father_name}</td>
                  <td className="p-2 text-foreground">{m.mobile}</td>
                  <td className="p-2 text-muted-foreground">{m.address}</td>
                  <td className="p-2 text-foreground">{m.monthly_donation ?? 0} ৳</td>
                  {role === "admin" && (
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(m)}
                          className="rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary/20"
                          aria-label="সম্পাদনা"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmTarget(m)}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                          aria-label="মুছুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
                <Trash2 className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold">সদস্য মুছে ফেলবেন?</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{confirmTarget.name}</span> — এই সদস্যকে স্থায়ীভাবে মুছে ফেলা হবে। এটি আর ফিরিয়ে আনা যাবে না।
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmTarget(null)}
                  disabled={deleting}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  মুছে ফেলুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
                <Pencil className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold">সদস্য সম্পাদনা</h3>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">নাম</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">পিতার নাম</label>
                <input
                  value={editForm.father_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, father_name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">মোবাইল</label>
                <input
                  value={editForm.mobile}
                  onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">ঠিকানা</label>
                <select
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">ঠিকানা নির্বাচন করুন</option>
                  {editForm.address && !addressOptions.includes(editForm.address) && (
                    <option value={editForm.address}>{editForm.address}</option>
                  )}
                  {addressOptions.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">মাসিক দান (টাকা)</label>
                <input
                  type="number"
                  value={editForm.monthly_donation}
                  onChange={(e) => setEditForm((f) => ({ ...f, monthly_donation: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setEditTarget(null)}
                  disabled={saving}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  বাতিল
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  সংরক্ষণ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const BN_MONTHS_SHORT = [
  "জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে",
];

// মাসের তালিকা বাংলায় সাজানো: "জুন, জানু ও ডিসে"
function joinMonthsBn(months: number[]): string {
  const names = months.map((m) => BN_MONTHS_SHORT[m - 1]);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} ও ${names[names.length - 1]}`;
}

// বছর বাংলা অঙ্কে, কমা ছাড়া (যেমন ২০২৬)
function bnYear(y: number): string {
  return String(y).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

// একাধিক বছরের অগ্রিম মাস বছরভিত্তিক সাজানো: "আগ, সেপ্ট ও ডিসে ২০২৬; জানু ও ফেব্রু ২০২৭"
function joinSlotsBn(slots: { year: number; month: number }[]): string {
  const byYear = new Map<number, number[]>();
  slots.forEach((s) => {
    const arr = byYear.get(s.year) ?? [];
    arr.push(s.month);
    byYear.set(s.year, arr);
  });
  return [...byYear.keys()]
    .sort((a, b) => a - b)
    .map((y) => `${joinMonthsBn(byYear.get(y)!.sort((a, b) => a - b))} ${bnYear(y)}`)
    .join("; ");
}




type Collection = {
  id: string;
  member_id: string | null;
  member_no: number | null;
  member_name: string;
  mobile: string | null;
  amount: number;
  year: number;
  month: number;
  note: string | null;
  method: string | null;
  collected_at: string;
};

const PAYMENT_METHODS = ["নগদ", "বিকাশ", "নগদ (অ্যাকাউন্ট)", "রকেট", "ব্যাংক", "অন্যান্য"];

function CollectionsTab({ role }: { role: UserRole }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [members, setMembers] = useState<Member[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [yearCollections, setYearCollections] = useState<Collection[]>([]);
  const [futureCollections, setFutureCollections] = useState<Collection[]>([]);

  const [view, setView] = useState<"paid" | "unpaid" | "advance">("paid");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  // বকেয়া আদায় পপআপ
  const [payMember, setPayMember] = useState<Member | null>(null);
  const [paySel, setPaySel] = useState<Record<string, string>>({}); // "year-month" -> amount
  const [payPaidSet, setPayPaidSet] = useState<Set<string>>(new Set());
  const [payYear, setPayYear] = useState(now.getFullYear());
  const [payCount, setPayCount] = useState("");
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0]);
  const [paySaving, setPaySaving] = useState(false);

  const slotKey = (y: number, m: number) => `${y}-${m}`;

  const openPay = async (member: Member, unpaidMonths: number[]) => {
    const per = String(member.monthly_donation ?? 0);
    const sel: Record<string, string> = {};
    unpaidMonths.forEach((m) => (sel[slotKey(year, m)] = per));
    setPaySel(sel);
    setPayMethod(PAYMENT_METHODS[0]);
    setPayYear(year);
    setPayCount("");
    setPayPaidSet(new Set());
    setPayMember(member);
    const { data } = await supabase
      .from("donation_collections")
      .select("year, month")
      .eq("member_id", member.id);
    const s = new Set<string>();
    (data ?? []).forEach((r: { year: number; month: number }) => s.add(slotKey(r.year, r.month)));
    setPayPaidSet(s);
  };

  const toggleSlot = (y: number, m: number) => {
    const k = slotKey(y, m);
    if (payPaidSet.has(k)) return;
    setPaySel((p) => {
      const n = { ...p };
      if (k in n) delete n[k];
      else n[k] = String(payMember?.monthly_donation ?? 0);
      return n;
    });
  };

  // "কত মাস" — শুরুর সময় (জুলাই ২০২৬) থেকে প্রথম N টি অনাদায়ী মাস নির্বাচন
  const selectCount = (n: number) => {
    if (!payMember || n <= 0) return;
    const per = String(payMember.monthly_donation ?? 0);
    const added: Record<string, string> = {};
    let cy = 2026;
    let cm = 7;
    let count = 0;
    while (count < n && cy < 2026 + 25) {
      const k = slotKey(cy, cm);
      if (!payPaidSet.has(k)) {
        added[k] = per;
        count++;
      }
      cm++;
      if (cm > 12) {
        cm = 1;
        cy++;
      }
    }
    setPaySel((p) => ({ ...p, ...added }));
  };

  const payTotal = Object.values(paySel).reduce((s, v) => s + (Number(v) || 0), 0);
  const paySelList = Object.keys(paySel)
    .map((k) => {
      const [y, m] = k.split("-").map(Number);
      return { y, m, key: k };
    })
    .sort((a, b) => a.y - b.y || a.m - b.m);

  const savePay = async () => {
    if (!payMember) return;
    if (paySelList.length === 0) {
      toast.error("অন্তত একটি মাস নির্বাচন করুন।");
      return;
    }
    const rows = paySelList.map(({ y, m }) => ({
      member_id: payMember.id,
      member_no: payMember.member_no,
      member_name: payMember.name,
      mobile: payMember.mobile,
      amount: Number(paySel[slotKey(y, m)]) || 0,
      year: y,
      month: m,
      note: null,
      method: payMethod,
    }));
    if (rows.some((r) => r.amount <= 0)) {
      toast.error("প্রতিটি মাসের সঠিক টাকা দিন।");
      return;
    }
    setPaySaving(true);
    const { data, error } = await supabase
      .from("donation_collections")
      .insert(rows)
      .select("*");
    setPaySaving(false);
    if (error) {
      toast.error("আদায় সংরক্ষণ করা যায়নি।");
      return;
    }
    const inserted = (data as Collection[]) ?? [];
    setYearCollections((prev) => [...prev, ...inserted.filter((c) => c.year === year)]);
    setCollections((prev) => [
      ...inserted.filter((c) => c.year === year && c.month === month),
      ...prev,
    ]);
    setPayMember(null);
    toast.success(`${rows.length} মাসের দান আদায় সম্পন্ন হয়েছে।`);
  };



  const load = async () => {
    setLoading(true);
    const [{ data: mem }, { data: monthCol }, { data: yearCol }, { data: futureCol }] = await Promise.all([
      supabase
        .from("members")
        .select("id, member_no, name, father_name, mobile, address, monthly_donation, created_at")
        .order("member_no", { ascending: true }),
      supabase
        .from("donation_collections")
        .select("*")
        .eq("year", year)
        .eq("month", month)
        .order("collected_at", { ascending: false }),
      supabase
        .from("donation_collections")
        .select("id, member_id, month, year")
        .eq("year", year),
      supabase
        .from("donation_collections")
        .select("id, member_id, month, year")
        .gte("year", now.getFullYear()),
    ]);
    setMembers((mem as Member[]) ?? []);
    setCollections((monthCol as Collection[]) ?? []);
    setYearCollections((yearCol as Collection[]) ?? []);
    setFutureCollections((futureCol as Collection[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // বছরে প্রতিটি সদস্য কোন কোন মাসে দান দিয়েছে তার সেট
  const paidMonthsByMember = new Map<string, Set<number>>();
  yearCollections.forEach((c) => {
    if (!c.member_id) return;
    const set = paidMonthsByMember.get(c.member_id) ?? new Set<number>();
    set.add(c.month);
    paidMonthsByMember.set(c.member_id, set);
  });

  // কত মাস পর্যন্ত হিসাব করা হবে (চলতি বছরে চলতি মাস পর্যন্ত, আগের বছরে ১২ মাস)
  const monthsElapsed =
    year < now.getFullYear() ? 12 : year === now.getFullYear() ? now.getMonth() + 1 : 0;

  // যাদের দান আদায় হয়নি তাদের তালিকা (একাধিক মাস হলে সব মাস)
  // আদায় কার্যক্রম শুরু হয়েছে জুলাই ২০২৬ থেকে — এর আগের কোনো মাস বকেয়া ধরা হবে না
  const START_YEAR = 2026;
  const START_MONTH = 7;
  const unpaidList =
    year < START_YEAR
      ? []
      : members
          .map((m) => {
            const created = m.created_at ? new Date(m.created_at) : null;
            const memberStart =
              created && created.getFullYear() === year ? created.getMonth() + 1 : 1;
            const programStart = year === START_YEAR ? START_MONTH : 1;
            const startMonth = Math.max(memberStart, programStart);
            const paidSet = paidMonthsByMember.get(m.id) ?? new Set<number>();
            const unpaidMonths: number[] = [];
            for (let mo = startMonth; mo <= monthsElapsed; mo++) {
              if (!paidSet.has(mo)) unpaidMonths.push(mo);
            }
            return { member: m, unpaidMonths };
          })
          .filter((x) => x.unpaidMonths.length > 0);

  // অগ্রিম আদায় — যারা এখনো আসেনি এমন ভবিষ্যৎ মাসের দান আগেই দিয়েছেন (একাধিক বছর জুড়ে)
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const futureSlotsByMember = new Map<string, { year: number; month: number }[]>();
  futureCollections.forEach((c) => {
    if (!c.member_id) return;
    const isFuture = c.year > nowYear || (c.year === nowYear && c.month > nowMonth);
    if (!isFuture) return;
    const arr = futureSlotsByMember.get(c.member_id) ?? [];
    arr.push({ year: c.year, month: c.month });
    futureSlotsByMember.set(c.member_id, arr);
  });
  const advanceList = members
    .map((m) => {
      const advanceSlots = (futureSlotsByMember.get(m.id) ?? []).sort(
        (a, b) => a.year - b.year || a.month - b.month,
      );
      return { member: m, advanceSlots };
    })
    .filter((x) => x.advanceSlots.length > 0);






  const q = query.trim().toLowerCase();
  const matches = q
    ? members
        .filter(
          (m) =>
            String(m.member_no).includes(q) ||
            (m.mobile ?? "").toLowerCase().includes(q) ||
            (m.name ?? "").toLowerCase().includes(q),
        )
        .slice(0, 50)
    : [];

  const paidIds = new Set(collections.map((c) => c.member_id).filter(Boolean) as string[]);

  const pickMember = (m: Member) => {
    setQuery("");
    // চলতি বছরের অনাদায়ী মাসগুলো বের করে রিচ পপআপ খুলি (মাস ও বছর নির্বাচনসহ)
    const paidSet = paidMonthsByMember.get(m.id) ?? new Set<number>();
    const programStart = year === START_YEAR ? START_MONTH : 1;
    const start = year > START_YEAR ? 1 : programStart;
    const unpaid: number[] = [];
    for (let mo = start; mo <= monthsElapsed; mo++) {
      if (!paidSet.has(mo)) unpaid.push(mo);
    }
    openPay(m, unpaid);
  };


  const save = async () => {
    if (!selected) return;
    const amt = Number(amount) || 0;
    if (amt <= 0) {
      toast.error("সঠিক টাকার পরিমাণ দিন।");
      return;
    }
    setSaving(true);
    const row = {
      member_id: selected.id,
      member_no: selected.member_no,
      member_name: selected.name,
      mobile: selected.mobile,
      amount: amt,
      year,
      month,
      note: note.trim() || null,
    };
    const { data, error } = await supabase
      .from("donation_collections")
      .insert(row)
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      toast.error("আদায় সংরক্ষণ করা যায়নি।");
      return;
    }
    setCollections((prev) => [data as Collection, ...prev]);
    setYearCollections((prev) => [...prev, data as Collection]);
    setSelected(null);
    setAmount("");
    setNote("");
    toast.success("দান আদায় সংরক্ষণ করা হয়েছে।");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("donation_collections").delete().eq("id", deleteTarget.id);
    if (error) {
      toast.error("মুছে ফেলা যায়নি।");
      return;
    }
    setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setYearCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("রেকর্ড মুছে ফেলা হয়েছে।");
  };

  const total = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const periodLabel = `${BN_MONTHS[month - 1]} ${year}`;

  const downloadExcel = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    let header: string[];
    let rows: string[][];
    let footer: string[][] = [];
    let filename = `দান-আদায়-${periodLabel}.csv`;

    if (view === "advance") {
      header = ["সদস্য নম্বর", "নাম", "মোবাইল", "অগ্রিম মাস", "কত মাস"];
      rows = advanceList.map(({ member: m, advanceSlots }) => [
        String(m.member_no ?? ""),
        m.name,
        m.mobile ?? "",
        joinSlotsBn(advanceSlots),
        `${advanceSlots.length} মাস`,
      ]);
      filename = "অগ্রিম-দান-আদায়.csv";
    } else {
      header = ["সদস্য নম্বর", "নাম", "মোবাইল", "টাকার পরিমাণ", "নোট", "তারিখ"];
      rows = collections.map((c) => [
        String(c.member_no ?? ""),
        c.member_name,
        c.mobile ?? "",
        String(c.amount),
        c.note ?? "",
        new Date(c.collected_at).toLocaleDateString("bn-BD"),
      ]);
      footer = [["", "", "মোট", String(total), "", ""]];
    }

    const csv = [header, ...rows, ...footer]
      .map((r) => r.map(esc).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (view === "advance") {
      const rows = advanceList
        .map(
          ({ member: m, advanceSlots }) =>
            `<tr><td>${m.member_no ?? ""}</td><td>${m.name}</td><td>${m.mobile ?? ""}</td><td>${joinSlotsBn(advanceSlots)}</td><td>${advanceSlots.length} মাস</td></tr>`,
        )
        .join("");
      const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>অগ্রিম দান আদায়</title>
        <style>
          body{font-family:'Noto Sans Bengali','Segoe UI',sans-serif;padding:24px;color:#1a1a1a}
          h1{font-size:18px;text-align:center;margin:0 0 4px}
          p{text-align:center;margin:0 0 16px;color:#555;font-size:12px}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th,td{border:1px solid #999;padding:6px 8px;text-align:left}
          th{background:#0369a1;color:#fff}
        </style></head><body>
        <h1>${mosque.name}</h1>
        <p>অগ্রিম দান আদায় তালিকা — মোট ${advanceList.length} জন</p>
        <table><thead><tr><th>সদস্য নম্বর</th><th>নাম</th><th>মোবাইল</th><th>অগ্রিম মাস</th><th>কত মাস</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <script>window.onload=function(){window.print()}<\/script>
        </body></html>`;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(html);
        w.document.close();
      }
      return;
    }
    const rows = collections
      .map(
        (c) =>
          `<tr><td>${c.member_no ?? ""}</td><td>${c.member_name}</td><td>${c.mobile ?? ""}</td><td>${c.amount}</td><td>${c.note ?? ""}</td><td>${new Date(c.collected_at).toLocaleDateString("bn-BD")}</td></tr>`,
      )
      .join("");
    const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><title>দান আদায়</title>
      <style>
        body{font-family:'Noto Sans Bengali','Segoe UI',sans-serif;padding:24px;color:#1a1a1a}
        h1{font-size:18px;text-align:center;margin:0 0 4px}
        p{text-align:center;margin:0 0 16px;color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #999;padding:6px 8px;text-align:left}
        th{background:#0f6e4f;color:#fff}
        tfoot td{font-weight:bold}
      </style></head><body>
      <h1>${mosque.name}</h1>
      <p>মাসিক দান আদায় তালিকা — ${periodLabel} · মোট ${collections.length} জন · সর্বমোট ${total} টাকা</p>
      <table><thead><tr><th>সদস্য নম্বর</th><th>নাম</th><th>মোবাইল</th><th>টাকার পরিমাণ</th><th>নোট</th><th>তারিখ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3">মোট</td><td>${total}</td><td></td><td></td></tr></tfoot></table>
      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  // আগামী ৫ বছর (অগ্রিম আদায়) + চলতি ও আগের ৫ বছর
  const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() + 5 - i);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[110px] sm:flex-none">
          <label className="mb-1 block text-xs font-semibold text-foreground">মাস</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {BN_MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[110px] sm:flex-none">
          <label className="mb-1 block text-xs font-semibold text-foreground">বছর</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <button
            onClick={downloadExcel}
            disabled={view === "advance" ? advanceList.length === 0 : collections.length === 0}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50 sm:flex-none"
          >
            <FileSpreadsheet className="h-4 w-4" /> এক্সেল
          </button>
          <button
            onClick={downloadPdf}
            disabled={view === "advance" ? advanceList.length === 0 : collections.length === 0}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-foreground disabled:opacity-50 sm:flex-none"
          >
            <FileDown className="h-4 w-4" /> পিডিএফ
          </button>
        </div>
      </div>


      <div className="relative rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-card to-teal-50 p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-emerald text-primary-foreground shadow-sm">
              <HandCoins className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground sm:text-lg">দান আদায় করুন</p>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </div>
          </div>
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-2.5">
                <div className="min-w-0 text-sm">
                  <span className="font-semibold text-foreground">#{selected.member_no} · {selected.name}</span>
                  <span className="ml-2 text-muted-foreground">{selected.mobile}</span>
                </div>
                <button onClick={() => setSelected(null)} aria-label="বাতিল" className="shrink-0">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="sm:w-40">
                  <label className="mb-1 block text-xs font-semibold text-foreground">টাকার পরিমাণ</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-foreground">নোট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
                  />
                </div>
              </div>
              {paidIds.has(selected.id) && (
                <p className="text-xs text-amber-600">এই সদস্যের জন্য এই মাসে ইতিমধ্যে আদায় রেকর্ড আছে।</p>
              )}
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald px-4 py-3.5 text-base font-bold text-primary-foreground shadow-sm disabled:opacity-60 sm:w-auto"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                আদায় সংরক্ষণ
              </button>
            </div>
          ) : (
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
              <input
                type="text"
                inputMode="tel"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="মোবাইল নম্বর দিয়ে সদস্য খুঁজুন"
                className="w-full rounded-xl border border-emerald-200 bg-background py-4 pl-12 pr-4 text-base shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="mt-2 px-1 text-xs text-muted-foreground">নাম বা সদস্য নম্বর দিয়েও খোঁজা যাবে</p>
              {matches.length > 0 && (
                <div className="absolute z-30 mt-1 max-h-72 w-full divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
                  {matches.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => pickMember(m)}
                      className="flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm hover:bg-secondary"
                    >
                      <span className="font-medium text-foreground">#{m.member_no} · {m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.mobile}{paidIds.has(m.id) ? " ✓" : ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setView("paid")}
          className={`w-full rounded-full px-2 py-2 text-center text-xs font-semibold transition sm:text-sm ${
            view === "paid"
              ? "gradient-emerald text-primary-foreground"
              : "bg-secondary text-foreground"
          }`}
        >
          আদায় হয়েছে ({collections.length})
        </button>
        <button
          onClick={() => setView("unpaid")}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
            view === "unpaid"
              ? "bg-amber-500 text-white"
              : "bg-secondary text-foreground"
          }`}
        >
          আদায় হয়নি ({unpaidList.length})
        </button>
        <button
          onClick={() => setView("advance")}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
            view === "advance"
              ? "bg-sky-600 text-white"
              : "bg-secondary text-foreground"
          }`}
        >
          অগ্রিম আদায় ({advanceList.length})
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {view === "paid"
            ? `${periodLabel} — মোট ${collections.length} জন আদায় করেছেন।`
            : view === "advance"
              ? `মোট ${advanceList.length} জন অগ্রিম দান দিয়েছেন।`
              : `${year} সালে ${unpaidList.length} জনের বকেয়া রয়েছে।`}
        </p>
        {view === "paid" && (
          <p className="text-base font-bold text-emerald-700">
            সর্বমোট {total.toLocaleString("bn-BD")} ৳
          </p>
        )}
      </div>


      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : view === "paid" ? (
        collections.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">এই মাসে কোনো আদায় রেকর্ড নেই।</p>
        ) : (
          <>
          {/* mobile cards */}
          <div className="space-y-2 sm:hidden">
            {collections.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{c.member_name}</p>
                    <p className="text-xs text-muted-foreground">#{c.member_no ?? "-"} · {c.mobile}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-bold text-emerald-700">{c.amount} ৳</span>
                    {role === "admin" && (
                      <button onClick={() => setDeleteTarget(c)} aria-label="মুছুন" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(c.collected_at).toLocaleDateString("bn-BD")}</p>
              </div>
            ))}
          </div>
          {/* desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-foreground">
                <tr>
                  <th className="p-2 text-left">সদস্য নম্বর</th>
                  <th className="p-2 text-left">নাম</th>
                  <th className="p-2 text-left">মোবাইল</th>
                  <th className="p-2 text-left">টাকা</th>
                  <th className="p-2 text-left">তারিখ</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-2 text-foreground">{c.member_no ?? "-"}</td>
                    <td className="p-2 text-foreground">{c.member_name}</td>
                    <td className="p-2 text-muted-foreground">{c.mobile}</td>
                    <td className="p-2 font-semibold text-emerald-700">{c.amount} ৳</td>
                    <td className="p-2 text-muted-foreground">{new Date(c.collected_at).toLocaleDateString("bn-BD")}</td>
                    <td className="p-2 text-right">
                      {role === "admin" && (
                        <button onClick={() => setDeleteTarget(c)} aria-label="মুছুন" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )
      ) : view === "unpaid" ? (
        unpaidList.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">সবার দান আদায় সম্পন্ন হয়েছে। 🎉</p>
      ) : (
        <>
        {/* mobile cards */}
        <div className="space-y-2 sm:hidden">
          {unpaidList.map(({ member: m, unpaidMonths }) => (
            <div key={m.id} className="rounded-xl border border-amber-300 bg-amber-50/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{m.name}</p>
                  <p className="text-xs text-muted-foreground">#{m.member_no ?? "-"} · {m.mobile}</p>
                </div>
                <button
                  onClick={() => openPay(m, unpaidMonths)}
                  className="shrink-0 rounded-md gradient-emerald px-3 py-1.5 text-xs font-bold text-primary-foreground"
                >
                  আদায় করুন
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-amber-700">
                {joinMonthsBn(unpaidMonths)}{" "}
                <span className="text-xs font-normal text-muted-foreground">({unpaidMonths.length} মাস)</span>
              </p>
            </div>
          ))}
        </div>
        {/* desktop table */}
        <div className="hidden overflow-x-auto rounded-xl border border-amber-300 sm:block">
          <table className="w-full text-sm">
            <thead className="bg-amber-100 text-amber-900">
              <tr>
                <th className="p-2 text-left">সদস্য নম্বর</th>
                <th className="p-2 text-left">নাম</th>
                <th className="p-2 text-left">মোবাইল</th>
                <th className="p-2 text-left">বকেয়া মাস</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {unpaidList.map(({ member: m, unpaidMonths }) => (
                <tr key={m.id} className="border-t border-amber-200">
                  <td className="p-2 text-foreground">{m.member_no ?? "-"}</td>
                  <td className="p-2 text-foreground">{m.name}</td>
                  <td className="p-2 text-muted-foreground">{m.mobile}</td>
                  <td className="p-2 font-semibold text-amber-700">
                    {joinMonthsBn(unpaidMonths)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">({unpaidMonths.length} মাস)</span>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => openPay(m, unpaidMonths)}
                      className="rounded-md gradient-emerald px-3 py-1 text-xs font-bold text-primary-foreground"
                    >
                      আদায় করুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )
      ) : advanceList.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">এখনো কেউ অগ্রিম দান দেননি।</p>
      ) : (
        <>
        {/* mobile cards */}
        <div className="space-y-2 sm:hidden">
          {advanceList.map(({ member: m, advanceSlots }) => (
            <div key={m.id} className="rounded-xl border border-sky-300 bg-sky-50/40 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-foreground">{m.name}</p>
                <span className="shrink-0 text-xs font-normal text-muted-foreground">({advanceSlots.length} মাস)</span>
              </div>
              <p className="text-xs text-muted-foreground">#{m.member_no ?? "-"} · {m.mobile}</p>
              <p className="mt-2 text-sm font-semibold text-sky-700">{joinSlotsBn(advanceSlots)}</p>
            </div>
          ))}
        </div>
        {/* desktop table */}
        <div className="hidden overflow-x-auto rounded-xl border border-sky-300 sm:block">
          <table className="w-full text-sm">
            <thead className="bg-sky-100 text-sky-900">
              <tr>
                <th className="p-2 text-left">সদস্য নম্বর</th>
                <th className="p-2 text-left">নাম</th>
                <th className="p-2 text-left">মোবাইল</th>
                <th className="p-2 text-left">অগ্রিম মাস</th>
              </tr>
            </thead>
            <tbody>
              {advanceList.map(({ member: m, advanceSlots }) => (
                <tr key={m.id} className="border-t border-sky-200">
                  <td className="p-2 text-foreground">{m.member_no ?? "-"}</td>
                  <td className="p-2 text-foreground">{m.name}</td>
                  <td className="p-2 text-muted-foreground">{m.mobile}</td>
                  <td className="p-2 font-semibold text-sky-700">
                    {joinSlotsBn(advanceSlots)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">({advanceSlots.length} মাস)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}


      {payMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-foreground">
                  #{payMember.member_no} · {payMember.name}
                </p>
                <p className="text-xs text-muted-foreground">{payMember.mobile}</p>
              </div>
              <button onClick={() => setPayMember(null)} aria-label="বন্ধ করুন" className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* কত মাস — সংখ্যা লিখে বা বাটনে ক্লিক করে নির্বাচন */}
            <p className="mb-2 text-xs font-semibold text-foreground">কত মাস আদায় করবেন?</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[1, 2, 3, 6, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => selectCount(n)}
                  className="rounded-full border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {n.toLocaleString("bn-BD")} মাস
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaySel({})}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
              >
                সব বাদ
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              <input
                type="number"
                min={1}
                value={payCount}
                onChange={(e) => setPayCount(e.target.value)}
                placeholder="মাসের সংখ্যা লিখুন"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  selectCount(Number(payCount) || 0);
                  setPayCount("");
                }}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                নির্বাচন
              </button>
            </div>

            {/* বছর ও মাস নির্বাচন */}
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">বছর ও মাস নির্বাচন করুন</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayYear((y) => y - 1)}
                  className="rounded-md bg-secondary px-2 py-0.5 text-sm font-bold text-foreground"
                >
                  ‹
                </button>
                <span className="text-sm font-bold text-foreground">{bnYear(payYear)}</span>
                <button
                  type="button"
                  onClick={() => setPayYear((y) => y + 1)}
                  className="rounded-md bg-secondary px-2 py-0.5 text-sm font-bold text-foreground"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-1.5">
              {BN_MONTHS.map((name, i) => {
                const mo = i + 1;
                const k = slotKey(payYear, mo);
                const paid = payPaidSet.has(k);
                const sel = k in paySel;
                return (
                  <button
                    key={mo}
                    type="button"
                    disabled={paid}
                    onClick={() => toggleSlot(payYear, mo)}
                    className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                      paid
                        ? "cursor-not-allowed bg-emerald-100 text-emerald-700 opacity-70"
                        : sel
                          ? "bg-emerald-600 text-white"
                          : "bg-secondary text-foreground"
                    }`}
                  >
                    {name}
                    {paid && " ✓"}
                  </button>
                );
              })}
            </div>

            {/* নির্বাচিত মাসের তালিকা ও টাকা */}
            {paySelList.length > 0 && (
              <>
                <p className="mb-2 text-xs font-semibold text-foreground">নির্বাচিত মাস ও টাকা</p>
                <div className="space-y-2">
                  {paySelList.map(({ y, m, key }) => (
                    <div key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {BN_MONTHS[m - 1]} {bnYear(y)}
                      </span>
                      <input
                        type="number"
                        value={paySel[key] ?? ""}
                        onChange={(e) => setPaySel((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-24 rounded-md border border-input bg-background px-2 py-1 text-right text-sm"
                      />
                      <span className="text-xs text-muted-foreground">৳</span>
                      <button
                        type="button"
                        onClick={() => toggleSlot(y, m)}
                        aria-label="বাদ দিন"
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold text-foreground">আদায় মাধ্যম</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
              <span className="text-sm font-semibold text-foreground">
                মোট আদায় ({paySelList.length.toLocaleString("bn-BD")} মাস)
              </span>
              <span className="text-lg font-bold text-emerald-700">
                {payTotal.toLocaleString("bn-BD")} ৳
              </span>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPayMember(null)}
                className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-foreground"
              >
                বাতিল
              </button>
              <button
                onClick={savePay}
                disabled={paySaving}
                className="inline-flex items-center gap-2 rounded-md gradient-emerald px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {paySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                আদায় সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}


      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{deleteTarget.member_name}</span> এর আদায় রেকর্ডটি মুছে ফেলবেন?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-foreground"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type TabProps = {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
};

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">{children}</div>;
}

function SiteTab({ content, setContent }: TabProps) {
  const s = content.site;
  return (
    <Card>
      <Field
        label="সাইট টাইটেল (ব্রাউজার ট্যাবে দেখাবে)"
        value={s.title}
        onChange={(v) => setContent((c) => ({ ...c, site: { ...c.site, title: v } }))}
      />
      <ImageCropUpload
        label="সাইট আইকন (ফ্যাভিকন)"
        value={s.icon}
        aspect={1}
        round={false}
        outputWidth={256}
        onChange={(img) => setContent((c) => ({ ...c, site: { ...c.site, icon: img } }))}
      />
      <p className="text-xs text-muted-foreground">
        আইকন বর্গাকারে ক্রোপ হবে এবং ব্রাউজার ট্যাবে দেখাবে। পরিবর্তন সংরক্ষণের পর কিছুক্ষণের মধ্যে কার্যকর হবে।
      </p>
    </Card>
  );
}


function MosqueTab({ content, setContent }: TabProps) {
  const m = content.mosque;
  const set = (k: keyof typeof m, v: string) =>
    setContent((c) => ({ ...c, mosque: { ...c.mosque, [k]: v } }));
  return (
    <Card>
      <Field label="মসজিদের নাম" value={m.name} onChange={(v) => set("name", v)} />
      <Field label="সংক্ষিপ্ত নাম" value={m.shortName} onChange={(v) => set("shortName", v)} />
      <Field label="প্রতিষ্ঠা সন" value={m.established} onChange={(v) => set("established", v)} />
      <Field label="অবস্থান" value={m.location} onChange={(v) => set("location", v)} />
      <Field label="ট্যাগলাইন" value={m.tagline} onChange={(v) => set("tagline", v)} textarea />
      <p className="text-xs text-muted-foreground">
        স্লাইডার ছবি ও ক্যাপশন এখন "স্লাইডার" ট্যাবে পরিবর্তন করা যাবে।
      </p>
    </Card>
  );
}

function SliderTab({ content, setContent }: TabProps) {
  const slides = content.heroSlides;
  const setSlide = (i: number, patch: Partial<SiteContent["heroSlides"][number]>) =>
    setContent((c) => ({
      ...c,
      heroSlides: c.heroSlides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  const add = () =>
    setContent((c) => ({ ...c, heroSlides: [...c.heroSlides, { caption: "" }] }));
  const remove = (i: number) =>
    setContent((c) => ({ ...c, heroSlides: c.heroSlides.filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        প্রতিটি স্লাইডের জন্য ছবি আপলোড করুন (ওয়াইড আকারে ক্রোপ হবে) এবং নিচে টাইটেল/ক্যাপশন লিখুন।
      </p>
      {slides.map((s, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
              স্লাইড {i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
              aria-label="মুছুন"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <ImageCropUpload
            label="স্লাইডার ছবি"
            value={s.image}
            aspect={16 / 9}
            round={false}
            outputWidth={1280}
            onChange={(img) => setSlide(i, { image: img })}
          />
          <Field
            label="টাইটেল / ক্যাপশন"
            value={s.caption}
            onChange={(v) => setSlide(i, { caption: v })}
            textarea
          />
        </Card>
      ))}
      <AddButton onClick={add} label="নতুন স্লাইড যোগ করুন" />
    </div>
  );
}

function SectionsTab({ content, setContent }: TabProps) {
  const s = content.sections;
  const set = (k: keyof typeof s, v: string) =>
    setContent((c) => ({ ...c, sections: { ...c.sections, [k]: v } }));
  return (
    <Card>
      <Field label="নামাজ সেকশন শিরোনাম" value={s.prayerTitle} onChange={(v) => set("prayerTitle", v)} />
      <Field label="দায়িত্বপ্রাপ্ত সেকশন শিরোনাম" value={s.staffTitle} onChange={(v) => set("staffTitle", v)} />
      <Field label="কমিটি সেকশন শিরোনাম" value={s.committeeTitle} onChange={(v) => set("committeeTitle", v)} />
      <Field label="দান বাটনের লেখা" value={s.donateLabel} onChange={(v) => set("donateLabel", v)} />
      <Field label="দান আহ্বান শিরোনাম" value={s.ctaTitle} onChange={(v) => set("ctaTitle", v)} />
      <Field label="দান আহ্বান বিবরণ" value={s.ctaText} onChange={(v) => set("ctaText", v)} textarea />
      <Field label="ফুটার উক্তি" value={s.footerQuote} onChange={(v) => set("footerQuote", v)} textarea />
    </Card>
  );
}

function MarqueeTab({ content, setContent }: TabProps) {
  const m = content.marquee;
  const set = (patch: Partial<typeof m>) =>
    setContent((c) => ({ ...c, marquee: { ...c.marquee, ...patch } }));
  return (
    <Card>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
        <span className="text-sm font-semibold text-foreground">
          স্ক্রোলিং টাইটেল চালু রাখুন
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            চালু থাকলে হোম পেজে মাসয়ালার নিচে দেখাবে।
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={m.enabled}
          onClick={() => set({ enabled: !m.enabled })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${m.enabled ? "bg-primary" : "bg-muted"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${m.enabled ? "left-[22px]" : "left-0.5"}`}
          />
        </button>
      </label>

      <div>
        <span className="mb-1 block text-sm font-semibold text-foreground">টাইটেল লেখা</span>
        <RichTextEditor
          value={m.html}
          onChange={(html) => set({ html })}
          placeholder="এখানে স্ক্রোলিং লেখা লিখুন — শব্দ সিলেক্ট করে বোল্ড, ইটালিক, কালার বা সিম্বল যুক্ত করুন…"
        />
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-foreground">
          স্ক্রোলিং গতি — {m.speed} সেকেন্ড (কম মানে দ্রুত)
        </span>
        <input
          type="range"
          min={5}
          max={60}
          step={1}
          value={m.speed}
          onChange={(e) => set({ speed: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      {m.enabled && m.html.trim() ? (
        <div className="rounded-xl border border-border bg-secondary/40 p-3">
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">প্রিভিউ</span>
          <div className="overflow-hidden">
            <div
              className="whitespace-nowrap text-sm font-semibold text-foreground"
              dangerouslySetInnerHTML={{ __html: m.html }}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}


function FooterTab({ content, setContent }: TabProps) {
  const s = content.sections;
  const set = (k: keyof typeof s, v: string) =>
    setContent((c) => ({ ...c, sections: { ...c.sections, [k]: v } }));
  return (
    <Card>
      <Field label="ফুটার উক্তি" value={s.footerQuote} onChange={(v) => set("footerQuote", v)} textarea />
      <Field label="ফুটার বার্তা" value={s.footerMessage} onChange={(v) => set("footerMessage", v)} textarea />
    </Card>
  );
}

const DONATE_ICON_OPTIONS: { value: SiteContent["donate"]["methods"][number]["icon"]; label: string }[] = [
  { value: "smartphone", label: "মোবাইল (বিকাশ/নগদ)" },
  { value: "bank", label: "ব্যাংক" },
  { value: "building", label: "ভবন / অফিস" },
];

function DonateTab({ content, setContent }: TabProps) {
  const d = content.donate;
  const setField = (k: "subtitle" | "footerNote", v: string) =>
    setContent((c) => ({ ...c, donate: { ...c.donate, [k]: v } }));
  const setMethod = (i: number, patch: Partial<SiteContent["donate"]["methods"][number]>) =>
    setContent((c) => ({
      ...c,
      donate: {
        ...c.donate,
        methods: c.donate.methods.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
      },
    }));
  const add = () =>
    setContent((c) => ({
      ...c,
      donate: {
        ...c.donate,
        methods: [...c.donate.methods, { icon: "smartphone", title: "", value: "", note: "" }],
      },
    }));
  const remove = (i: number) =>
    setContent((c) => ({
      ...c,
      donate: { ...c.donate, methods: c.donate.methods.filter((_, idx) => idx !== i) },
    }));

  return (
    <div className="space-y-5">
      <Card>
        <Field label="উপরের উক্তি / সাবটাইটেল" value={d.subtitle} onChange={(v) => setField("subtitle", v)} textarea />
        <Field label="নিচের বার্তা" value={d.footerNote} onChange={(v) => setField("footerNote", v)} textarea />
      </Card>
      {d.methods.map((m, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
              দান পদ্ধতি {i + 1}
            </span>
            <button
              onClick={() => remove(i)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
              aria-label="মুছুন"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-foreground">আইকন</span>
            <select
              value={m.icon}
              onChange={(e) => setMethod(i, { icon: e.target.value as SiteContent["donate"]["methods"][number]["icon"] })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {DONATE_ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="শিরোনাম" value={m.title} onChange={(v) => setMethod(i, { title: v })} />
          {m.icon === "bank" ? (
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground">ব্যাংক তথ্য</p>
              <Field label="ব্যাংক" value={m.bankName ?? ""} onChange={(v) => setMethod(i, { bankName: v })} />
              <Field label="শাখা" value={m.branch ?? ""} onChange={(v) => setMethod(i, { branch: v })} />
              <Field label="হোল্ডার নাম" value={m.holderName ?? ""} onChange={(v) => setMethod(i, { holderName: v })} />
              <Field label="একাউন্ট নম্বর" value={m.accountNumber ?? ""} onChange={(v) => setMethod(i, { accountNumber: v })} />
              <Field label="রাউটিং নং" value={m.routingNumber ?? ""} onChange={(v) => setMethod(i, { routingNumber: v })} />
            </div>
          ) : (
            <>
              <Field label="নম্বর / বিবরণ" value={m.value} onChange={(v) => setMethod(i, { value: v })} />
              <Field label="নোট" value={m.note} onChange={(v) => setMethod(i, { note: v })} />
            </>
          )}
        </Card>
      ))}
      <AddButton onClick={add} label="নতুন দান পদ্ধতি যোগ করুন" />
    </div>
  );
}


function DevelopmentTab({ content, setContent }: TabProps) {
  const dev = content.development;
  const setField = (k: "title" | "subtitle", v: string) =>
    setContent((c) => ({ ...c, development: { ...c.development, [k]: v } }));
  const setItem = (i: number, patch: Partial<SiteContent["development"]["items"][number]>) =>
    setContent((c) => ({
      ...c,
      development: {
        ...c.development,
        items: c.development.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
      },
    }));
  const add = () =>
    setContent((c) => ({
      ...c,
      development: { ...c.development, items: [...c.development.items, { caption: "" }] },
    }));
  const remove = (i: number) =>
    setContent((c) => ({
      ...c,
      development: { ...c.development, items: c.development.items.filter((_, idx) => idx !== i) },
    }));

  return (
    <div className="space-y-5">
      <Card>
        <Field label="শিরোনাম" value={dev.title} onChange={(v) => setField("title", v)} />
        <Field label="সংক্ষিপ্ত বিবরণ" value={dev.subtitle} onChange={(v) => setField("subtitle", v)} textarea />
      </Card>
      <p className="text-sm text-muted-foreground">
        উন্নয়ন কাজের প্রতিটি ছবি আপলোড করুন এবং নিচে ক্যাপশন লিখুন।
      </p>
      {dev.items.map((it, i) => {
        const imgs = it.images ?? (it.image ? [it.image] : []);
        const setImgs = (next: string[]) =>
          setItem(i, { images: next, image: next[0] });
        return (
        <Card key={i}>
          <div className="flex items-center justify-between">
            <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
              কাজ {i + 1} ({imgs.length.toLocaleString("bn-BD")} ছবি)
            </span>
            <button
              onClick={() => remove(i)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
              aria-label="মুছুন"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Field
            label="ক্যাপশন / শিরোনাম"
            value={it.caption}
            onChange={(v) => setItem(i, { caption: v })}
            textarea
          />
          <p className="text-xs font-semibold text-foreground">ছবিসমূহ (একাধিক আপলোড করা যাবে)</p>
          <div className="grid grid-cols-2 gap-3">
            {imgs.map((img, gi) => (
              <div key={gi} className="space-y-1">
                <ImageCropUpload
                  label={`ছবি ${(gi + 1).toLocaleString("bn-BD")}`}
                  value={img}
                  aspect={1}
                  round={false}
                  outputWidth={800}
                  onChange={(v) =>
                    setImgs(imgs.map((x, xi) => (xi === gi ? v || "" : x)).filter(Boolean))
                  }
                />
                <button
                  onClick={() => setImgs(imgs.filter((_, xi) => xi !== gi))}
                  className="w-full rounded-md bg-destructive/10 py-1 text-xs font-semibold text-destructive"
                >
                  এই ছবি মুছুন
                </button>
              </div>
            ))}
            <ImageCropUpload
              key={`add-${imgs.length}`}
              label="নতুন ছবি যোগ"
              value={undefined}
              aspect={1}
              round={false}
              outputWidth={800}
              onChange={(v) => v && setImgs([...imgs, v])}
            />
          </div>
        </Card>
        );
      })}
      <AddButton onClick={add} label="নতুন কাজ যোগ করুন" />
    </div>
  );
}


function IbadahTab({ content, setContent }: TabProps) {
  const ib = content.ibadah;

  const setField = (k: "subtitle" | "stepsTitle" | "programsTitle" | "duasTitle", v: string) =>
    setContent((c) => ({ ...c, ibadah: { ...c.ibadah, [k]: v } }));

  // Steps
  const setStep = (i: number, patch: Partial<SiteContent["ibadah"]["steps"][number]>) =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, steps: c.ibadah.steps.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) },
    }));
  const addStep = () =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, steps: [...c.ibadah.steps, { step: "", title: "", detail: "" }] },
    }));
  const removeStep = (i: number) =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, steps: c.ibadah.steps.filter((_, idx) => idx !== i) },
    }));

  // Programs
  const setProgram = (i: number, patch: Partial<SiteContent["ibadah"]["programs"][number]>) =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, programs: c.ibadah.programs.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) },
    }));
  const addProgram = () =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, programs: [...c.ibadah.programs, { title: "", detail: "" }] },
    }));
  const removeProgram = (i: number) =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, programs: c.ibadah.programs.filter((_, idx) => idx !== i) },
    }));

  // Duas
  const setDua = (i: number, patch: Partial<SiteContent["ibadah"]["duas"][number]>) =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, duas: c.ibadah.duas.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) },
    }));
  const addDua = () =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, duas: [...c.ibadah.duas, { title: "", arabic: "", meaning: "" }] },
    }));
  const removeDua = (i: number) =>
    setContent((c) => ({
      ...c,
      ibadah: { ...c.ibadah, duas: c.ibadah.duas.filter((_, idx) => idx !== i) },
    }));

  const [section, setSection] = useState<"steps" | "programs" | "duas">("steps");

  const subTabs: { key: "steps" | "programs" | "duas"; label: string }[] = [
    { key: "steps", label: "নামাজের ধাপ" },
    { key: "programs", label: "কার্যক্রম" },
    { key: "duas", label: "দোয়া" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Field label="পেজ সাবটাইটেল" value={ib.subtitle} onChange={(v) => setField("subtitle", v)} textarea />
      </Card>

      {/* Sub-section selector */}
      <div className="flex flex-wrap gap-2">
        {subTabs.map((s) => {
          const active = section === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "gradient-gold text-gold-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Steps section */}
      {section === "steps" && (
        <div className="space-y-3">
          <Card>
            <Field label="ধাপ সেকশনের শিরোনাম" value={ib.stepsTitle} onChange={(v) => setField("stepsTitle", v)} />
          </Card>
          {ib.steps.map((it, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
                  ধাপ {i + 1}
                </span>
                <button
                  onClick={() => removeStep(i)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
                  aria-label="মুছুন"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Field label="ধাপ নম্বর (যেমন ১)" value={it.step} onChange={(v) => setStep(i, { step: v })} />
              <Field label="শিরোনাম" value={it.title} onChange={(v) => setStep(i, { title: v })} />
              <Field label="বিবরণ" value={it.detail} onChange={(v) => setStep(i, { detail: v })} textarea />
            </Card>
          ))}
          <AddButton onClick={addStep} label="নতুন ধাপ যোগ করুন" />
        </div>
      )}

      {/* Programs section */}
      {section === "programs" && (
        <div className="space-y-3">
          <Card>
            <Field label="কার্যক্রম সেকশনের শিরোনাম" value={ib.programsTitle} onChange={(v) => setField("programsTitle", v)} />
          </Card>
          {ib.programs.map((it, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
                  কার্যক্রম {i + 1}
                </span>
                <button
                  onClick={() => removeProgram(i)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
                  aria-label="মুছুন"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Field label="শিরোনাম" value={it.title} onChange={(v) => setProgram(i, { title: v })} />
              <Field label="বিবরণ" value={it.detail} onChange={(v) => setProgram(i, { detail: v })} textarea />
            </Card>
          ))}
          <AddButton onClick={addProgram} label="নতুন কার্যক্রম যোগ করুন" />
        </div>
      )}

      {/* Duas section */}
      {section === "duas" && (
        <div className="space-y-3">
          <Card>
            <Field label="দোয়া সেকশনের শিরোনাম" value={ib.duasTitle} onChange={(v) => setField("duasTitle", v)} />
          </Card>
          {ib.duas.map((it, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
                  দোয়া {i + 1}
                </span>
                <button
                  onClick={() => removeDua(i)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive"
                  aria-label="মুছুন"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Field label="শিরোনাম" value={it.title} onChange={(v) => setDua(i, { title: v })} />
              <Field label="আরবি / উচ্চারণ" value={it.arabic} onChange={(v) => setDua(i, { arabic: v })} textarea />
              <Field label="অর্থ" value={it.meaning} onChange={(v) => setDua(i, { meaning: v })} textarea />
            </Card>
          ))}
          <AddButton onClick={addDua} label="নতুন দোয়া যোগ করুন" />
        </div>
      )}
    </div>
  );
}




function PrayerTab({ content, setContent }: TabProps) {
  const setRow = (i: number, k: "name" | "time", v: string) =>
    setContent((c) => {
      const arr = c.prayerTimes.map((p, idx) => (idx === i ? { ...p, [k]: v } : p));
      return { ...c, prayerTimes: arr };
    });
  const setJamaat = (i: number, v: string) =>
    setContent((c) => {
      const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
      const arr = c.prayerTimes.map((p, idx) =>
        idx === i ? { ...p, jamaat: isNaN(n) ? undefined : n } : p,
      );
      return { ...c, prayerTimes: arr };
    });
  const add = () =>
    setContent((c) => ({ ...c, prayerTimes: [...c.prayerTimes, { name: "নতুন", time: "", jamaat: 15 }] }));
  const remove = (i: number) =>
    setContent((c) => ({ ...c, prayerTimes: c.prayerTimes.filter((_, idx) => idx !== i) }));
  return (
    <Card>
      {content.prayerTimes.map((p, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="ওয়াক্ত" value={p.name} onChange={(v) => setRow(i, "name", v)} />
          </div>
          <div className="flex-1">
            <Field label="সময়" value={p.time} onChange={(v) => setRow(i, "time", v)} />
          </div>
          <div className="w-28">
            <Field
              label="জামাত (মিনিট)"
              value={p.jamaat == null ? "" : String(p.jamaat)}
              onChange={(v) => setJamaat(i, v)}
            />
          </div>
          <button
            onClick={() => remove(i)}
            className="mb-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive"
            aria-label="মুছুন"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <AddButton onClick={add} label="নতুন ওয়াক্ত যোগ করুন" />
    </Card>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

function ListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it}
              onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive"
              aria-label="মুছুন"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, ""])}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"
      >
        <Plus className="h-3.5 w-3.5" /> যোগ করুন
      </button>
    </div>
  );
}

function slugify(name: string, fallback: string) {
  const base = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return base || fallback;
}

function PersonEditor({
  person,
  onChange,
  onRemove,
}: {
  person: SiteContent["staff"][number];
  onChange: (p: SiteContent["staff"][number]) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
            {person.role || "নতুন"}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{person.name || "নাম নেই"}</span>
        </button>
        <button onClick={onRemove} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive" aria-label="মুছুন">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <ImageCropUpload value={person.image} onChange={(img) => onChange({ ...person, image: img })} />
          <Field label="নাম" value={person.name} onChange={(v) => onChange({ ...person, name: v })} />
          <Field label="পদবি" value={person.role} onChange={(v) => onChange({ ...person, role: v })} />
          <div>
            <Field
              label="কাস্টম স্লাগ / লিংক (ঐচ্ছিক)"
              value={person.slug}
              onChange={(v) => {
                const clean = v.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                onChange({ ...person, slug: clean || slugify(person.name, `person-${Date.now()}`) });
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              খালি রাখলে স্বয়ংক্রিয়ভাবে স্লাগ তৈরি হবে। শুধু ইংরেজি অক্ষর, সংখ্যা ও হাইফেন (-) ব্যবহার করা যাবে।
            </p>
          </div>
          <Field label="সংক্ষিপ্ত বিবরণ" value={person.detail} onChange={(v) => onChange({ ...person, detail: v })} textarea />
          <Field label="অভিজ্ঞতা" value={person.experience} onChange={(v) => onChange({ ...person, experience: v })} textarea />
          <Field label="হোয়াটসঅ্যাপ নম্বর (যেমন 8801712345678)" value={person.whatsapp ?? ""} onChange={(v) => onChange({ ...person, whatsapp: v.replace(/[^\d]/g, "") })} />

          <ListField label="পূর্বের কর্মস্থল" items={person.previousJobs} onChange={(v) => onChange({ ...person, previousJobs: v })} />
          <ListField label="দক্ষতার বিষয়" items={person.expertise} onChange={(v) => onChange({ ...person, expertise: v })} />
          <ListField label="শিক্ষাগত যোগ্যতা" items={person.education} onChange={(v) => onChange({ ...person, education: v })} />
        </div>
      )}
    </Card>
  );
}

function StaffTab({ content, setContent }: TabProps) {
  const update = (i: number, p: SiteContent["staff"][number]) =>
    setContent((c) => ({ ...c, staff: c.staff.map((s, idx) => (idx === i ? p : s)) }));
  const remove = (i: number) =>
    setContent((c) => ({ ...c, staff: c.staff.filter((_, idx) => idx !== i) }));
  const add = () =>
    setContent((c) => ({
      ...c,
      staff: [
        ...c.staff,
        {
          slug: slugify("", `staff-${Date.now()}`),
          name: "",
          role: "",
          detail: "",
          experience: "",
          previousJobs: [],
          expertise: [],
          education: [],
        },
      ],
    }));
  return (
    <div className="space-y-5">
      {content.staff.map((s, i) => (
        <PersonEditor key={i} person={s} onChange={(p) => update(i, p)} onRemove={() => remove(i)} />
      ))}
      <AddButton onClick={add} label="নতুন দায়িত্বপ্রাপ্ত যোগ করুন" />
    </div>
  );
}

function CommitteeTab({ content, setContent }: TabProps) {
  const update = (i: number, p: SiteContent["committee"][number]) =>
    setContent((c) => ({ ...c, committee: c.committee.map((s, idx) => (idx === i ? p : s)) }));
  const remove = (i: number) =>
    setContent((c) => ({ ...c, committee: c.committee.filter((_, idx) => idx !== i) }));
  const add = () =>
    setContent((c) => ({
      ...c,
      committee: [
        ...c.committee,
        {
          slug: slugify("", `member-${Date.now()}`),
          name: "",
          role: "",
          detail: "",
          experience: "",
          previousJobs: [],
          expertise: [],
          education: [],
        },
      ],
    }));
  return (
    <div className="space-y-5">
      {content.committee.map((s, i) => (
        <PersonEditor key={i} person={s} onChange={(p) => update(i, p)} onRemove={() => remove(i)} />
      ))}
      <AddButton onClick={add} label="নতুন কমিটি সদস্য যোগ করুন" />
    </div>
  );
}

// ============ আয়-ব্যয় হিসাব ============
type FinanceRow = {
  id: string;
  year: number;
  month: number;
  kind: "income" | "expense";
  amount: number;
  note: string | null;
};

const FIN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const finBn = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const finMoney = (n: number) => {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "৳ " + s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
};

function FinanceTab({ role }: { role: UserRole }) {
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("finance_entries")
      .select("id, year, month, kind, amount, note")
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data as FinanceRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("সঠিক টাকার পরিমাণ লিখুন।");
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("finance_entries").insert({
      year,
      month,
      kind,
      amount: amt,
      note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setAmount("");
    setNote("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("finance_entries").delete().eq("id", id);
    setConfirmId(null);
    if (error) setError(error.message);
    else load();
  };

  // মাসভিত্তিক জের সহ সারাংশ
  // আগে লেখা নোটগুলো — বর্তমান ধরন অগ্রাধিকার পাবে, তারপর বাকিগুলো
  const noteSuggestions = (() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const r of rows) {
      const n = (r.note ?? "").trim();
      if (n && r.kind === kind && !seen.has(n)) {
        seen.add(n);
        ordered.push(n);
      }
    }
    for (const r of rows) {
      const n = (r.note ?? "").trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        ordered.push(n);
      }
    }
    return ordered;
  })();

  const summary = (() => {
    const map = new Map<string, { year: number; month: number; income: number; expense: number }>();
    for (const r of rows) {
      const key = `${r.year}-${r.month}`;
      const cur = map.get(key) ?? { year: r.year, month: r.month, income: 0, expense: 0 };
      if (r.kind === "income") cur.income += Number(r.amount);
      else cur.expense += Number(r.amount);
      map.set(key, cur);
    }
    const asc = [...map.values()].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));
    let opening = 0;
    const out = asc.map((m) => {
      const totalIncome = opening + m.income;
      const closing = totalIncome - m.expense;
      const o = { ...m, opening, totalIncome, closing };
      opening = closing;
      return o;
    });
    return out.reverse();
  })();

  const itemsByMonth = (() => {
    const map = new Map<string, { income: { note: string; amount: number }[]; expense: { note: string; amount: number }[] }>();
    for (const r of rows) {
      const key = `${r.year}-${r.month}`;
      const cur = map.get(key) ?? { income: [], expense: [] };
      const item = { note: (r.note ?? "").trim(), amount: Number(r.amount) };
      if (r.kind === "income") cur.income.push(item);
      else cur.expense.push(item);
      map.set(key, cur);
    }
    return map;
  })();

  const toggleSelect = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const allSelected = summary.length > 0 && selected.size === summary.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(summary.map((s) => `${s.year}-${s.month}`)));

  const escapeHtml = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
    );

  const downloadPdf = () => {
    const chosen =
      selected.size > 0
        ? summary.filter((s) => selected.has(`${s.year}-${s.month}`))
        : summary;
    if (chosen.length === 0) {
      setError("ডাউনলোড করার জন্য কোনো মাস নেই।");
      return;
    }
    const chronological = [...chosen].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : a.month - b.month,
    );
    const itemRows = (items: { note: string; amount: number }[]) =>
      items.length === 0
        ? `<tr><td colspan="2" style="padding:6px 8px;color:#888;">কোনো তথ্য নেই।</td></tr>`
        : items
            .map(
              (it) =>
                `<tr><td style="padding:5px 8px;border-bottom:1px solid #eee;">${escapeHtml(it.note || "বিবরণ নেই")}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right;">${finMoney(it.amount)}</td></tr>`,
            )
            .join("");

    const sections = chronological
      .map((s) => {
        const it = itemsByMonth.get(`${s.year}-${s.month}`) ?? { income: [], expense: [] };
        return `
<div class="month">
  <h2>${FIN_MONTHS[s.month - 1]} ${finBn(s.year)}</h2>
  <div class="grid">
    <div class="stat"><b>গত জের</b><span>${finMoney(s.opening)}</span></div>
    <div class="stat"><b>আয়</b><span>${finMoney(s.income)}</span></div>
    <div class="stat"><b>মোট আয়</b><span>${finMoney(s.totalIncome)}</span></div>
    <div class="stat"><b>ব্যয়</b><span>${finMoney(s.expense)}</span></div>
    <div class="stat"><b>স্থিতি</b><span>${finMoney(s.closing)}</span></div>
  </div>
  <div class="cols">
    <div><h3>কি বাবদ আয়</h3><table><tr><th>বিবরণ</th><th>পরিমাণ</th></tr>${itemRows(it.income)}</table></div>
    <div><h3>কি বাবদ ব্যয়</h3><table><tr><th>বিবরণ</th><th>পরিমাণ</th></tr>${itemRows(it.expense)}</table></div>
  </div>
</div>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8" />
<title>আয়-ব্যয় হিসাব</title>
<style>
  * { font-family: 'Noto Sans Bengali','SolaimanLipi',system-ui,sans-serif; }
  body { margin: 28px; color: #1a1a1a; }
  .mosque { text-align:center; font-size: 22px; font-weight: bold; color:#1a7a4c; margin: 0 0 2px; }
  .tagline { text-align:center; font-size: 12px; color:#666; margin: 0 0 20px; }
  h1 { text-align:center; font-size: 20px; margin: 0 0 20px; }
  .month { margin-bottom: 26px; page-break-inside: avoid; }
  h2 { font-size: 15px; margin: 0 0 8px; border-bottom: 2px solid #1a7a4c; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin-bottom: 12px; }
  .stat { border: 1px solid #ddd; border-radius: 6px; padding: 8px; }
  .stat b { display:block; font-size: 10px; color:#666; font-weight: normal; }
  .stat span { font-size: 14px; font-weight: bold; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  h3 { font-size: 12px; margin: 8px 0 4px; }
  table { width:100%; border-collapse: collapse; font-size: 12px; }
  th { text-align:left; background:#1a7a4c; color:#fff; padding: 5px 8px; }
  th:last-child { text-align:right; }
</style></head><body>
<p class="mosque">বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ, মহিপুর</p>
<p class="tagline">আয়-ব্যয়ের স্বচ্ছ হিসাব</p>
<h1>আয়-ব্যয় হিসাব</h1>
${sections}
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 1 + i);

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      {/* যোগ করার ফর্ম */}
      <div className="rounded-xl border border-border bg-background p-4">
        <h3 className="mb-3 font-semibold text-foreground">নতুন আয়/ব্যয় যোগ করুন</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">ধরন</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKind("income")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm ${kind === "income" ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-background text-foreground"}`}
              >
                <TrendingUp className="h-4 w-4" /> আয়
              </button>
              <button
                type="button"
                onClick={() => setKind("expense")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm ${kind === "expense" ? "border-rose-600 bg-rose-600 text-white" : "border-border bg-background text-foreground"}`}
              >
                <TrendingDown className="h-4 w-4" /> ব্যয়
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">মাস</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {FIN_MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">বছর</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {years.map((y) => (
                <option key={y} value={y}>{finBn(y)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">টাকার পরিমাণ</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">নোট (ঐচ্ছিক)</label>
            <input
              type="text"
              list="finance-note-suggestions"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: বিদ্যুৎ বিল, দান ইত্যাদি"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <datalist id="finance-note-suggestions">
              {noteSuggestions.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
        </div>
        <button
          onClick={add}
          disabled={saving}
          className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          যোগ করুন
        </button>
      </div>

      {/* মাসভিত্তিক সারাংশ (জের সহ) */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground">মাসভিত্তিক হিসাব (স্বয়ংক্রিয় জের সহ)</h3>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={summary.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
          >
            <FileDown className="h-4 w-4" />
            {selected.size > 0 ? `নির্বাচিত ${finBn(selected.size)} মাস PDF` : "সব মাস PDF"}
          </button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">এক বা একাধিক মাস সিলেক্ট করে PDF ডাউনলোড করুন। কোনো মাস সিলেক্ট না করলে সব মাস ডাউনলোড হবে।</p>
        {/* mobile cards */}
        <div className="space-y-2 sm:hidden">
          {summary.length === 0 ? (
            <p className="rounded-xl border border-border px-3 py-6 text-center text-sm text-muted-foreground">
              {loading ? "লোড হচ্ছে…" : "কোনো তথ্য নেই।"}
            </p>
          ) : (
            summary.map((s) => {
              const key = `${s.year}-${s.month}`;
              return (
                <div key={key} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-2">
                      <input type="checkbox" checked={selected.has(key)} onChange={() => toggleSelect(key)} aria-label={`${FIN_MONTHS[s.month - 1]} নির্বাচন`} />
                      <span className="font-semibold text-foreground">{FIN_MONTHS[s.month - 1]} {finBn(s.year)}</span>
                    </label>
                    <span className="shrink-0 font-bold tabular-nums text-lime-700">{finMoney(s.closing)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    <p className="text-muted-foreground">গত জের: <span className="tabular-nums text-slate-600">{finMoney(s.opening)}</span></p>
                    <p className="text-muted-foreground">আয়: <span className="tabular-nums text-emerald-700">{finMoney(s.income)}</span></p>
                    <p className="text-muted-foreground">মোট আয়: <span className="tabular-nums text-foreground">{finMoney(s.totalIncome)}</span></p>
                    <p className="text-muted-foreground">ব্যয়: <span className="tabular-nums text-rose-700">{finMoney(s.expense)}</span></p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* desktop table */}
        <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-muted text-foreground">
                <th className="px-3 py-2 text-center">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="সব নির্বাচন" />
                </th>
                <th className="px-3 py-2 text-left">মাস</th>
                <th className="px-3 py-2 text-right">গত জের</th>
                <th className="px-3 py-2 text-right">আয়</th>
                <th className="px-3 py-2 text-right">মোট আয়</th>
                <th className="px-3 py-2 text-right">ব্যয়</th>
                <th className="px-3 py-2 text-right">স্থিতি</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    {loading ? "লোড হচ্ছে…" : "কোনো তথ্য নেই।"}
                  </td>
                </tr>
              ) : (
                summary.map((s) => {
                  const key = `${s.year}-${s.month}`;
                  return (
                  <tr key={key} className="border-t border-border">
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={selected.has(key)} onChange={() => toggleSelect(key)} aria-label={`${FIN_MONTHS[s.month - 1]} নির্বাচন`} />
                    </td>
                    <td className="px-3 py-2 font-medium">{FIN_MONTHS[s.month - 1]} {finBn(s.year)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-slate-600">{finMoney(s.opening)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-emerald-700">{finMoney(s.income)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{finMoney(s.totalIncome)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-rose-700">{finMoney(s.expense)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-lime-700">{finMoney(s.closing)}</td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* সব এন্ট্রি */}
      <div>
        <h3 className="mb-2 font-semibold text-foreground">সব এন্ট্রি</h3>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${r.kind === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {r.kind === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {finMoney(Number(r.amount))} · {FIN_MONTHS[r.month - 1]} {finBn(r.year)}
                  </p>
                  {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                </div>
              </div>
              {role === "admin" && (
                confirmId === r.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => remove(r.id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">মুছুন</button>
                    <button onClick={() => setConfirmId(null)} className="rounded bg-muted px-2 py-1 text-xs">বাতিল</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(r.id)} className="text-muted-foreground hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )
              )}
            </div>
          ))}
          {rows.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">কোনো এন্ট্রি নেই।</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================ Staff / role accounts ============================

function StaffAccountsTab() {
  const listFn = useServerFn(listStaffAccounts);
  const createFn = useServerFn(createStaffAccount);
  const updateFn = useServerFn(updateStaffAccount);
  const deleteFn = useServerFn(deleteStaffAccount);

  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [creating, setCreating] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editPin, setEditPin] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFn();
      setAccounts(data as StaffAccount[]);
    } catch {
      setError("তালিকা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createFn({ data: { username, pin, name } });
      toast.success("স্টাফ অ্যাকাউন্ট তৈরি হয়েছে।");
      setName("");
      setUsername("");
      setPin("");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "তৈরি ব্যর্থ হয়েছে।");
    } finally {
      setCreating(false);
    }
  };

  const savePin = async (id: string) => {
    if (!/^\d{6}$/.test(editPin)) {
      toast.error("পিন অবশ্যই ৬ সংখ্যার হতে হবে।");
      return;
    }
    setSavingId(id);
    try {
      await updateFn({ data: { id, pin: editPin } });
      toast.success("পিন পরিবর্তন হয়েছে।");
      setEditId(null);
      setEditPin("");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "পরিবর্তন ব্যর্থ হয়েছে।");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string, uname: string) => {
    if (!confirm(`"${uname}" অ্যাকাউন্টটি মুছে ফেলবেন?`)) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("অ্যাকাউন্ট মুছে ফেলা হয়েছে।");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "মুছতে ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-1 text-base font-bold text-primary">নতুন স্টাফ অ্যাকাউন্ট</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          "Finance" রোলের ব্যবহারকারী শুধুমাত্র সদস্য তালিকা, দান আদায় ও আয়-ব্যয় হিসাব পরিচালনা করতে পারবেন।
        </p>
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-foreground">নাম (ঐচ্ছিক)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="যেমন: মো. আব্দুল্লাহ"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-foreground">ইউজারনেম</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="finance01"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-foreground">৬ সংখ্যার পিন</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-center text-base tracking-[0.3em] outline-none focus:border-primary"
              placeholder="••••••"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl gradient-emerald px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              অ্যাকাউন্ট তৈরি করুন
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-4 text-base font-bold text-primary">স্টাফ অ্যাকাউন্ট তালিকা</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">এখনো কোনো স্টাফ অ্যাকাউন্ট নেই।</p>
        ) : (
          <div className="space-y-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {a.name || a.username}
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Finance
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ইউজার: <span className="font-mono">{a.username}</span> · পিন:{" "}
                    <span className="font-mono">{a.pin}</span>
                  </p>
                </div>
                {editId === a.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      placeholder="নতুন পিন"
                      className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm tracking-widest outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => savePin(a.id)}
                      disabled={savingId === a.id}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white disabled:opacity-60"
                      aria-label="সংরক্ষণ"
                    >
                      {savingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditId(null);
                        setEditPin("");
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground"
                      aria-label="বাতিল"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditId(a.id);
                        setEditPin("");
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground hover:bg-secondary/70"
                      aria-label="পিন পরিবর্তন"
                      title="পিন পরিবর্তন"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(a.id, a.username)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                      aria-label="মুছুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
