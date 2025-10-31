import { NextRequest, NextResponse } from "next/server";
import { FollowupRequestSchema } from "@/lib/schemas";
import { getMockFollowupResponse } from "@/lib/mocks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Валидация запроса
    const validated = FollowupRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validated.error },
        { status: 400 }
      );
    }

    const { threadId, query } = validated.data;

    // Симуляция задержки API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Возвращаем мок-ответ с уточнением
    const response = getMockFollowupResponse(threadId);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Followup API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


