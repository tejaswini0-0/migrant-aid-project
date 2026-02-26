import { useState } from 'react';
import { ArrowLeft, Check, AlertTriangle, Volume2, Globe } from 'lucide-react';
import { LANG_META, getLangKey } from './Languages';

interface EvidenceScreenProps {
  onBack: () => void;
  onContinue: () => void;
  checklist?: string[];
  languageCode?: string;
}

const DEFAULT_CHECKLIST: {
  text: string;
  subtext: string;
  t: Record<string, { text: string; subtext: string }>;
}[] = [
  {
    text: 'Photograph the site signboard',
    subtext: 'Shows contractor name and number',
    t: {
      hi: { text: 'साइट का साइनबोर्ड फोटो लें', subtext: 'ठेकेदार का नाम और नंबर दिखता है' },
      kn: { text: 'ಸೈಟ್ ಸೈನ್‌ಬೋರ್ಡ್ ಫೋಟೋ ತೆಗೆಯಿರಿ', subtext: 'ಗುತ್ತಿಗೆದಾರರ ಹೆಸರು ಮತ್ತು ಸಂಖ್ಯೆ ತೋರಿಸುತ್ತದೆ' },
      ta: { text: 'தளத்தின் பெயர் பலகையை புகைப்படம் எடுங்கள்', subtext: 'ஒப்பந்தகாரர் பெயர் மற்றும் எண் காட்டுகிறது' },
      te: { text: 'సైట్ సైన్‌బోర్డ్ ఫోటో తీయండి', subtext: 'కాంట్రాక్టర్ పేరు మరియు నంబర్ చూపిస్తుంది' },
      bn: { text: 'সাইটের সাইনবোর্ডের ছবি তুলুন', subtext: 'ঠিকাদারের নাম ও নম্বর দেখা যাবে' },
      mr: { text: 'साइटचा साइनबोर्ड फोटो काढा', subtext: 'कंत्राटदाराचे नाव आणि नंबर दिसतो' },
      gu: { text: 'સાઇટ સાઇનબોર્ડનો ફોટો લો', subtext: 'કોન્ટ્રાક્ટરનું નામ અને નંબર દેખાય છે' },
    },
  },
  {
    text: 'Screenshot your UPI/bank messages',
    subtext: 'Shows last payment date',
    t: {
      hi: { text: 'अपने UPI/बैंक मैसेज का स्क्रीनशॉट लें', subtext: 'आखिरी भुगतान की तारीख दिखती है' },
      kn: { text: 'UPI/ಬ್ಯಾಂಕ್ ಸಂದೇಶ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ತೆಗೆಯಿರಿ', subtext: 'ಕೊನೆಯ ಪಾವತಿ ದಿನಾಂಕ ತೋರಿಸುತ್ತದೆ' },
      ta: { text: 'UPI/வங்கி செய்திகளை ஸ்கிரீன்ஷாட் எடுங்கள்', subtext: 'கடைசி கட்டண தேதி காட்டுகிறது' },
      te: { text: 'UPI/బ్యాంక్ మెసేజ్‌ స్క్రీన్‌షాట్ తీయండి', subtext: 'చివరి చెల్లింపు తేదీ చూపిస్తుంది' },
      bn: { text: 'UPI/ব্যাংক মেসেজের স্ক্রিনশট নিন', subtext: 'শেষ পেমেন্টের তারিখ দেখা যাবে' },
      mr: { text: 'UPI/बँक मेसेजचा स्क्रीनशॉट घ्या', subtext: 'शेवटच्या पेमेंटची तारीख दिसते' },
      gu: { text: 'UPI/બેંક સંદેશાઓના સ્ક્રીનશોટ લો', subtext: 'છેલ્લી ચૂકવણીની તારીખ દેખાય છે' },
    },
  },
  {
    text: 'Get 1 coworker to voice-note what they witnessed',
    subtext: 'Important witness evidence',
    t: {
      hi: { text: '1 साथी मजदूर से गवाही का वॉइस नोट लें', subtext: 'महत्वपूर्ण गवाह का सबूत' },
      kn: { text: '1 ಸಹ ಕಾರ್ಮಿಕರಿಂದ ಧ್ವನಿ ಸಂದೇಶ ಪಡೆಯಿರಿ', subtext: 'ಮಹತ್ವದ ಸಾಕ್ಷಿ ಪುರಾವೆ' },
      ta: { text: '1 சக தொழிலாளியிடம் குரல் குறிப்பு வாங்குங்கள்', subtext: 'முக்கியமான சாட்சி ஆதாரம்' },
      te: { text: '1 సహోద్యోగి వద్ద వాయిస్ నోట్ తీసుకోండి', subtext: 'ముఖ్యమైన సాక్షి సాక్ష్యం' },
      bn: { text: '1 জন সহকর্মীর কাছ থেকে ভয়েস নোট নিন', subtext: 'গুরুত্বপূর্ণ সাক্ষী প্রমাণ' },
      mr: { text: '1 सहकर्मचाऱ्याकडून व्हॉइस नोट घ्या', subtext: 'महत्त्वाचे साक्षीदार पुरावे' },
      gu: { text: '1 સહ-કર્મચારી પાસેથી વૉઇસ નોટ લો', subtext: 'મહત્વપૂર્ણ સાક્ષી પુરાવો' },
    },
  },
  {
    text: 'Do NOT sign anything they give you right now',
    subtext: 'Protect your legal rights',
    t: {
      hi: { text: 'अभी कोई भी कागज पर साइन मत करें', subtext: 'अपने कानूनी अधिकार बचाएं' },
      kn: { text: 'ಈಗ ಯಾವುದನ್ನೂ ಸಹಿ ಮಾಡಬೇಡಿ', subtext: 'ನಿಮ್ಮ ಕಾನೂನು ಹಕ್ಕುಗಳನ್ನು ರಕ್ಷಿಸಿ' },
      ta: { text: 'இப்போது எதையும் கையெழுத்திட வேண்டாம்', subtext: 'உங்கள் சட்ட உரிமைகளை பாதுகாங்கள்' },
      te: { text: 'ఇప్పుడు ఏదీ సైన్ చేయవద్దు', subtext: 'మీ చట్టపరమైన హక్కులను రక్షించుకోండి' },
      bn: { text: 'এখন কোনো কিছুতে স্বাক্ষর করবেন না', subtext: 'আপনার আইনি অধিকার রক্ষা করুন' },
      mr: { text: 'आत्ता कोणत्याही गोष्टीवर सही करू नका', subtext: 'तुमचे कायदेशीर हक्क जपा' },
      gu: { text: 'હવે કોઈ પણ વસ્તુ પર સહી ન કરો', subtext: 'તમારા કાનૂની અધિકારોની રક્ષા કરો' },
    },
  },
  {
    text: "Note the contractor's vehicle number",
    subtext: 'Additional identifying information',
    t: {
      hi: { text: 'ठेकेदार की गाड़ी का नंबर नोट करें', subtext: 'पहचान के लिए जरूरी जानकारी' },
      kn: { text: 'ಗುತ್ತಿಗೆದಾರರ ವಾಹನ ಸಂಖ್ಯೆ ನೋಂದಿಸಿ', subtext: 'ಹೆಚ್ಚುವರಿ ಗುರುತಿನ ಮಾಹಿತಿ' },
      ta: { text: 'ஒப்பந்தகாரரின் வாகன எண்ணை குறிப்பிடுங்கள்', subtext: 'கூடுதல் அடையாள தகவல்' },
      te: { text: 'కాంట్రాక్టర్ వాహన నంబర్ నోట్ చేయండి', subtext: 'అదనపు గుర్తింపు సమాచారం' },
      bn: { text: 'ঠিকাদারের গাড়ির নম্বর লিখে রাখুন', subtext: 'অতিরিক্ত পরিচয় তথ্য' },
      mr: { text: 'कंत्राटदाराचा वाहन क्रमांक नोंदवा', subtext: 'अतिरिक्त ओळख माहिती' },
      gu: { text: 'કોન્ટ્રાક્ટરનો વાહન નંબર નોંધો', subtext: 'વધારાની ઓળખ માહિતી' },
    },
  },
];

