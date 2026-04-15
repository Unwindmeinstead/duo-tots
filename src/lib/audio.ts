const AUDIO_CACHE_PREFIX = "duotots-audio:";
export const VOICE_MODE_KEY = "duotots-voice-mode";
export type VoiceMode = "auto" | "gentle" | "clear";

type AudioLookup = {
  audioUrl: string | null;
  source: string;
};

async function lookupWordAudio(word: string): Promise<AudioLookup> {
  if (typeof window === "undefined") {
    return { audioUrl: null, source: "none" };
  }

  const key = `${AUDIO_CACHE_PREFIX}${word.toLowerCase()}`;
  const cached = window.localStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached) as AudioLookup;
  }

  try {
    const res = await fetch(`/api/tts?word=${encodeURIComponent(word)}`);
    if (!res.ok) {
      throw new Error("audio lookup failed");
    }

    const payload = (await res.json()) as AudioLookup;
    window.localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    const payload = { audioUrl: null, source: "none" };
    window.localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  }
}

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const preferred = voices.find((voice) =>
    /Google|Siri|Microsoft|Enhanced|Premium/i.test(voice.name),
  );
  return preferred ?? voices[0] ?? null;
}

export async function speakWord(word: string): Promise<{ source: string }> {
  if (typeof window === "undefined") {
    return { source: "none" };
  }

  const lookup = await lookupWordAudio(word);
  if (lookup.audioUrl) {
    const audio = new Audio(lookup.audioUrl);
    audio.preload = "auto";
    await audio.play();
    return { source: lookup.source };
  }

  if (!("speechSynthesis" in window)) {
    return { source: "none" };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  const voices = window.speechSynthesis.getVoices();
  const bestVoice = pickBestVoice(voices);
  const voiceMode = (window.localStorage.getItem(VOICE_MODE_KEY) as VoiceMode | null) ?? "auto";
  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang || "en-US";
  } else {
    utterance.lang = "en-US";
  }
  if (voiceMode === "gentle") {
    utterance.rate = 0.76;
    utterance.pitch = 1.1;
  } else if (voiceMode === "clear") {
    utterance.rate = 0.88;
    utterance.pitch = 0.98;
  } else {
    utterance.rate = 0.82;
    utterance.pitch = 1;
  }
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return { source: "browser-fallback" };
}
