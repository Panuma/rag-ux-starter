import { useState, useRef } from "react";
import { Plus, Mic } from "lucide-react";

interface SearchBoxProps {
  onSearch?: (query: string) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't focus if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    textareaRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        onClick={handleContainerClick}
        className="relative flex items-center gap-3 px-6 py-4 min-h-[72px] cursor-text bg-card border border-border rounded-[44px] transition-all duration-200"
      >
        {/* Main Input */}
        <div className="flex-1 flex items-center">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Auto-resize textarea
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (query.trim()) {
                  handleSubmit(e as any);
                }
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Задайте вопрос или опишите гипотезу..."
            rows={1}
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 resize-none overflow-hidden leading-[24px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end pb-1">
          <button
            type="button"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
          >
            <Plus className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
          >
            <Mic className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </form>
  );
}
