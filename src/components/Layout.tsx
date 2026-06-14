import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Moon } from "lucide-react";
import { mosque, navItems } from "@/lib/mosque-data";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-gold shadow-gold">
            <Moon className="h-5 w-5 text-gold-foreground" />
          </span>
          <span className="text-lg font-bold text-primary leading-tight">{mosque.shortName}</span>
        </Link>
        <button
          aria-label="মেনু"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background px-4 pb-4 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary" }}
              className="block rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-screen-md flex-1">{children}</main>
      <Footer />
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
