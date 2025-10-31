"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header({ mode }: { mode: "online" | "offline" }) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔎</span>
          <h1 className="text-xl font-semibold">ИИ-исследователь</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={mode === "online" ? "default" : "secondary"}>
            {mode === "online" ? "🔵 Онлайн" : "🟢 Офлайн"}
          </Badge>
          <Avatar>
            <AvatarFallback>UX</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}


