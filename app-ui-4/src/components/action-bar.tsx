import { Share2, Copy, Download, RefreshCw, FileStack } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "sonner";

interface ActionBarProps {
  sourceCount: number;
  answerText: string;
}

export function ActionBar({ sourceCount, answerText }: ActionBarProps) {
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Ссылка скопирована в буфер обмена");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answerText);
    toast.success("Ответ скопирован в буфер обмена");
  };

  const handleExport = () => {
    const blob = new Blob([answerText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sberinsight-answer.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Ответ экспортирован");
  };

  const handleReformulate = () => {
    toast.info("Переформулирование ответа...");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <TooltipProvider>
        {/* Actions Group */}
        <div className="flex items-center gap-1 -ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-9 w-9"
              >
                <Share2 className="w-4 h-4" style={{ color: '#64748B' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Поделиться</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-9 w-9"
              >
                <Copy className="w-4 h-4" style={{ color: '#64748B' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Копировать текст</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                className="h-9 w-9"
              >
                <Download className="w-4 h-4" style={{ color: '#64748B' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Экспорт в Markdown</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReformulate}
                className="h-9 w-9"
              >
                <RefreshCw className="w-4 h-4" style={{ color: '#64748B' }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Переформулировать ответ</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
