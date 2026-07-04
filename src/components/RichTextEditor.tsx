import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  RemoveFormatting,
  Smile,
  Pipette,
  Highlighter,
} from "lucide-react";

const COLORS = [
  "#e11d48", // red
  "#f43f5e", // rose
  "#ea580c", // orange
  "#f59e0b", // amber
  "#ca8a04", // gold
  "#eab308", // yellow
  "#16a34a", // green
  "#22c55e", // emerald
  "#0d9488", // teal
  "#06b6d4", // cyan
  "#2563eb", // blue
  "#3b82f6", // sky
  "#6366f1", // indigo
  "#7c3aed", // violet
  "#a855f7", // purple
  "#db2777", // pink
  "#0f172a", // near-black
  "#64748b", // slate
  "#ffffff", // white
  "#facc15", // bright gold
];

const SYMBOLS = [
  "★", "☆", "❤", "✿", "✦", "☪", "۞", "﷽", "☝", "•",
  "→", "←", "↔", "»", "«", "◆", "●", "✔", "✓", "❗",
  "❓", "‼", "📢", "🕌", "🌙", "🤲", "📿", "🕋", "🌟", "☀",
];

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

/**
 * A lightweight classic rich text editor built on contentEditable.
 * Supports bold, italic, underline, strikethrough, text color, and symbols.
 * Emits sanitized-ready HTML via onChange.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [showColors, setShowColors] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [customColor, setCustomColor] = useState("#16a34a");

  // Keep the DOM in sync when the external value changes (e.g. initial load),
  // but avoid clobbering the caret while the user is typing.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  // Remember the current text selection so color pickers can restore it
  // (opening a popover / native color input can drop the selection).
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const applyColor = (color: string) => {
    ref.current?.focus();
    restoreSelection();
    exec("styleWithCSS", "true");
    exec("foreColor", color);
    setShowColors(false);
    emit();
  };

  const applyHighlight = (color: string) => {
    ref.current?.focus();
    restoreSelection();
    exec("styleWithCSS", "true");
    exec("hiliteColor", color);
    emit();
  };

  const insertSymbol = (sym: string) => {
    ref.current?.focus();
    restoreSelection();
    exec("insertText", sym);
    setShowSymbols(false);
    emit();
  };

  const btn =
    "grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-secondary";

  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border p-2">
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => { exec("bold"); emit(); }} aria-label="বোল্ড">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => { exec("italic"); emit(); }} aria-label="ইটালিক">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => { exec("underline"); emit(); }} aria-label="আন্ডারলাইন">
          <Underline className="h-4 w-4" />
        </button>
        <button type="button" className={btn} onMouseDown={(e) => e.preventDefault()} onClick={() => { exec("strikeThrough"); emit(); }} aria-label="স্ট্রাইকথ্রু">
          <Strikethrough className="h-4 w-4" />
        </button>

        {/* Color */}
        <div className="relative">
          <button
            type="button"
            className={btn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setShowColors((s) => !s); setShowSymbols(false); }}
            aria-label="কালার"
          >
            <span className="h-4 w-4 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500" />
          </button>
          {showColors && (
            <div className="absolute z-20 mt-1 grid grid-cols-5 gap-1 rounded-xl border border-border bg-card p-2 shadow-soft">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyColor(c)}
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>

        {/* Symbols */}
        <div className="relative">
          <button
            type="button"
            className={btn}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setShowSymbols((s) => !s); setShowColors(false); }}
            aria-label="সিম্বল"
          >
            <Smile className="h-4 w-4" />
          </button>
          {showSymbols && (
            <div className="absolute z-20 mt-1 grid w-56 grid-cols-6 gap-1 rounded-xl border border-border bg-card p-2 shadow-soft">
              {SYMBOLS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSymbol(s)}
                  className="grid h-7 w-7 place-items-center rounded-md text-lg hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className={`${btn} ml-auto`} onMouseDown={(e) => e.preventDefault()} onClick={() => { exec("removeFormat"); emit(); }} aria-label="ফরম্যাট মুছুন">
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="min-h-[80px] px-3 py-2 text-sm outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
