import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeartHandshake, Loader2, X } from "lucide-react";

const STORAGE_KEY = "bn_volunteer_lead_done";

export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/auth")) return;
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markDone = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Insert the lead; duplicate phone numbers are treated as already submitted.
  const saveLead = async (trimmed: string) => {
    const { error: insertError } = await supabase
      .from("volunteer_leads")
      .insert({ name: name.trim() || null, phone: trimmed });
    if (insertError && insertError.code !== "23505") throw insertError;
  };

  // Closing the popup: if a valid number was typed, save it automatically.
  const close = async () => {
    const trimmed = phone.trim();
    if (trimmed.length >= 6) {
      try {
        await saveLead(trimmed);
      } catch {
        /* ignore — user is dismissing anyway */
      }
    }
    markDone();
    setOpen(false);
  };

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
      await saveLead(trimmed);
      markDone();
      setDone(true);
      setTimeout(() => setOpen(false), 3500);
    } catch {
      setError("জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={close}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="বন্ধ করুন"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-emerald text-primary-foreground">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-primary">জাজাকাল্লাহু খাইরান</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              আপনাকে অসংখ্য ধন্যবাদ ও শুকরিয়া। আল্লাহ আপনার নেক ইচ্ছা কবুল করুন। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে ইনশাআল্লাহ।
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-gold text-gold-foreground">
                <HeartHandshake className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-primary">
                আল্লাহর ঘর মসজিদের কাজে যুক্ত হোন
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                মসজিদের সেবায় শরিক হতে আপনার মোবাইল নম্বরটি দিন — আমরা আপনার সাথে যোগাযোগ করব ইনশাআল্লাহ।
              </p>
            </div>
            <form onSubmit={submit} className="mt-5 space-y-3">
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
              <button
                type="button"
                onClick={close}
                className="w-full rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                পরে দেব, সাইট দেখি
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
