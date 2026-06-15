import { type ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, HeartHandshake, HardHat, BookOpen } from "lucide-react";
import { navItems } from "@/lib/mosque-data";
import { useSiteContent } from "@/lib/use-site-content";

const navIcons: Record<string, typeof Home> = {
  "/": Home,
  "/donate": HeartHandshake,
  "/development": HardHat,
  "/ibadah": BookOpen,
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
    );
  }

  const bangla = now.toLocaleDateString("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const english = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const islamicFmt = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const parts = islamicFmt.formatToParts(now);
  const islamicDay = parseInt(parts.find((p) => p.type === "day")?.value ?? "1", 10);
  const islamicMonth = parseInt(parts.find((p) => p.type === "month")?.value ?? "1", 10);
  const islamicYear = parseInt(parts.find((p) => p.type === "year")?.value ?? "1", 10);
  const arabic = `${toBnNum(islamicDay)} ${islamicMonthsBn[islamicMonth - 1]} ${toBnNum(islamicYear)} হিজরি`;
  const time = now.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center gap-6 text-center leading-tight lg:text-left">
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-base font-bold tabular-nums text-foreground">{time}</span>
        <span dir="rtl" className="text-xs font-medium text-gold">{arabic}</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-xs text-muted-foreground">{english}</span>
        <span className="text-sm font-bold text-primary">{bangla}</span>
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
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <BismillahBar />
      <div className="relative mx-auto flex max-w-screen-md items-center justify-center px-4 py-3 lg:max-w-6xl lg:justify-between">
        <HeaderDateTime />
        {/* Desktop-only top navigation */}
        <nav className="hidden items-center gap-1 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
          {navItems.map((item) => {
            const Icon = navIcons[item.to] ?? Home;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-primary/10 text-primary" }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-screen-md grid-cols-4 px-1 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const Icon = navIcons[item.to] ?? Home;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="flex flex-col items-center gap-1 px-1 py-2 text-muted-foreground transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
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
