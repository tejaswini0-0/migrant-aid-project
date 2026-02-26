import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Scale, FileText, Volume2, Download, Send, MapPin,
  Phone, ChevronDown, ChevronUp, Copy, Check, AlertTriangle,
  Globe, BookOpen
} from 'lucide-react';
import { LANG_META, getLangKey } from './languages';

export interface LawEntry {
  act: string;
  section: string;
  summary: string;
  detail: string;
  translations: Record<string, string>;
}

export interface AnalysisResult {
  incidentType: string;
  incidentColor: string;
  language: string;
  languageCode: string;
  rawTranscript: string;
  laws: LawEntry[];
  complaintDraft: string;
  authority: { name: string; address: string; phone: string; hours: string };
  referToNgo: boolean;
  evidenceChecklist?: string[];
}

interface RightsScreenProps {
  onBack: () => void;
  analysis: AnalysisResult | null;
}

// ─── TTS — tracks playingId so each button knows if IT is playing ─────────────
function useTTS() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = (id: string, text: string, bcp47: string) => {
    window.speechSynthesis.cancel();
    if (playingId === id) { setPlayingId(null); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp47;
    u.rate = 0.82;
    u.onstart = () => setPlayingId(id);
    u.onend = () => setPlayingId(null);
    u.onerror = () => setPlayingId(null);
    setTimeout(() => window.speechSynthesis.speak(u), 50);
  };

  const stop = () => { window.speechSynthesis.cancel(); setPlayingId(null); };
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, []);

  return {
    speak,
    stop,
    isPlaying: (id: string) => playingId === id,
    anyPlaying: playingId !== null,
    supported,
  };
}

