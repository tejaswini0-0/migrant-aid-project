import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Phone, MessageCircle, Scale, Shield, AlertTriangle, ChevronDown, ChevronUp,
  Send, Loader2, Bot, User, Volume2, Mic, MicOff, Square, HelpCircle
} from 'lucide-react';

interface HelpScreenProps {
  userLanguage?: string;
  languageCode?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EMERGENCY = [
  { label: 'Labour Helpline',  number: '1800-11-2229', color: '#F59E0B', desc: 'National labour grievance — free, 24/7' },
  { label: 'Police Emergency', number: '100',          color: '#EF4444', desc: 'Abuse, threats, or immediate danger' },
  { label: 'NHRC Helpline',   number: '14433',         color: '#8B5CF6', desc: 'National Human Rights Commission' },
  { label: 'Women Helpline',  number: '181',           color: '#EC4899', desc: 'Women workers facing harassment' },
  { label: 'Child Helpline',  number: '1098',          color: '#06B6D4', desc: 'Child labour situations' },
];

const FAQ = [
  {
    q: 'What minimum wage am I entitled to?',
    a: 'Minimum wages are set by each state and vary by type of work. For unskilled construction, most states set ₹400–700/day (2024). No contract can reduce this — it is a legal floor. Call 1800-11-2229 or visit your state Labour Department to find your exact rate.',
  },
  {
    q: 'My employer took my Aadhaar card. What do I do?',
    a: 'This is a serious criminal offence. Confiscating documents to stop you from leaving is bonded labour under the Bonded Labour Act, 1976 — non-bailable. Immediately: (1) File an FIR at the nearest police station — they cannot refuse, (2) Contact the District Magistrate, (3) Call 1800-11-2229.',
  },
  {
    q: 'Can I file a complaint without a lawyer?',
    a: 'Yes — completely free. You do not need a lawyer to file a wage complaint with the Labour Commissioner. Submit evidence (bank messages, site photos), and the Commissioner summons the employer to a hearing within ~30 days. AWAAZ generates this letter automatically.',
  },
  {
    q: 'What evidence do I need?',
    a: '(1) Photo of site signboard — shows contractor name and licence, (2) UPI/bank screenshots showing payment history, (3) Voice note from a coworker who witnessed your work, (4) Any written work orders or gate passes, (5) Contractor\'s vehicle number plate.',
  },
  {
    q: 'My employer is threatening me after I complained.',
    a: 'Threatening a worker for filing a complaint is called victimisation — illegal under labour laws. Document every threat with date, time, and witnesses. Report to the Labour Commissioner in writing AND to police under IPC Section 506 (criminal intimidation).',
  },
  {
    q: 'I was injured at the worksite — what am I owed?',
    a: "Under the Employees' Compensation Act, 1923, any work injury entitles you to compensation regardless of fault. Get a written medical report from a government hospital and file a claim with the Commissioner for Employees' Compensation in your district.",
  },
  {
    q: 'What is the BOCW Act?',
    a: "The Building & Other Construction Workers Act, 1996 covers you if you work in construction. Your employer must provide free safety equipment, safe scaffolding, wages on time, and accident compensation. Register with your state's BOCW Welfare Board for housing, education scholarships, and medical aid.",
  },
  {
    q: 'Can my employer deduct money from my wages?',
    a: 'Only legal deductions: absence, damage you caused (after formal inquiry), employer housing, advances you requested, and PF/ESI. Deductions for tools, transport, or food are illegal. File a complaint under the Payment of Wages Act if this happens.',
  },
  {
    q: 'What extra rights do women workers have?',
    a: 'Women workers have: (1) Equal pay for equal work (Equal Remuneration Act, 1976), (2) Protection from sexual harassment — POSH Act requires every employer with 10+ workers to have a complaints committee, (3) 26 weeks paid maternity leave, (4) No forced night shifts without consent.',
  },
  {
    q: 'Can my employer dismiss me without notice?',
    a: "Workers who have worked 240+ days cannot be dismissed without 30 days' written notice (or 1 month's wages instead), a written reason, and a chance to respond. Sudden dismissal without this is illegal — file for reinstatement or compensation at the Labour Commissioner.",
  },
];

const WORKER_RIGHTS = [
  'Minimum wages — no contract can reduce this',
  'Safe working conditions and free safety equipment',
  'Compensation for any work-related injury',
  'File complaints free — no lawyer needed',
  'Keep your own identity documents at all times',
  'Not to be abused, threatened, or harassed',
  'Equal pay for equal work (women workers)',
  '26 weeks paid maternity leave (women workers)',
  'Form or join a trade union',
  'BOCW Welfare Board benefits if you work in construction',
];

// ─── TTS hook — picks correct language voice, falls back gracefully ───────────

// Language code mapping to help with TTS voice selection
const LANGUAGE_VOICE_MAP: { [key: string]: string[] } = {
  'hi': ['hi-IN', 'hi', 'hin', 'en-IN', 'en'],           // Hindi
  'ta': ['ta-IN', 'ta', 'tam', 'en-IN', 'en'],           // Tamil
  'te': ['te-IN', 'te', 'tel', 'en-IN', 'en'],           // Telugu
  'kn': ['kn-IN', 'kn', 'kan', 'en-IN', 'en'],           // Kannada
  'bn': ['bn-IN', 'bn', 'ben', 'en-IN', 'en'],           // Bengali
  'mr': ['mr-IN', 'mr', 'mar', 'en-IN', 'en'],           // Marathi
  'gu': ['gu-IN', 'gu', 'guj', 'en-IN', 'en'],           // Gujarati
  'en': ['en-IN', 'en-US', 'en-GB', 'en'],                 // English
};

function useTTS(defaultLang = 'en-IN') {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Ensure voices are loaded on component mount
  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => setVoicesLoaded(true);
    window.speechSynthesis.onvoiceschanged = loadVoices;
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesLoaded(true);
    }
    return () => {
      window.speechSynthesis.onvoiceschanged = null as any;
    };
  }, [supported]);

  // Pick the best available voice for a given BCP-47 lang code
  const getBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (!supported) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    
    const langBase = lang.split('-')[0];
    
    // Use language map for fallback chain
    const fallbackChain = LANGUAGE_VOICE_MAP[langBase] || [lang, langBase, 'en'];
    
    // Try each language in the fallback chain
    for (const tryLang of fallbackChain) {
      // Try exact match
      const exact = voices.find(v => v.lang === tryLang);
      if (exact) return exact;
      
      // Try prefix match (e.g., 'hi' matches 'hi-IN')
      const prefix = voices.find(v => v.lang.startsWith(tryLang));
      if (prefix) return prefix;
      
      // Try base language match
      const base = tryLang.split('-')[0];
      const baseLang = voices.find(v => v.lang.split('-')[0] === base);
      if (baseLang) return baseLang;
    }
    
    // Last resort: return any voice
    return voices.length > 0 ? voices[0] : null;
  }, [supported]);

  const speak = useCallback((id: string, text: string, lang?: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    if (playingId === id) { setPlayingId(null); return; }
    const targetLang = lang ?? defaultLang;
    
    // Extract only the first paragraph for TTS (regional language part, not English)
    const textToSpeak = text.split('--- English ---')[0].trim();
    
    const u = new SpeechSynthesisUtterance(textToSpeak);
    u.lang = targetLang;
    u.rate = 0.9;  // Slightly faster for better clarity
    u.pitch = 1;
    
    const voice = getBestVoice(targetLang);
    if (voice) u.voice = voice;
    
    u.onstart = () => setPlayingId(id);
    u.onend = () => setPlayingId(null);
    u.onerror = () => {
      console.warn(`TTS error for language ${targetLang}:`, u.onerror);
      setPlayingId(null);
    };
    
    // Chrome needs a short delay after cancel() before speak()
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        setPlayingId(null);
      }
    }, 100);
  }, [playingId, defaultLang, supported, getBestVoice]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setPlayingId(null);
  }, [supported]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, []);

  return {
    speak, stop,
    isPlaying: (id: string) => playingId === id,
    anyPlaying: playingId !== null,
    supported,
  };
}

