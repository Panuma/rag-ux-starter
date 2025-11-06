import { Circle, Image, File } from "lucide-react";
import { Navbar } from "./navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { SourceCard, SourceCardProps } from "./source-card";
import { AIAnswer } from "./ai-answer";
import { ActionBar } from "./action-bar";
import { RelatedLinks } from "./related-links";
import { FixedSearchBar } from "./fixed-search-bar";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ResultsPageProps {
  query: string;
  theme: "light" | "dark";
  mode: "online" | "offline";
  onThemeChange: (theme: "light" | "dark") => void;
  onModeChange: (mode: "online" | "offline") => void;
  onBackToHome?: () => void;
}

// Mock data
const sources: SourceCardProps[] = [
  {
    id: "1",
    type: "survey",
    title: "Исследование удовлетворённости клиентов банковскими услугами",
    year: 2023,
    url: "#",
  },
  {
    id: "2",
    type: "report",
    title: "Анализ поведения пользователей мобильного приложения",
    year: 2023,
    url: "#",
  },
  {
    id: "3",
    type: "video",
    title: "Интервью с клиентами о цифровых сервисах",
    year: 2022,
    url: "#",
  },
  {
    id: "4",
    type: "survey",
    title: "NPS-опрос клиентов премиум-сегмента",
    year: 2023,
    url: "#",
  },
  {
    id: "5",
    type: "report",
    title: "Исследование лояльности клиентов",
    year: 2022,
    url: "#",
  },
];

const answerContent = {
  sections: [
    {
      paragraphs: [
        "На основе анализа пяти исследований, проведённых в 2022-2023 годах, выявлены ключевые факторы, влияющие на удовлетворённость клиентов банковскими услугами. Основное внимание уделяется цифровым каналам обслуживания и мобильному приложению.",
      ],
    },
    {
      title: "Основные выводы",
      paragraphs: [
        "Клиенты оценивают удобство мобильного приложения как критически важный фактор. 87% респондентов отметили, что качество цифровых сервисов напрямую влияет на их решение остаться с банком.",
        "Премиум-сегмент демонстрирует более высокие требования к персонализации услуг. NPS среди премиальных клиентов составляет 68 пунктов при условии индивидуального подхода.",
      ],
    },
    {
      title: "Рекомендации",
      paragraphs: [
        "Необходимо продолжить инвестиции в развитие мобильного приложения, особенно в части аналитики личных финансов и персональных рекомендаций. Клиенты хотят видеть не просто транзакции, а понимать свои финансовые паттерны.",
      ],
    },
  ],
  images: [
    "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhdGElMjBhbmFseXRpY3N8ZW58MXx8fHwxNzYyMjgwMDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1680602239834-092e38d8bad6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHN1cnZleSUyMHJlc2VhcmNofGVufDF8fHx8MTc2MjI4NDYxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBjaGFydHMlMjBncmFwaHN8ZW58MXx8fHwxNzYyMjA0ODMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1633457896836-f8d6025c85d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGRpc2N1c3Npb258ZW58MXx8fHwxNzYyMjI4ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  ],
};

const relatedLinks = [
  { id: "1", label: "Опросы NPS", href: "#" },
  { id: "2", label: "Лояльность клиентов", href: "#" },
  { id: "3", label: "Исследование потребностей", href: "#" },
  { id: "4", label: "Мобильное приложение", href: "#" },
  { id: "5", label: "Премиум-сегмент", href: "#" },
  { id: "6", label: "Цифровые сервисы", href: "#" },
];

const imageGallery = [
  "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhdGElMjBhbmFseXRpY3N8ZW58MXx8fHwxNzYyMjgwMDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1680602239834-092e38d8bad6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHN1cnZleSUyMHJlc2VhcmNofGVufDF8fHx8MTc2MjI4NDYxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBjaGFydHMlMjBncmFwaHN8ZW58MXx8fHwxNzYyMjA0ODMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1633457896836-f8d6025c85d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGRpc2N1c3Npb258ZW58MXx8fHwxNzYyMjI4ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

export function ResultsPage({
  query,
  theme,
  mode,
  onThemeChange,
  onModeChange,
  onBackToHome,
}: ResultsPageProps) {
  const handleFollowUpSubmit = (newQuery: string) => {
    console.log("Follow-up query:", newQuery);
  };

  // Generate answer text for action bar
  const answerText = answerContent.sections
    .map((section) => {
      const title = section.title ? `## ${section.title}\n\n` : "";
      const text = section.paragraphs.join("\n\n");
      return title + text;
    })
    .join("\n\n");

  return (
    <div className="min-h-screen bg-background pb-40">
      <Navbar
        theme={theme}
        mode={mode}
        onThemeChange={onThemeChange}
        onModeChange={onModeChange}
        onLogoClick={onBackToHome}
      />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-[112px] lg:px-[144px] xl:px-[176px]">
        {/* Query Header with Better Spacing */}
        <div className="pt-20 pb-8">
          <h2 className="text-foreground line-clamp-3 leading-tight">
            {query}
          </h2>
        </div>

        {/* Tabs with Improved Design */}
        <Tabs defaultValue="answer" variant="underline" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="answer" className="gap-2">
              <Circle className="w-4 h-4" />
              <span>Ответ</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2">
              <Image className="w-4 h-4" />
              <span>Изображения</span>
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-2">
              <File className="w-4 h-4" />
              <span>Источники</span>
            </TabsTrigger>
          </TabsList>

          {/* Answer Tab */}
          <TabsContent value="answer" className="space-y-12 mt-0">
            {/* AI Answer Section */}
            <section>
              <AIAnswer content={answerContent} />
            </section>

            {/* Action Bar Section */}
            <section>
              <ActionBar sourceCount={sources.length} answerText={answerText} />
            </section>

            {/* Related Links Section */}
            <section>
              <RelatedLinks links={relatedLinks} />
            </section>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {imageGallery.length} изображений из исследований
                </p>
              </div>
              
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                {imageGallery.map((image, idx) => (
                  <div
                    key={idx}
                    className="break-inside-avoid mb-4 group"
                  >
                    <div className="relative overflow-hidden rounded-lg border border-border bg-muted/30 cursor-pointer transition-all duration-300 hover:border-border/60">
                      <ImageWithFallback
                        src={image}
                        alt={`Gallery image ${idx + 1}`}
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {sources.map((source) => (
                  <SourceCard key={source.id} {...source} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Fixed Search Bar */}
      <FixedSearchBar onSubmit={handleFollowUpSubmit} />
    </div>
  );
}
