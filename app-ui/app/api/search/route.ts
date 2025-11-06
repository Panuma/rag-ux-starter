import { NextRequest, NextResponse } from "next/server";
import { MOCK_SEARCH_RESPONSE } from "@/lib/mocks";
import { SearchRequestSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Валидация запроса
    const validated = SearchRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validated.error },
        { status: 400 }
      );
    }

    const { mode, queryType, query, filters } = validated.data;

    // Симуляция задержки API
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Возвращаем мок-данные (в будущем здесь будет реальный бэкенд)
    const response = {
      ...MOCK_SEARCH_RESPONSE,
      mode,
      queryType,
      query: query || "",
      filters: filters || {},
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





