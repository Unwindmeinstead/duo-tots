import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  /* The dictionary is single-word only — a phrase can never resolve,
     so answer "none" immediately and let the client use device speech. */
  if (/\s/.test(word.trim())) {
    return NextResponse.json({ audioUrl: null, source: "none" });
  }

  try {
    const dictionaryRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
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
    /* AMERICAN ONLY (Grey's order, 2026-11-07): the read-back voice
       must be a clear American voice — and this API lists the BRITISH
       clip first for most words (apple-uk.mp3 ahead of apple-us.mp3),
       which is exactly the voice Grey rejected. US recordings carry
       a "-us" filename suffix, so only those may ever be returned.
       A word with no US clip (e.g. "hello" has only -uk/-au) returns
       none, and the client falls back to the device's en-US voice. */
    const audioUrl =
      entries
        .flatMap((entry) => entry.phonetics ?? [])
        .map((phonetic) => phonetic.audio)
        .find(
          (value) =>
            typeof value === "string" && /-us\.(mp3|ogg)$/i.test(value),
        ) ?? null;

    return NextResponse.json({
      audioUrl,
      source: audioUrl ? "dictionaryapi-us" : "none",
    });
  } catch {
    return NextResponse.json({ audioUrl: null, source: "none" });
  }
}
