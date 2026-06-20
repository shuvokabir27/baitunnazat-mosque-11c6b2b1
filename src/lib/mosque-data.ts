import mosque1 from "@/assets/mosque-1.jpg";
import mosque2 from "@/assets/mosque-2.jpg";
import mosque3 from "@/assets/mosque-3.jpg";
import imam from "@/assets/imam.jpg";
import khatib from "@/assets/khatib.jpg";
import muazzin from "@/assets/muazzin.jpg";

export const mosque = {
  name: "বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ, মহিপুর",
  shortName: "বাইতুন নাজাত",
  established: "১৯৪০",
  location: "মহিপুর",
  tagline: "আল্লাহর ঘর — শান্তি ও ইবাদতের কেন্দ্র",
};

export const heroImages = [mosque1, mosque2, mosque3];

export const heroSlides = [
  { src: mosque1, caption: "আল্লাহর ঘর — শান্তি ও ইবাদতের কেন্দ্র" },
  { src: mosque2, caption: "জামাতের সাথে নামাজ আদায়ের পবিত্র স্থান" },
  { src: mosque3, caption: "দ্বীনি শিক্ষা ও কুরআন তিলাওয়াতের কেন্দ্র" },
];

export const development = {
  title: "মসজিদ উন্নয়ন প্রকল্প",
  subtitle: "মুসল্লিদের সহযোগিতায় চলমান উন্নয়ন কাজের ছবি ও অগ্রগতি।",
  // স্লাইডারে দেখানো নির্বাচিত ছবিগুলো
  slider: [mosque1, mosque2, mosque3],
  // নিচের গ্যালারিতে দেখানো সব ছবি (ক্লিক করে যুম ও সেভ করা যাবে)
  gallery: [
    { src: mosque1, caption: "দ্বিতীয় তলা সম্প্রসারণ কাজ" },
    { src: mosque2, caption: "ওযুখানা ও টয়লেট সংস্কার" },
    { src: mosque3, caption: "মিনার ও গম্বুজ সংস্কার" },
    { src: mosque1, caption: "নতুন এয়ার কন্ডিশনার স্থাপন" },
    { src: mosque2, caption: "মূল নামাজ কক্ষের কার্পেট" },
    { src: mosque3, caption: "বাহিরের আঙিনা উন্নয়ন" },
  ],
};

export const staff = [
  {
    slug: "imam",
    name: "মাওলানা আব্দুর রহমান",
    role: "ইমাম",
    image: imam,
    whatsapp: "8801700000001",
    detail: "৩৫ বছরের অভিজ্ঞ ক্বারী ও আলেম",
    experience: "৩৫ বছরের ইমামতি ও ক্বিরাত শিক্ষাদানের অভিজ্ঞতা।",
    previousJobs: [
      "বাইতুল মামুর জামে মসজিদে ইমাম (১০ বছর)",
      "ঢাকা মাদ্রাসায় শিক্ষক (৮ বছর)",
    ],
    expertise: ["তাজবিদ ও ক্বিরাত", "ফিকহ ও মাসআলা", "তাফসির"],
    education: ["দাওরায়ে হাদিস (তাকমিল)", "ক্বিরাত বিশারদ"],
  },
  {
    slug: "khatib",
    name: "মুফতি সাইফুল ইসলাম",
    role: "খতিব",
    image: khatib,
    detail: "জুমার খুতবা ও দ্বীনি শিক্ষাদানে নিবেদিত",
    experience: "২০ বছরের খিতাবত ও ফতোয়া প্রদানের অভিজ্ঞতা।",
    previousJobs: [
      "জামিয়া ইসলামিয়ায় মুফতি (১২ বছর)",
      "কেন্দ্রীয় মসজিদে খতিব (৬ বছর)",
    ],
    expertise: ["ফতোয়া ও ইফতা", "জুমার খুতবা", "ইসলামি আইন"],
    education: ["ইফতা সম্পন্ন (মুফতি)", "দাওরায়ে হাদিস"],
  },
  {
    slug: "muazzin",
    name: "হাফেজ রবিউল হাসান",
    role: "মুয়াজ্জিন",
    image: muazzin,
    detail: "সুমধুর কণ্ঠে আজান ও তিলাওয়াত",
    experience: "১৫ বছরের আজান ও তিলাওয়াতের অভিজ্ঞতা।",
    previousJobs: [
      "স্থানীয় জামে মসজিদে মুয়াজ্জিন (৭ বছর)",
      "মাদ্রাসায় হিফজ বিভাগে সহকারী (৫ বছর)",
    ],
    expertise: ["সুমধুর আজান", "কুরআন তিলাওয়াত", "হিফজ"],
    education: ["হিফজুল কুরআন সম্পন্ন", "মাধ্যমিক দ্বীনি শিক্ষা"],
  },
];


