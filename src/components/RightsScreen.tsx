import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, Scale, FileText, Volume2, Download, Send, MapPin,
  Phone, ChevronDown, ChevronUp, Copy, Check, AlertTriangle,
  Globe, BookOpen, Square
} from 'lucide-react';
import { LANG_META, getLangKey } from './Languages';
import { TTSEngine } from './tts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LawEntry {
  act: string;
  section: string;
  summary: string;
  detail: string;
  translations: Record<string, string>; // key = LANG_META key (hi/kn/ta/te/bn/mr/gu/pa)
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

// ─── TTS hook — wraps TTSEngine, triggers re-render on state changes ─────────

function useTTS() {
  const [, forceRender] = useState(0);
  const engineRef = useRef<TTSEngine | null>(null);
  if (!engineRef.current) engineRef.current = new TTSEngine();
  const engine = engineRef.current;

  useEffect(() => {
    const unsub = engine.subscribe(() => forceRender(n => n + 1));
    return () => { unsub(); engine.stop(); };
  }, []);

  return {
    // speak() is async — call without await so it doesn't block event handlers
    speak: (id: string, text: string, bcp47: string) => { engine.speak(id, text, bcp47); },
    stop: () => engine.stop(),
    isPlaying: (id: string) => engine.isPlaying(id),
    anyPlaying: engine.anyPlaying,
    supported: engine.isSupported,
  };
}

// ─── Language selector bar ────────────────────────────────────────────────────