// ─── Language bar ─────────────────────────────────────────────────────────────
function LangBar({ current, onChange }: { current: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button onClick={() => onChange('en')}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${current === 'en' ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-300 border border-gray-700 hover:border-gray-500'}`}>
        English
      </button>
      {Object.entries(LANG_META).map(([key, meta]) => (
        <button key={key} onClick={() => onChange(key)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${current === key ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-300 border border-gray-700 hover:border-gray-500'}`}>
          {meta.native}
        </button>
      ))}
    </div>
  );
}

// ─── Law Card ─────────────────────────────────────────────────────────────────
function LawCard({ law, displayLang, tts, idx }: { law: LawEntry; displayLang: string; tts: ReturnType<typeof useTTS>; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const translation = displayLang !== 'en' ? law.translations[displayLang] : null;
  const displayText = translation || law.detail;
  const summaryDisplay = translation ? translation.split('.')[0] + '.' : law.summary;
  const bcp47 = displayLang !== 'en' ? (LANG_META[displayLang]?.bcp47 ?? 'en-IN') : 'en-IN';
  const ttsId = `law-${idx}-${displayLang}`;

  return (
    <div className="bg-[#0F172A] rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-[#F59E0B] text-xs font-bold uppercase tracking-wide">{law.section}</span>
            <p className="text-white font-semibold text-sm mt-0.5">{law.act}</p>
          </div>
          {tts.supported && (
            <button onClick={() => tts.speak(ttsId, displayText, bcp47)}
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${tts.isPlaying(ttsId) ? 'bg-red-500/20 border border-red-500/50' : 'bg-[#F59E0B]/10 border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20'}`}>
              <Volume2 className={`w-4 h-4 ${tts.isPlaying(ttsId) ? 'text-red-400' : 'text-[#F59E0B]'}`} />
            </button>
          )}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{summaryDisplay}</p>
        {translation && (
          <span className="inline-block mt-1.5 text-[10px] bg-blue-900/30 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded-full">
            {LANG_META[displayLang]?.native}
          </span>
        )}
      </div>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between border-t border-gray-700/50 hover:bg-[#1E293B]/50 transition-colors">
        <span className="text-[#F59E0B] text-xs font-semibold flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {expanded ? 'Show less' : 'Full explanation'}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-700/50">
          {translation ? (
            <>
              <p className="text-white text-sm leading-relaxed mb-3">{translation}</p>
              <details className="group">
                <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 list-none flex items-center gap-1">
                  <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />Also in English
                </summary>
                <p className="text-gray-400 text-xs leading-relaxed mt-2 pl-2 border-l border-gray-700">{law.detail}</p>
              </details>
            </>
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed">{law.detail}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RightsScreen({ onBack, analysis }: RightsScreenProps) {
  const tts = useTTS();
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const autoLang = analysis ? (getLangKey(analysis.languageCode) ?? 'en') : 'en';
  const [displayLang, setDisplayLang] = useState(autoLang);

  const data: AnalysisResult = analysis ?? {
    incidentType: 'Wage Theft', incidentColor: '#F59E0B',
    language: 'Hindi', languageCode: 'hi-IN', rawTranscript: '',
    laws: [{
      act: 'Payment of Wages Act, 1936', section: 'Section 15',
      summary: 'Right to claim all unpaid wages. Employer fined up to 10× the unpaid amount.',
      detail: 'If wages are not paid by the 7th or 10th of the month, the employer must pay 10× the delayed wages as compensation. File a free claim at the Labour Commissioner — no lawyer needed.',
      translations: { hi: 'यदि मजदूरी समय पर नहीं दी गई, तो नियोक्ता को 10 गुना जुर्माना देना होगा। श्रम आयुक्त के पास मुफ्त में दावा करें।' },
    }],
    complaintDraft: 'To,\nThe Labour Commissioner,\n[District]\n\nSub: Non-payment of wages\n\n[Your Name]\n[Date]',
    authority: { name: 'Labour Commissioner Office', address: '[District HQ], Ground Floor, Room 4', phone: '1800-11-2229', hours: 'Mon–Sat, 10am–5pm' },
    referToNgo: false,
  };

  const handleListenAll = () => {
    if (tts.anyPlaying) { tts.stop(); return; }
    const text = data.laws.map(l => (displayLang !== 'en' && l.translations[displayLang]) ? l.translations[displayLang] : l.summary).join('. ');
    const bcp47 = displayLang !== 'en' ? (LANG_META[displayLang]?.bcp47 ?? 'en-IN') : 'en-IN';
    tts.speak('listen-all', text, bcp47);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.complaintDraft).then(() => {
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([data.complaintDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `awaaz_complaint_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent('AWAAZ Legal Aid — Complaint\n\n' + data.complaintDraft)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="p-2 hover:bg-[#1E293B] rounded-lg transition-all active:scale-95">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="ml-3 flex-1">
            <h1 className="text-base font-bold text-white">Your Rights & Next Steps</h1>
            <p className="text-xs text-gray-400">{data.language} · {data.incidentType}</p>
          </div>
          {tts.supported && (
            <button onClick={handleListenAll}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${tts.anyPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'}`}>
              <Volume2 className="w-3.5 h-3.5" />
              {tts.anyPlaying ? 'Stop' : 'Listen All'}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">

        {/* Language switcher */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-white text-sm font-semibold">Reading in:</span>
            {displayLang !== 'en' && <span className="text-xs text-gray-400">{LANG_META[displayLang]?.native}</span>}
          </div>
          <LangBar current={displayLang} onChange={setDisplayLang} />
        </div>

        {/* Incident badge */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.incidentColor }} />
          <span className="text-white font-bold">{data.incidentType}</span>
        </div>

        {/* Laws */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-white font-bold uppercase tracking-wide text-sm">Your Rights</h2>
          </div>
          <div className="space-y-3">
            {data.laws.map((law, i) => (
              <LawCard key={`${i}-${displayLang}`} law={law} displayLang={displayLang} tts={tts} idx={i} />
            ))}
          </div>
        </section>

        {/* Complaint */}
        <section className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
          <button onClick={() => setShowDraft(!showDraft)}
            className="w-full p-4 flex items-center justify-between hover:bg-[#334155]/30 transition-colors">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-white font-bold">Your Complaint is Ready</span>
            </div>
            {showDraft ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showDraft && (
            <div className="px-4 pb-3 border-t border-gray-700/50 pt-3">
              <div className="bg-[#0F172A] rounded-xl p-4 border border-gray-700 mb-2">
                <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">{data.complaintDraft}</pre>
              </div>
              <p className="text-gray-500 text-xs">Fill in the [brackets] with your personal details before submitting.</p>
            </div>
          )}
          <div className="px-4 pb-4 pt-2 space-y-2.5 border-t border-gray-700/50">
            {tts.supported && (
              <button onClick={() => tts.speak('complaint', data.complaintDraft, 'en-IN')}
                className={`w-full py-3.5 px-5 rounded-xl flex items-center gap-3 font-semibold transition-all active:scale-95 border ${tts.isPlaying('complaint') ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-[#0F172A] border-gray-700 text-white hover:bg-[#334155]'}`}>
                <Volume2 className="w-5 h-5 text-[#F59E0B]" />
                {tts.isPlaying('complaint') ? 'Stop reading' : 'Listen to complaint'}
              </button>
            )}
            <button onClick={handleCopy}
              className="w-full bg-[#0F172A] hover:bg-[#334155] border border-gray-700 text-white font-semibold py-3.5 px-5 rounded-xl flex items-center gap-3 transition-all active:scale-95">
              {copiedDraft ? <><Check className="w-5 h-5 text-green-400" /> Copied!</> : <><Copy className="w-5 h-5 text-[#F59E0B]" /> Copy complaint text</>}
            </button>
            <button onClick={handleDownload}
              className="w-full bg-[#0F172A] hover:bg-[#334155] border border-gray-700 text-white font-semibold py-3.5 px-5 rounded-xl flex items-center gap-3 transition-all active:scale-95">
              <Download className="w-5 h-5 text-[#F59E0B]" /> Download as text file
            </button>
            <button onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-3.5 px-5 rounded-xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-[#25D366]/20">
              <Send className="w-5 h-5" /> Send to WhatsApp
            </button>
          </div>
        </section>

        {data.referToNgo && (
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-purple-300 font-semibold text-sm">Complex Case — Free Legal Help Available</p>
              <p className="text-purple-400 text-xs mt-1">Call the toll-free number 1800-11-2229 or ask the Labour Commissioner to refer you to a free lawyer.</p>
            </div>
          </div>
        )}

        {/* Where to go */}
        <section className="bg-[#1E293B] rounded-2xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Where to Go</h2>
          </div>
          <div className="space-y-2">
            <div><p className="text-gray-400 text-xs">Office</p><p className="text-white font-semibold">{data.authority.name}</p></div>
            <div><p className="text-gray-400 text-xs">Address</p><p className="text-white text-sm">{data.authority.address}</p></div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div><p className="text-gray-400 text-xs">Hours</p><p className="text-white text-sm">{data.authority.hours}</p></div>
              <div><p className="text-gray-400 text-xs">Phone</p><p className="text-[#F59E0B] font-semibold text-sm">{data.authority.phone}</p></div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(data.authority.name + ' ' + data.authority.address)}`, '_blank')}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#F59E0B]/20">
            <MapPin className="w-5 h-5" /> Directions
          </button>
          <button onClick={() => window.location.href = `tel:${data.authority.phone.replace(/\D/g, '')}`}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#22C55E]/20">
            <Phone className="w-5 h-5" /> Call Now
          </button>
        </div>
      </div>
    </div>
  );
}