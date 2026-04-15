const IMAGE_CACHE_PREFIX = "duotots-image:";

type MediaResponse = {
  imageUrl: string;
  source: string;
};

export async function resolveWordImage(query: string): Promise<MediaResponse> {
  if (typeof window === "undefined") {
    return { imageUrl: "", source: "none" };
  }

  const cacheKey = `${IMAGE_CACHE_PREFIX}${query.toLowerCase()}`;
  const cached = window.localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached) as MediaResponse;

  try {
    const res = await fetch(`/api/media?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("media lookup failed");

    const payload = (await res.json()) as MediaResponse;
    const data = payload.imageUrl ? payload : { imageUrl: "", source: "none" };
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    const data: MediaResponse = { imageUrl: "", source: "none" };
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }
}

const prefetchInFlight = new Set<string>();

export function prefetchWordImages(queries: string[]) {
  for (const query of queries) {
    const key = query.toLowerCase();
    if (prefetchInFlight.has(key)) continue;
    const cacheKey = `${IMAGE_CACHE_PREFIX}${key}`;
    if (typeof window !== "undefined" && window.localStorage.getItem(cacheKey)) continue;

    prefetchInFlight.add(key);
    resolveWordImage(query)
      .then((result) => {
        if (result.imageUrl) {
          const img = new window.Image();
          img.src = result.imageUrl;
        }
      })
      .finally(() => prefetchInFlight.delete(key));
  }
}
