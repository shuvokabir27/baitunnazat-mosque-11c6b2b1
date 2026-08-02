import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";

import { useSiteContent } from "@/lib/use-site-content";

const STORAGE_KEY = "prayer-notify-enabled";
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toEn(s: string) {
  return s.replace(/[০-৯]/g, (c) => String(BN_DIGITS.indexOf(c)));
}

// প্রতি নামাজের সময়কে মধ্যরাত থেকে মিনিটে রূপান্তর
function prayerMinutes(name: string, time: string): number | null {
  const m = toEn(time).match(/(\d{1,2})\s*[:.]\s*(\d{1,2})/);
  if (!m) return null;
  let hour = Number(m[1]);
  const min = Number(m[2]);
  const isFajr = name.includes("ফজর") || name.includes("সাহরি") || name.includes("সেহরি");
  if (isFajr) {
    if (hour === 12) hour = 0;
  } else if (hour < 12) {
    hour += 12;
  }
  return hour * 60 + min;
}

export function PrayerNotification() {
  const { prayerTimes } = useSiteContent();
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setSupported(false);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    // আগে অনুমতি দেওয়া থাকলে নতুন করে কিছু চাইতে হবে না — সরাসরি চালু
    if (Notification.permission === "granted") {
      if (stored !== "0") {
        localStorage.setItem(STORAGE_KEY, "1");
        setEnabled(true);
      }
      return;
    }

    // ব্যবহারকারী নিজে বন্ধ না করে থাকলে সাইট লোডেই একবার অনুমতি চাওয়া হবে
    if (Notification.permission === "default" && stored === null) {
      const t = setTimeout(() => {
        Notification.requestPermission()
          .then((perm) => {
            if (perm === "granted") {
              localStorage.setItem(STORAGE_KEY, "1");
              setEnabled(true);
            }
          })
          .catch(() => {
            /* ignore */
          });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const show = useCallback((title: string, body: string) => {
    try {
      const n = new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: title + body,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) return;

    const daily = prayerTimes
      .filter((p) => !p.name.includes("জুমা"))
      .map((p) => ({ name: p.name, time: p.time, mins: prayerMinutes(p.name, p.time) }))
      .filter((p): p is { name: string; time: string; mins: number } => p.mins !== null);

    if (!daily.length) return;

    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const nowMins = now.getHours() * 60 + now.getMinutes();

      for (const p of daily) {
        const before = `${key}|${p.name}|pre`;
        const at = `${key}|${p.name}|now`;
        const diff = p.mins - nowMins;
        if (diff <= 10 && diff >= 8 && !firedRef.current.has(before)) {
          firedRef.current.add(before);
          show(`${p.name} এর জামাত ১০ মিনিট পর`, `জামাতের সময় ${p.time} — মসজিদে আসার প্রস্তুতি নিন।`);
        }
        if (diff <= 0 && diff >= -1 && !firedRef.current.has(at)) {
          firedRef.current.add(at);
          show(`${p.name} এর জামাত শুরু`, `বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ — সময় ${p.time}`);
        }
      }
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [enabled, prayerTimes, show]);

  if (!supported) return null;

  const toggle = async () => {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "0");
      toast.success("নামাজের নোটিফিকেশন বন্ধ করা হয়েছে");
      return;
    }
    let perm = Notification.permission;
    if (perm !== "granted") perm = await Notification.requestPermission();
    if (perm !== "granted") {
      toast.error("ব্রাউজার থেকে নোটিফিকেশনের অনুমতি দিন");
      return;
    }
    setEnabled(true);
    localStorage.setItem(STORAGE_KEY, "1");
    show("নোটিফিকেশন চালু হয়েছে", "প্রতি ওয়াক্তের ১০ মিনিট আগে ও জামাতের সময় জানিয়ে দেওয়া হবে।");
    toast.success("নামাজের নোটিফিকেশন চালু হয়েছে");
  };

  return (
    <div className="mb-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        </span>
        <div>
          <p className="font-semibold text-foreground">নামাজের নোটিফিকেশন</p>
          <p className="text-xs text-muted-foreground">
            ব্রাউজারে সাইট খোলা থাকলে প্রতি ওয়াক্তের ১০ মিনিট আগে ও জামাতের সময় জানিয়ে দেবে।
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
          enabled
            ? "border border-border bg-muted text-foreground hover:bg-muted/70"
            : "gradient-emerald text-primary-foreground shadow-soft"
        }`}
      >
        {enabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {enabled ? "বন্ধ করুন" : "চালু করুন"}
      </button>
    </div>
  );
}
