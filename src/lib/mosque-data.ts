import mosque1 from "@/assets/mosque-1.jpg";
import mosque2 from "@/assets/mosque-2.jpg";
import mosque3 from "@/assets/mosque-3.jpg";
import imam from "@/assets/imam.jpg";
import khatib from "@/assets/khatib.jpg";
import muazzin from "@/assets/muazzin.jpg";

export const mosque = {
  name: "বাইতুন নাজাত কেন্দ্রিয় জামে মসজিদ, মহিপুর",
  shortName: "বাইতুন নাজাত",
  established: "১৯৭৮",
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
    name: "মাওলানা আব্দুর রহমান",
    role: "ইমাম",
    image: imam,
    detail: "৩৫ বছরের অভিজ্ঞ ক্বারী ও আলেম",
  },
  {
    name: "মুফতি সাইফুল ইসলাম",
    role: "খতিব",
    image: khatib,
    detail: "জুমার খুতবা ও দ্বীনি শিক্ষাদানে নিবেদিত",
  },
  {
    name: "হাফেজ রবিউল হাসান",
    role: "মুয়াজ্জিন",
    image: muazzin,
    detail: "সুমধুর কণ্ঠে আজান ও তিলাওয়াত",
  },
];

export const committee = [
  { name: "আলহাজ্ব মোহাম্মদ ইব্রাহিম", role: "সভাপতি" },
  { name: "জনাব আব্দুল কাদের", role: "সাধারণ সম্পাদক" },
  { name: "জনাব নুরুল আমিন", role: "কোষাধ্যক্ষ" },
  { name: "জনাব শফিকুর রহমান", role: "সহ-সভাপতি" },
  { name: "জনাব মাহবুব আলম", role: "সহ-সম্পাদক" },
  { name: "জনাব জসিম উদ্দিন", role: "সদস্য" },
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
  { to: "/donate", label: "দান করুন" },
  { to: "/development", label: "উন্নয়ন কাজ" },
  { to: "/ibadah", label: "ইবাদত ও নামাজ" },
] as const;
