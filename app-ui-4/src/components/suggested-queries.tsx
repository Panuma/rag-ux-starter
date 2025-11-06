import { Lightbulb } from "lucide-react";
import { Card } from "./ui/card";

interface SuggestedQueriesProps {
  onQuerySelect?: (query: string) => void;
}

const suggestions = [
  "Какие топ‑3 причины, почему клиенты закрывают кредитную карту?",
  "Какие были сложности при проектировании экрана беспроцентного периода?",
  "Какие барьеры возникают у клиентов при оформлении кредитной карты?",
];

export function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lightbulb className="w-4 h-4" />
        <span className="text-[14px]">Популярные запросы</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <Card
            key={index}
            onClick={() => onQuerySelect?.(suggestion)}
            className="
              p-4 cursor-pointer group
              border border-border
              bg-card hover:bg-accent/50
              transition-all duration-200
              hover:shadow-sm hover:border-ring/30
            "
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <p className="text-[14px] text-foreground/90 leading-relaxed group-hover:text-foreground">
                {suggestion}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