export const committee = [
  {
    slug: "ibrahim",
    name: "আলহাজ্ব মোহাম্মদ ইব্রাহিম",
    role: "সভাপতি",
    detail: "দীর্ঘদিন ধরে মসজিদ পরিচালনায় নিবেদিত একজন সমাজসেবক।",
    experience: "২৫ বছর ধরে মসজিদ ও সমাজকল্যাণমূলক কাজে যুক্ত।",
    previousJobs: ["স্থানীয় স্কুল কমিটির সভাপতি (১২ বছর)", "ব্যবসায়ী সমিতির সদস্য"],
    expertise: ["প্রশাসন ও পরিচালনা", "সমাজসেবা", "তহবিল ব্যবস্থাপনা"],
    education: ["স্নাতক (বি.এ)"],
  },
  {
    slug: "abdul-kader",
    name: "জনাব আব্দুল কাদের",
    role: "সাধারণ সম্পাদক",
    detail: "মসজিদের দৈনন্দিন কার্যক্রম সমন্বয়ের দায়িত্বে।",
    experience: "১৮ বছরের সাংগঠনিক ও প্রশাসনিক অভিজ্ঞতা।",
    previousJobs: ["সমবায় সমিতির সম্পাদক (৮ বছর)", "শিক্ষকতা (১০ বছর)"],
    expertise: ["সাংগঠনিক সমন্বয়", "নথিপত্র ব্যবস্থাপনা", "যোগাযোগ"],
    education: ["স্নাতকোত্তর (এম.এ)"],
  },
  {
    slug: "nurul-amin",
    name: "জনাব নুরুল আমিন",
    role: "কোষাধ্যক্ষ",
    detail: "মসজিদের আর্থিক হিসাব ও তহবিল রক্ষণাবেক্ষণে দায়িত্বশীল।",
    experience: "২০ বছরের হিসাবরক্ষণ ও অর্থ ব্যবস্থাপনার অভিজ্ঞতা।",
    previousJobs: ["ব্যাংকে হিসাবরক্ষক (১৫ বছর)"],
    expertise: ["হিসাবরক্ষণ", "অর্থ ব্যবস্থাপনা", "অডিট"],
    education: ["বি.কম (হিসাববিজ্ঞান)"],
  },
  {
    slug: "shafiqur-rahman",
    name: "জনাব শফিকুর রহমান",
    role: "সহ-সভাপতি",
    detail: "মসজিদ উন্নয়ন ও সিদ্ধান্ত গ্রহণে সক্রিয় ভূমিকা।",
    experience: "১৫ বছরের সমাজসেবা ও নেতৃত্বের অভিজ্ঞতা।",
    previousJobs: ["যুব সংগঠনের সভাপতি (৬ বছর)"],
    expertise: ["নেতৃত্ব", "উন্নয়ন পরিকল্পনা", "জনসংযোগ"],
    education: ["স্নাতক (বি.এস.এস)"],
  },
  {
    slug: "mahbub-alam",
    name: "জনাব মাহবুব আলম",
    role: "সহ-সম্পাদক",
    detail: "সাংগঠনিক কাজে সাধারণ সম্পাদককে সহযোগিতা প্রদান।",
    experience: "১০ বছরের সাংগঠনিক অভিজ্ঞতা।",
    previousJobs: ["স্থানীয় ক্লাব সম্পাদক (৫ বছর)"],
    expertise: ["সাংগঠনিক কাজ", "অনুষ্ঠান ব্যবস্থাপনা"],
    education: ["উচ্চ মাধ্যমিক"],
  },
  {
    slug: "jasim-uddin",
    name: "জনাব জসিম উদ্দিন",
    role: "সদস্য",
    detail: "মসজিদের বিভিন্ন কার্যক্রমে সক্রিয় অংশগ্রহণকারী।",
    experience: "৮ বছর ধরে মসজিদের সেবামূলক কাজে যুক্ত।",
    previousJobs: ["স্বেচ্ছাসেবক সংগঠনের সদস্য"],
    expertise: ["স্বেচ্ছাসেবা", "সমাজসেবা"],
    education: ["উচ্চ মাধ্যমিক"],
  },
];

export const prayerTimes = [
  { name: "ফজর", time: "৫:১৫" },
  { name: "যোহর", time: "১:৩০" },
  { name: "আসর", time: "৪:৪৫" },
  { name: "মাগরিব", time: "৬:৩৫" },
  { name: "ইশা", time: "৮:০০" },
  { name: "জুমা", time: "১:৩০" },
];

export const navItems = [
  { to: "/", label: "হোম" },
  { to: "/members", label: "সদস্য" },
  { to: "/donate", label: "দান করুন" },
] as const;

export const moreNavItems = [
  { to: "/development", label: "উন্নয়ন কাজ" },
  { to: "/ibadah", label: "ইবাদত ও নামাজ" },
] as const;
