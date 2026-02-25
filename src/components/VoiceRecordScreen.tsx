import { useState } from 'react';
import { ArrowLeft, ChevronDown, Mic, MicOff } from 'lucide-react';

interface VoiceRecordScreenProps {
  selectedLanguage: string;
  onBack: () => void;
  onLanguageChange: (language: string) => void;
  onSubmit: (text: string, isVoice: boolean) => void;
}

const languages = [
  'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
  'Odia', 'Gujarati', 'Marathi', 'Punjabi', 'Rajasthani', 'Bhojpuri'
];

export default function VoiceRecordScreen({
  selectedLanguage,
  onBack,
  onLanguageChange,
  onSubmit
}: VoiceRecordScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleMicClick = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        onSubmit('Sample voice recording', true);
      }, 2000);
    } else {
      setIsRecording(false);
      onSubmit('Sample voice recording', true);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onSubmit(textInput, false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onBack} className="p-2 hover:bg-[#1E293B] rounded-lg tap-scale transition-all">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] tap-scale transition-all"
            >
              <span className="font-medium">{selectedLanguage}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1E293B] rounded-xl shadow-2xl border border-gray-700 max-h-64 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang);
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-[#334155] transition-colors ${
                      lang === selectedLanguage ? 'text-[#F59E0B] font-semibold' : 'text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">बोलिए — अपनी समस्या बताइए</h2>
        <p className="text-gray-400 text-sm">Speak — Tell us your problem</p>
      </div>

      <div className="flex flex-col items-center px-4 mb-8">
        <div className="relative">
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/30 pulse-ring"></div>
              <div className="absolute inset-0 rounded-full bg-red-500/20 pulse-ring" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}
          <button
            onClick={handleMicClick}
            className={`
              relative w-32 h-32 rounded-full flex items-center justify-center transition-all tap-scale
              ${isRecording
                ? 'bg-red-500 recording-pulse shadow-2xl shadow-red-500/50'
                : 'bg-[#F59E0B] hover:bg-[#D97706] shadow-xl shadow-[#F59E0B]/30'
              }
            `}
          >
            {isRecording ? (
              <MicOff className="w-12 h-12 text-white" strokeWidth={2.5} />
            ) : (
              <Mic className="w-12 h-12 text-white" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <p className="mt-6 text-white font-medium">
          {isRecording ? 'Tap to stop and send' : 'Tap to speak'}
        </p>
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="text-gray-500 text-sm font-semibold">OR TYPE</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-gray-700 p-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your problem here..."
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[120px]"
            rows={5}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="w-full mt-4 bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-xl tap-scale transition-all"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
}
