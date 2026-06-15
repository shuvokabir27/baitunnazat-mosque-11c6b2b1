import { createServerFn } from "@tanstack/react-start";

export type ReactionCounts = { love: number; like: number };

/** Public read of reaction counts for a profile slug. */
export const getReactions = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    const slug = String(input.slug ?? "").slice(0, 200);
    return { slug };
  })
  .handler(async ({ data }): Promise<ReactionCounts> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("profile_reactions")
      .select("kind, count")
      .eq("slug", data.slug);
    const counts: ReactionCounts = { love: 0, like: 0 };
    for (const r of rows ?? []) {
      if (r.kind === "love") counts.love = r.count;
      else if (r.kind === "like") counts.like = r.count;
    }
    return counts;
  });

/** Public: add one love or like reaction to a profile. */
export const addReaction = createServerFn({ method: "POST" })
  .inputValidator((input: { slug: string; kind: "love" | "like" }) => {
    const slug = String(input.slug ?? "").slice(0, 200);
    const kind = input.kind === "love" || input.kind === "like" ? input.kind : null;
    if (!slug || !kind) throw new Error("Invalid input");
    return { slug, kind };
  })
  .handler(async ({ data }): Promise<{ count: number }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: count, error } = await supabaseAdmin.rpc("increment_reaction", {
      _slug: data.slug,
      _kind: data.kind,
    });
    if (error) throw error;
    return { count: (count as number) ?? 0 };
  });
