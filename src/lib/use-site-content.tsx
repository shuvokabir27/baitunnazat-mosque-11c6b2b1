import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/lib/site-content.functions";
import { defaultContent, type SiteContent } from "@/lib/site-content";

const SiteContentContext = createContext<SiteContent>(defaultContent);

export const siteContentQueryOptions = {
  queryKey: ["site-content"] as const,
  queryFn: () => getSiteContent(),
  // Site content rarely changes and admin saves call invalidateQueries(["site-content"]).
  // Long cache + no focus/mount refetch avoids hammering the server worker on every
  // navigation or tab focus, which was causing Cloudflare "Worker exceeded resource limits".
  staleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
};

function applySiteSettings(site: SiteContent["site"]) {
  if (typeof document === "undefined") return;
  if (site.title) document.title = site.title;
  if (site.icon) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = site.icon;
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const { data } = useSuspenseQuery(siteContentQueryOptions);
  const content = data ?? defaultContent;

  useEffect(() => {
    applySiteSettings(content.site);
  }, [content.site.title, content.site.icon]);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}


export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext);
}
