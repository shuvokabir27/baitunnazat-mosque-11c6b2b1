import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || typeof window !== "undefined" ? window.location.href : "";

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [title, text, shareUrl]);

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
      type="button"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          কপি হয়েছে
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          শেয়ার
        </>
      )}
    </button>
  );
}
