import { Scale, Mic, Lock, Phone, ChevronRight } from 'lucide-react';

interface LandingScreenProps {
  onLanguageSelect: (language: string) => void;
  onRecordClick: () => void;
  selectedLanguage: string | null;
}

const languages = [
  { name: 'Hindi', native: 'हिंदी', bcp47: 'hi-IN' },
  { name: 'Bengali', native: 'বাংলা', bcp47: 'bn-IN' },
  { name: 'Tamil', native: 'தமிழ்', bcp47: 'ta-IN' },
  { name: 'Telugu', native: 'తెలుగు', bcp47: 'te-IN' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { name: 'Malayalam', native: 'മലയാളം', bcp47: 'ml-IN' },
  { name: 'Odia', native: 'ଓଡ଼ିଆ', bcp47: 'or-IN' },
  { name: 'Gujarati', native: 'ગુજરાતી', bcp47: 'gu-IN' },
  { name: 'Marathi', native: 'मराठी', bcp47: 'mr-IN' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  { name: 'Rajasthani', native: 'राजस्थानी', bcp47: 'hi-IN' },
  { name: 'Bhojpuri', native: 'भोजपुरी', bcp47: 'hi-IN' },
];

export { languages };

export default function LandingScreen({ onLanguageSelect, onRecordClick, selectedLanguage }: LandingScreenProps) {
  const selected = languages.find(l => l.name === selectedLanguage);

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      {/* Header */}
      <div className="px-4 pt-10 pb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Scale className="w-9 h-9 text-[#F59E0B]" strokeWidth={2} />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            AWAAZ <span className="text-[#F59E0B]">XYZ</span>
          </h1>
          <span className="px-2 py-0.5 text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 rounded-full border border-[#F59E0B]/30 self-start mt-1">
            BETA
          </span>
        </div>
        <p className="text-gray-400 text-sm">Voice Legal Aid for Workers</p>
      </div>

      {/* Hero CTA */}
      <div className="px-4 mb-6">
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-gray-700/50 mb-4">
          <p className="text-white text-xl font-bold mb-1">Something wrong happened?</p>
          <p className="text-gray-400 text-sm mb-4">We can help. Right now. Free. Private.</p>
          <button
            onClick={onRecordClick}
            disabled={!selectedLanguage}
            className={`
              w-full font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3
              shadow-lg tap-scale transition-all text-lg
              ${selectedLanguage
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-[#F59E0B]/20 cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Mic className="w-6 h-6" />
            <span>SPEAK YOUR PROBLEM</span>
            {selectedLanguage && <ChevronRight className="w-5 h-5 ml-auto" />}
          </button>
          {!selectedLanguage && (
            <p className="text-[#F59E0B] text-xs text-center mt-2">
              ↓ Select your language first
            </p>
          )}
        </div>
      </div>

      {/* Language Selection */}
      <div className="px-4 mb-6">
        <h2 className="text-white font-semibold text-base mb-1">
          भाषा चुनें / Select Language
        </h2>
        {selected && (
          <p className="text-[#F59E0B] text-xs mb-3">
            ✓ Selected: {selected.name} ({selected.native}) — Speech code: {selected.bcp47}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2.5">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => onLanguageSelect(lang.name)}
              className={`
                py-3 px-2 rounded-xl font-medium transition-all tap-scale text-center
                ${selectedLanguage === lang.name
                  ? 'bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/30 border border-[#F59E0B]'
                  : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155] border border-gray-700'
                }
              `}
            >
              <div className="text-xs font-semibold">{lang.name}</div>
              <div className="text-xs mt-0.5 opacity-80">{lang.native}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>No account needed. Conversations are private.</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
          <Phone className="w-3.5 h-3.5" />
          <span>No smartphone? Call toll-free: <span className="text-[#F59E0B] font-semibold">1800-XXX-XXXX</span></span>
        </div>
      </div>
    </div>
  );
}