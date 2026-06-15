import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { ChevronLeft, Heart, ThumbsUp } from "lucide-react";
import { Layout } from "@/components/Layout";
import { staff } from "@/lib/mosque-data";

export const Route = createFileRoute("/staff/$slug")({
  loader: ({ params }) => {
    const member = staff.find((s) => s.slug === params.slug);
    if (!member) throw notFound();
    return { member };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.member.name ?? "প্রোফাইল";
    return {
      meta: [
        { title: `${name} — বাইতুন নাজাত জামে মসজিদ` },
        { name: "description", content: loaderData?.member.experience ?? "" },
        { property: "og:title", content: name },
        { property: "og:description", content: loaderData?.member.experience ?? "" },
        { property: "og:image", content: loaderData?.member.image ?? "" },
      ],
    };
  },
  errorComponent: () => (
    <Layout>
      <div className="px-4 py-20 text-center text-muted-foreground">কিছু একটা সমস্যা হয়েছে।</div>
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="px-4 py-20 text-center text-muted-foreground">প্রোফাইল পাওয়া যায়নি।</div>
    </Layout>
  ),
  component: StaffProfilePage,
});

type Reaction = "love" | "like";

function StaffProfilePage() {
  const { member } = Route.useLoaderData();
  const storageKey = `staff-reaction:${member.slug}`;
  const [reaction, setReaction] = useState<Reaction | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as Reaction | null;
    if (saved === "love" || saved === "like") setReaction(saved);
  }, [storageKey]);

  const react = (type: Reaction) => {
    if (reaction) return; // already reacted once from this device
    setReaction(type);
    localStorage.setItem(storageKey, type);
  };

  return (
    <Layout>
      <div className="px-4 py-6">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> ফিরে যান
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <img
              src={member.image}
              alt={member.name}
              className="h-32 w-32 rounded-3xl object-cover shadow-soft"
            />
            <span className="mt-4 rounded-full gradient-emerald px-4 py-1 text-xs font-semibold text-primary-foreground">
              {member.role}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-foreground">{member.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{member.detail}</p>
          </div>

          {/* Reaction buttons */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => react("love")}
              disabled={!!reaction}
              aria-pressed={reaction === "love"}
              className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                reaction === "love"
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-border bg-secondary text-foreground"
              } ${reaction && reaction !== "love" ? "opacity-50" : ""}`}
            >
              <Heart className={`h-4 w-4 ${reaction === "love" ? "fill-current" : ""}`} /> লাভ
            </button>
            <button
              onClick={() => react("like")}
              disabled={!!reaction}
              aria-pressed={reaction === "like"}
              className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                reaction === "like"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-foreground"
              } ${reaction && reaction !== "like" ? "opacity-50" : ""}`}
            >
              <ThumbsUp className={`h-4 w-4 ${reaction === "like" ? "fill-current" : ""}`} /> লাইক
            </button>
          </div>
          {reaction && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              আপনি এই প্রোফাইলে {reaction === "love" ? "লাভ" : "লাইক"} দিয়েছেন।
            </p>
          )}
        </div>

        <div className="mt-6 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div>
            <h2 className="text-sm font-bold text-primary">অভিজ্ঞতা</h2>
            <p className="mt-1 text-sm text-muted-foreground">{member.experience}</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">পূর্বের কর্মস্থল</h2>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {member.previousJobs.map((j: string) => (
                <li key={j}>{j}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">দক্ষতার বিষয়</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {member.expertise.map((e: string) => (
                <span key={e} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">শিক্ষাগত যোগ্যতা</h2>
            <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {member.education.map((ed: string) => (
                <li key={ed}>{ed}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
