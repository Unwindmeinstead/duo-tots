import { loadProgress, saveProgress } from "@/lib/progress";

export const VOICE_MODE_KEY = "duotots-voice-mode";
export type VoiceMode = "auto" | "gentle" | "clear";

let lockedVoice: SpeechSynthesisVoice | null = null;

function getVoice(): SpeechSynthesisVoice | null {
  if (lockedVoice) return lockedVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  /* AMERICAN ONLY (Grey's order, 2026-11-07): the read-back must be a
     clear American voice a kid can understand — never British,
     Australian, or Irish. Only en-US voices are EVER selected. When
     the device has no en-US voice at all we return null WITHOUT
     locking: the utterance still requests lang "en-US", so the
     engine makes its own best US match instead of us pinning a
     foreign voice — and a later voiceschanged can still find one.
     Within en-US, the clearest voices win: the named natural voices
     (Google US English, Microsoft's Aria/Jenny, Apple's Ava and
     Samantha, Zira), then any natural/neural/premium/enhanced US
     voice, then any US voice at all. */
  const us = voices.filter((v) => /^en[-_]US/i.test(v.lang));

  const named = [
    /Google US English/i,
    /Microsoft Aria/i,
    /Microsoft Jenny/i,
    /\bAva\b/i,
    /\bSamantha\b/i,
    /Microsoft Zira/i,
  ];
  for (const re of named) {
    const match = us.find((v) => re.test(v.name));
    if (match) { lockedVoice = match; return match; }
  }
  const polished = us.find((v) => /natural|neural|premium|enhanced/i.test(v.name));
  if (polished) { lockedVoice = polished; return polished; }
  if (us.length > 0) { lockedVoice = us[0]; return lockedVoice; }
  return null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => { lockedVoice = null; getVoice(); };
}

/* ─── Real American recordings (wired 2026-11-08) ───
   For single words, /api/tts returns a real en-US human recording
   (dictionaryapi.dev, US clips only — the route filters out the
   British/Australian clips Grey rejected). A warm human voice beats
   any device synth for a learning toddler, so it is tried first;
   anything that goes wrong (offline, no US clip, playback error)
   falls straight through to the device voice below. Sentences and
   phrases skip the lookup entirely — a dictionary has no phrase
   audio — and go direct to device speech. Results cache for the
   session so repeat taps never refetch. */
const clipCache = new Map<string, string | null>();
let clipPlayer: HTMLAudioElement | null = null;

async function fetchUsClip(word: string): Promise<string | null> {
  const key = word.toLowerCase();
  const cached = clipCache.get(key);
  if (cached !== undefined) return cached;
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`/api/tts?word=${encodeURIComponent(key)}`, {
      signal: ctrl.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) {
      clipCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as { audioUrl?: string | null };
    const url =
      typeof data.audioUrl === "string" && data.audioUrl ? data.audioUrl : null;
    clipCache.set(key, url);
    return url;
  } catch {
    clipCache.set(key, null);
    return null;
  }
}

function playClip(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!clipPlayer) clipPlayer = new Audio();
      const audio = clipPlayer;
      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        audio.onended = null;
        audio.onerror = null;
        resolve(ok);
      };
      audio.onended = () => done(true);
      audio.onerror = () => done(false);
      /* A stuck clip must never wedge a caller's speak button. */
      window.setTimeout(() => done(true), 6000);
      audio.src = url;
      void audio.play().catch(() => done(false));
    } catch {
      resolve(false);
    }
  });
}

export async function speakWord(word: string): Promise<{ source: string }> {
  if (typeof window === "undefined") {
    return { source: "none" };
  }

  /* A new speak always wins: stop whatever voice or clip is mid-word. */
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (clipPlayer) {
    try { clipPlayer.pause(); } catch { /* ignore */ }
  }

  /* Single uppercase letters (e.g. "A") cause many TTS engines to say
     "Capital A" — normalise to lowercase so it simply says the letter. */
  const text = /^[A-Z]$/.test(word) ? word.toLowerCase() : word;

  /* Single words get the real American recording when one exists. */
  if (!/\s/.test(text)) {
    const clip = await fetchUsClip(text);
    if (clip && (await playClip(clip))) {
      return { source: "dictionary-us" };
    }
  }

  if (!("speechSynthesis" in window)) {
    return { source: "none" };
  }

  const utterance = new SpeechSynthesisUtterance(text);
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
    utterance.pitch = 1.08;
  }
  utterance.volume = 1;

  return new Promise((resolve) => {
    let settled = false;
    const done = (source: string) => {
      if (settled) return;
      settled = true;
      resolve({ source });
    };
    utterance.onend = () => done("speech-synthesis");
    utterance.onerror = () => done("none");
    /* Some engines (notably Chrome) can stall without firing onend/onerror —
       never let callers hang with a disabled speak button. */
    window.setTimeout(() => done("speech-synthesis"), 4000);
    window.speechSynthesis.speak(utterance);
  });
}

