"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Image as ImageIcon, BookOpen, Download, Share2, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResponse } from "@/lib/types";

interface ResultsPanelProps {
  query: string;
  results: SearchResponse | null;
  isLoading?: boolean;
  onExport: () => void;
  onShare: () => void;
  onFollowup: (query: string) => void;
  onTryAgain?: () => void;
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
};

export function ResultsPanel({ query, results, isLoading, onExport, onShare, onFollowup, onTryAgain }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (!results) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center py-12"
      >
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Попробуйте изменить запрос или фильтры
        </p>
        {onTryAgain && (
          <Button onClick={onTryAgain}>
            Попробовать снова
          </Button>
        )}
      </motion.div>
    );
  }

  const bullets = results.summary
    .split(/[.!?]\s+/)
    .filter((s) => s.trim().length > 0)
    .slice(0, 4);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Результаты поиска</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onShare} className="transition-all active:scale-95">
                  <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Поделиться
                </Button>
              </TooltipTrigger>
              <TooltipContent>Поделиться ссылкой</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onExport} className="transition-all active:scale-95">
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Экспорт .md
                </Button>
              </TooltipTrigger>
              <TooltipContent>Скачать отчёт</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="summary" aria-label="Аналитический ответ">
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
              Ответ
            </TabsTrigger>
            <TabsTrigger value="quotes" aria-label="Цитаты">
              <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
              Цитаты ({results.quotes.length})
            </TabsTrigger>
            <TabsTrigger value="images" aria-label="Изображения">
              <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" />
              Изображения ({results.images.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧠 Аналитический вывод
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {bullets.map((bullet, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-gray-500 dark:text-gray-400 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{bullet.trim()}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📌 Источники
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.sources.length > 0 ? (
                  <div className="space-y-2">
                    {results.sources.map((source, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-wrap items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <Badge variant="outline" className="font-mono text-xs">
                          {source.id}
                        </Badge>
                        <span className="text-sm font-medium">{source.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          · {source.date} · Итерация {source.iteration}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Источники не найдены</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4 mt-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {results.quotes.length > 0 ? (
                  results.quotes.map((quote, idx) => (
                    <motion.div
                      key={quote.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary" className="font-mono">#{idx + 1}</Badge>
                              <Badge variant="outline" className="text-xs">
                                {quote.metadata.id} · Итерация {quote.metadata.iteration}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {quote.metadata.date}
                              </Badge>
                            </div>
                            {quote.distance && (
                              <Badge variant="ghost" className="text-xs">
                                {quote.distance.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{quote.metadata.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="border-l-4 border-primary/20 pl-4 py-2 mb-4 rounded-r-lg bg-gray-50 dark:bg-gray-900">
                            <p className="text-sm leading-relaxed">{quote.text}</p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p>
                              <span className="font-medium">Файл:</span> {quote.metadata.filename}
                            </p>
                            <p>
                              <span className="font-medium">Секция:</span> {quote.metadata.section_path}
                            </p>
                            <p>
                              <span className="font-medium">Чанк:</span> {quote.metadata.chunk_index}
                            </p>
                            <p>
                              <span className="font-medium">Продукт:</span> {quote.metadata.product}
                            </p>
                          </div>

                          {/* Превью изображений */}
                          {results.images.filter((img) => img.source_id === quote.metadata.id).length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {results.images
                                .filter((img) => img.source_id === quote.metadata.id)
                                .slice(0, 3)
                                .map((img, imgIdx) => (
                                  <motion.div
                                    key={imgIdx}
                                    custom={imgIdx}
                                    initial="hidden"
                                    animate="visible"
                                    variants={imageVariants}
                                    className="relative group aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                                  >
                                    <img
                                      src={`/${img.path}`}
                                      alt={img.alt || "Preview"}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="secondary"
                                          size="icon"
                                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => window.open(`/${img.path}`, '_blank')}
                                          aria-label="Открыть в новом окне"
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Открыть в новом окне</TooltipContent>
                                    </Tooltip>
                                  </motion.div>
                                ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    Цитаты не найдены
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            {results.images.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      custom={idx}
                      initial="hidden"
                      animate="visible"
                      variants={imageVariants}
                    >
                      <Card className="overflow-hidden group hover:shadow-lg transition-all">
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                          <img
                            src={`/${img.path}`}
                            alt={img.alt || "Image"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => window.open(`/${img.path}`, '_blank')}
                                aria-label="Открыть в новом окне"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Открыть в новом окне</TooltipContent>
                          </Tooltip>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium">{img.alt}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{img.source_id}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                Изображения не найдены
              </p>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        {/* Follow-up форма */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Задайте уточняющий вопрос</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const followupQuery = formData.get("query") as string;
              if (followupQuery.trim()) {
                onFollowup(followupQuery.trim());
              }
            }}
            className="flex gap-2"
          >
            <label className="sr-only" htmlFor="followup-input">
              Уточняющий вопрос
            </label>
            <input
              id="followup-input"
              name="query"
              type="text"
              placeholder="Уточните вопрос..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black focus:ring-2 focus:ring-primary transition-all"
              aria-label="Уточняющий вопрос"
            />
            <Button type="submit" className="transition-all active:scale-95">
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
              Спросить
            </Button>
          </form>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
