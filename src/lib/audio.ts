export const VOICE_MODE_KEY = "duotots-voice-mode";
export type VoiceMode = "auto" | "gentle" | "clear";

let lockedVoice: SpeechSynthesisVoice | null = null;

function getVoice(): SpeechSynthesisVoice | null {
  if (lockedVoice) return lockedVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((v) => /^en[-_]/i.test(v.lang));

  const ranked = [
    /Samantha/i,
    /Karen/i,
    /Daniel/i,
    /Google US English/i,
    /Google UK English Female/i,
    /Microsoft Zira/i,
    /Microsoft David/i,
    /Enhanced/i,
    /Premium/i,
  ];

  for (const re of ranked) {
    const match = english.find((v) => re.test(v.name));
    if (match) { lockedVoice = match; return match; }
  }

  lockedVoice = english[0] ?? voices[0] ?? null;
  return lockedVoice;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => { lockedVoice = null; getVoice(); };
}

export async function speakWord(word: string): Promise<{ source: string }> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { source: "none" };
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  const voice = getVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }

  const voiceMode = (window.localStorage.getItem(VOICE_MODE_KEY) as VoiceMode | null) ?? "auto";
  if (voiceMode === "gentle") {
    utterance.rate = 0.72;
    utterance.pitch = 1.1;
  } else if (voiceMode === "clear") {
    utterance.rate = 0.85;
    utterance.pitch = 0.98;
  } else {
    utterance.rate = 0.78;
    utterance.pitch = 1.0;
  }
  utterance.volume = 1;

  return new Promise((resolve) => {
    utterance.onend = () => resolve({ source: "speech-synthesis" });
    utterance.onerror = () => resolve({ source: "none" });
    window.speechSynthesis.speak(utterance);
  });
}
