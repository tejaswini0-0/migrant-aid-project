import { useState, useRef, useEffect } from 'react';
import {
  Phone, MessageCircle, Scale, Shield, AlertTriangle, ChevronDown,
  ChevronUp, Send, Loader2, Bot, User, Volume2, X
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

const EMERGENCY_CONTACTS = [
  { label: 'Labour Helpline',   number: '1800-11-2229', color: '#F59E0B', description: 'National labour grievance — free call' },
  { label: 'Police Emergency',  number: '100',          color: '#EF4444', description: 'Abuse, threats, or immediate danger' },
  { label: 'NHRC Helpline',     number: '14433',        color: '#8B5CF6', description: 'National Human Rights Commission' },
  { label: 'Women Helpline',    number: '181',          color: '#EC4899', description: 'Women workers facing harassment' },
];

const FAQ = [
  { q: 'What minimum wage am I entitled to?', a: 'Minimum wages vary by state and work type. Most states set ₹350–650/day for unskilled construction work as of 2024. Your employer must pay at least the state-notified minimum wage regardless of any verbal agreement — no contract can waive this right.' },
  { q: 'My employer took my Aadhaar card. What do I do?', a: 'This is illegal. Confiscating identity documents is bonded labour under the Bonded Labour System (Abolition) Act, 1976 — a non-bailable criminal offence. File an FIR at the nearest police station immediately, then contact the District Magistrate. Call 1800-11-2229 for guidance.' },
  { q: 'Can I file a complaint without a lawyer?', a: 'Yes — absolutely free. You do not need a lawyer to file a wage complaint with the Labour Commissioner. Fill out a form, submit your evidence (bank messages, photos), and the Commissioner summons the employer for a hearing. AWAAZ generates this letter for you.' },
  { q: 'What evidence do I need?', a: 'Best evidence: (1) Photos of worksite signboard showing contractor details, (2) UPI/bank screenshots showing payment history, (3) Voice recordings or written statements from coworkers, (4) Any written work orders, passes, or attendance records.' },
  { q: 'My employer is threatening me after I complained.', a: 'Threatening a worker for filing a legal complaint is victimisation — illegal under labour laws. Document every threat (date, time, what was said, witnesses). Report to the Labour Commissioner and police at the same time. Contact an NGO like Jan Sahas for extra protection.' },
  { q: 'I was injured at the worksite. Am I entitled to compensation?', a: "Yes. Under the Employees' Compensation Act, 1923, your employer must pay compensation for work-related injuries. Get a medical report from a government hospital immediately. File a claim with the Commissioner for Employees' Compensation — separate from any police complaint." },
  { q: 'What is the BOCW Act?', a: "The Building and Other Construction Workers Act, 1996 protects construction site workers. Employers must provide free safety equipment (helmets, harnesses), pay wages on time, and contribute to a welfare fund. Register with your state's BOCW Welfare Board to access housing, education benefits, and medical aid." },
];

function useTTS() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const supported = 'speechSynthesis' in window;
  const speak = (id: string, text: string, lang = 'en-IN') => {
    window.speechSynthesis.cancel();
    if (playingId === id) { setPlayingId(null); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.85;
    u.onstart = () => setPlayingId(id);
    u.onend = () => setPlayingId(null);
    u.onerror = () => setPlayingId(null);
    setTimeout(() => window.speechSynthesis.speak(u), 50);
  };
  return { speak, isPlaying: (id: string) => playingId === id, supported };
}

const SYSTEM_PROMPT = `You are a legal aid assistant for AWAAZ, helping Indian migrant and construction workers understand their labour rights. Keep answers concise (3–5 sentences). Use simple language. For immediate danger, always mention calling 100 first. Respond in the same language the user writes in.`;

async function callClaude(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.content?.[0]?.text ?? 'Sorry, I could not get a response. Please try again.';
}

function ChatBot({ userLanguage, languageCode }: { userLanguage?: string; languageCode?: string }) {
  const tts = useTTS();
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'assistant',
    text: `Hi! I'm the AWAAZ legal assistant. Ask me anything about your rights as a worker in India — in English or your own language.\n\nFor example:\n• "My contractor hasn't paid me for 2 months"\n• "What is minimum wage in Karnataka?"\n• "My employer took my Aadhaar"`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(''); setError(null);
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg]
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.text }));
      if (userLanguage) {
        history.unshift({ role: 'assistant', content: `I will respond in ${userLanguage} when you write in that language.` });
        history.unshift({ role: 'user', content: `My preferred language is ${userLanguage}.` });
      }
      const reply = await callClaude(history);
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
    } catch (err: any) {
      setError('Could not reach the AI assistant. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'My wages haven\'t been paid for months',
    'How do I file a complaint?',
    'My employer is threatening me',
    'I was injured at work',
    'My documents were taken',
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-3 flex items-start gap-2">
        <Scale className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-yellow-200 text-xs leading-relaxed">
          Ask in any language — Hindi, Kannada, Tamil, Telugu, Bengali, or English. The AI understands Indian labour law.
        </p>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map(q => (
          <button key={q} onClick={() => setInput(q)}
            className="px-3 py-1.5 bg-[#1E293B] border border-gray-700 hover:border-[#F59E0B]/50 text-gray-300 text-xs rounded-full transition-all">
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex flex-col bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b border-gray-700 bg-[#0F172A]/60">
          <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AWAAZ Legal Assistant</p>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Online
            </p>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 max-h-[380px] min-h-[180px]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-[#F59E0B]/20 border border-[#F59E0B]/40' : 'bg-blue-900/40 border border-blue-700/40'}`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
              </div>
              <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#F59E0B] text-white rounded-tr-sm' : 'bg-[#0F172A] text-gray-200 border border-gray-700 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
                {msg.role === 'assistant' && tts.supported && (
                  <button onClick={() => tts.speak(msg.id, msg.text, languageCode ?? 'en-IN')}
                    className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 px-1">
                    <Volume2 className="w-2.5 h-2.5" />
                    {tts.isPlaying(msg.id) ? 'Stop' : 'Listen'}
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
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-gray-700 bg-[#0F172A]/40">
          <div className="flex gap-2 items-end">
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={`Ask in any language... (e.g. "मेरी मजदूरी नहीं मिली")`}
              rows={2}
              className="flex-1 bg-[#1E293B] text-white placeholder-gray-500 text-sm rounded-xl px-3 py-2.5 outline-none border border-gray-700 focus:border-[#F59E0B]/50 resize-none leading-relaxed" />
            <button onClick={send} disabled={!input.trim() || loading}
              className="w-10 h-10 bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-gray-600 text-[10px] mt-1.5 px-1">AI can make mistakes — verify important details with the Labour Commissioner</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  const tts = useTTS();
  return (
    <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-[#334155]/30 transition-colors">
        <span className="text-white text-sm font-medium leading-relaxed">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
          <p className="text-gray-300 text-sm leading-relaxed mb-2">{a}</p>
          {tts.supported && (
            <button onClick={() => tts.speak(`faq-${idx}`, a)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200">
              <Volume2 className="w-3 h-3" /> {tts.isPlaying(`faq-${idx}`) ? 'Stop' : 'Listen'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HelpScreen({ userLanguage, languageCode }: HelpScreenProps) {
  const [tab, setTab] = useState<'chat' | 'faq' | 'contacts'>('chat');

  return (
    <div className="min-h-screen bg-[#0F172A] pb-28">
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="px-4 pt-4 pb-1">
          <h1 className="text-lg font-bold text-white">Help & Legal Guidance</h1>
          <p className="text-xs text-gray-400 mb-3">Free support — available in all languages</p>
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
        {tab === 'chat' && <ChatBot userLanguage={userLanguage} languageCode={languageCode} />}

        {tab === 'faq' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-white font-bold">Common Questions</h2>
            </div>
            {FAQ.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} idx={i} />)}
            <div className="mt-2 bg-[#1E293B] rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-[#F59E0B]" />
                <p className="text-white font-semibold text-sm">Your Fundamental Rights</p>
              </div>
              <ul className="space-y-1.5">
                {['Right to minimum wages (no contract can waive this)', 'Right to safe working conditions', 'Right to compensation for work injuries', 'Right to file complaints without a lawyer — free', 'Right to keep your own identity documents', 'Right not to be physically abused or threatened', 'Right to form or join a trade union'].map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                    <span className="text-[#22C55E] mt-0.5">✓</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'contacts' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">All helplines below are <span className="text-white font-semibold">free to call</span>.</p>
            <div className="space-y-3">
              {EMERGENCY_CONTACTS.map((c, i) => (
                <div key={i} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <p className="text-white font-semibold text-sm">{c.label}</p>
                    </div>
                    <p className="text-gray-400 text-xs">{c.description}</p>
                  </div>
                  <a href={`tel:${c.number}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all"
                    style={{ backgroundColor: c.color }}>
                    <Phone className="w-4 h-4" />{c.number}
                  </a>
                </div>
              ))}
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <p className="text-white font-semibold">Free Legal Aid — NGOs</p>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { name: 'Jan Sahas', desc: 'Bonded labour, trafficking, migrant worker rights', contact: 'jansahas.net' },
                  { name: 'SEWA', desc: 'Self Employed Women\'s Association — women worker rights', contact: 'sewa.org' },
                  { name: 'District Legal Services Authority', desc: 'Free government lawyers — every district has one', contact: 'Ask at your District Court' },
                ].map((n, i) => (
                  <div key={i} className={i > 0 ? 'border-t border-gray-700/50 pt-3' : ''}>
                    <p className="text-white font-medium">{n.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{n.desc}</p>
                    <p className="text-[#F59E0B] text-xs mt-0.5">{n.contact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-[#F59E0B]" />
                <p className="text-white font-semibold">How the Complaint Process Works</p>
              </div>
              <ol className="space-y-3">
                {[
                  { n: '1', t: 'Collect evidence', d: 'Photos, bank messages, witness statements — do this first' },
                  { n: '2', t: 'Generate complaint', d: 'AWAAZ creates a formal complaint letter from your voice recording' },
                  { n: '3', t: 'File with Labour Commissioner', d: 'Visit the office or send by post — free, no lawyer needed' },
                  { n: '4', t: 'Hearing is scheduled', d: 'Both you and employer are called (usually within 30 days)' },
                  { n: '5', t: 'Order and payment', d: 'Commissioner can order employer to pay wages + penalty up to 10×' },
                ].map(({ n, t, d }) => (
                  <li key={n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
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