import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      titles: query,
      prop: "pageimages",
      piprop: "original|thumbnail",
      pithumbsize: "800",
      format: "json",
      redirects: "1",
    });
    const endpoint = `https://en.wikipedia.org/w/api.php?${params}`;
    const res = await fetch(endpoint, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!res.ok) throw new Error("wiki request failed");

    const data = (await res.json()) as {
      query?: {
        pages?: Record<string, {
          thumbnail?: { source?: string };
          original?: { source?: string };
        }>;
      };
    };

    const pages = data.query?.pages;
    if (!pages) throw new Error("no pages");

    const page = Object.values(pages)[0];
    const imageUrl = page?.thumbnail?.source ?? page?.original?.source ?? null;
    if (!imageUrl) throw new Error("no image");

    return NextResponse.json(
      { imageUrl, source: "wikipedia" },
      { headers: { "Cache-Control": "public, max-age=2592000, s-maxage=2592000" } },
    );
  } catch {
    return NextResponse.json({ imageUrl: "", source: "none" }, { status: 404 });
  }
}
