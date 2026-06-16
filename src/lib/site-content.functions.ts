import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { mergeContent, type SiteContent } from "@/lib/site-content";

/** Public read of the site content. Falls back to defaults when empty. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) throw new Error("Missing backend configuration");
  const supabasePublic = createClient<Database>(supabaseUrl, publishableKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data } = await supabasePublic
    .from("site_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();
  return mergeContent((data?.content as Partial<SiteContent>) ?? null);
});

/** Whether the current authenticated user is an admin. */
export const getMyAdminStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw error;
    return { isAdmin: !!data };
  });

/** Update the full site content document. Admin only. */
export const updateSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { content: SiteContent }) => input)
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw roleError;
    if (!isAdmin) throw new Error("Forbidden");

    const clean = mergeContent(data.content);
    const { error } = await context.supabase
      .from("site_content")
      .update({ content: clean, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) throw error;
    return { ok: true, content: clean };
  });
