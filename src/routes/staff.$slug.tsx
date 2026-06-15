import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { staff } from "@/lib/mosque-data";
import { useSiteContent } from "@/lib/use-site-content";
import { staffImages, heroImages } from "@/lib/site-content";
import { ProfileReactions } from "@/components/ProfileReactions";


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

function StaffProfilePage() {
  const { member: loaderMember } = Route.useLoaderData();
  const { staff: liveStaff } = useSiteContent();
  const member = liveStaff.find((s) => s.slug === loaderMember.slug) ?? loaderMember;
  const image = member.image || staffImages[member.slug] || heroImages[0];


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
              src={image}
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
          <ProfileReactions slug={member.slug} />

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
