import { NextRequest, NextResponse } from "next/server";
import { getMockAnswerResponse } from "@/lib/mocks";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Симуляция задержки API
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Возвращаем мок-ответ по ID
    const response = getMockAnswerResponse(id, "online");

    return NextResponse.json(response);
  } catch (error) {
    console.error("Answer API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


