import { NextResponse } from "next/server";

const HEADERS = { "Cache-Control": "public, max-age=2592000, s-maxage=2592000" };
const PIXABAY_KEY = process.env.PIXABAY_API_KEY ?? "";

/** Same query → same index into result lists (legacy photo variety). */
function stablePickIndex(key: string, len: number): number {
  if (len <= 1) return 0;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % len;
}

const SCORE_STOP = new Set([
  "the", "and", "for", "with", "from", "into", "that", "this", "your", "are", "was", "were",
  "simple", "flat", "icon", "icons", "vector", "illustration", "clipart", "cartoon", "cute",
  "isolated", "white", "black", "background", "silhouette", "outline", "stick", "figure",
  "person", "people", "child", "children", "kid", "man", "woman", "boy", "girl", "human",
  "action", "verb", "activity", "symbol", "pictogram", "drawing", "graphic", "design",
]);

/** Prefer hits whose titles/tags overlap distinctive query tokens (better verb match on stock APIs). */
function scoreQueryAgainstText(query: string, text: string): number {
  const hay = text.toLowerCase();
  let score = 0;
  for (const raw of query.toLowerCase().split(/\s+/)) {
    const w = raw.replace(/[^a-z0-9]/g, "");
    if (w.length < 3 || SCORE_STOP.has(w)) continue;
    if (hay.includes(w)) score += w.length;
  }
  return score;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word / word-prefix match so "cry" does not score inside "crystal". */
function lemmaAppearsInBlob(lemma: string, blob: string): boolean {
  const m = lemma.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (m.length < 2) return false;
  return new RegExp(`\\b${escapeRegExp(m)}\\w*\\b`, "i").test(blob);
}

/** Extra weight when the lesson lemma (e.g. verb on the card) appears in metadata. */
function scoreWithLemma(query: string, text: string, lemma: string | null): number {
  let s = scoreQueryAgainstText(query, text);
  if (lemma && lemmaAppearsInBlob(lemma, text)) s += 120;
  return s;
}

/** Vecteezy API v2 — https://www.vecteezy.com/api-docs (Bearer + numeric account id). */
type VecteezyResource = {
  preview_url?: string | null;
  thumbnail_2x_url?: string | null;
  thumbnail_url?: string | null;
  name?: string | null;
  title?: string | null;
  description?: string | null;
};

function urlFromVecteezyResource(r: VecteezyResource & Record<string, unknown>): string | null {
  const raw = r as Record<string, unknown>;
  const candidates = [
    r.preview_url,
    r.thumbnail_2x_url,
    r.thumbnail_url,
    raw.previewUrl,
    raw.thumbnail2xUrl,
    raw.thumbnailUrl,
    raw.image_url,
    raw.imageUrl,
    raw.url,
  ];
  for (const c of candidates) {
    if (typeof c !== "string" || !c) continue;
    const t = c.trim();
    if (t.startsWith("https://") || t.startsWith("http://")) return t;
    if (t.startsWith("//")) return `https:${t}`;
  }
  return null;
}

function metaBlobFromVecteezyResource(r: VecteezyResource & Record<string, unknown>): string {
  const raw = r as Record<string, unknown>;
  return [r.name, r.title, r.description, raw.keywords, raw.tags, raw.category]
    .filter((x) => typeof x === "string" && (x as string).length > 0)
    .join(" ");
}

type VecteezySearchJson = {
  resources?: VecteezyResource[];
  errors?: Array<{ message?: string }>;
};

async function fetchVecteezyPreview(
  term: string,
  contentType: "vector" | "photo" | "png" | "svg",
  lemma: string | null = null,
): Promise<string | null> {
  const token = process.env.VECTEEZY_BEARER_TOKEN ?? process.env.VECTEEZY_API_KEY ?? "";
  const accountId = Number.parseInt(process.env.VECTEEZY_ACCOUNT_ID ?? "", 10);
  if (!token || !Number.isFinite(accountId) || accountId < 1) return null;

  const params = new URLSearchParams({
    term,
    content_type: contentType,
    per_page: "16",
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
    const resources = (data.resources ?? []).filter((r) => urlFromVecteezyResource(r as VecteezyResource & Record<string, unknown>));
    if (!resources.length) return null;
    const scored = resources
      .map((r) => {
        const rr = r as VecteezyResource & Record<string, unknown>;
        const blob = metaBlobFromVecteezyResource(rr);
        return { r: rr, s: scoreWithLemma(term, blob, lemma) };
      })
      .sort((a, b) => b.s - a.s || 0);
    for (const row of scored) {
      const u = urlFromVecteezyResource(row.r);
      if (u) return u;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const modeRaw = searchParams.get("mode")?.trim().toLowerCase() ?? "photo";
  const mode = modeRaw === "vector" || modeRaw === "photo" ? modeRaw : "photo";
  const matchLemma = searchParams.get("match")?.trim() ?? null;

  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  try {
    const vectConfigured =
      (process.env.VECTEEZY_BEARER_TOKEN ?? process.env.VECTEEZY_API_KEY ?? "").length > 0
      && Number.parseInt(process.env.VECTEEZY_ACCOUNT_ID ?? "", 10) > 0;

    const vectOnly = /^1|true|yes$/i.test(process.env.VECTEEZY_ONLY ?? "");

    if (vectConfigured) {
      if (mode === "vector") {
        const vz =
          (await fetchVecteezyPreview(query, "vector", matchLemma))
          ?? (await fetchVecteezyPreview(query, "svg", matchLemma))
          ?? (await fetchVecteezyPreview(query, "png", matchLemma));
        if (vz) return NextResponse.json({ imageUrl: vz, source: "vecteezy" }, { headers: HEADERS });
      } else {
        const vz = await fetchVecteezyPreview(query, "photo", matchLemma);
        if (vz) return NextResponse.json({ imageUrl: vz, source: "vecteezy" }, { headers: HEADERS });
      }
      if (vectOnly) return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
    }

    if (PIXABAY_KEY) {
      const url = await fetchPixabay(query, mode === "vector" ? "illustration" : "photo", matchLemma);
      if (url) return NextResponse.json({ imageUrl: url, source: "pixabay" }, { headers: HEADERS });

      if (mode === "vector") {
        const vectorUrl = await fetchPixabay(query, "vector", matchLemma);
        if (vectorUrl) return NextResponse.json({ imageUrl: vectorUrl, source: "pixabay" }, { headers: HEADERS });

        const photoUrl = await fetchPixabay(query, "photo", matchLemma);
        if (photoUrl) return NextResponse.json({ imageUrl: photoUrl, source: "pixabay" }, { headers: HEADERS });
      }
    }

    /* Wikipedia titles rarely match long stock-style queries; skip for vector to avoid wrong photos. */
    if (mode === "photo") {
      const wikiUrl = await fetchWikipedia(query);
      if (wikiUrl) return NextResponse.json({ imageUrl: wikiUrl, source: "wikipedia" }, { headers: HEADERS });
    }

    return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
  } catch {
    return NextResponse.json({ imageUrl: "", source: "none" }, { headers: HEADERS });
  }
}

async function fetchPixabay(query: string, imageType: string, lemma: string | null = null): Promise<string | null> {
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
      hits?: Array<{
        webformatURL?: string;
        largeImageURL?: string;
        previewURL?: string;
        tags?: string;
        user?: string;
      }>;
    };

    const hits = data.hits ?? [];
    if (!hits.length) return null;
    const ranked = [...hits].sort((a, b) => {
      const sa = scoreWithLemma(query, `${a.tags ?? ""} ${a.user ?? ""}`, lemma);
      const sb = scoreWithLemma(query, `${b.tags ?? ""} ${b.user ?? ""}`, lemma);
      return sb - sa;
    });
    for (const hit of ranked) {
      const u = hit.largeImageURL ?? hit.webformatURL ?? hit.previewURL ?? null;
      if (u) return u;
    }
    return null;
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