function useTTS() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const supported = 'speechSynthesis' in window;
  const speak = (id: string, text: string, bcp47: string) => {
    window.speechSynthesis.cancel();
    if (playingId === id) { setPlayingId(null); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp47; u.rate = 0.85;
    u.onstart = () => setPlayingId(id);
    u.onend = () => setPlayingId(null);
    u.onerror = () => setPlayingId(null);
    setTimeout(() => window.speechSynthesis.speak(u), 50);
  };
  return { speak, isPlaying: (id: string) => playingId === id, supported };
}

export default function EvidenceScreen({ onBack, onContinue, checklist, languageCode }: EvidenceScreenProps) {
  const tts = useTTS();
  const autoKey = languageCode ? getLangKey(languageCode) : null;
  const [displayLang, setDisplayLang] = useState<string>(autoKey ?? 'en');

  const items = checklist
    ? checklist.map((text, i) => ({ id: i, text, subtext: '', t: {} as Record<string, { text: string; subtext: string }> }))
    : DEFAULT_CHECKLIST.map((item, i) => ({ id: i, text: item.text, subtext: item.subtext, t: item.t }));

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const canContinue = checked.size === items.length;

  const getText = (item: typeof items[0]) => {
    if (displayLang === 'en') return { text: item.text, subtext: item.subtext };
    return item.t[displayLang] ?? { text: item.text, subtext: item.subtext };
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center px-4 py-4">
          <button onClick={onBack} className="p-2 hover:bg-[#1E293B] rounded-lg transition-all active:scale-95">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-white">Evidence Checklist</h1>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Warning */}
        <div className="bg-gradient-to-r from-[#F97316] to-[#F59E0B] rounded-2xl p-5 mb-4 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-7 h-7 text-white flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <h2 className="text-xl font-bold text-white">DO THESE THINGS RIGHT NOW</h2>
              <p className="text-white/90 text-sm mt-0.5">Evidence disappears in hours. Tap each item when done.</p>
            </div>
          </div>
        </div>

        {/* Language bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-white text-sm font-semibold">Read in:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setDisplayLang('en')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${displayLang === 'en' ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-300 border border-gray-700'}`}>
              English
            </button>
            {Object.entries(LANG_META).map(([key, meta]) => (
              <button key={key} onClick={() => setDisplayLang(key)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${displayLang === key ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-300 border border-gray-700'}`}>
                {meta.native}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-400 text-sm shrink-0">{checked.size}/{items.length}</span>
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-2 bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: items.length ? `${(checked.size / items.length) * 100}%` : '0%' }} />
          </div>
          {canContinue && <Check className="w-4 h-4 text-[#22C55E] shrink-0" />}
        </div>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {items.map(item => {
            const isChecked = checked.has(item.id);
            const { text, subtext } = getText(item);
            const bcp47 = displayLang !== 'en' ? (LANG_META[displayLang]?.bcp47 ?? 'en-IN') : 'en-IN';
            const ttsId = `ev-${item.id}-${displayLang}`;
            return (
              <div key={item.id} className={`rounded-xl border-2 transition-all ${isChecked ? 'bg-[#22C55E]/10 border-[#22C55E]' : 'bg-[#1E293B] border-gray-700'}`}>
                <div className="flex items-start gap-3 p-4">
                  <button onClick={() => toggle(item.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${isChecked ? 'bg-[#22C55E]' : 'bg-gray-700 border-2 border-gray-600'}`}>
                    {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                  <button onClick={() => toggle(item.id)} className="flex-1 text-left">
                    <div className={`font-semibold text-sm mb-0.5 ${isChecked ? 'text-[#22C55E]' : 'text-white'}`}>{text}</div>
                    {subtext && <div className="text-xs text-gray-400">{subtext}</div>}
                  </button>
                  {tts.supported && (
                    <button onClick={() => tts.speak(ttsId, text + (subtext ? '. ' + subtext : ''), bcp47)}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${tts.isPlaying(ttsId) ? 'bg-red-500/20 border border-red-500/40' : 'bg-[#F59E0B]/10 border border-[#F59E0B]/20'}`}>
                      <Volume2 className={`w-3.5 h-3.5 ${tts.isPlaying(ttsId) ? 'text-red-400' : 'text-[#F59E0B]'}`} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onContinue} disabled={!canContinue}
          className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all active:scale-95 ${canContinue ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-lg shadow-[#22C55E]/30' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
          <span className="flex items-center justify-center gap-2">
            <Check className="w-6 h-6" /> I have done this — Continue
          </span>
        </button>
        <button onClick={onContinue} className="w-full mt-3 py-3 text-gray-400 hover:text-white text-sm transition-colors">
          Skip for now
        </button>
      </div>
    </div>
  );
}