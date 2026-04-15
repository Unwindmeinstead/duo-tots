import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query,
    )}`;
    const wikiRes = await fetch(endpoint, {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!wikiRes.ok) {
      throw new Error("wiki request failed");
    }

    const data = (await wikiRes.json()) as {
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      content_urls?: { desktop?: { page?: string } };
    };

    const imageUrl = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    if (!imageUrl) {
      throw new Error("no image");
    }

    return NextResponse.json({
      imageUrl,
      source: data.content_urls?.desktop?.page ?? "wikipedia",
    });
  } catch {
    return NextResponse.json({ imageUrl: "", source: "none" }, { status: 404 });
  }
}
