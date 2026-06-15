import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Moon } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "অ্যাডমিন লগইন — বাইতুন নাজাত জামে মসজিদ" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
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
          <h1 className="mt-3 text-xl font-bold text-primary">অ্যাডমিন প্যানেল</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "লগইন করে সাইট পরিচালনা করুন" : "নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করুন"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-emerald py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন" : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === "login" ? "signup" : "login"));
            setError(null);
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-primary"
        >
          {mode === "login" ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন"}
        </button>
      </div>
      <p className="mt-4 max-w-sm text-center text-xs text-muted-foreground">
        প্রথমবার সাইন আপ করা ব্যক্তি স্বয়ংক্রিয়ভাবে অ্যাডমিন হবেন।
      </p>
    </div>
  );
}

function translateError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "ইমেইল বা পাসওয়ার্ড ভুল।";
  if (/already registered/i.test(msg)) return "এই ইমেইলে অ্যাকাউন্ট আছে। লগইন করুন।";
  if (/password should be at least/i.test(msg)) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  return msg;
}