function LangBar({ current, onChange }: { current: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button onClick={() => onChange('en')}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${current === 'en' ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-300 border border-gray-700'}`}>
        English
      </button>
      {Object.entries(LANG_META).map(([key, meta]) => (
        <button key={key} onClick={() => onChange(key)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${current === key ? 'bg-[#F59E0B] text-white' : 'bg-[#1E293B] text-gray-300 border border-gray-700'}`}>
          {meta.native}
        </button>
      ))}
    </div>
  );
}

// ─── Law Card ─────────────────────────────────────────────────────────────────

function LawCard({ law, displayLang, tts, idx }: {
  law: LawEntry;
  displayLang: string;
  tts: ReturnType<typeof useTTS>;
  idx: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isEn = displayLang === 'en';
  const translation = !isEn ? law.translations[displayLang] : null;
  const displayText = translation ?? law.detail;
  // First sentence of translation as summary preview, or English summary
  const summaryDisplay = translation
    ? (translation.split(/[।.!?]/)[0] + '.')
    : law.summary;
  const bcp47 = !isEn ? (LANG_META[displayLang]?.bcp47 ?? 'en-IN') : 'en-IN';
  const ttsId = `law-${idx}-${displayLang}`;

  return (
    <div className="bg-[#0F172A] rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-[#F59E0B] text-xs font-bold uppercase tracking-wide">{law.section}</span>
            <p className="text-white font-semibold text-sm mt-0.5 leading-snug">{law.act}</p>
          </div>
          {tts.supported && (
            <button onClick={() => tts.speak(ttsId, displayText, bcp47)}
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${tts.isPlaying(ttsId) ? 'bg-red-500/20 border border-red-500/50' : 'bg-[#F59E0B]/10 border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20'}`}>
              {tts.isPlaying(ttsId)
                ? <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                : <Volume2 className="w-4 h-4 text-[#F59E0B]" />}
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

      <button onClick={() => setExpanded(e => !e)}
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
                  <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                  Also in English
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

// ─── Fallback law DB used when analysis is null ───────────────────────────────
// Full 8-language translations for every law.

const FALLBACK_LAWS: LawEntry[] = [
  {
    act: 'Payment of Wages Act, 1936',
    section: 'Section 15',
    summary: 'Right to all unpaid wages. Employer fined up to 10× the delayed amount.',
    detail: 'If wages are not paid by the 7th or 10th of the following month, the employer must pay 10× the delayed wages as compensation. File a free claim at the Labour Commissioner — no lawyer needed, no filing fee.',
    translations: {
      hi: 'यदि मजदूरी समय पर नहीं दी गई, तो नियोक्ता को 10 गुना जुर्माना देना होगा। श्रम आयुक्त के पास निःशुल्क दावा दर्ज करें — वकील की कोई जरूरत नहीं।',
      kn: 'ವೇತನ ಸಮಯಕ್ಕೆ ಪಾವತಿಸದಿದ್ದರೆ ಉದ್ಯೋಗದಾತ 10 ಪಟ್ಟು ಪರಿಹಾರ ನೀಡಬೇಕು. ಕಾರ್ಮಿಕ ಆಯುಕ್ತರ ಬಳಿ ಉಚಿತ ದಾವೆ ಸಲ್ಲಿಸಿ — ವಕೀಲ ಬೇಡ.',
      ta: 'ஊதியம் தாமதமானால் 10 மடங்கு அபராதம் கிடைக்கும். தொழிலாளர் ஆணையரிடம் இலவசமாக மனு தாக்கல் செய்யுங்கள் — வழக்கறிஞர் தேவையில்லை.',
      te: 'వేతనం ఆలస్యమైతే 10 రెట్లు జరిమానా. కార్మిక కమిషనర్ వద్ద ఉచితంగా దావా వేయండి — లాయర్ అవసరం లేదు.',
      bn: 'মজুরি দেরি হলে ১০ গুণ জরিমানা পাবেন। শ্রম কমিশনারের কাছে বিনামূল্যে অভিযোগ করুন — আইনজীবী দরকার নেই।',
      mr: 'मजुरी उशिरा दिल्यास 10 पट दंड भरावा लागतो. कामगार आयुक्ताकडे मोफत तक्रार करा — वकील लागत नाही.',
      gu: 'વેતન મોડું ચૂકવ્યું તો 10 ગણો દંડ. મજૂર કમિશ્નર પાસે મફત ફરિયાદ કરો — વકીલ જરૂરી નથી.',
      pa: 'ਤਨਖ਼ਾਹ ਦੇਰ ਨਾਲ ਮਿਲੇ ਤਾਂ 10 ਗੁਣਾ ਜੁਰਮਾਨਾ। ਲੇਬਰ ਕਮਿਸ਼ਨਰ ਕੋਲ ਮੁਫ਼ਤ ਸ਼ਿਕਾਇਤ ਕਰੋ।',
    },
  },
  {
    act: 'Contract Labour (Regulation & Abolition) Act, 1970',
    section: 'Section 21',
    summary: 'Site owner is directly liable if contractor fails to pay wages.',
    detail: 'If a contractor fails to pay wages, the principal employer (company or site owner who hired the contractor) is legally bound to pay workers directly. You can go straight to the site owner — they cannot refuse.',
    translations: {
      hi: 'ठेकेदार न दे तो साइट मालिक या कंपनी सीधे जिम्मेदार है। आप सीधे उनसे मांग सकते हैं।',
      kn: 'ಗುತ್ತಿಗೆದಾರ ವೇತನ ನೀಡದಿದ್ದರೆ ಸೈಟ್ ಮಾಲೀಕ ನೇರ ಜವಾಬ್ದಾರ. ನೀವು ನೇರ ಅವರ ಬಳಿ ಕೇಳಬಹುದು.',
      ta: 'ஒப்பந்தகாரர் ஊதியம் கொடுக்காவிட்டால் தள உரிமையாளர் நேரடியாக பொறுப்பாவார்.',
      te: 'కాంట్రాక్టర్ చెల్లించకపోతే సైట్ యజమాని నేరుగా బాధ్యుడు.',
      bn: 'ঠিকাদার না দিলে সাইট মালিক সরাসরি দায়বদ্ধ।',
      mr: 'कंत्राटदाराने न दिल्यास साइट मालक थेट जबाबदार आहे.',
      gu: 'ઠેકેદાર ન ચૂકવે તો સાઇટ માલિક સીધો જવાબદાર.',
      pa: 'ਠੇਕੇਦਾਰ ਨਾ ਦੇਵੇ ਤਾਂ ਸਾਈਟ ਮਾਲਕ ਸਿੱਧਾ ਜ਼ਿੰਮੇਵਾਰ ਹੈ।',
    },
  },
  {
    act: 'Bonded Labour System (Abolition) Act, 1976',
    section: 'Sections 16–19',
    summary: 'Seizing documents or forcing you to stay is bonded labour — a non-bailable criminal offence.',
    detail: 'Confiscating identity documents (Aadhaar, passport) or using debt or threats to stop a worker from leaving is bonded labour. It is a non-bailable cognisable offence. The District Magistrate has special powers to intervene immediately and release you.',
    translations: {
      hi: 'दस्तावेज जब्त करना या रोकना बंधुआ मजदूरी है — जमानत-रहित जघन्य अपराध। जिलाधिकारी तुरंत कार्रवाई कर सकते हैं।',
      kn: 'ದಾಖಲೆ ವಶಪಡಿಸಿ ನಿರ್ಬಂಧಿಸುವುದು ಬಂಧಿತ ಕಾರ್ಮಿಕ — ಜಾಮೀನು ರಹಿತ ಗಂಭೀರ ಅಪರಾಧ.',
      ta: 'ஆவணங்கள் பறித்து தடுப்பது அடிமை தொழில் — ஜாமீனில்லா கடுமையான குற்றம்.',
      te: 'పత్రాలు తీసుకుని నిర్బంధించడం బంధిత కార్మికం — జామీను లేని తీవ్రమైన నేరం.',
      bn: 'কাগজপত্র বাজেয়াপ্ত করে আটকানো বন্ধুয়া শ্রম — জামিনযোগ্য নয়, গুরুতর অপরাধ।',
      mr: 'कागदपत्रे जप्त करणे म्हणजे बंधपत्री मजुरी — जामीन नसलेला गुन्हा.',
      gu: 'દસ્તાવેજ જપ્ત કરી રોકવું — બંધિત શ્રમ, જામીન વગરનો ગંભીર ગુનો.',
      pa: 'ਦਸਤਾਵੇਜ਼ ਜ਼ਬਤ ਕਰਕੇ ਰੋਕਣਾ ਬੰਧੂਆ ਮਜ਼ਦੂਰੀ ਹੈ — ਗੈਰ-ਜ਼ਮਾਨਤੀ ਗੰਭੀਰ ਅਪਰਾਧ।',
    },
  },
  {
    act: 'Building & Other Construction Workers Act, 1996',
    section: 'Sections 32–40',
    summary: 'Employer must provide free safety equipment, safe scaffolding, and first aid at all times.',
    detail: 'Every construction employer must provide helmets, harnesses, safety boots, safe scaffolding, and first aid — all free of charge. Failure is punishable with fines and imprisonment. If you were injured due to lack of safety equipment, this is the Act you file under.',
    translations: {
      hi: 'हर निर्माण नियोक्ता हेलमेट, हार्नेस, सुरक्षित मचान और प्राथमिक चिकित्सा मुफ्त देने के लिए बाध्य है।',
      kn: 'ಪ್ರತಿ ನಿರ್ಮಾಣ ಉದ್ಯೋಗದಾತ ಹೆಲ್ಮೆಟ್, ಹಾರ್ನೆಸ್, ಸುರಕ್ಷಿತ ಮಚಾನ, ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಉಚಿತ ನೀಡಬೇಕು.',
      ta: 'கட்டுமான முதலாளி தலைக்கவசம், பாதுகாப்பு கட்டுகட்டு, பாதுகாப்பான தளம், முதல் உதவி இலவசமாக வழங்க வேண்டும்.',
      te: 'నిర్మాణ యజమాని హెల్మెట్, హార్నెస్, సురక్షితమైన స్కాఫ్ఫోల్డింగ్, ప్రథమ చికిత్స ఉచితంగా ఇవ్వాలి.',
      bn: 'নির্মাণ নিয়োগকর্তা হেলমেট, হার্নেস, নিরাপদ মাচান ও প্রাথমিক চিকিৎসা বিনামূল্যে দিতে বাধ্য।',
      mr: 'बांधकाम नियोक्त्याने हेल्मेट, हार्नेस, सुरक्षित मचाण आणि प्रथमोपचार मोफत द्यावे.',
      gu: 'નિર્માણ નિયોક્તા હેલ્મેટ, હાર્નેસ, સુરક્ષિત સ્કૅફોલ્ડ, પ્રાથમિક સારવાર મફત આપવી ફરજ.',
      pa: 'ਨਿਰਮਾਣ ਮਾਲਕ ਹੈਲਮੇਟ, ਹਾਰਨੈੱਸ, ਸੁਰੱਖਿਅਤ ਮਚਾਨ ਅਤੇ ਮੁੱਢਲੀ ਸਹਾਇਤਾ ਮੁਫ਼ਤ ਦੇਣਾ ਲਾਜ਼ਮੀ ਹੈ।',
    },
  },
  {
    act: "Employees' Compensation Act, 1923",
    section: 'Section 3',
    summary: 'Right to compensation for any work-related injury — regardless of fault.',
    detail: "If you are injured while doing your job, your employer must pay compensation. The amount depends on your wage, age, and severity of injury. Serious injuries can mean lakhs of rupees. Get a government hospital medical report immediately and file with the Commissioner for Employees' Compensation.",
    translations: {
      hi: 'काम के दौरान चोट लगने पर नियोक्ता मुआवजा देने के लिए बाध्य है — चाहे गलती किसी की भी हो। सरकारी अस्पताल से मेडिकल रिपोर्ट तुरंत लें।',
      kn: 'ಕೆಲಸದ ಸಮಯದಲ್ಲಿ ಗಾಯಗೊಂಡರೆ ಉದ್ಯೋಗದಾತ ಪರಿಹಾರ ನೀಡಬೇಕು — ತಪ್ಪು ಯಾರದ್ದೇ ಇರಲಿ. ಸರಕಾರಿ ಆಸ್ಪತ್ರೆಯ ವರದಿ ತಕ್ಷಣ ಪಡೆಯಿರಿ.',
      ta: 'வேலையில் காயம் ஆனால் முதலாளி இழப்பீடு தர வேண்டும் — யார் தவறு என்று பார்க்கப்படாது. அரசு மருத்துவமனையில் மருத்துவ அறிக்கை எடுங்கள்.',
      te: 'పని సమయంలో గాయమైతే యజమాని నష్టపరిహారం ఇవ్వాలి — తప్పు ఎవరిదైనా. ప్రభుత్వ ఆసుపత్రి వైద్య నివేదిక వెంటనే తీసుకోండి.',
      bn: 'কাজে আঘাত পেলে নিয়োগকর্তা ক্ষতিপূরণ দিতে বাধ্য — যার দোষেই হোক। সরকারি হাসপাতাল থেকে চিকিৎসা রিপোর্ট সঙ্গে সঙ্গে নিন।',
      mr: 'कामावर जखमी झाल्यास नियोक्त्याने भरपाई द्यावी — दोष कुणाचाही असो. सरकारी रुग्णालयाचा वैद्यकीय अहवाल लगेच घ्या.',
      gu: 'કામ દરમ્યાન ઈજા થઈ તો માલિક વળતર આપવા બંધાયેલ — ભૂલ ગમે તેની હોય. સરકારી હૉસ્પિટલ રિપોર્ટ તરત લો.',
      pa: 'ਕੰਮ ਦੌਰਾਨ ਸੱਟ ਲੱਗੇ ਤਾਂ ਮਾਲਕ ਮੁਆਵਜ਼ਾ ਦੇਣ ਲਈ ਮਜਬੂਰ ਹੈ — ਕਿਸੇ ਦੀ ਵੀ ਗਲਤੀ ਹੋਵੇ।',
    },
  },
  {
    act: 'Indian Penal Code, 1860',
    section: 'Sections 323, 324 & 506',
    summary: 'Physical assault carries 1–3 years imprisonment. Criminal threats carry up to 2 years.',
    detail: 'IPC 323 (hurt, up to 1 year), IPC 324 (hurt by weapon, up to 3 years), IPC 506 (criminal intimidation / threats, up to 2 years). You can file an FIR at any police station — they cannot legally refuse. For immediate danger, call 100.',
    translations: {
      hi: 'मारपीट 1–3 साल जेल (IPC 323/324)। धमकी देना 2 साल जेल (IPC 506)। किसी भी पुलिस थाने में FIR दर्ज करें — तत्काल खतरे के लिए 100 पर कॉल करें।',
      kn: 'ಹೊಡೆತ 1–3 ವರ್ಷ ಜೈಲು (IPC 323/324). ಬೆದರಿಕೆ 2 ವರ್ಷ ಜೈಲು (IPC 506). ಯಾವ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲೂ FIR ದಾಖಲಿಸಿ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 100 ಕರೆ ಮಾಡಿ.',
      ta: 'தாக்குதல் 1–3 ஆண்டு சிறை (IPC 323/324). மிரட்டல் 2 ஆண்டு சிறை (IPC 506). எந்த காவல் நிலையத்திலும் FIR பதிவு செய்யலாம். அவசரத்தில் 100 அழையுங்கள்.',
      te: 'దాడి 1–3 సంవత్సరాల జైలు (IPC 323/324). బెదిరింపు 2 సంవత్సరాల జైలు (IPC 506). ఏ పోలీస్ స్టేషన్‌లోనైనా FIR నమోదు చేయండి. అత్యవసరంగా 100 కి కాల్ చేయండి.',
      bn: 'মারধর ১–৩ বছর কারাদণ্ড (IPC 323/324)। হুমকি ২ বছর কারাদণ্ড (IPC 506)। যেকোনো থানায় FIR করুন। জরুরি অবস্থায় ১০০ কল করুন।',
      mr: 'मारहाण 1–3 वर्षे तुरुंगवास (IPC 323/324). धमकी 2 वर्षे (IPC 506). कोणत्याही पोलिस ठाण्यात FIR नोंदवा. तातडीसाठी 100.',
      gu: 'મારઝૂડ 1–3 વર્ષ જેલ (IPC 323/324). ધમકી 2 વર્ષ (IPC 506). ગમે ત્યાં FIR નોંધો. તાત્કાલિક 100 ઉપર ફોન કરો.',
      pa: 'ਕੁੱਟਮਾਰ 1–3 ਸਾਲ ਜੇਲ੍ਹ (IPC 323/324). ਧਮਕੀ 2 ਸਾਲ (IPC 506). ਕਿਸੇ ਵੀ ਥਾਣੇ FIR ਦਰਜ ਕਰੋ। ਐਮਰਜੈਂਸੀ ਲਈ 100.',
    },
  },
  {
    act: 'Minimum Wages Act, 1948',
    section: 'Section 22',
    summary: 'Employer who pays below minimum wage faces up to 5 years imprisonment.',
    detail: "Your employer must pay at least the state-notified minimum wage for your type of work — this applies even if you agreed to a lower wage verbally. If they pay less, file a complaint with the Labour Commissioner. Penalties include fines and up to 5 years' imprisonment.",
    translations: {
      hi: 'राज्य सरकार द्वारा निर्धारित न्यूनतम मजदूरी से कम भुगतान पर 5 साल जेल। मौखिक कम-वेतन समझौता भी अमान्य है।',
      kn: 'ರಾಜ್ಯ ನಿಗದಿತ ಕನಿಷ್ಟ ವೇತನಕ್ಕಿಂತ ಕಡಿಮೆ ಕೊಟ್ಟರೆ 5 ವರ್ಷ ಜೈಲು. ಮೌಖಿಕ ಒಪ್ಪಂದ ಕಾನೂನಿನ ಮೇಲೆ ಮಾನ್ಯವಿಲ್ಲ.',
      ta: 'குறைந்தபட்ச ஊதியத்தை விட குறைவாக கொடுத்தால் 5 ஆண்டு சிறை. வாய்மொழி ஒப்பந்தம் சட்டத்தை மீறாது.',
      te: 'కనీస వేతనం కంటే తక్కువ చెల్లిస్తే 5 సంవత్సరాల జైలు. మాటలో అంగీకరించినా చట్టం కంటే తక్కువ ఇవ్వలేరు.',
      bn: 'ন্যূনতম মজুরির কম দিলে ৫ বছর কারাদণ্ড। মৌখিক চুক্তি আইনের চেয়ে বড় নয়।',
      mr: 'किमान वेतनापेक्षा कमी दिल्यास 5 वर्षे तुरुंगवास. तोंडी करार कायद्याला बदलत नाही.',
      gu: 'ઓછામ વેતન ચૂકવ્યું તો 5 વર્ષ જેલ. મૌખિક સોદો કાયદા કરતા ઉપર નથી.',
      pa: 'ਘੱਟੋ-ਘੱਟ ਤਨਖ਼ਾਹ ਤੋਂ ਘੱਟ ਦੇਣ ਤੇ 5 ਸਾਲ ਜੇਲ੍ਹ। ਜ਼ਬਾਨੀ ਸਮਝੌਤਾ ਕਾਨੂੰਨ ਤੋਂ ਵੱਡਾ ਨਹੀਂ।',
    },
  },
  {
    act: 'Equal Remuneration Act, 1976',
    section: 'Section 4',
    summary: 'Women must be paid the same as men for the same work — by law.',
    detail: 'No employer can pay a woman less than a man for the same or similar work. Violations are punishable with fines and imprisonment. Women workers can file a complaint with the Labour Commissioner for wage discrimination.',
    translations: {
      hi: 'एक जैसे काम के लिए महिलाओं को पुरुषों जितना ही वेतन देना कानूनी बाध्यता है। वेतन-भेद पर श्रम आयुक्त के पास शिकायत करें।',
      kn: 'ಒಂದೇ ಕೆಲಸಕ್ಕೆ ಮಹಿಳೆಯರಿಗೆ ಪುರುಷರಷ್ಟೇ ವೇತನ ಕೊಡಬೇಕು ಎಂಬುದು ಕಾನೂನು. ತಾರತಮ್ಯವಿದ್ದರೆ ಕಾರ್ಮಿಕ ಆಯುಕ್ತರ ಬಳಿ ದೂರು ನೀಡಿ.',
      ta: 'ஒரே வேலைக்கு பெண்களுக்கும் ஆண்களுக்கும் சம ஊதியம் சட்டம். ஊதிய பாகுபாட்டிற்கு தொழிலாளர் ஆணையரிடம் புகார் செய்யுங்கள்.',
      te: 'ఒకే పనికి మహిళలకు పురుషులతో సమానంగా వేతనం ఇవ్వాలని చట్టం. వేతన వివక్ష ఉంటే కార్మిక కమిషనర్ వద్ద ఫిర్యాదు చేయండి.',
      bn: 'একই কাজে নারীদের পুরুষের সমান বেতন দেওয়া আইনি বাধ্যবাধকতা। বেতন বৈষম্য হলে শ্রম কমিশনারের কাছে অভিযোগ করুন।',
      mr: 'समान कामासाठी महिलांना पुरुषांइतकेच वेतन देणे कायद्याने बंधनकारक. वेतन भेदाबद्दल कामगार आयुक्ताकडे तक्रार करा.',
      gu: 'એક જ કામ માટે મહિલાઓને પુરુષ જેટલું વેતન ચૂકવવું ફરજ. વેતન ભેદ ઘટે તો મજૂર કમિશ્નર પાસે ફરિયાદ.',
      pa: 'ਉਹੀ ਕੰਮ ਲਈ ਔਰਤਾਂ ਨੂੰ ਮਰਦਾਂ ਜਿੱਨੀ ਤਨਖ਼ਾਹ ਦੇਣਾ ਕਾਨੂੰਨੀ ਜ਼ਿੰਮੇਵਾਰੀ ਹੈ। ਤਨਖ਼ਾਹ ਵਿਤਕਰੇ ਤੇ ਲੇਬਰ ਕਮਿਸ਼ਨਰ ਕੋਲ ਸ਼ਿਕਾਇਤ ਕਰੋ।',
    },
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function RightsScreen({ onBack, analysis }: RightsScreenProps) {
  const tts = useTTS();
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  const autoLang = analysis ? (getLangKey(analysis.languageCode) ?? 'en') : 'en';
  const [displayLang, setDisplayLang] = useState(autoLang);

  const data: AnalysisResult = analysis ?? {
    incidentType: 'Your Rights Overview', incidentColor: '#F59E0B',
    language: 'English', languageCode: 'en-IN', rawTranscript: '',
    laws: FALLBACK_LAWS,
    complaintDraft: 'To,\nThe Labour Commissioner,\n[District], [State]\n\nSubject: [Describe issue]\n\n[Your Name] | [Phone] | [Date]',
    authority: { name: 'Labour Commissioner Office', address: '[District HQ], Ground Floor', phone: '1800-11-2229', hours: 'Mon–Sat, 10am–5pm' },
    referToNgo: false,
  };

  // Merge analysis laws with FALLBACK_LAWS (show incident-specific first, then general)
  const allLaws: LawEntry[] = analysis
    ? [...data.laws, ...FALLBACK_LAWS.filter(fl => !data.laws.some(dl => dl.section === fl.section))]
    : FALLBACK_LAWS;

  const handleListenAll = () => {
    if (tts.anyPlaying) { tts.stop(); return; }
    const text = allLaws.slice(0, 4).map(l => {
      const t = displayLang !== 'en' ? l.translations[displayLang] : null;
      return t ?? l.summary;
    }).join('. ');
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

      {/* Sticky header */}
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
              {tts.anyPlaying ? <><Square className="w-3 h-3 fill-current" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Listen All</>}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">

        {/* Language switcher — always prominent */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-white text-sm font-semibold">Reading in:</span>
            {displayLang !== 'en' && (
              <span className="text-xs text-gray-400">{LANG_META[displayLang]?.native}</span>
            )}
          </div>
          <LangBar current={displayLang} onChange={setDisplayLang} />
        </div>

        {/* Incident badge */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.incidentColor }} />
          <span className="text-white font-bold">{data.incidentType}</span>
        </div>

        {/* Laws — all of them */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-white font-bold uppercase tracking-wide text-sm">
              Your Rights Under the Law ({allLaws.length} laws)
            </h2>
          </div>
          <div className="space-y-3">
            {allLaws.map((law, i) => (
              <LawCard key={`${i}-${displayLang}`} law={law} displayLang={displayLang} tts={tts} idx={i} />
            ))}
          </div>
        </section>

        {/* Complaint section */}
        {analysis && (
          <section className="bg-[#1E293B] rounded-2xl border border-gray-700 overflow-hidden">
            <button onClick={() => setShowDraft(d => !d)}
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
        )}

        {/* NGO referral */}
        {data.referToNgo && (
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-purple-300 font-semibold text-sm">Complex Case — Free Legal Help Available</p>
              <p className="text-purple-400 text-xs mt-1">Call 1800-11-2229 or ask the Labour Commissioner to refer you to a free lawyer (District Legal Services Authority).</p>
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
              <div><p className="text-gray-400 text-xs">Helpline</p><p className="text-[#F59E0B] font-semibold text-sm">{data.authority.phone}</p></div>
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