import { useState } from "react";
import { Plus, Mic } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface FixedSearchBarProps {
  onSubmit: (query: string) => void;
}

export function FixedSearchBar({ onSubmit }: FixedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 py-4 md:py-6 z-40">
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit}>
          <div
            className="flex items-center gap-3 px-6 py-4 min-h-[72px] bg-card border border-border rounded-[44px] transition-all duration-200"
          >
            {/* Text Input */}
            <div className="flex-1 flex items-center">
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Задайте уточняющий вопрос..."
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 resize-none overflow-hidden leading-[24px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (query.trim()) {
                      handleSubmit(e as any);
                    }
                  }
                }}
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
      </div>
    </div>
  );
}
