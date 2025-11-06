import { useState } from "react";
import { Navbar } from "./components/navbar";
import { SearchBox } from "./components/search-box";
import { SuggestedQueries } from "./components/suggested-queries";
import { ResultsPage } from "./components/results-page";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  // Apply theme class to document root
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(true);
  };

  const handleQuerySelect = (query: string) => {
    setSearchQuery(query);
    setShowResults(true);
  };

  const handleBackToHome = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  // Show results page if there's a search query
  if (showResults && searchQuery) {
    return (
      <>
        <ResultsPage
          query={searchQuery}
          theme={theme}
          mode={mode}
          onThemeChange={handleThemeChange}
          onModeChange={setMode}
          onBackToHome={handleBackToHome}
        />
        <Toaster />
      </>
    );
  }

  // Show home page
  return (
    <div className="min-h-screen bg-background">
      <Navbar
        theme={theme}
        mode={mode}
        onThemeChange={handleThemeChange}
        onModeChange={setMode}
      />

      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-20 md:pt-28 lg:pt-36 pb-8 md:pb-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-foreground">
              Панорама UX
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto opacity-90">
              Находите результаты предыдущих исследований по вопросам, гипотезам, проблемам и даже по похожим картинкам
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="pb-32">
          <div className="max-w-3xl mx-auto">
            <SearchBox onSearch={handleSearch} />
          </div>
        </section>

        {/* Footer Info */}
        <section className="fixed bottom-0 left-0 right-0 py-5 bg-background">
          <div className="max-w-3xl mx-auto text-center px-4">
            <p className="text-muted-foreground opacity-75 text-[12px]">
              Используйте естественный язык для поиска. Система анализирует предыдущие исследования СберБанка и находит релевантные выводы и инсайты
            </p>
          </div>
        </section>
      </main>
      <Toaster />
    </div>
  );
}
