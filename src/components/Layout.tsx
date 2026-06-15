import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Home, HeartHandshake, HardHat, BookOpen } from "lucide-react";
import { mosque, navItems } from "@/lib/mosque-data";

const navIcons: Record<string, typeof Home> = {
  "/": Home,
  "/donate": HeartHandshake,
  "/development": HardHat,
  "/ibadah": BookOpen,
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-md items-center justify-center px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-gold shadow-gold">
            <Moon className="h-5 w-5 text-gold-foreground" />
          </span>
          <span className="text-lg font-bold text-primary leading-tight">{mosque.shortName}</span>
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-screen-md grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
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
  return (
    <footer className="mt-16 gradient-hero text-primary-foreground">
      <div className="mx-auto max-w-screen-md px-5 py-10 text-center">
        <h3 className="text-xl font-bold">{mosque.name}</h3>
        <p className="mt-2 text-sm text-primary-foreground/80">
          {mosque.location} • প্রতিষ্ঠিত {mosque.established}
        </p>
        <div className="mx-auto my-5 h-px w-24 bg-gold/60" />
        <p className="text-sm text-primary-foreground/70">
          “নিশ্চয়ই মসজিদসমূহ আল্লাহরই জন্য।” — সূরা আল-জিন
        </p>
        <p className="mt-6 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} {mosque.shortName} জামে মসজিদ
        </p>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="mx-auto w-full max-w-screen-md flex-1">{children}</main>
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
