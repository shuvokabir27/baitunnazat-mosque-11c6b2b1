import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Heart, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { mosque, heroImages, staff, committee, prayerTimes } from "@/lib/mosque-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বায়তুল মামুর জামে মসজিদ — হোম" },
      { name: "description", content: "বায়তুল মামুর জামে মসজিদ। নামাজের সময়সূচি, ইমাম-খতিব ও কমিটির পরিচিতি।" },
    ],
  }),
  component: Index,
});

function HeroSlider() {
  const [i, setI] = useState(0);
  const next = () => setI((p) => (p + 1) % heroImages.length);
  const prev = () => setI((p) => (p - 1 + heroImages.length) % heroImages.length);

  useEffect(() => {
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[78vh] min-h-[480px] w-full overflow-hidden">
      {heroImages.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={`${mosque.name} ছবি ${idx + 1}`}
          width={1280}
          height={1280}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 gradient-hero opacity-75" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-primary-foreground">
        <span className="rounded-full gradient-gold px-4 py-1 text-sm font-semibold text-gold-foreground shadow-gold">
          প্রতিষ্ঠিত {mosque.established} সন
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight drop-shadow">{mosque.name}</h1>
        <p className="mt-3 max-w-sm text-primary-foreground/90">{mosque.tagline}</p>
        <Link
          to="/donate"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-base font-semibold text-primary shadow-soft"
        >
          <Heart className="h-5 w-5" /> দান করুন
        </Link>
      </div>

      <button onClick={prev} aria-label="পূর্ববর্তী" className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/30 text-primary-foreground backdrop-blur">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={next} aria-label="পরবর্তী" className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/30 text-primary-foreground backdrop-blur">
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            aria-label={`ছবি ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-2 bg-primary-foreground/60"}`}
          />
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-primary">{children}</h2>
      <div className="mx-auto mt-2 h-1 w-16 rounded-full gradient-gold" />
    </div>
  );
}

function Index() {
  return (
    <Layout>
      <HeroSlider />

      {/* Prayer times */}
      <section className="px-4 py-10">
        <SectionTitle>নামাজের সময়সূচি</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          {prayerTimes.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
              <Clock className="mx-auto h-5 w-5 text-gold" />
              <p className="mt-2 font-semibold text-foreground">{p.name}</p>
              <p className="text-lg font-bold text-primary">{p.time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Staff */}
      <section className="bg-secondary/40 px-4 py-12">
        <SectionTitle>মসজিদের দায়িত্বপ্রাপ্ত</SectionTitle>
        <div className="space-y-5">
          {staff.map((s) => (
            <div key={s.role} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                width={768}
                height={768}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover"
              />
              <div>
                <span className="rounded-full gradient-emerald px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  {s.role}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-foreground">{s.name}</h3>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Committee */}
      <section className="px-4 py-12">
        <SectionTitle>মসজিদ কমিটি</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {committee.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full gradient-gold text-lg font-bold text-gold-foreground">
                {c.name.replace(/^(আলহাজ্ব |জনাব )/, "").charAt(0)}
              </div>
              <h3 className="mt-2 text-sm font-bold text-foreground">{c.name}</h3>
              <p className="text-xs text-primary">{c.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4">
        <div className="rounded-3xl gradient-emerald p-7 text-center text-primary-foreground shadow-soft">
          <h2 className="text-xl font-bold">মসজিদের সেবায় শরিক হোন</h2>
          <p className="mt-2 text-sm text-primary-foreground/85">
            আপনার দান মসজিদের উন্নয়ন ও দ্বীনি শিক্ষায় কাজে লাগবে।
          </p>
          <Link
            to="/donate"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 font-semibold text-primary"
          >
            <Heart className="h-5 w-5" /> দান করুন
          </Link>
        </div>
      </section>
    </Layout>
  );
}
