import { useMemo } from "react";
import DOMPurify from "dompurify";
import { useSiteContent } from "@/lib/use-site-content";

/**
 * Scrolling (marquee) title bar controlled from the admin panel.
 * Renders sanitized rich HTML and scrolls it horizontally.
 */
export function MarqueeBar() {
  const { marquee } = useSiteContent();

  const safeHtml = useMemo(() => {
    if (!marquee?.html) return "";
    // Allow inline styling (color, bold, italic) and basic formatting tags only.
    return DOMPurify.sanitize(marquee.html, {
      ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "s", "span", "br", "mark", "sub", "sup", "a"],
      ALLOWED_ATTR: ["style", "href", "target", "rel"],
      ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/i,
    });
  }, [marquee?.html]);

  if (!marquee?.enabled || !safeHtml.trim()) return null;

  const duration = Math.max(5, Math.min(120, marquee.speed || 20));

  return (
    <div className="border-y border-gold/30 bg-gradient-to-r from-primary/10 via-gold/10 to-primary/10">
      <div className="marquee-viewport mx-auto max-w-6xl overflow-hidden py-2">
        <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
          <span
            className="marquee-content px-8 text-sm font-semibold text-foreground sm:text-base"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
          <span
            aria-hidden
            className="marquee-content px-8 text-sm font-semibold text-foreground sm:text-base"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </div>
      </div>
    </div>
  );
}
