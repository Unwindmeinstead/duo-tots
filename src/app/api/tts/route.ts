import { NextResponse } from "next/server";

/* Read-back audio lookup (wired into speakWord 2026-11-08).
   Returns a REAL en-US human recording for a single word, or null —
   and null is a first-class answer: the client then uses the
   device's en-US voice. AMERICAN ONLY (Grey's order, 2026-11-07):
   dictionaryapi.dev lists the BRITISH clip first for most words
   (apple-uk.mp3 ahead of apple-us.mp3) — the exact voice Grey
   rejected — so only "-us" recordings may ever be returned. */

const MONTH = 60 * 60 * 24 * 30;

async function lookupEntries(word: string): Promise<string | null> {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    {
      headers: { accept: "application/json" },
      next: { revalidate: MONTH },
    },
  );
  if (!res.ok) throw new Error("dictionary lookup failed");
  const entries = (await res.json()) as Array<{
    phonetics?: Array<{ audio?: string }>;
  }>;
  return (
    entries
      .flatMap((entry) => entry.phonetics ?? [])
      .map((phonetic) => phonetic.audio)
      .find(
        (value) =>
          typeof value === "string" && /-us\.(mp3|ogg)$/i.test(value),
      ) ?? null
  );
}

/* Fallback when the entries API is unreachable from this network
   (it intermittently 5xxes / refuses datacenter egress — observed
   live 2026-11-08 while the same call succeeded elsewhere): the
   media files live at a deterministic address, so probe it with a
   one-byte range request. A hit is returned; a miss costs nothing
   and the answer stays null. */
async function probePattern(word: string): Promise<string | null> {
  for (const ext of ["mp3", "ogg"]) {
    const url = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.${ext}`;
    try {
      const res = await fetch(url, {
        headers: { range: "bytes=0-0" },
        next: { revalidate: MONTH },
      });
      if (res.ok || res.status === 206) {
        void res.body?.cancel().catch(() => { /* already got our answer */ });
        return url;
      }
    } catch {
      /* try the next extension */
    }
  }
  return null;
}

/* Fallback 2: Wikimedia Commons carries the classic Wiktionary US
   recordings under a deterministic name — En-us-<word>.ogg —
   served by the upload.wikimedia.org CDN. Coverage is broad
   (it has a US "hello", which dictionaryapi lacks entirely), and
   the host does not share dictionaryapi's egress flakiness.
   Special:FilePath redirects to the real file; a word with no US
   recording 404s and the answer stays null. The canonical
   FilePath URL is what we return — browsers follow the redirect
   when the clip plays. */
async function probeCommons(word: string): Promise<string | null> {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/En-us-${word}.ogg`;
  try {
    const res = await fetch(url, {
      headers: { range: "bytes=0-0" },
      next: { revalidate: MONTH },
    });
    if (res.ok || res.status === 206) {
      void res.body?.cancel().catch(() => { /* already got our answer */ });
      return url;
    }
  } catch {
    /* no Commons recording */
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  /* The dictionary is single-word only — a phrase can never resolve,
     so answer "none" immediately and let the client use device speech. */
  const clean = word.trim().toLowerCase();
  if (!clean || /\s/.test(clean)) {
    return NextResponse.json({ audioUrl: null, source: "none" });
  }

  let audioUrl: string | null = null;
  let source = "none";
  try {
    audioUrl = await lookupEntries(clean);
    if (audioUrl) source = "dictionaryapi-us";
  } catch {
    /* one retry — the upstream is intermittently flaky */
    try {
      audioUrl = await lookupEntries(clean);
      if (audioUrl) source = "dictionaryapi-us";
    } catch {
      audioUrl = null;
    }
  }

  /* No clip from the entries (unreachable upstream, or the word
     lists none): try the Wikimedia Commons US recording, then the
     dictionaryapi media-pattern probe, before giving up. A word
     with no US recording anywhere still correctly answers null. */
  if (!audioUrl) {
    audioUrl = await probeCommons(clean);
    if (audioUrl) source = "wikimedia-us";
  }
  if (!audioUrl) {
    audioUrl = await probePattern(clean);
    if (audioUrl) source = "dictionaryapi-us-pattern";
  }

  return NextResponse.json({ audioUrl, source });
}
