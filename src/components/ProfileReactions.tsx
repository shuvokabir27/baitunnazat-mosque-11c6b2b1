import { useEffect, useState } from "react";
import { Heart, ThumbsUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReactions, addReaction } from "@/lib/reactions.functions";

type Reaction = "love" | "like";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBn(n: number) {
  return String(n)
    .split("")
    .map((c) => (/[0-9]/.test(c) ? BN_DIGITS[Number(c)] : c))
    .join("");
}

export function ProfileReactions({ slug }: { slug: string }) {
  const storageKey = `staff-reaction:${slug}`;
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const queryClient = useQueryClient();
  const fetchReactions = useServerFn(getReactions);
  const sendReaction = useServerFn(addReaction);

  const { data: counts } = useQuery({
    queryKey: ["reactions", slug],
    queryFn: () => fetchReactions({ data: { slug } }),
    placeholderData: { love: 0, like: 0 },
  });

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as Reaction | null;
    if (saved === "love" || saved === "like") setReaction(saved);
  }, [storageKey]);

  const mutation = useMutation({
    mutationFn: (kind: Reaction) => sendReaction({ data: { slug, kind } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", slug] });
    },
  });

  const react = (type: Reaction) => {
    if (reaction) return; // already reacted once from this device
    setReaction(type);
    localStorage.setItem(storageKey, type);
    mutation.mutate(type);
  };

  const love = counts?.love ?? 0;
  const like = counts?.like ?? 0;

  return (
    <>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => react("love")}
          disabled={!!reaction}
          aria-pressed={reaction === "love"}
          className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
            reaction === "love"
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-border bg-secondary text-foreground"
          } ${reaction && reaction !== "love" ? "opacity-50" : ""}`}
        >
          <Heart className={`h-4 w-4 ${reaction === "love" ? "fill-current" : ""}`} />
          <span className="tabular-nums">{toBn(love)}</span> লাভ
        </button>
        <button
          onClick={() => react("like")}
          disabled={!!reaction}
          aria-pressed={reaction === "like"}
          className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
            reaction === "like"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary text-foreground"
          } ${reaction && reaction !== "like" ? "opacity-50" : ""}`}
        >
          <ThumbsUp className={`h-4 w-4 ${reaction === "like" ? "fill-current" : ""}`} />
          <span className="tabular-nums">{toBn(like)}</span> লাইক
        </button>
      </div>
      {reaction && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          আপনি এই প্রোফাইলে {reaction === "love" ? "লাভ" : "লাইক"} দিয়েছেন।
        </p>
      )}
    </>
  );
}
