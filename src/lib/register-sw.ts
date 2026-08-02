/**
 * অফলাইন/দ্রুত লোডের জন্য সার্ভিস ওয়ার্কার রেজিস্ট্রেশন।
 * প্রিভিউ, iframe, ডেভ মোড কিংবা ?sw=off থাকলে রেজিস্টার হবে না — বরং পুরনো ওয়ার্কার মুছে দেবে।
 */
const SW_URL = "/sw.js";

function isBlockedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterAppWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => {
        const url =
          r.active?.scriptURL ?? r.waiting?.scriptURL ?? r.installing?.scriptURL ?? "";
        return url.endsWith(SW_URL);
      })
      .map((r) => r.unregister()),
  );
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (isBlockedContext()) {
    void unregisterAppWorkers();
    return;
  }
  void navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
    /* ignore */
  });
}
