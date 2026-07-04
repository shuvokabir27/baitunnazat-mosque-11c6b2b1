import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Download, ZoomIn } from "lucide-react";
import { Layout, PageHeader } from "@/components/Layout";
import { useSiteContent } from "@/lib/use-site-content";
import { heroImages } from "@/lib/site-content";


export const Route = createFileRoute("/development")({
  head: () => ({
    meta: [
      { title: "উন্নয়ন কাজ — বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ" },
      { name: "description", content: "মসজিদের চলমান উন্নয়ন কাজের ছবি স্লাইডার ও গ্যালারি। ছবিতে ক্লিক করে যুম ও সেভ করুন।" },
    ],
  }),
  component: Development,
});

function Slider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    const t = setInterval(() => go(1), 4000);
    return () => clearInterval(t);
  }, [go]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-soft" style={{ aspectRatio: "16 / 9" }}>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`উন্নয়ন কাজের ছবি ${i + 1}`}
          width={1280}
          height={720}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <button
        onClick={() => go(-1)}
        aria-label="আগের ছবি"
        className="absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="পরের ছবি"
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}

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

function Development() {
  const { development } = useSiteContent();
  const [active, setActive] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);

  const items = development.items.map((it, idx) => {
    const images =
      it.images && it.images.length
        ? it.images
        : it.image
          ? [it.image]
          : [heroImages[idx % heroImages.length]];
    return { images, caption: it.caption };
  });

  const sliderImages = items.flatMap((it) => it.images);

  const openItem = (i: number) => {
    setActive(i);
    setSlide(0);
  };

  const activeItem = active !== null ? items[active] : null;
  const go = (dir: number) => {
    if (!activeItem) return;
    setSlide((s) => (s + dir + activeItem.images.length) % activeItem.images.length);
  };

  return (
    <Layout>
      <PageHeader title={development.title} subtitle={development.subtitle} />

      <section className="px-4 pt-6">
        <Slider images={sliderImages} />
      </section>

      <section className="px-4 py-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">উন্নয়নের কাজসমূহ</h2>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => openItem(i)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <img
                src={item.images[0]}
                alt={item.caption}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.images.length > 1 ? (
                <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
                  {item.images.length.toLocaleString("bn-BD")} ছবি
                </span>
              ) : (
                <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
                  <ZoomIn className="h-4 w-4" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs font-semibold text-white">
                {item.caption}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeItem && active !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeItem.images[slide]}
              alt={activeItem.caption}
              className="mx-auto max-h-[65vh] w-auto max-w-full rounded-2xl object-contain"
            />
            {activeItem.images.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="আগের ছবি"
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="পরের ছবি"
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <p className="mt-3 text-center text-sm font-semibold text-white">
            {activeItem.caption}
            {activeItem.images.length > 1 && (
              <span className="ml-2 text-white/70">
                ({(slide + 1).toLocaleString("bn-BD")}/{activeItem.images.length.toLocaleString("bn-BD")})
              </span>
            )}
          </p>

          {activeItem.images.length > 1 && (
            <div
              className="mt-3 flex max-w-full gap-2 overflow-x-auto px-2 pb-1"
              onClick={(e) => e.stopPropagation()}
            >
              {activeItem.images.map((src, ti) => (
                <button
                  key={ti}
                  onClick={() => setSlide(ti)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    ti === slide ? "border-white" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => saveImage(activeItem.images[slide], `unnoyon-${active + 1}-${slide + 1}.jpg`)}
              className="flex items-center gap-2 rounded-full gradient-emerald px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              <Download className="h-4 w-4" /> সেভ করুন
            </button>
            <button
              onClick={() => setActive(null)}
              aria-label="বন্ধ করুন"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
