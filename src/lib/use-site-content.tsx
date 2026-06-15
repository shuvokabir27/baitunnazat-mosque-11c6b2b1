import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/lib/site-content.functions";
import { defaultContent, type SiteContent } from "@/lib/site-content";

const SiteContentContext = createContext<SiteContent>(defaultContent);

export const siteContentQueryOptions = {
  queryKey: ["site-content"] as const,
  queryFn: () => getSiteContent(),
  initialData: defaultContent,
  staleTime: 1000 * 30,
};

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery(siteContentQueryOptions);
  return (
    <SiteContentContext.Provider value={data ?? defaultContent}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): SiteContent {
  return useContext(SiteContentContext);
}
