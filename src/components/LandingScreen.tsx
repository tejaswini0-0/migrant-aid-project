import { Scale, Mic, Lock, Phone } from 'lucide-react';

interface LandingScreenProps {
  onLanguageSelect: (language: string) => void;
  onRecordClick: () => void;
  selectedLanguage: string | null;
}

const languages = [
  { name: 'Hindi', native: 'हिंदी' },
  { name: 'Bengali', native: 'বাংলা' },
  { name: 'Tamil', native: 'தமிழ்' },
  { name: 'Telugu', native: 'తెలుగు' },
  { name: 'Kannada', native: 'ಕನ್ನಡ' },
  { name: 'Malayalam', native: 'മലയാളം' },
  { name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { name: 'Gujarati', native: 'ગુજરાતી' },
  { name: 'Marathi', native: 'मराठी' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { name: 'Rajasthani', native: 'राजस्थानी' },
  { name: 'Bhojpuri', native: 'भोजपुरी' },
];

export default function LandingScreen({ onLanguageSelect, onRecordClick, selectedLanguage }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Scale className="w-10 h-10 text-[#F59E0B]" strokeWidth={2} />
          <h1 className="text-4xl font-bold text-white">
            AWAAZ <span className="text-[#F59E0B]">आवाज़</span>
          </h1>
          <span className="px-2 py-1 text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/10 rounded-full border border-[#F59E0B]/30">
            BETA
          </span>
        </div>
        <p className="text-center text-gray-400 text-sm">Voice Legal Aid for Workers</p>
      </div>

      <div className="px-4 mb-8">
        <button
          onClick={onRecordClick}
          className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#F59E0B]/20 tap-scale transition-all"
        >
          <Mic className="w-6 h-6" />
          <span className="text-lg">SPEAK YOUR PROBLEM</span>
        </button>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-white font-semibold text-lg mb-4 text-center">Choose Your Language</h2>
        <div className="grid grid-cols-3 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => onLanguageSelect(lang.name)}
              className={`
                py-4 px-2 rounded-xl font-medium transition-all tap-scale
                ${
                  selectedLanguage === lang.name
                    ? 'bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/30'
                    : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155] border border-gray-700'
                }
              `}
            >
              <div className="text-sm">{lang.name}</div>
              <div className="text-xs mt-1 opacity-80">{lang.native}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Lock className="w-4 h-4" />
          <span>No account needed. Private.</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Phone className="w-4 h-4" />
          <span>Call toll-free: <span className="text-[#F59E0B]">1800-XXX-XXXX</span></span>
        </div>
      </div>
    </div>
  );
}
