"use client";

export default function AppClient() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center text-muted-foreground">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Figma Make не подключён</h2>
        <p className="max-w-md text-sm leading-relaxed">
          Замените компонент <code>AppClient</code> на экспорт из Figma Make. Файл расположен в
          `app-ui/components/make/App.client.tsx`.
        </p>
      </div>
    </div>
  );
}

