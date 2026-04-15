import { NextResponse } from "next/server";

const HEADERS = { "Cache-Control": "public, max-age=2592000, s-maxage=2592000" };
const PIXABAY_KEY = process.env.PIXABAY_API_KEY ?? "";

/** Same query → same index into result lists (less “random first hit”). */
function stablePickIndex(key: string, len: number): number {
  if (len <= 1) return 0;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % len;
}

/** Vecteezy API v2 — https://www.vecteezy.com/api-docs (Bearer + numeric account id). */
type VecteezyResource = {
  preview_url?: string | null;
  thumbnail_2x_url?: string | null;
  thumbnail_url?: string | null;
};

type VecteezySearchJson = {
  resources?: VecteezyResource[];
  errors?: Array<{ message?: string }>;
};

async function fetchVecteezyPreview(
  term: string,
  contentType: "vector" | "photo" | "png" | "svg",
): Promise<string | null> {
  const token = process.env.VECTEEZY_BEARER_TOKEN ?? process.env.VECTEEZY_API_KEY ?? "";
  const accountId = Number.parseInt(process.env.VECTEEZY_ACCOUNT_ID ?? "", 10);
  if (!token || !Number.isFinite(accountId) || accountId < 1) return null;

  const params = new URLSearchParams({
    term,
    content_type: contentType,
    per_page: "24",
    sort_by: "relevance",
    page: "1",
    family_friendly: "true",
  });

  try {
    const res = await fetch(`https://api.vecteezy.com/v2/${accountId}/resources?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as VecteezySearchJson;
    if (data.errors?.length) return null;
    const resources = (data.resources ?? []).filter((r) =>
      Boolean(r.preview_url ?? r.thumbnail_2x_url ?? r.thumbnail_url),
    );
    if (!resources.length) return null;
    const r = resources[stablePickIndex(term.toLowerCase(), resources.length)];
    return r.preview_url ?? r.thumbnail_2x_url ?? r.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const mode = searchParams.get("mode") ?? "photo";

  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });
  if (mode !== "photo" && mode !== "vector") {
    return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
  }

  try {
    const vectConfigured =
      (process.env.VECTEEZY_BEARER_TOKEN ?? process.env.VECTEEZY_API_KEY ?? "").length > 0
      && Number.parseInt(process.env.VECTEEZY_ACCOUNT_ID ?? "", 10) > 0;

    const vectOnly = /^1|true|yes$/i.test(process.env.VECTEEZY_ONLY ?? "");

    if (vectConfigured) {
      if (mode === "vector") {
        const vz =
          (await fetchVecteezyPreview(query, "vector"))
          ?? (await fetchVecteezyPreview(query, "svg"))
          ?? (await fetchVecteezyPreview(query, "png"));
        if (vz) return NextResponse.json({ imageUrl: vz, source: "vecteezy" }, { headers: HEADERS });
      } else {
        const vz = await fetchVecteezyPreview(query, "photo");
        if (vz) return NextResponse.json({ imageUrl: vz, source: "vecteezy" }, { headers: HEADERS });
      }
      if (vectOnly) return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
    }

    if (PIXABAY_KEY) {
      const url = await fetchPixabay(query, mode === "vector" ? "illustration" : "photo");
      if (url) return NextResponse.json({ imageUrl: url, source: "pixabay" }, { headers: HEADERS });

      if (mode === "vector") {
        const vectorUrl = await fetchPixabay(query, "vector");
        if (vectorUrl) return NextResponse.json({ imageUrl: vectorUrl, source: "pixabay" }, { headers: HEADERS });

        const photoUrl = await fetchPixabay(query, "photo");
        if (photoUrl) return NextResponse.json({ imageUrl: photoUrl, source: "pixabay" }, { headers: HEADERS });
      }
    }

    const wikiUrl = await fetchWikipedia(query);
    if (wikiUrl) return NextResponse.json({ imageUrl: wikiUrl, source: "wikipedia" }, { headers: HEADERS });

    return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
  } catch {
    return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
  }
}

async function fetchPixabay(query: string, imageType: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      key: PIXABAY_KEY,
      q: query,
      image_type: imageType,
      safesearch: "true",
      per_page: "24",
      order: "popular",
    });
    const res = await fetch(`https://pixabay.com/api/?${params}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      hits?: Array<{ webformatURL?: string; largeImageURL?: string; previewURL?: string }>;
    };

    const hits = data.hits ?? [];
    if (!hits.length) return null;
    const hit = hits[stablePickIndex(query.toLowerCase(), hits.length)];
    return hit?.largeImageURL ?? hit?.webformatURL ?? null;
  } catch {
    return null;
  }
}

async function fetchWikipedia(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "query", titles: query, prop: "pageimages",
      piprop: "original|thumbnail", pithumbsize: "600",
      format: "json", redirects: "1",
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string }; original?: { source?: string } }> };
    };
    const page = Object.values(data.query?.pages ?? {})[0];
    return page?.thumbnail?.source ?? page?.original?.source ?? null;
  } catch {
    return null;
  }
}
