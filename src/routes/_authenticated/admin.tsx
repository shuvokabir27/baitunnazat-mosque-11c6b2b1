import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  LogOut,
  Save,
  Plus,
  Trash2,
  Loader2,
  ShieldAlert,
  Menu,
  LayoutDashboard,
  Images,
  FileText,
  Clock,
  Users,
  UsersRound,
  Home,
} from "lucide-react";
import { defaultContent, type SiteContent } from "@/lib/site-content";
import {
  getSiteContent,
  updateSiteContent,
  getMyAdminStatus,
  claimAdmin,
} from "@/lib/site-content.functions";
import { ImageCropUpload } from "@/components/ImageCropUpload";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "অ্যাডমিন প্যানেল" }] }),
  component: AdminPage,
});

type Status = "loading" | "denied" | "ready";

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const update = useServerFn(updateSiteContent);
  const checkAdmin = useServerFn(getMyAdminStatus);
  const claim = useServerFn(claimAdmin);

  const [status, setStatus] = useState<Status>("loading");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("mosque");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const claimed = await claim();
        const admin = claimed.isAdmin ? claimed : await checkAdmin();
        if (!admin.isAdmin) {
          setStatus("denied");
          return;
        }
        const loaded = await getSiteContent();
        setContent(loaded);
        setStatus("ready");
      } catch {
        setStatus("denied");
      }
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await update({ data: { content } });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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
    <div className="min-h-screen bg-secondary/30 pb-24">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-primary">অ্যাডমিন প্যানেল</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full gradient-emerald px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              সংরক্ষণ
            </button>
            <button
              onClick={signOut}
              className="grid h-9 w-9 place-items-center rounded-full bg-card text-muted-foreground shadow-soft"
              aria-label="লগ আউট"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {saved && (
          <p className="bg-emerald-600 py-1 text-center text-xs font-semibold text-white">
            সফলভাবে সংরক্ষিত হয়েছে ✓
          </p>
        )}
        <Tabs tab={tab} setTab={setTab} />
      </header>

      <main className="mx-auto max-w-screen-md space-y-6 px-4 py-6">
        {tab === "mosque" && <MosqueTab content={content} setContent={setContent} />}
        {tab === "slider" && <SliderTab content={content} setContent={setContent} />}
        {tab === "sections" && <SectionsTab content={content} setContent={setContent} />}
        {tab === "prayer" && <PrayerTab content={content} setContent={setContent} />}
        {tab === "staff" && <StaffTab content={content} setContent={setContent} />}
        {tab === "committee" && <CommitteeTab content={content} setContent={setContent} />}
      </main>
    </div>
  );
}

type Tab = "mosque" | "slider" | "sections" | "prayer" | "staff" | "committee";
const TAB_LABELS: Record<Tab, string> = {
  mosque: "মসজিদ",
  slider: "স্লাইডার",
  sections: "সেকশন লেখা",
  prayer: "নামাজ",
  staff: "দায়িত্বপ্রাপ্ত",
  committee: "কমিটি",
};

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="mx-auto flex max-w-screen-md gap-1 overflow-x-auto px-2 py-2">
      {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            tab === t ? "gradient-emerald text-primary-foreground" : "bg-card text-muted-foreground"
          }`}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
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

function PrayerTab({ content, setContent }: TabProps) {
  const setRow = (i: number, k: "name" | "time", v: string) =>
    setContent((c) => {
      const arr = c.prayerTimes.map((p, idx) => (idx === i ? { ...p, [k]: v } : p));
      return { ...c, prayerTimes: arr };
    });
  const add = () =>
    setContent((c) => ({ ...c, prayerTimes: [...c.prayerTimes, { name: "নতুন", time: "" }] }));
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
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="rounded-full gradient-gold px-3 py-0.5 text-xs font-semibold text-gold-foreground">
          {person.role || "নতুন"}
        </span>
        <button onClick={onRemove} className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive" aria-label="মুছুন">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <ImageCropUpload value={person.image} onChange={(img) => onChange({ ...person, image: img })} />
      <Field label="নাম" value={person.name} onChange={(v) => onChange({ ...person, name: v })} />
      <Field label="পদবি" value={person.role} onChange={(v) => onChange({ ...person, role: v })} />
      <Field label="সংক্ষিপ্ত বিবরণ" value={person.detail} onChange={(v) => onChange({ ...person, detail: v })} textarea />
      <Field label="অভিজ্ঞতা" value={person.experience} onChange={(v) => onChange({ ...person, experience: v })} textarea />
      <ListField label="পূর্বের কর্মস্থল" items={person.previousJobs} onChange={(v) => onChange({ ...person, previousJobs: v })} />
      <ListField label="দক্ষতার বিষয়" items={person.expertise} onChange={(v) => onChange({ ...person, expertise: v })} />
      <ListField label="শিক্ষাগত যোগ্যতা" items={person.education} onChange={(v) => onChange({ ...person, education: v })} />
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
