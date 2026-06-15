import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Heart, Clock, X, Download, ZoomIn } from "lucide-react";
import { Layout } from "@/components/Layout";
import { mosque, heroSlides, staff, committee, prayerTimes } from "@/lib/mosque-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ, মহিপুর — হোম" },
      { name: "description", content: "বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ, মহিপুর। নামাজের সময়সূচি, ইমাম-খতিব ও কমিটির পরিচিতি।" },
    ],
  }),
  component: Index,
});

async function saveImage(src: string, name: string) {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank");
  }
}

function HeroSlider() {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const next = () => setI((p) => (p + 1) % heroSlides.length);
  const prev = () => setI((p) => (p - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    if (zoom) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [zoom]);

  return (
    <section>
      {/* Mosque name & established year above the slider */}
      <div className="flex flex-col items-center px-5 pt-6 pb-5 text-center">
        <span className="rounded-full gradient-gold px-4 py-1 text-sm font-semibold text-gold-foreground shadow-gold">
          প্রতিষ্ঠিত {mosque.established} সন
        </span>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-primary">{mosque.name}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{mosque.tagline}</p>
      </div>

      {/* Image area with 16:9 aspect ratio */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        {heroSlides.map((slide, idx) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.caption}
            width={1280}
            height={720}
            onClick={() => idx === i && setZoom(true)}
            className={`absolute inset-0 h-full w-full cursor-zoom-in object-cover transition-opacity duration-1000 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Zoom hint */}
        <span className="pointer-events-none absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
          <ZoomIn className="h-4 w-4" />
        </span>

        {/* Navigation arrows */}
        <button onClick={prev} aria-label="পূর্ববর্তী" className="absolute left-2 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={next} aria-label="পরবর্তী" className="absolute right-2 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-white backdrop-blur">
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`ছবি ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-2 bg-white/70"}`}
            />
          ))}
        </div>
      </div>

      {/* Synced text slide for the current image */}
      <div className="bg-secondary/40 px-5 py-3 text-center">
        <p key={i} className="animate-in fade-in slide-in-from-bottom-2 text-sm font-semibold text-primary duration-500">
          {heroSlides[i].caption}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            onClick={() => setZoom(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-soft"
          >
            <ZoomIn className="h-3.5 w-3.5" /> জুম করুন
          </button>
          <button
            onClick={() => saveImage(heroSlides[i].src, `mosque-${i + 1}.jpg`)}
            className="inline-flex items-center gap-1.5 rounded-full gradient-emerald px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Download className="h-3.5 w-3.5" /> সেভ করুন
          </button>
        </div>
      </div>

      {/* Donate CTA below the slider */}
      <div className="flex flex-col items-center px-5 py-8 text-center">
        <Link
          to="/donate"
          className="inline-flex items-center gap-2 rounded-full gradient-emerald px-6 py-3 text-base font-semibold text-primary-foreground shadow-soft"
        >
          <Heart className="h-5 w-5" /> দান করুন
        </Link>
      </div>

      {/* Zoom lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
        >
          <img
            src={heroSlides[i].src}
            alt={heroSlides[i].caption}
            className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-3 text-center text-sm font-semibold text-white">{heroSlides[i].caption}</p>
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => saveImage(heroSlides[i].src, `mosque-${i + 1}.jpg`)}
              className="flex items-center gap-2 rounded-full gradient-emerald px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Download className="h-4 w-4" /> সেভ করুন
            </button>
            <button
              onClick={() => setZoom(false)}
              aria-label="বন্ধ করুন"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
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
