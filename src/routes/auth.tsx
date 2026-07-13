import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Moon, ShieldCheck, KeyRound } from "lucide-react";
import { STAFF_EMAIL_DOMAIN } from "@/lib/staff-accounts.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "লগইন — বাইতুন নাজাত জামে মসজিদ" }],
  }),
  component: AuthPage,
});

type Mode = "admin" | "staff";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "admin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const uname = username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(uname)) throw new Error("ইউজারনেম সঠিক নয়।");
        if (!/^\d{4,32}$/.test(pin.trim())) throw new Error("পিন ৪ থেকে ৩২ সংখ্যার হতে হবে।");
        const { error } = await supabase.auth.signInWithPassword({
          email: `${uname}@${STAFF_EMAIL_DOMAIN}`,
          password: pin.trim(),
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "একটি সমস্যা হয়েছে";
      setError(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-5">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full gradient-gold shadow-gold">
            <Moon className="h-6 w-6 text-gold-foreground" />
          </span>
          <h1 className="mt-3 text-xl font-bold text-primary">লগইন প্যানেল</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            লগইন করে সাইট পরিচালনা করুন
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl bg-secondary/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === "admin" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            অ্যাডমিন
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("staff");
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === "staff" ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            স্টাফ
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "admin" ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">ইমেইল</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">ইউজারনেম</label>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="finance01"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-foreground">৬ সংখ্যার পিন</label>
                <input
                  type="password"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-lg tracking-[0.4em] outline-none focus:border-primary"
                  placeholder="••••••"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-emerald py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "অপেক্ষা করুন..." : "লগইন"}
          </button>
        </form>
      </div>
      <p className="mt-4 max-w-sm text-center text-xs text-muted-foreground">
        শুধুমাত্র অনুমোদিত ব্যবহারকারী লগইন করতে পারবেন।
      </p>
    </div>
  );
}

function translateError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "তথ্য ভুল। আবার চেষ্টা করুন।";
  if (/already registered/i.test(msg)) return "এই অ্যাকাউন্ট আগে থেকেই আছে। লগইন করুন।";
  if (/password should be at least/i.test(msg)) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  return msg;
}