/* ─── Gamification sounds (WebAudio, no assets) ───
   All functions are safe to call from tap handlers: they no-op on the
   server, when WebAudio is unavailable, or if anything throws. A single
   shared AudioContext is created/resumed lazily on first use. */

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!sharedAudioContext) sharedAudioContext = new Ctor();
    if (sharedAudioContext.state === "suspended") {
      void sharedAudioContext.resume().catch(() => { /* ignore */ });
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/* ─── Parent mute (earcons only — speech is never gated) ───
   The flag lives in ProgressState.soundEnabled so it persists with the
   rest of the child's progress and migrates via the {...initialProgress,
   ...parsed} spread in loadProgress. Reading it must never throw:
   server-side / pre-hydration it defaults to ON (sounds play). */

function earconsOn(): boolean {
  try {
    return loadProgress().soundEnabled !== false;
  } catch {
    return true;
  }
}

export function isSoundEnabled(): boolean {
  return earconsOn();
}

export function setSoundEnabled(on: boolean): void {
  try {
    saveProgress({ ...loadProgress(), soundEnabled: on });
  } catch { /* persistence is best-effort — never crash a tap */ }
}

function playTone(
  ctx: AudioContext,
  opts: {
    freq: number;
    freqEnd?: number;
    start: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
  },
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type ?? "sine";
  const t0 = opts.start;
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + opts.duration);
  }
  const vol = opts.volume ?? 0.12;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + opts.duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + opts.duration + 0.05);
}

export function playPop(): void {
  try {
    if (!earconsOn()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    // Chunky tap/pop: quick 500 → 900Hz sine chirp, subtle and physical
    playTone(ctx, { freq: 500, freqEnd: 900, start: ctx.currentTime, duration: 0.08, type: "sine", volume: 0.1 });
  } catch { /* sound is best-effort — never crash a tap */ }
}

export function playGentle(): void {
  try {
    if (!earconsOn()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    // Companion to THE DING — the same bell (sine + quiet triangle
    // partial), softer and settling instead of rising: E6 → C#6, the
    // A-major third, at roughly half the ding's volume. It says "good
    // try, have another go" in the ding's own voice — never a buzzer,
    // never a scold (Playbook §C).
    const t = ctx.currentTime;
    playTone(ctx, { freq: 1318.5, start: t, duration: 0.2, type: "sine", volume: 0.07 });
    playTone(ctx, { freq: 1318.5, start: t, duration: 0.16, type: "triangle", volume: 0.025 });
    playTone(ctx, { freq: 1108.73, start: t + 0.1, duration: 0.3, type: "sine", volume: 0.07 });
    playTone(ctx, { freq: 1108.73, start: t + 0.1, duration: 0.24, type: "triangle", volume: 0.025 });
  } catch { /* sound is best-effort — never crash a tap */ }
}

export function playCorrect(): void {
  try {
    if (!earconsOn()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    // THE DING (hero sound): bright two-note chime E6 → A6.
    // Each note is a sine fundamental with a quiet triangle partial for
    // warmth; the second note carries a soft octave shimmer (A7).
    // Total ~0.43s — well under the 600ms earcon ceiling.
    playTone(ctx, { freq: 1318.5, start: t, duration: 0.22, type: "sine", volume: 0.12 });
    playTone(ctx, { freq: 1318.5, start: t, duration: 0.18, type: "triangle", volume: 0.04 });
    playTone(ctx, { freq: 1760, start: t + 0.11, duration: 0.32, type: "sine", volume: 0.12 });
    playTone(ctx, { freq: 1760, start: t + 0.11, duration: 0.26, type: "triangle", volume: 0.04 });
    playTone(ctx, { freq: 3520, start: t + 0.11, duration: 0.28, type: "sine", volume: 0.025 });
  } catch { /* sound is best-effort — never crash a tap */ }
}

export function playCelebration(): void {
  try {
    if (!earconsOn()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    // Rising sparkle arpeggio in the ding's A-major family:
    // A5 → C#6 → E6 → A6, ~0.51s total (≤600ms ceiling)
    const notes = [880, 1108.73, 1318.5, 1760];
    notes.forEach((freq, i) => {
      playTone(ctx, { freq, start: t + i * 0.09, duration: 0.24, type: "triangle", volume: 0.11 });
    });
    // Soft sine sheen on the final note so the top of the arc glows
    playTone(ctx, { freq: 1760, start: t + 0.27, duration: 0.24, type: "sine", volume: 0.05 });
  } catch { /* sound is best-effort — never crash a tap */ }
}

export function playStarChime(): void {
  try {
    if (!earconsOn()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    // Star-earned / milestone chime: A6 anchor with an E7 sparkle and a
    // faint A7 tail — a slightly bigger moment than the ding, still
    // gentle, ~0.54s total (≤600ms ceiling)
    playTone(ctx, { freq: 1760, start: t, duration: 0.38, type: "sine", volume: 0.12 });
    playTone(ctx, { freq: 1760, start: t, duration: 0.3, type: "triangle", volume: 0.04 });
    playTone(ctx, { freq: 2637.02, start: t + 0.07, duration: 0.34, type: "sine", volume: 0.07 });
    playTone(ctx, { freq: 3520, start: t + 0.14, duration: 0.4, type: "sine", volume: 0.03 });
  } catch { /* sound is best-effort — never crash a tap */ }
}
