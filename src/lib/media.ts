const IMAGE_CACHE_PREFIX = "duotots-image:";

type MediaResponse = {
  imageUrl: string;
  source: string;
};

export async function resolveWordImage(
  query: string,
  fallbackImage: string,
): Promise<MediaResponse> {
  if (typeof window === "undefined") {
    return { imageUrl: fallbackImage, source: "fallback" };
  }

  const cacheKey = `${IMAGE_CACHE_PREFIX}${query.toLowerCase()}`;
  const cached = window.localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached) as MediaResponse;
  }

  try {
    const res = await fetch(`/api/media?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error("media lookup failed");
    }
    const payload = (await res.json()) as MediaResponse;
    const data = payload.imageUrl ? payload : { imageUrl: fallbackImage, source: "fallback" };
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch {
    const data = { imageUrl: fallbackImage, source: "fallback" };
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  }
}
