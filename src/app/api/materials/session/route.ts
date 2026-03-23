import { NextRequest, NextResponse } from "next/server";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function createLessonBrief(materials: Array<{ name: string; text: string }>) {
  return materials
    .map((material) => {
      const excerpt = normalizeText(material.text).slice(0, 2400);
      return `Source: ${material.name}\n${excerpt}`;
    })
    .join("\n\n---\n\n")
    .slice(0, 7000);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No PDF files were uploaded" }, { status: 400 });
  }

  try {
    const { PDFParse } = await import("pdf-parse");

    const extractedMaterials = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const parser = new PDFParse({ data: buffer });
        const parsed = await parser.getText();
        await parser.destroy();

        return {
          name: file.name,
          text: parsed.text ?? ""
        };
      })
    );

    const validMaterials = extractedMaterials.filter((material) => material.text.trim().length > 0);

    if (validMaterials.length === 0) {
      return NextResponse.json(
        { error: "Could not extract readable text from the uploaded PDFs" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      lessonBrief: createLessonBrief(validMaterials),
      materialCount: validMaterials.length
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process the uploaded PDFs";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
