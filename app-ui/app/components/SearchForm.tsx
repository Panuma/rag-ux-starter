"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, FileText, Image as ImageIcon, ChevronDown, Upload, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import type { Mode } from "@/lib/types";

interface SearchFormProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onSearch: (query: string, filters?: any) => void;
  isSearching?: boolean;
  onFileUpload?: (file: File) => void;
}

const exampleQueries = [
  "Как показать беспроцентный период, чтобы не путали с планом выплат?",
  "Какие были проблемы с визуализацией беспроцентного периода?",
  "Что респонденты думали про проценты по наличным?",
];

export function SearchForm({ mode, onModeChange, onSearch, isSearching, onFileUpload }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [iteration, setIteration] = useState("");
  const [scenario, setScenario] = useState("");
  const [date, setDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      onFileUpload?.(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSearch(query, {
      iteration: iteration.trim() || undefined,
      scenario: scenario.trim() || undefined,
      date: date.trim() || undefined,
    });
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Tabs defaultValue="text" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="text" aria-label="Поиск по тексту">
                <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                По тексту
              </TabsTrigger>
              <TabsTrigger value="image" aria-label="Поиск по макету">
                <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                По макету
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Режим поиска">
                    {mode === "online" ? "🔵 Онлайн" : "🟢 Офлайн"}
                    <ChevronDown className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => onModeChange("online")}
                    aria-label="Онлайн режим"
                  >
                    🔵 Онлайн
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onModeChange("offline")}
                    aria-label="Офлайн режим"
                  >
                    🟢 Офлайн
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Загрузить файл">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Загрузить файл исследования</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <TabsContent value="text" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="sr-only" htmlFor="iteration-input">
                  Итерация
                </label>
                <Input
                  id="iteration-input"
                  placeholder="Итерация (1 или 2)"
                  value={iteration}
                  onChange={(e) => setIteration(e.target.value)}
                  className="w-full sm:w-1/3"
                  aria-label="Итерация"
                />
                <label className="sr-only" htmlFor="scenario-input">
                  Сценарий
                </label>
                <Input
                  id="scenario-input"
                  placeholder="Сценарий/тег"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full sm:w-1/3"
                  aria-label="Сценарий"
                />
                <label className="sr-only" htmlFor="date-input">
                  Дата
                </label>
                <Input
                  id="date-input"
                  placeholder="Дата (YYYY-MM)"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full sm:w-1/3"
                  aria-label="Дата"
                />
              </div>

              <div className="relative">
                <label className="sr-only" htmlFor="query-textarea">
                  Запрос
                </label>
                <Textarea
                  id="query-textarea"
                  placeholder="Идея экрана / вопрос / гипотеза"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={4}
                  className="pr-12 resize-none focus:ring-2 focus:ring-primary transition-all"
                  aria-label="Введите ваш запрос"
                  aria-describedby="query-hint"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isSearching || !query.trim()}
                      className={cn(
                        "absolute bottom-3 right-3 transition-all active:scale-95",
                        isSearching && "cursor-not-allowed"
                      )}
                      aria-busy={isSearching}
                      aria-label={isSearching ? "Поиск..." : "Начать поиск"}
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Search className="w-4 h-4" aria-hidden="true" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!isSearching && <TooltipContent>Начать поиск</TooltipContent>}
                </Tooltip>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p id="query-hint">Примеры запросов:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-blue-600 dark:text-blue-400 transition-colors"
                      aria-label={`Выбрать пример запроса: ${example}`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
              )}
            >
              <input {...getInputProps()} aria-label="Загрузить изображение" />
              <ImageIcon 
                className="w-12 h-12 mx-auto mb-4 text-gray-400" 
                aria-hidden="true"
              />
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Отпустите для загрузки
                </p>
              ) : (
                <>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Перетащите файл сюда или нажмите для выбора
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    PNG, JPG, WEBP до 20 МБ
                  </p>
                  <Button variant="outline" type="button">
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                    Выбрать файл
                  </Button>
                </>
              )}
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    {selectedFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  aria-label="Удалить файл"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  );
}
