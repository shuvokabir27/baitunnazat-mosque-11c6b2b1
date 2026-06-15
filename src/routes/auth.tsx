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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
            লগইন করে সাইট পরিচালনা করুন
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
            {loading ? "অপেক্ষা করুন..." : "লগইন"}
          </button>
        </form>
      </div>
      <p className="mt-4 max-w-sm text-center text-xs text-muted-foreground">
        শুধুমাত্র অনুমোদিত অ্যাডমিন লগইন করতে পারবেন।
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
