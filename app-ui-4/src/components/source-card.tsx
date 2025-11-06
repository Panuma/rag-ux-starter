import { Video, FileText, BarChart3, ExternalLink } from "lucide-react";

export interface SourceCardProps {
  id: string;
  type: "video" | "survey" | "report";
  title: string;
  year: number;
  url: string;
}

const typeConfig = {
  video: {
    icon: Video,
    label: "Видео",
    accent: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  },
  survey: {
    icon: FileText,
    label: "Опрос",
    accent: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  report: {
    icon: BarChart3,
    label: "Отчёт",
    accent: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
};

export function SourceCard({ type, title, year, url }: SourceCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      onClick={() => window.open(url, "_blank")}
      className="group w-full p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-card border border-border rounded-xl hover:border-border/60"
    >
      <div className="space-y-4">
        {/* Type Badge */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.accent}`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[13px]">{config.label}</span>
          </div>
          <span className="text-[13px] text-muted-foreground">{year}</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h4 className="line-clamp-2 text-card-foreground leading-snug">
            {title}
          </h4>
          
          {/* External Link Indicator */}
          <div className="flex items-center gap-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="text-[12px]">Открыть источник</span>
          </div>
        </div>
      </div>
    </div>
  );
}
