import type { ImageMode } from "./vocab";

/** Bump when media resolution logic changes (forces clients to refetch). */
const IMAGE_CACHE_PREFIX = "duotots-img9:";

type MediaResponse = {
  imageUrl: string;
  source: string;
};

export async function resolveWordImage(
  query: string,
  mode: ImageMode = "photo",
  opts?: { match?: string },
): Promise<MediaResponse> {
  if (typeof window === "undefined") return { imageUrl: "", source: "none" };
  if (mode !== "photo" && mode !== "vector") return { imageUrl: "", source: "skip" };

  const matchPart = opts?.match?.trim() ? `:m:${opts.match.trim().toLowerCase()}` : "";
  const cacheKey = `${IMAGE_CACHE_PREFIX}${mode}:${query.toLowerCase()}${matchPart}`;
  const cached = window.localStorage.getItem(cacheKey);
  if (cached) {
    try { return JSON.parse(cached) as MediaResponse; }
    catch { window.localStorage.removeItem(cacheKey); }
  }

  try {
    const q = new URLSearchParams({ query, mode });
    if (opts?.match?.trim()) q.set("match", opts.match.trim());
    const res = await fetch(`/api/media?${q}`);
    if (!res.ok) throw new Error("media lookup failed");

    const payload = (await res.json()) as MediaResponse;
    const data = payload.imageUrl ? payload : { imageUrl: "", source: "none" };
    /* Never persist empty lookups — avoids bricking Actions after a transient miss or API change. */
    if (data.imageUrl) window.localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    return { imageUrl: "", source: "none" };
  }
}

const prefetchInFlight = new Set<string>();

export function prefetchWordImages(queries: string[], mode: ImageMode = "photo", matches?: string[]) {
  if (mode !== "photo" && mode !== "vector") return;
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const match = matches?.[i];
    const opts = match?.trim() ? { match: match.trim() } : undefined;
    const key = `${mode}:${query.toLowerCase()}${opts?.match ? `:m:${opts.match.toLowerCase()}` : ""}`;
    if (prefetchInFlight.has(key)) continue;
    const cacheKey = `${IMAGE_CACHE_PREFIX}${key}`;
    if (typeof window !== "undefined" && window.localStorage.getItem(cacheKey)) continue;

    prefetchInFlight.add(key);
    resolveWordImage(query, mode, opts)
      .then((result) => {
        if (result.imageUrl) {
          const img = new window.Image();
          img.src = result.imageUrl;
        }
      })
      .finally(() => prefetchInFlight.delete(key));
  }
}
