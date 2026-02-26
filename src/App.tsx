import { useState, useEffect } from 'react';

// ─── All screens inline to avoid import issues ────────────────────────────────
import LandingScreen from './components/LandingScreen';
import VoiceRecordScreen, { type SubmissionPayload } from './components/VoiceRecordScreen';
import LoadingScreen from './components/LoadingScreen';
import EvidenceScreen from './components/EvidenceScreen';
import RightsScreen, { type AnalysisResult } from './components/RightsScreen';
import HelpScreen from './components/HelpScreen';
import BottomNav from './components/BottomNav';

type Screen = 'landing' | 'record' | 'loading' | 'evidence' | 'rights' | 'help';
type NavTab = 'home' | 'record' | 'case' | 'help';

const LANG_CODE_MAP: Record<string, string> = {
  Hindi: 'hi-IN', Bengali: 'bn-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Kannada: 'kn-IN', Malayalam: 'ml-IN', Odia: 'or-IN', Gujarati: 'gu-IN',
  Marathi: 'mr-IN', Punjabi: 'pa-IN', Rajasthani: 'hi-IN', Bhojpuri: 'hi-IN',
};

// ─── Keyword-based incident classifier ───────────────────────────────────────

function buildAnalysis(payload: SubmissionPayload): AnalysisResult {
  const t = payload.transcript.toLowerCase();
  const is = (words: string[]) => words.some(w => t.includes(w));

  const type =
    is(['beat', 'hit', 'assault', 'abuse', 'violence', 'slap', 'मारा', 'पीटा', 'ಹೊಡೆ'])
      ? 'abuse'
    : is(['passport', 'aadhaar', 'document', 'confiscat', 'seized', 'पासपोर्ट', 'ಆಧಾರ್'])
      ? 'document'
    : is(['accident', 'injury', 'unsafe', 'fell', 'safety', 'helmet', 'chemical', 'दुर्घटना'])
      ? 'unsafe'
    : 'wage';

  const date = new Date().toLocaleDateString('en-IN');

  if (type === 'abuse') return {
    incidentType: 'Physical Abuse', incidentColor: '#EF4444',
    language: payload.language, languageCode: payload.languageCode, rawTranscript: payload.transcript,
    laws: [{
      act: 'Indian Penal Code, 1860', section: 'Section 323 & 324',
      summary: 'Voluntarily causing hurt — up to 3 years imprisonment if a weapon was used.',
      detail: 'Any person who voluntarily causes hurt is punishable under IPC 323 (up to 1 year). If a weapon was involved, IPC 324 applies (up to 3 years). You have the right to file an FIR at any police station — they cannot legally refuse to register it.',
      translations: {
        hi: 'जानबूझकर चोट पहुंचाना 1–3 साल जेल का अपराध है। किसी भी पुलिस स्टेशन में एफआईआर दर्ज करें — वे मना नहीं कर सकते।',
        kn: 'ಉದ್ದೇಶಪೂರ್ವಕ ಹಾನಿ 1–3 ವರ್ಷ ಜೈಲು. ಯಾವ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲೂ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಿ.',
        ta: 'வேண்டுமென்றே காயம் 1–3 ஆண்டு சிறை. எந்த காவல் நிலையத்திலும் FIR பதிவு செய்யலாம்.',
        te: 'ఉద్దేశపూర్వకంగా గాయం 1–3 సంవత్సరాల జైలు. ఏ పోలీస్ స్టేషన్‌లోనైనా FIR నమోదు చేయండి.',
        bn: 'ইচ্ছাকৃত আঘাত ১–৩ বছর কারাদণ্ড। যেকোনো থানায় FIR করুন।',
      },
    }],
    complaintDraft: `To,\nThe SHO, [Police Station], [District]\n\nSubject: FIR for physical assault\n\nI, [Your Name], report that [Attacker Name/Description] physically assaulted me on [Date] at [Location/Worksite].\n\nStatement: "${payload.transcript}"\n\nI have [photographs of injuries / medical report / witness names].\nI request immediate FIR registration under IPC 323/324.\n\n[Your Name] | [Phone] | Date: ${date}`,
    evidenceChecklist: [
      'Photograph all injuries RIGHT NOW before they fade',
      'Go to a government hospital — get a written medical report',
      'Write down names of everyone who witnessed the assault',
      "Note the attacker's name, description, and any vehicle number",
      'Do NOT wash or change clothes — preserve physical evidence',
    ],
    authority: { name: 'Local Police Station', address: 'Nearest police station to incident location', phone: '100', hours: '24 hours, 7 days a week' },
    referToNgo: true,
  };

  if (type === 'document') return {
    incidentType: 'Document Confiscation', incidentColor: '#8B5CF6',
    language: payload.language, languageCode: payload.languageCode, rawTranscript: payload.transcript,
    laws: [{
      act: 'Bonded Labour System (Abolition) Act, 1976', section: 'Sections 16–19',
      summary: 'Seizing documents to prevent a worker from leaving is bonded labour — a non-bailable criminal offence.',
      detail: 'Confiscating identity documents (Aadhaar, passport, etc.) to control a worker or prevent them from leaving is bonded labour under this Act. It is a cognisable, non-bailable criminal offence. The District Magistrate has special powers to intervene immediately and release the worker.',
      translations: {
        hi: 'दस्तावेज़ जब्त करके रोकना बंधुआ मजदूरी है — जघन्य, जमानत-रहित अपराध। जिलाधिकारी तुरंत कार्रवाई कर सकते हैं।',
        kn: 'ದಾಖಲೆ ವಶಪಡಿಸಿ ನಿರ್ಬಂಧಿಸುವುದು ಬಂಧಿತ ಕಾರ್ಮಿಕ — ಜಾಮೀನು ರಹಿತ ಗಂಭೀರ ಅಪರಾಧ.',
        ta: 'ஆவணங்களை பறித்து தடுப்பது அடிமை தொழில் — ஜாமீனில்லா கடுமையான குற்றம்.',
        te: 'పత్రాలు తీసుకుని నిర్బంధించడం బంధిత కార్మికం — జామీను లేని తీవ్రమైన నేరం.',
        bn: 'কাগজপত্র বাজেয়াপ্ত করে আটকানো বন্ধুয়া শ্রম — জামিনযোগ্য নয় এমন গুরুতর অপরাধ।',
      },
    }],
    complaintDraft: `To,\nThe District Magistrate, [District]\n\nSubject: Illegal confiscation of identity documents / bonded labour\n\nI, [Your Name], report that [Employer/Contractor Name] has illegally confiscated my [Aadhaar / Passport / specify] on [Date].\n\nStatement: "${payload.transcript}"\n\nThis violates the Bonded Labour System (Abolition) Act, 1976. I request immediate action and recovery of my documents.\n\n[Your Name] | [Phone] | Date: ${date}`,
    evidenceChecklist: [
      'Note the exact date and person who took your documents',
      "Demand a written receipt — say 'मुझे रसीद दो' / 'Give me a receipt'",
      'Note full names of all witnesses present',
      'File an FIR at the police station immediately',
      'Call the Labour helpline: 1800-11-2229',
    ],
    authority: { name: 'District Magistrate Office', address: '[District Collectorate], [District]', phone: '1800-11-2229', hours: 'Monday – Friday, 10am – 5pm' },
    referToNgo: true,
  };

  if (type === 'unsafe') return {
    incidentType: 'Unsafe Working Conditions', incidentColor: '#F97316',
    language: payload.language, languageCode: payload.languageCode, rawTranscript: payload.transcript,
    laws: [{
      act: 'BOCW Act, 1996', section: 'Sections 32–40',
      summary: 'Employer must provide free safety equipment, training, and a safe worksite at all times.',
      detail: 'Every construction employer must provide helmets, safety harnesses, safe scaffolding, first aid, and safety training at no cost to workers. Failure is punishable with fines and imprisonment. If you were injured, you are entitled to compensation under the Employees\' Compensation Act, 1923.',
      translations: {
        hi: 'हर निर्माण नियोक्ता को हेलमेट, सुरक्षा उपकरण और प्राथमिक चिकित्सा मुफ्त देने होंगे। उल्लंघन पर जेल और जुर्माना।',
        kn: 'ಪ್ರತಿ ನಿರ್ಮಾಣ ಉದ್ಯೋಗದಾತ ಹೆಲ್ಮೆಟ್, ಸುರಕ್ಷತಾ ಸಾಧನ, ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ ಉಚಿತ ನೀಡಬೇಕು.',
        ta: 'கட்டுமான முதலாளி தலைக்கவசம், பாதுகாப்பு உபகரணம், முதல் உதவி இலவசமாக வழங்க வேண்டும்.',
        te: 'నిర్మాణ యజమాని హెల్మెట్, భద్రతా పరికరాలు, ప్రథమ చికిత్స ఉచితంగా ఇవ్వాలి.',
        bn: 'নির্মাণ নিয়োগকর্তা হেলমেট, নিরাপত্তা সরঞ্জাম, প্রাথমিক চিকিৎসা বিনামূল্যে দিতে বাধ্য।',
      },
    }],
    complaintDraft: `To,\nThe Labour / Factory Inspector, [District]\n\nSubject: Complaint of unsafe working conditions\n\nI, [Your Name], employed at [Site Name], report the following dangerous conditions:\n\nStatement: "${payload.transcript}"\n\nI request an immediate site inspection under the BOCW Act, 1996 and Factories Act, 1948.\n\n[Your Name] | [Phone] | Date: ${date}`,
    evidenceChecklist: [
      'Photograph the unsafe area or equipment RIGHT NOW',
      'Note exact location, date, and time of the hazard',
      'Get names of at least 2 coworkers who can confirm this',
      'If injured: go to government hospital, get written medical report',
      'Do NOT let the employer alter or clean up the accident site',
    ],
    authority: { name: 'Labour / Factory Inspector Office', address: '[District Labour Office], [District]', phone: '1800-11-2229', hours: 'Monday – Saturday, 10am – 5pm' },
    referToNgo: false,
  };

  // Default: wage theft
  return {
    incidentType: 'Wage Theft', incidentColor: '#F59E0B',
    language: payload.language, languageCode: payload.languageCode, rawTranscript: payload.transcript,
    laws: [
      {
        act: 'Payment of Wages Act, 1936', section: 'Section 15',
        summary: 'Right to claim all unpaid wages. Employer must pay a penalty of up to 10× the delayed amount.',
        detail: 'If wages are not paid by the 7th or 10th of the following month, the employer is liable to pay 10× the delayed wages as compensation. You can file a free claim before the Labour Commissioner — no lawyer is needed and there is no filing fee.',
        translations: {
          hi: 'मजदूरी समय पर न देने पर नियोक्ता को 10 गुना जुर्माना देना होगा। श्रम आयुक्त के पास निःशुल्क दावा करें — वकील की जरूरत नहीं।',
          kn: 'ವೇತನ ಸಮಯಕ್ಕೆ ಪಾವತಿಸದಿದ್ದರೆ ಉದ್ಯೋಗದಾತ 10 ಪಟ್ಟು ಪರಿಹಾರ ನೀಡಬೇಕು. ಕಾರ್ಮಿಕ ಆಯುಕ್ತರ ಬಳಿ ಉಚಿತ ದಾವೆ ಸಲ್ಲಿಸಿ.',
          ta: 'ஊதியம் தாமதமாக தந்தால் 10 மடங்கு அபராதம். தொழிலாளர் ஆணையரிடம் இலவசமாக மனு தாக்கல் செய்யுங்கள்.',
          te: 'వేతనం ఆలస్యంగా చెల్లిస్తే 10 రెట్లు జరిమానా. కార్మిక కమిషనర్ వద్ద ఉచితంగా దావా వేయండి.',
          bn: 'মজুরি দেরিতে দিলে ১০ গুণ জরিমানা। শ্রম কমিশনারের কাছে বিনামূল্যে অভিযোগ করুন।',
          mr: 'मजुरी उशिरा दिल्यास 10 पट दंड. कामगार आयुक्ताकडे मोफत तक्रार करा.',
          gu: 'મોડા વેતન માટે 10 ગણો દંડ. મજૂર કમિશ્નર પાસે મફત ફરિયાદ કરો.',
        },
      },
      {
        act: 'Contract Labour (Regulation & Abolition) Act, 1970', section: 'Section 21',
        summary: 'Principal employer (site owner) is directly liable if contractor fails to pay wages.',
        detail: 'If a contractor fails to pay wages, the principal employer who hired the contractor is legally bound to pay the workers directly. You can approach the site owner or company directly — they cannot refuse.',
        translations: {
          hi: 'ठेकेदार न दे तो साइट मालिक या कंपनी सीधे जिम्मेदार हैं। आप सीधे उनसे मांग कर सकते हैं।',
          kn: 'ಗುತ್ತಿಗೆದಾರ ನೀಡದಿದ್ದರೆ ಮುಖ್ಯ ಉದ್ಯೋಗದಾತ ನೇರ ಜವಾಬ್ದಾರ.',
          ta: 'ஒப்பந்தகாரர் ஊதியம் கொடுக்காவிட்டால் தள உரிமையாளர் நேரடியாக பொறுப்பாவார்.',
          te: 'కాంట్రాక్టర్ చెల్లించకపోతే సైట్ యజమాని నేరుగా బాధ్యుడు.',
          bn: 'ঠিকাদার না দিলে সাইট মালিক সরাসরি দায়বদ্ধ।',
          mr: 'कंत्राटदाराने न दिल्यास साइट मालक थेट जबाबदार.',
          gu: 'ઠેકેદાર ન ચૂકવે તો સાઇટ માલિક સીધો જવાબદાર.',
        },
      },
    ],
    complaintDraft: `To,\nThe Labour Commissioner,\n[District], [State]\n\nSubject: Complaint regarding non-payment / delayed payment of wages\n\nRespected Sir/Madam,\n\nI, [Your Full Name], employed at [Site/Company Name] under contractor [Contractor Name], hereby complain about non-payment of wages.\n\nDetails:\n• Period of non-payment: [Start Date] to [End Date]\n• Agreed daily/monthly wage: ₹[Amount]\n• Total amount owed: ₹[Total]\n• Date of last payment: [Date]\n\nStatement: "${payload.transcript}"\n\nI request immediate action under the Payment of Wages Act, 1936.\n\n[Your Full Name] | [Phone Number] | Date: ${date}`,
    evidenceChecklist: [
      'Photograph the site signboard (shows contractor name + number)',
      'Screenshot UPI/bank messages showing last payment date',
      'Ask 1 coworker to record a voice note about what they witnessed',
      'Do NOT sign any paper the employer gives you right now',
      "Note the contractor's vehicle number plate",
    ],
    authority: { name: 'Labour Commissioner Office', address: '[District HQ], Ground Floor, Room 4', phone: '1800-11-2229', hours: 'Monday – Saturday, 10am – 5pm' },
    referToNgo: payload.transcript.split(' ').length > 60,
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [navTab, setNavTab] = useState<NavTab>('home');
  const [language, setLanguage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('awaaz-language');
    if (saved) setLanguage(saved);
  }, []);

  const selectLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('awaaz-language', lang);
  };

  const handleSubmit = async (payload: SubmissionPayload) => {
    setScreen('loading');
    // Small delay so LoadingScreen renders, then classify and move forward
    await new Promise(r => setTimeout(r, 1600));
    setAnalysis(buildAnalysis(payload));
    setScreen('evidence');
  };

  const handleNav = (tab: NavTab) => {
    setNavTab(tab);
    if (tab === 'home') setScreen('landing');
    else if (tab === 'record' && language) setScreen('record');
    else if (tab === 'case') setScreen('rights');
    else if (tab === 'help') setScreen('help');
  };

  const handleBack = () => {
    if (screen === 'record')   { setScreen('landing');  setNavTab('home'); }
    else if (screen === 'evidence') { setScreen('record'); setNavTab('record'); }
    else if (screen === 'rights')   { setScreen('evidence'); }
    else if (screen === 'help')     { setScreen('landing'); setNavTab('home'); }
    else setScreen('landing');
  };

  const langCode = language ? (LANG_CODE_MAP[language] ?? 'hi-IN') : undefined;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {screen === 'landing' && (
        <LandingScreen
          selectedLanguage={language}
          onLanguageSelect={selectLanguage}
          onRecordClick={() => { if (language) { setScreen('record'); setNavTab('record'); } }}
        />
      )}

      {screen === 'record' && language && (
        <VoiceRecordScreen
          selectedLanguage={language}
          onBack={handleBack}
          onLanguageChange={selectLanguage}
          onSubmit={handleSubmit}
        />
      )}

      {screen === 'loading' && <LoadingScreen />}

      {screen === 'evidence' && (
        <EvidenceScreen
          onBack={handleBack}
          onContinue={() => { setScreen('rights'); setNavTab('case'); }}
          checklist={analysis?.evidenceChecklist}
          languageCode={langCode}
        />
      )}

      {screen === 'rights' && (
        <RightsScreen
          onBack={handleBack}
          analysis={analysis}
        />
      )}

      {screen === 'help' && (
        <HelpScreen
          userLanguage={language ?? undefined}
          languageCode={langCode}
        />
      )}

      {screen !== 'loading' && (
        <BottomNav activeScreen={navTab} onNavigate={handleNav} />
      )}
    </div>
  );
}