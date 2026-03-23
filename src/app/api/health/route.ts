import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "newteacher",
    firecrawlConfigured: Boolean(process.env.FIRECRAWL_API_KEY),
    elevenLabsAgentConfigured: Boolean(
      process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_NEW_TEACHER ||
        process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
    )
  });
}
