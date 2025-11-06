import { Moon, Sun, WifiOff, Wifi } from "lucide-react";

interface NavbarProps {
  theme: "light" | "dark";
  mode: "online" | "offline";
  onThemeChange: (theme: "light" | "dark") => void;
  onModeChange: (mode: "online" | "offline") => void;
  onLogoClick?: () => void;
}

export function Navbar({ theme, mode, onThemeChange, onModeChange, onLogoClick }: NavbarProps) {
  return (
    <nav className="w-full bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-1 ring-primary/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                />
              </svg>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/50 border border-border/50">
              <button
                onClick={() => onModeChange("online")}
                className={`
                  flex items-center px-3 py-1.5 rounded-lg transition-all duration-200
                  ${mode === "online" 
                    ? "bg-background text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <span className="text-[13px]">Онлайн</span>
              </button>
              <button
                onClick={() => onModeChange("offline")}
                className={`
                  flex items-center px-3 py-1.5 rounded-lg transition-all duration-200
                  ${mode === "offline" 
                    ? "bg-background text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <span className="text-[13px]">Оффлайн</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
              className="h-9 w-9 rounded-xl border border-border/50 bg-muted/50 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
