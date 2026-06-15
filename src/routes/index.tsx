import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Heart, Clock, X, Download, ZoomIn, ChevronDown } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";
import { heroImages, staffImages } from "@/lib/site-content";

function staffImageFor(slug: string) {
  return staffImages[slug] ?? heroImages[0];
}

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
  const { mosque, heroSlides, heroCaptions, sections } = useSiteContent();
  const baseSlides: { image?: string; caption: string }[] = heroSlides.length
    ? heroSlides
    : heroCaptions.map((caption) => ({ caption }));
  const slides = baseSlides.map((s, idx) => ({
    src: s.image || heroImages[idx] || heroImages[0],
    caption: s.caption ?? heroCaptions[idx] ?? "",
  }));
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (zoom) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [zoom]);

  return (
    <section>
      {/* Mosque name & established year above the slider */}
      <div className="flex flex-col items-center px-5 pt-6 pb-5 text-center lg:pt-10">
        <h1 className="text-2xl font-bold leading-tight text-primary lg:text-4xl">{mosque.name}</h1>
        <span className="mt-3 rounded-full gradient-gold px-4 py-1 text-sm font-semibold text-gold-foreground shadow-gold">
          প্রতিষ্ঠিত {mosque.established} সন
        </span>
        <p className="mt-3 text-sm text-muted-foreground lg:text-base">{mosque.tagline}</p>
      </div>

      {/* Image area with 16:9 aspect ratio */}
      <div className="relative w-full overflow-hidden lg:mx-auto lg:max-w-4xl lg:rounded-3xl lg:shadow-soft" style={{ aspectRatio: "16 / 9" }}>

        {slides.map((slide, idx) => (
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
          {slides.map((_, idx) => (
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
          {slides[i].caption}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            onClick={() => setZoom(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-soft"
          >
            <ZoomIn className="h-3.5 w-3.5" /> জুম করুন
          </button>
          <button
            onClick={() => saveImage(slides[i].src, `mosque-${i + 1}.jpg`)}
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
          className="animate-pulse-red inline-flex items-center gap-2 rounded-full gradient-red px-6 py-3 text-base font-semibold text-white shadow-red"
        >
          <Heart className="h-5 w-5" /> {sections.donateLabel}
        </Link>
      </div>

      {/* Zoom lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
        >
          <img
            src={slides[i].src}
            alt={slides[i].caption}
            className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="mt-3 text-center text-sm font-semibold text-white">{slides[i].caption}</p>
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => saveImage(slides[i].src, `mosque-${i + 1}.jpg`)}
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
      <h2 className="text-2xl font-bold text-primary lg:text-3xl">{children}</h2>
      <div className="mx-auto mt-2 h-1 w-16 rounded-full gradient-gold" />
    </div>
  );
}

function StaffSection() {
  const { staff, sections } = useSiteContent();
  return (
    <section className="bg-secondary/40 px-4 py-12">
      <SectionTitle>{sections.staffTitle}</SectionTitle>
      <div className="space-y-5 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
        {staff.map((s) => (
          <Link
            key={s.slug}
            to="/staff/$slug"
            params={{ slug: s.slug }}
            className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left shadow-soft transition-transform active:scale-[0.98]"
          >
            <img
              src={s.image || staffImageFor(s.slug)}
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
              <span className="mt-1 inline-block text-xs font-semibold text-primary">প্রোফাইল দেখুন →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CommitteeSection() {
  const { committee, sections } = useSiteContent();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? committee : committee.slice(0, 4);

  return (
    <section className="px-4 py-12">
      <SectionTitle>{sections.committeeTitle}</SectionTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {visible.map((c) => (
          <Link
            key={c.slug}
            to="/committee/$slug"
            params={{ slug: c.slug }}
            className="rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-transform active:scale-[0.98]"
          >
            {c.image ? (
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="mx-auto h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full gradient-gold text-lg font-bold text-gold-foreground">
                {c.name.replace(/^(আলহাজ্ব |জনাব )/, "").charAt(0)}
              </div>
            )}
            <h3 className="mt-2 text-sm font-bold text-foreground">{c.name}</h3>
            <p className="text-xs text-primary">{c.role}</p>
            <span className="mt-1 inline-block text-[11px] font-semibold text-primary">প্রোফাইল দেখুন →</span>
          </Link>
        ))}
      </div>
      {committee.length > 4 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mx-auto mt-5 flex items-center gap-1.5 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-primary shadow-soft"
        >
          {showAll ? "কম দেখুন" : "সকল সদস্য দেখুন"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
        </button>
      )}
    </section>
  );
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toEnNumber(s: string) {
  let out = "";
  for (const ch of s) {
    const idx = BN_DIGITS.indexOf(ch);
    out += idx >= 0 ? String(idx) : ch;
  }
  return out;
}

function toBnNumber(n: number) {
  return String(n)
    .split("")
    .map((c) => (/[0-9]/.test(c) ? BN_DIGITS[Number(c)] : c))
    .join("");
}

// Parse a prayer time + name into minutes-from-midnight (24h)
function prayerMinutes(name: string, time: string): number | null {
  const m = toEnNumber(time).match(/(\d{1,2})\s*[:.]\s*(\d{1,2})/);
  if (!m) return null;
  let hour = Number(m[1]);
  const min = Number(m[2]);
  const isFajr = name.includes("ফজর") || name.includes("সাহরি") || name.includes("সেহরি");
  if (isFajr) {
    if (hour === 12) hour = 0; // 12 AM
    // morning hours stay as-is
  } else {
    if (hour < 12) hour += 12; // afternoon/evening -> PM
  }
  return hour * 60 + min;
}

function useNextPrayer(prayerTimes: { name: string; time: string }[]) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // exclude জুমা (weekly) from the rolling countdown
  const daily = prayerTimes
    .filter((p) => !p.name.includes("জুমা"))
    .map((p) => ({ ...p, mins: prayerMinutes(p.name, p.time) }))
    .filter((p): p is { name: string; time: string; mins: number } => p.mins !== null)
    .sort((a, b) => a.mins - b.mins);

  if (!daily.length) return null;

  const nowMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  let next = daily.find((p) => p.mins > nowMins);
  let diff: number;
  if (next) {
    diff = next.mins - nowMins;
  } else {
    next = daily[0]; // tomorrow's first prayer
    diff = 24 * 60 - nowMins + next.mins;
  }
  const totalMin = Math.floor(diff);
  return { name: next.name, time: next.time, hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
}

function PrayerSection() {
  const { prayerTimes, sections } = useSiteContent();
  const next = useNextPrayer(prayerTimes);
  return (
    <section className="px-4 py-10">
      <SectionTitle>{sections.prayerTitle}</SectionTitle>
      {next && (
        <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl gradient-emerald px-4 py-3 text-center text-primary-foreground shadow-soft">
          <Clock className="h-5 w-5 shrink-0 animate-pulse" />
          <p className="text-sm font-semibold">
            পরবর্তী নামাজ <span className="font-bold">{next.name}</span> ({next.time}) —{" "}
            {next.hours > 0 && <span>{toBnNumber(next.hours)} ঘন্টা </span>}
            {toBnNumber(next.minutes)} মিনিট বাকি
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {prayerTimes.map((p) => {
          const isNext = next?.name === p.name && !p.name.includes("জুমা");
          return (
            <div
              key={p.name}
              className={`rounded-2xl border p-4 text-center shadow-soft transition-colors ${
                isNext ? "border-gold bg-gold/10 ring-2 ring-gold" : "border-border bg-card"
              }`}
            >
              <Clock className={`mx-auto h-5 w-5 ${isNext ? "text-primary" : "text-gold"}`} />
              <p className="mt-2 font-semibold text-foreground">{p.name}</p>
              <p className="text-lg font-bold text-primary">{p.time}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}


function CtaSection() {
  const { sections } = useSiteContent();
  return (
    <section className="px-4 pb-4">
      <div className="rounded-3xl gradient-emerald p-7 text-center text-primary-foreground shadow-soft">
        <h2 className="text-xl font-bold">{sections.ctaTitle}</h2>
        <p className="mt-2 text-sm text-primary-foreground/85">{sections.ctaText}</p>
        <Link
          to="/donate"
          className="animate-pulse-red mt-5 inline-flex items-center gap-2 rounded-full gradient-red px-6 py-3 font-semibold text-white shadow-red"
        >
          <Heart className="h-5 w-5" /> {sections.donateLabel}
        </Link>
      </div>
    </section>
  );
}

function Index() {
  return (
    <Layout>
      <HeroSlider />
      <PrayerSection />
      <StaffSection />
      <CommitteeSection />
      <CtaSection />
    </Layout>
  );
}
