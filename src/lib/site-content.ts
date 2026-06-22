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
  whatsapp?: string;
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
  // Optional bank-specific fields (shown when provided, e.g. for ব্যাংক)
  bankName?: string;
  branch?: string;
  routingNumber?: string;
  holderName?: string;
  accountNumber?: string;
};

export type DonateContent = {
  subtitle: string;
  methods: DonateMethod[];
  footerNote: string;
};

export type IbadahStep = { step: string; title: string; detail: string };
export type IbadahProgram = { title: string; detail: string };
export type IbadahDua = { title: string; arabic: string; meaning: string };

export type IbadahContent = {
  subtitle: string;
  stepsTitle: string;
  steps: IbadahStep[];
  programsTitle: string;
  programs: IbadahProgram[];
  duasTitle: string;
  duas: IbadahDua[];
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
  ibadah: IbadahContent;
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
  donate: {
    subtitle:
      "“যে ব্যক্তি আল্লাহর সন্তুষ্টির জন্য একটি মসজিদ নির্মাণ করে, আল্লাহ তার জন্য জান্নাতে অনুরূপ ঘর নির্মাণ করেন।”",
    methods: [
      { icon: "smartphone", title: "বিকাশ", value: "০১৭xx-xxxxxx", note: "পার্সোনাল / সেন্ড মানি" },
      { icon: "smartphone", title: "নগদ", value: "০১৮xx-xxxxxx", note: "পার্সোনাল / সেন্ড মানি" },
      {
        icon: "bank",
        title: "ব্যাংক",
        value: "",
        note: "",
        bankName: "ইসলামী ব্যাংক বাংলাদেশ",
        branch: "মিরপুর শাখা",
        routingNumber: "১২৫২৬১৭৩৪",
        holderName: "বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ",
        accountNumber: "১২৩৪৫৬৭৮৯০",
      },
      { icon: "building", title: "সরাসরি", value: "মসজিদ অফিসে যোগাযোগ করুন", note: "দান বাক্সে দান করুন" },
    ],
    footerNote: "আপনার সদকা ও দান মসজিদের বিদ্যুৎ বিল, ইমাম-মুয়াজ্জিনের সম্মানী ও উন্নয়ন কাজে ব্যয় হয়।",
  },
  ibadah: {
    subtitle: "নামাজ শিক্ষা, বিভিন্ন ইবাদত ও দোয়া অর্থসহ এক জায়গায়।",
    stepsTitle: "নামাজ আদায়ের ধাপসমূহ",
    steps: [
      { step: "১", title: "ওযু করা", detail: "নিয়তসহ হাত, মুখ, বাহু, মাথা মাসেহ ও পা ধৌত করা।" },
      { step: "২", title: "নিয়ত করা", detail: "কোন ওয়াক্তের কত রাকাত নামাজ পড়বেন তা মনে স্থির করা।" },
      { step: "৩", title: "তাকবিরে তাহরিমা", detail: "“আল্লাহু আকবার” বলে হাত বাঁধা।" },
      { step: "৪", title: "ক্বিরাত", detail: "সূরা ফাতিহা ও তার সাথে অন্য সূরা পাঠ করা।" },
      { step: "৫", title: "রুকু ও সিজদা", detail: "রুকু ও দুই সিজদা যথাযথভাবে আদায় করা।" },
      { step: "৬", title: "তাশাহহুদ ও সালাম", detail: "শেষ বৈঠকে তাশাহহুদ, দরুদ পড়ে সালাম ফেরানো।" },
    ],
    programsTitle: "বিভিন্ন ইবাদত কার্যক্রম",
    programs: [
      { title: "পাঁচ ওয়াক্ত জামাত", detail: "প্রতিদিন নির্ধারিত সময়ে জামাতে নামাজ আদায়।" },
      { title: "জুমার নামাজ", detail: "প্রতি শুক্রবার খুতবাসহ জুমার জামাত।" },
      { title: "তারাবিহ", detail: "রমজান মাসে খতমে তারাবিহর আয়োজন।" },
      { title: "তাফসির মাহফিল", detail: "প্রতি সপ্তাহে কুরআনের তাফসির আলোচনা।" },
      { title: "যিকির ও দোয়া", detail: "ফজর ও মাগরিবের পর সম্মিলিত যিকির।" },
    ],
    duasTitle: "গুরুত্বপূর্ণ দোয়া (অর্থসহ)",
    duas: [
      {
        title: "সানা",
        arabic: "সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা ওয়া তাবা-রকাসমুকা ওয়া তাআ-লা জাদ্দুকা ওয়া লা ইলা-হা গায়রুক।",
        meaning: "হে আল্লাহ! তোমার প্রশংসাসহ তোমার পবিত্রতা ঘোষণা করছি, তোমার নাম বরকতময়, তোমার মর্যাদা সুউচ্চ এবং তুমি ছাড়া কোনো উপাস্য নেই।",
      },
      {
        title: "রুকুর তাসবিহ",
        arabic: "সুবহানা রব্বিয়াল আযীম (৩ বার)",
        meaning: "আমার মহান রবের পবিত্রতা ঘোষণা করছি।",
      },
      {
        title: "সিজদার তাসবিহ",
        arabic: "সুবহানা রব্বিয়াল আ’লা (৩ বার)",
        meaning: "আমার সর্বোচ্চ রবের পবিত্রতা ঘোষণা করছি।",
      },
      {
        title: "খাবারের পূর্বে",
        arabic: "বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।",
        meaning: "আল্লাহর নামে এবং আল্লাহর দেওয়া বরকত নিয়ে (শুরু করছি)।",
      },
      {
        title: "ঘুমানোর দোয়া",
        arabic: "আল্লাহুম্মা বিইসমিকা আমূতু ওয়া আহইয়া।",
        meaning: "হে আল্লাহ! তোমারই নামে আমি মরি ও বাঁচি।",
      },
    ],
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
    donate: {
      ...defaultContent.donate,
      ...(stored.donate ?? {}),
      methods:
        stored.donate?.methods && stored.donate.methods.length
          ? stored.donate.methods
          : defaultContent.donate.methods,
    },
  };
}
