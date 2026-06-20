import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, HeartHandshake, HardHat, BookOpen, MoreHorizontal } from "lucide-react";
import { navItems, moreNavItems } from "@/lib/mosque-data";
import { useSiteContent } from "@/lib/use-site-content";

const navIcons: Record<string, typeof Home> = {
  "/": Home,
  "/donate": HeartHandshake,
  "/development": HardHat,
  "/ibadah": BookOpen,
};

const navColors: Record<string, { bg: string; text: string; activeBg: string; activeText: string; dot: string }> = {
  "/": { bg: "bg-emerald-100", text: "text-emerald-700", activeBg: "bg-emerald-600", activeText: "text-white", dot: "bg-emerald-500" },
  "/donate": { bg: "bg-amber-100", text: "text-amber-700", activeBg: "bg-amber-500", activeText: "text-white", dot: "bg-amber-500" },
  "/development": { bg: "bg-sky-100", text: "text-sky-700", activeBg: "bg-sky-600", activeText: "text-white", dot: "bg-sky-500" },
  "/ibadah": { bg: "bg-violet-100", text: "text-violet-700", activeBg: "bg-violet-600", activeText: "text-white", dot: "bg-violet-500" },
  more: { bg: "bg-slate-100", text: "text-slate-700", activeBg: "bg-slate-600", activeText: "text-white", dot: "bg-slate-500" },
};

const islamicMonthsBn = [
  "মুহররম",
  "সফর",
  "রবিউল আউয়াল",
  "রবিউস সানি",
  "জমাদিউল আউয়াল",
  "জমাদিউস সানি",
  "রজব",
  "শাবান",
  "রমজান",
  "শাওয়াল",
  "জিলকদ",
  "জিলহজ্জ",
];

function toBnNum(n: number): string {
  return n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)]);
}

function HeaderDateTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="bg-secondary/60 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="flex items-center gap-6 text-center leading-tight lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-base font-bold tabular-nums text-foreground">...</span>
            <span dir="rtl" className="text-xs font-medium text-gold">...</span>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-xs text-muted-foreground">...</span>
            <span className="text-sm font-bold text-primary">...</span>
          </div>
        </div>
      </div>
    );
  }

  const bangla = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // বাংলাদেশের চাঁদ দেখা উম-আল-কুরা ক্যালেন্ডারের চেয়ে সাধারণত ১ দিন পিছিয়ে থাকে
  const islamicDate = new Date(now);
  islamicDate.setDate(islamicDate.getDate() - 1);
  // আরবি/হিজরি তারিখ মাগরিব (সূর্যাস্ত) এর পর পরবর্তী দিনে গণনা হয়
  const maghribHour = 18;
  const maghribMinute = 35;
  if (
    now.getHours() > maghribHour ||
    (now.getHours() === maghribHour && now.getMinutes() >= maghribMinute)
  ) {
    islamicDate.setDate(islamicDate.getDate() + 1);
  }
  const islamicFmt = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = islamicFmt.formatToParts(islamicDate);
  const islamicDay = parseInt(parts.find((p) => p.type === "day")?.value ?? "1", 10);
  const islamicMonth = parseInt(parts.find((p) => p.type === "month")?.value ?? "1", 10);
  const islamicYear = parseInt(parts.find((p) => p.type === "year")?.value ?? "1", 10);
  const arabic = `${toBnNum(islamicDay)} ${islamicMonthsBn[islamicMonth - 1]} ${toBnNum(islamicYear)} হিজরি`;
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-secondary/60 backdrop-blur-sm rounded-lg px-4 py-2">
      <div className="flex items-center gap-6 text-center leading-tight lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <span className="text-base font-bold tabular-nums text-foreground">{time}</span>
          <span dir="rtl" className="text-xs font-medium text-gold">{arabic}</span>
        </div>
        <div className="flex flex-col items-center lg:items-start">
          <span className="text-sm font-bold text-primary">{bangla}</span>
        </div>
      </div>
    </div>
  );
}

