import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  try {
    const dictionaryRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 60 * 60 * 24 * 30 },
      },
    );

    if (!dictionaryRes.ok) {
      throw new Error("dictionary lookup failed");
    }

    const entries = (await dictionaryRes.json()) as Array<{
      phonetics?: Array<{ audio?: string }>;
    }>;
    const audioUrl =
      entries
        .flatMap((entry) => entry.phonetics ?? [])
        .map((phonetic) => phonetic.audio)
        .find((value) => typeof value === "string" && value.length > 0) ?? null;

    return NextResponse.json({
      audioUrl,
      source: audioUrl ? "dictionaryapi" : "none",
    });
  } catch {
    return NextResponse.json({ audioUrl: null, source: "none" }, { status: 404 });
  }
}