// ─── Voice input hook for chat ────────────────────────────────────────────────

function useVoiceInput(langCode = 'en-IN') {
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const recRef = useRef<any>(null);
  const accumRef = useRef('');

  const SR = typeof window !== 'undefined'
    ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
    : null;

  const start = useCallback(() => {
    if (!SR) return;
    accumRef.current = '';
    setLiveText('');
    const r = new SR();
    r.lang = langCode;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) accumRef.current += e.results[i][0].transcript + ' ';
        else interim = e.results[i][0].transcript;
      }
      setLiveText(accumRef.current + interim);
    };
    r.onerror = (e: any) => {
      if (e.error !== 'aborted') setListening(false);
    };
    // Keep alive on end
    r.onend = () => { if (recRef.current) { try { r.start(); } catch {} } };
    r.start();
    recRef.current = r;
    setListening(true);
  }, [langCode]);

  const stop = useCallback((): string => {
    const ref = recRef.current;
    recRef.current = null; // clear first so onend doesn't restart
    if (ref) { try { ref.abort(); } catch {} }
    setListening(false);
    const result = accumRef.current.trim();
    accumRef.current = '';
    setLiveText('');
    return result;
  }, []);

  return { listening, liveText, start, stop, supported: !!SR };
}

// ─── Groq API — requires VITE_GROQ_API_KEY in your .env / Vercel env vars