function BismillahBar() {
  return (
    <div className="bg-primary text-center py-1.5">
      <span dir="rtl" className="text-sm font-semibold text-primary-foreground">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </span>
    </div>
  );
}

function Header() {
  const [moreOpen, setMoreOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <BismillahBar />
      <div className="relative mx-auto flex max-w-screen-md items-center justify-center px-4 py-3 lg:max-w-6xl lg:justify-between">
        <HeaderDateTime />
        {/* Desktop-only top navigation */}
        <nav className="hidden items-center gap-2 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
          {navItems.map((item) => {
            const Icon = navIcons[item.to] ?? Home;
            const c = navColors[item.to];
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: `${c.activeBg} ${c.activeText} shadow-md` }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:shadow-sm`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* More dropdown */}
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:shadow-sm"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${navColors.more.bg} ${navColors.more.text}`}>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
              <span>আরো</span>
            </button>
            {moreOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-2xl border border-border bg-card p-2 shadow-lg">
                {moreNavItems.map((item) => {
                  const Icon = navIcons[item.to] ?? Home;
                  const c = navColors[item.to];
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      activeProps={{ className: "bg-secondary text-foreground" }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-primary shadow-[0_-8px_24px_-6px_oklch(0.4_0.1_165/0.35)] lg:hidden">
      {moreOpen && (
        <div ref={ref} className="absolute bottom-full right-2 mb-2 w-52 rounded-2xl border border-border bg-card p-2 shadow-lg">
          {moreNavItems.map((item) => {
            const Icon = navIcons[item.to] ?? Home;
            const c = navColors[item.to];
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
      <div className="mx-auto grid max-w-screen-md grid-cols-3 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {navItems.map((item) => {
          const Icon = navIcons[item.to] ?? Home;
          const c = navColors[item.to];
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: `text-white font-bold` }}
              className="group flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-primary-foreground/80 transition-all active:scale-95"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-all group-hover:scale-110 ${c.bg}`}>
                <Icon className={`h-4 w-4 ${c.text}`} />
              </span>
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
              <span className={`h-1 w-1 rounded-full transition-all group-hover:w-3 ${c.dot}`} />
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="group flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-primary-foreground/80 transition-all active:scale-95"
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-all group-hover:scale-110 ${navColors.more.bg}`}>
            <MoreHorizontal className={`h-4 w-4 ${navColors.more.text}`} />
          </span>
          <span className="text-[11px] font-medium leading-tight">আরো</span>
          <span className={`h-1 w-1 rounded-full transition-all group-hover:w-3 ${navColors.more.dot}`} />
        </button>
      </div>
    </nav>
  );
}

function Footer() {
  const { mosque, sections } = useSiteContent();
  return (
    <footer className="mt-16 gradient-hero text-primary-foreground">
      <div className="mx-auto max-w-screen-md px-5 py-10 text-center lg:max-w-6xl">
        <h3 className="text-xl font-bold">{mosque.name}</h3>
        <p className="mt-2 text-sm text-primary-foreground/80">
          {mosque.location} • প্রতিষ্ঠিত {mosque.established}
        </p>
        <div className="mx-auto my-5 h-px w-24 bg-gold/60" />
        <p className="text-sm text-primary-foreground/70">{sections.footerQuote}</p>
        <p className="mt-6 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {mosque.shortName} জামে মসজিদ
        </p>
        <p className="mt-3 text-[11px] text-primary-foreground/50">
          {sections.footerMessage}
        </p>



        <Link to="/admin" className="mt-4 inline-block text-[11px] text-primary-foreground/40">
          অ্যাডমিন
        </Link>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-20 lg:pb-0">
      <Header />
      <main className="mx-auto w-full max-w-screen-md flex-1 lg:max-w-6xl">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="gradient-hero px-5 py-12 text-center text-primary-foreground">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-primary-foreground/85">{subtitle}</p>
    </section>
  );
}
