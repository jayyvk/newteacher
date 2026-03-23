import { NextRequest, NextResponse } from "next/server";
import { getConversationSummary } from "@/lib/session-store";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await context.params;

  if (!conversationId) {
    return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
  }

  return NextResponse.json(getConversationSummary(conversationId));
}