// ─── ChatBot component ────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  'My wages haven\'t been paid',
  'My documents were taken',
  'I was injured at work',
  'My employer is threatening me',
  'What is minimum wage?',
  'How to file a complaint?',
];

function ChatBot({ userLanguage, languageCode }: { userLanguage?: string; languageCode?: string }) {
  const tts = useTTS(languageCode ?? 'en-IN');
  const voice = useVoiceInput(languageCode ?? 'en-IN');

  const [msgs, setMsgs] = useState<Message[]>([{
    id: 'w0', role: 'assistant',
    text: `Hello! I'm the AWAAZ legal assistant — ask me anything about your rights as a worker in India.\n\nYou can type OR tap 🎙 to speak your question. I respond in your language automatically, and read my replies aloud.\n\nExamples:\n• "मेरी मजदूरी 3 महीने से नहीं मिली"\n• "Is it legal to keep my Aadhaar?"\n• "ನನ್ನ ಸಂಬಳ ಕೊಡ್ತಿಲ್ಲ — ಏನ್ ಮಾಡಲಿ?"`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  // Mirror live voice transcript into the input box while listening
  useEffect(() => {
    if (voice.listening) setInput(voice.liveText);
  }, [voice.liveText, voice.listening]);

  const toggleVoice = () => {
    if (voice.listening) {
      const final = voice.stop();
      setInput(final || input);
      inputRef.current?.focus();
    } else {
      voice.start();
    }
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    if (voice.listening) voice.stop();
    setInput('');
    setError(null);

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build message history — skip welcome message, optionally prepend language hint
      const history: { role: string; content: string }[] = [];
      if (userLanguage && userLanguage !== 'English') {
        history.push({ role: 'user', content: `My preferred language is ${userLanguage}. Please respond in ${userLanguage} when I write in that language.` });
        history.push({ role: 'assistant', content: `Understood. I will respond in ${userLanguage} when you write in that language.` });
      }
      [...msgs, userMsg]
        .filter(m => m.id !== 'w0')
        .forEach(m => history.push({ role: m.role, content: m.text }));

      const reply = await askClaude(history);
      const aMsg: Message = { id: `a${Date.now()}`, role: 'assistant', text: reply };
      setMsgs(prev => [...prev, aMsg]);
      // Auto-read the reply aloud in the correct language
      setTimeout(() => tts.speak(aMsg.id, reply, languageCode ?? 'en-IN'), 250);
    } catch (e: any) {
      setError(e.message ?? 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Info banner */}
      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-3 flex items-start gap-2">
        <Scale className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-yellow-200 text-xs leading-relaxed">
          Type or 🎙 speak your question. Replies are <strong>read aloud automatically</strong> in your language. Works in Hindi, Kannada, Tamil, Telugu, Bengali, and English.
        </p>
      </div>

      {/* Quick prompt chips */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map(q => (
          <button key={q} onClick={() => send(q)} disabled={loading}
            className="px-3 py-1.5 bg-[#1E293B] border border-gray-700 hover:border-[#F59E0B]/50 text-gray-300 text-xs rounded-full transition-all active:scale-95 disabled:opacity-50">
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex flex-col bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-[#0F172A]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AWAAZ Legal Assistant</p>
              <p className="text-green-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online · Powered by Claude AI
              </p>
            </div>
          </div>
          {tts.anyPlaying && (
            <button onClick={tts.stop}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs active:scale-95">
              <Square className="w-3 h-3 fill-current" /> Stop
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="overflow-y-auto p-4 space-y-4 max-h-[420px] min-h-[180px]">
          {msgs.map(m => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-[#F59E0B]/20 border border-[#F59E0B]/40' : 'bg-blue-900/40 border border-blue-700/40'}`}>
                {m.role === 'user' ? <User className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
              </div>
              <div className={`max-w-[82%] flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#F59E0B] text-white rounded-tr-sm' : 'bg-[#0F172A] text-gray-200 border border-gray-700 rounded-tl-sm'}`}>
                  {m.text}
                </div>
                {m.role === 'assistant' && tts.supported && m.id !== 'w0' && (
                  <button onClick={() => tts.speak(m.id, m.text, languageCode)}
                    className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 px-1 transition-colors">
                    {tts.isPlaying(m.id)
                      ? <><Square className="w-2.5 h-2.5 fill-current" /> Stop</>
                      : <><Volume2 className="w-2.5 h-2.5" /> Listen again</>}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-900/40 border border-blue-700/40 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="bg-[#0F172A] border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                <span className="text-gray-400 text-sm">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Voice indicator bar */}
        {voice.listening && (
          <div className="mx-3 mb-2 px-3 py-2 bg-red-900/20 border border-red-700/40 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
            <span className="text-red-200 text-xs flex-1 truncate italic">
              {voice.liveText || 'Listening — speak now...'}
            </span>
            <button onClick={() => { const t = voice.stop(); if (t) send(t); }}
              className="shrink-0 text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 active:scale-95">
              Send ↑
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="p-3 border-t border-gray-700 bg-[#0F172A]/40">
          <div className="flex gap-2 items-end">
            {/* Mic button */}
            {voice.supported && (
              <button onClick={toggleVoice}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0 ${voice.listening ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-[#1E293B] border border-gray-700 text-gray-400 hover:text-[#F59E0B] hover:border-[#F59E0B]/50'}`}>
                {voice.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={voice.supported ? 'Type or tap 🎙 to speak...' : 'Type your question in any language...'}
              rows={2}
              className="flex-1 bg-[#1E293B] text-white placeholder-gray-500 text-sm rounded-xl px-3 py-2.5 outline-none border border-gray-700 focus:border-[#F59E0B]/50 resize-none leading-relaxed"
            />

            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="w-10 h-10 bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-gray-600 text-[10px] mt-1.5 px-1">
            Replies read aloud automatically · AI may make mistakes · Verify with Labour Commissioner
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ item with TTS ────────────────────────────────────────────────────────

function FAQItem({ q, a, idx, langCode }: { q: string; a: string; idx: number; langCode?: string }) {
  const [open, setOpen] = useState(false);
  const tts = useTTS(langCode ?? 'en-IN');
  return (
    <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-[#334155]/30 transition-colors">
        <span className="text-white text-sm font-medium leading-relaxed">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
          <p className="text-gray-300 text-sm leading-relaxed mb-3">{a}</p>
          {tts.supported && (
            <button onClick={() => tts.speak(`faq${idx}`, a, 'en-IN')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors">
              {tts.isPlaying(`faq${idx}`)
                ? <><Square className="w-3 h-3 fill-current" /> Stop</>
                : <><Volume2 className="w-3 h-3" /> Listen</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Worker Rights Card with TTS ─────────────────────────────────────────────

function WorkerRightsCard({ langCode }: { langCode?: string }) {
  const tts = useTTS(langCode ?? 'en-IN');
  const rightsText = WORKER_RIGHTS.join('. ');

  return (
    <div className="mt-2 bg-[#1E293B] rounded-xl border border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-3 justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#F59E0B]" />
          <p className="text-white font-semibold text-sm">Your Fundamental Rights as a Worker</p>
        </div>
        {tts.supported && (
          <button onClick={() => tts.speak('worker-rights', rightsText, langCode)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-200 transition-colors">
            {tts.isPlaying('worker-rights')
              ? <><Square className="w-3 h-3 fill-current" /> Stop</>
              : <><Volume2 className="w-3 h-3" /> Listen</>}
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {WORKER_RIGHTS.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
            <span className="text-[#22C55E] mt-0.5 shrink-0">✓</span>{r}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HelpScreen({ userLanguage, languageCode }: HelpScreenProps) {
  const [tab, setTab] = useState<'chat' | 'faq' | 'contacts'>('chat');

  return (
    <div className="min-h-screen bg-[#0F172A] pb-28">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="px-4 pt-4 pb-1">
          <h1 className="text-lg font-bold text-white">Help & Legal Guidance</h1>
          <p className="text-xs text-gray-400 mb-3">Free · All languages · AI-powered</p>
          <div className="flex gap-2 pb-3">
            {(['chat', 'faq', 'contacts'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-400 border border-gray-700 hover:text-white'}`}>
                {t === 'chat' ? '💬 AI Chat' : t === 'faq' ? '❓ FAQ' : '📞 Contacts'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">

        {/* ─ AI CHAT ─ */}
        {tab === 'chat' && (
          <ChatBot userLanguage={userLanguage} languageCode={languageCode} />
        )}

        {/* ─ FAQ ─ */}
        {tab === 'faq' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-white font-bold">Common Questions</h2>
            </div>
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} idx={i} langCode={languageCode} />
            ))}

            {/* Rights summary card */}
            <WorkerRightsCard langCode={languageCode} />
          </div>
        )}

        {/* ─ CONTACTS ─ */}
        {tab === 'contacts' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">All numbers are <span className="text-white font-semibold">free to call</span> from any mobile phone.</p>

            {/* Emergency contacts */}
            <div className="space-y-3">
              {EMERGENCY.map((c, i) => (
                <div key={i} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <p className="text-white font-semibold text-sm">{c.label}</p>
                    </div>
                    <p className="text-gray-400 text-xs">{c.desc}</p>
                  </div>
                  <a href={`tel:${c.number}`}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all shrink-0"
                    style={{ backgroundColor: c.color }}>
                    <Phone className="w-4 h-4" /> {c.number}
                  </a>
                </div>
              ))}
            </div>

            {/* NGOs */}
            <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <p className="text-white font-semibold">Free Legal Aid — NGOs</p>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Jan Sahas', desc: 'Bonded labour, trafficking, and migrant worker rights', contact: 'jansahas.net' },
                  { name: 'SEWA', desc: "Self Employed Women's Association — women worker rights and legal aid", contact: 'sewa.org' },
                  { name: 'Prayas', desc: 'Child labour and migrant worker support — Delhi NCR', contact: 'prayasIndia.org' },
                  { name: 'District Legal Services Authority (DLSA)', desc: 'Free government-assigned lawyers — every district has one. Ask at your District Court.', contact: 'nalsa.gov.in' },
                ].map((n, i, arr) => (
                  <div key={i} className={i > 0 ? 'border-t border-gray-700/50 pt-3' : ''}>
                    <p className="text-white font-medium text-sm">{n.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{n.desc}</p>
                    <p className="text-[#F59E0B] text-xs mt-0.5">{n.contact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Process guide */}
            <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-[#F59E0B]" />
                <p className="text-white font-semibold">How the Complaint Process Works</p>
              </div>
              <ol className="space-y-3">
                {[
                  { n: '1', t: 'Collect evidence first', d: 'Photos, bank messages, witness voice notes — before anything else' },
                  { n: '2', t: 'Record in AWAAZ', d: 'Speak your problem — AWAAZ creates a formal complaint letter automatically' },
                  { n: '3', t: 'File with Labour Commissioner', d: 'Visit the office or send by registered post — free, no lawyer needed' },
                  { n: '4', t: 'Hearing scheduled', d: 'Both you and employer summoned, usually within ~30 days' },
                  { n: '5', t: 'Order issued', d: 'Commissioner can order full back-pay + penalty up to 10× the owed wages' },
                ].map(({ n, t, d }) => (
                  <li key={n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {n}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{t}</p>
                      <p className="text-gray-400 text-xs">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
async function askClaude(msgs: { role: string; content: string }[]): Promise<string> {
  const SYSTEM_PROMPT = `You are AWAAZ Legal Assistant — a free AI helping Indian migrant and construction workers understand their labour rights in India.

Rules:
- Keep answers to 3–6 sentences unless a step-by-step is needed
- Use simple plain language; avoid jargon or explain it immediately  
- For physical danger ALWAYS say: call 100 (police) immediately first
- BILINGUAL FORMAT: If user writes in regional language (Hindi/Tamil/Telugu/Kannada/Bengali), respond FIRST in that regional language, then add a blank line, then add English translation with format "--- English ---" followed by English version
- You are expert in: Payment of Wages Act 1936, BOCW Act 1996, Contract Labour Act 1970, Minimum Wages Act 1948, Employees Compensation Act 1923, Bonded Labour Act 1976, POSH Act 2013, Maternity Benefit Act 1961, Equal Remuneration Act 1976, IPC Sections 323/324/506, Industrial Employment Act`;

  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Groq API key not configured.\n\n' +
      '📍 Get free API key at: https://console.groq.com\n\n' +
      '📍 Locally: Create/edit .env.local in your project root with:\n' +
      'VITE_GROQ_API_KEY=gsk_your-groq-key-here\n\n' +
      '📍 Vercel: Dashboard → Settings → Environment Variables → Add VITE_GROQ_API_KEY → Redeploy'
    );
  }

  // Add system prompt as first message
  const messagesWithSystem = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...msgs.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 1000,
      messages: messagesWithSystem,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as any)?.error?.message ?? '';
    if (res.status === 401) throw new Error('Invalid Groq API key. Get a free key at https://console.groq.com and add it to Vercel Settings → Environment Variables → VITE_GROQ_API_KEY.');
    if (res.status === 429) throw new Error('Rate limit reached — please wait a moment and try again.');
    if (res.status === 403) throw new Error('API access denied. Check your Groq API key at https://console.groq.com.');
    throw new Error(msg || `Groq API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'No response received. Please try again.';
}