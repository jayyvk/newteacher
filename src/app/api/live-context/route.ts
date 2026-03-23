import { NextRequest, NextResponse } from "next/server";
import { recordConversationSources } from "@/lib/session-store";

type FirecrawlItem = {
  title?: string;
  url?: string;
  markdown?: string;
  description?: string;
};

type FirecrawlResponse =
  | {
      data?: {
        web?: FirecrawlItem[];
      };
    }
  | {
      data?: FirecrawlItem[];
    };

function findConversationId(value: unknown): string | null {
  if (typeof value === "string" && value.startsWith("conv_")) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findConversationId(item);
      if (found) {
        return found;
      }
    }
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = findConversationId(item);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const conversationId = findConversationId(body);

  if (!query) {
    return NextResponse.json({ result: "No query provided." });
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    return NextResponse.json(
      { result: "Live context is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: { formats: ["markdown"] }
      })
    });

    if (!response.ok) {
      return NextResponse.json({
        result: "Live search failed. Continue teaching from textbook context."
      });
    }

    const data = (await response.json()) as FirecrawlResponse;
    const rawResults = Array.isArray(data.data) ? data.data : (data.data?.web ?? []);
    const sources = rawResults.slice(0, 4).map((item) => ({
      title: item.title || "Untitled source",
      url: item.url || "",
      content: (item.markdown || item.description || "").slice(0, 800)
    }));

    if (conversationId) {
      recordConversationSources(conversationId, sources);
    }

    return NextResponse.json({
      result: JSON.stringify({
        query,
        source_count: sources.length,
        results: sources
      })
    });
  } catch {
    return NextResponse.json({
      result: "Live search error. Continue teaching from available lesson context."
    });
  }
}
