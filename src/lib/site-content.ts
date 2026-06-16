import {
  mosque as mosqueDefault,
  heroSlides,
  staff as staffDefault,
  committee as committeeDefault,
  prayerTimes as prayerDefault,
  development as developmentDefault,
} from "@/lib/mosque-data";
import imam from "@/assets/imam.jpg";
import khatib from "@/assets/khatib.jpg";
import muazzin from "@/assets/muazzin.jpg";
import mosque1 from "@/assets/mosque-1.jpg";
import mosque2 from "@/assets/mosque-2.jpg";
import mosque3 from "@/assets/mosque-3.jpg";


export type MosqueInfo = {
  name: string;
  shortName: string;
  established: string;
  location: string;
  tagline: string;
};

export type PrayerTime = { name: string; time: string; jamaat?: number };

export type StaffMember = {
  slug: string;
  name: string;
  role: string;
  detail: string;
  experience: string;
  previousJobs: string[];
  expertise: string[];
  education: string[];
  image?: string;
};

export type CommitteeMember = StaffMember;

export type SiteSections = {
  prayerTitle: string;
  staffTitle: string;
  committeeTitle: string;
  ctaTitle: string;
  ctaText: string;
  donateLabel: string;
  footerQuote: string;
  footerMessage: string;
};

export type HeroSlide = { image?: string; caption: string };

export type DevelopmentItem = { image?: string; caption: string };

export type DevelopmentContent = {
  title: string;
  subtitle: string;
  items: DevelopmentItem[];
};

export type SiteSettings = {
  title: string;
  icon?: string;
};

export type DonateIcon = "smartphone" | "bank" | "building";

export type DonateMethod = {
  icon: DonateIcon;
  title: string;
  value: string;
  note: string;
};

export type DonateContent = {
  subtitle: string;
  methods: DonateMethod[];
  footerNote: string;
};

export type SiteContent = {
  site: SiteSettings;
  mosque: MosqueInfo;
  heroCaptions: string[];
  heroSlides: HeroSlide[];
  prayerTimes: PrayerTime[];
  staff: StaffMember[];
  committee: CommitteeMember[];
  sections: SiteSections;
  development: DevelopmentContent;
  donate: DonateContent;
};


// Static images keyed by staff slug (images are not editable via the panel)
export const staffImages: Record<string, string> = {
  imam,
  khatib,
  muazzin,
};

export const heroImages: string[] = [mosque1, mosque2, mosque3];

export const defaultContent: SiteContent = {
  site: {
    title: "বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ - মহিপুর",
    icon: "/icon-192.png",
  },
  mosque: { ...mosqueDefault },
  heroCaptions: heroSlides.map((s) => s.caption),
  heroSlides: heroSlides.map((s, i) => ({ image: heroImages[i], caption: s.caption })),
  prayerTimes: prayerDefault.map((p) => ({ ...p })),
  staff: staffDefault.map(({ image, ...rest }) => ({ ...rest })),
  committee: committeeDefault.map((c) => ({ ...c })),
  sections: {
    prayerTitle: "নামাজের সময়সূচি",
    staffTitle: "মসজিদের দায়িত্বপ্রাপ্ত",
    committeeTitle: "মসজিদ কমিটি",
    ctaTitle: "মসজিদের সেবায় শরিক হোন",
    ctaText: "আপনার দান মসজিদের উন্নয়ন ও দ্বীনি শিক্ষায় কাজে লাগবে।",
    donateLabel: "দান করুন",
    footerQuote: "“নিশ্চয়ই মসজিদসমূহ আল্লাহরই জন্য।” — সূরা আল-জিন",
    footerMessage: "এই মসজিদের ওয়েবসাইটের কাজ ফ্রি সদকা হিসেবে করা হয়েছে — আল্লাহ কবুল করুন।",
  },
  development: {
    title: developmentDefault.title,
    subtitle: developmentDefault.subtitle,
    items: developmentDefault.gallery.map((g) => ({ image: g.src, caption: g.caption })),
  },
};


/** Merge partial stored content over the defaults so missing keys are safe. */
export function mergeContent(stored: Partial<SiteContent> | null | undefined): SiteContent {
  if (!stored) return defaultContent;
  return {
    site: { ...defaultContent.site, ...(stored.site ?? {}) },
    mosque: { ...defaultContent.mosque, ...(stored.mosque ?? {}) },
    heroCaptions:
      stored.heroCaptions && stored.heroCaptions.length
        ? stored.heroCaptions
        : defaultContent.heroCaptions,
    heroSlides:
      stored.heroSlides && stored.heroSlides.length
        ? stored.heroSlides
        : defaultContent.heroSlides,
    prayerTimes:
      stored.prayerTimes && stored.prayerTimes.length
        ? stored.prayerTimes
        : defaultContent.prayerTimes,
    staff: stored.staff && stored.staff.length ? stored.staff : defaultContent.staff,
    committee:
      stored.committee && stored.committee.length ? stored.committee : defaultContent.committee,
    sections: { ...defaultContent.sections, ...(stored.sections ?? {}) },
    development: {
      ...defaultContent.development,
      ...(stored.development ?? {}),
      items:
        stored.development?.items && stored.development.items.length
          ? stored.development.items
          : defaultContent.development.items,
    },
  };
}
