import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.className !== "string" || !body.className.trim()) {
    return NextResponse.json({ error: "Class payload is invalid" }, { status: 400 });
  }

  const directory = path.join(process.cwd(), "data", "classes");
  const fileName = `${body.className.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomUUID()}.json`;
  const outputPath = path.join(directory, fileName);

  await mkdir(directory, { recursive: true });
  await writeFile(
    outputPath,
    JSON.stringify(
      {
        ...body,
        savedAt: new Date().toISOString()
      },
      null,
      2
    ),
    "utf8"
  );

  return NextResponse.json({ ok: true, path: outputPath });
}
