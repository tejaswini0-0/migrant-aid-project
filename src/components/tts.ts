// ─── AWAAZ TTS Engine ─────────────────────────────────────────────────────────
//
// The problem with regional Indian language TTS:
//
// 1. Google Translate TTS (translate.google.com) blocks browser fetch() with 403
//    because it checks Referer headers — so Audio(url) fails silently.
//
// 2. Web Speech API voices for Indian languages (hi-IN, kn-IN, ta-IN etc.) ARE
//    available on Android Chrome and some desktops, but only AFTER the
//    `voiceschanged` event fires (async). If you call getVoices() too early
//    you get an empty list and fall back incorrectly.
//
// 3. Even with no matching voice, Web Speech API will still speak using a
//    default voice — it just won't sound perfect. This is better than silence.
//
// Solution: Use Web Speech API always. Wait for voices to load properly.
// For languages with no exact voice, use the lang tag alone — the browser
// will pick the closest available voice instead of staying silent.

type Listener = () => void;

// BCP-47 codes for all supported languages
const LANG_BCP47: Record<string, string> = {
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  en: 'en-IN',
};

function normaliseLang(raw: string): string {
  const base = raw.split('-')[0].toLowerCase();
  return LANG_BCP47[base] ?? raw;
}

// Wait for speechSynthesis voices to load (Chrome loads them async)
function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { resolve(voices); return; }
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // Fallback: if event never fires (Firefox), resolve after 1s
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

// Pick best voice for a language. Falls back gracefully — never returns null.
// Even if no Indian voice exists, returning undefined lets the browser pick
// its default voice rather than staying silent.
async function pickVoice(bcp47: string): Promise<SpeechSynthesisVoice | undefined> {
  const voices = await waitForVoices();
  const base = bcp47.split('-')[0];
  return (
    voices.find(v => v.lang === bcp47) ??
    voices.find(v => v.lang.startsWith(base + '-')) ??
    voices.find(v => v.lang.startsWith(base)) ??
    undefined  // undefined = browser default; better than silence
  );
}

// Split text on sentence boundaries so long text doesn't get cut off
// (Web Speech has a ~32KB limit but some browsers cut at ~250 chars)
function splitSentences(text: string): string[] {
  // Split on Hindi danda (।) and common punctuation
  const parts = text.split(/(?<=[।.!?])\s+/).filter(Boolean);
  return parts.length ? parts : [text];
}

export class TTSEngine {
  private playingId: string | null = null;
  private cancelled = false;
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() { this.listeners.forEach(fn => fn()); }

  get isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isPlaying(id: string) { return this.playingId === id; }
  get anyPlaying() { return this.playingId !== null; }

  stop() {
    this.cancelled = true;
    if (this.isSupported) window.speechSynthesis.cancel();
    if (this.playingId !== null) {
      this.playingId = null;
      this.notify();
    }
  }

  async speak(id: string, rawText: string, langRaw?: string) {
    if (!this.isSupported) return;

    // Toggle off if same id
    if (this.playingId === id) { this.stop(); return; }
    this.stop();
    this.cancelled = false;

    // Strip bilingual separator — only read the regional part
    const text = rawText.split('--- English ---')[0].trim();
    if (!text) return;

    const bcp47 = normaliseLang(langRaw ?? 'en-IN');
    const sentences = splitSentences(text);
    const voice = await pickVoice(bcp47);

    if (this.cancelled) return;

    this.playingId = id;
    this.notify();

    // Speak sentence by sentence — avoids browser char limits and gives
    // smoother playback for long texts
    for (let i = 0; i < sentences.length; i++) {
      if (this.cancelled) break;
      await new Promise<void>(resolve => {
        const u = new SpeechSynthesisUtterance(sentences[i]);
        u.lang = bcp47;
        u.rate = 0.88;
        u.pitch = 1;
        u.volume = 1;
        if (voice) u.voice = voice;

        u.onend = () => resolve();
        u.onerror = (e) => {
          // 'interrupted' means stop() was called — not a real error
          if (e.error !== 'interrupted') console.warn('TTS error:', e.error, sentences[i]);
          resolve();
        };

        // Chrome bug: synthesis silently fails if you call speak() too
        // quickly after cancel(). The 80ms delay on the first sentence fixes this.
        setTimeout(() => {
          if (!this.cancelled) window.speechSynthesis.speak(u);
          else resolve();
        }, i === 0 ? 80 : 0);
      });
    }

    if (!this.cancelled) {
      this.playingId = null;
      this.notify();
    }
  }
}