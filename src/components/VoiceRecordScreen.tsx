import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ChevronDown, Mic, MicOff, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { LANG_META, LANG_CODE_MAP } from './Languages';

export interface SubmissionPayload {
  transcript: string;
  inputMethod: 'voice' | 'text';
  language: string;
  languageCode: string;
  audioBlob?: Blob;
  audioDurationMs?: number;
  confidence?: number;
  timestamp: string;
}

interface VoiceRecordScreenProps {
  selectedLanguage: string;
  onBack: () => void;
  onLanguageChange: (language: string) => void;
  onSubmit: (payload: SubmissionPayload) => void;
}

const LANGUAGES = [
  { name: 'Hindi',      native: 'हिंदी',      bcp47: 'hi-IN', instruction: 'बोलिए — अपनी समस्या बताइए' },
  { name: 'Bengali',    native: 'বাংলা',      bcp47: 'bn-IN', instruction: 'বলুন — আপনার সমস্যা বলুন' },
  { name: 'Tamil',      native: 'தமிழ்',      bcp47: 'ta-IN', instruction: 'பேசுங்கள் — உங்கள் பிரச்சினையை சொல்லுங்கள்' },
  { name: 'Telugu',     native: 'తెలుగు',     bcp47: 'te-IN', instruction: 'మాట్లాడండి — మీ సమస్య చెప్పండి' },
  { name: 'Kannada',    native: 'ಕನ್ನಡ',     bcp47: 'kn-IN', instruction: 'ಮಾತನಾಡಿ — ನಿಮ್ಮ ಸಮಸ್ಯೆ ಹೇಳಿ' },
  { name: 'Malayalam',  native: 'മലയാളം',    bcp47: 'ml-IN', instruction: 'സംസാരിക്കൂ — നിങ്ങളുടെ പ്രശ്നം പറയൂ' },
  { name: 'Odia',       native: 'ଓଡ଼ିଆ',      bcp47: 'or-IN', instruction: 'କୁହନ୍ତୁ — ଆପଣଙ୍କ ସମସ୍ୟା କୁହନ୍ତୁ' },
  { name: 'Gujarati',   native: 'ગુજરાતી',   bcp47: 'gu-IN', instruction: 'બોલો — તમારી સમસ્યા કહો' },
  { name: 'Marathi',    native: 'मराठी',      bcp47: 'mr-IN', instruction: 'बोला — तुमची समस्या सांगा' },
  { name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',   bcp47: 'pa-IN', instruction: 'ਬੋਲੋ — ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ' },
  { name: 'Rajasthani', native: 'राजस्थानी', bcp47: 'hi-IN', instruction: 'बोलो — आपकी समस्या बताओ' },
  { name: 'Bhojpuri',   native: 'भोजपुरी',   bcp47: 'hi-IN', instruction: 'बोलीं — आपन समस्या बताईं' },
];

function getSpeechRecognition(): (new () => any) | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}

export default function VoiceRecordScreen({ selectedLanguage, onBack, onLanguageChange, onSubmit }: VoiceRecordScreenProps) {
  const langConfig = LANGUAGES.find(l => l.name === selectedLanguage) ?? LANGUAGES[0];

  const [isRecording, setIsRecording] = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [confidence, setConfidence] = useState<number | undefined>();
  const [recordingMs, setRecordingMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>();
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Ref accumulates transcript across speech segments — fixes "resets on pause" bug
  const accumulatedRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    if (!getSpeechRecognition()) { setSpeechSupported(false); setActiveTab('text'); }
  }, []);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      const t0 = Date.now() - recordingMs;
      timerRef.current = setInterval(() => setRecordingMs(Date.now() - t0), 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setInterimText('');
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} recognitionRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setSpeechError(null);
    accumulatedRef.current = '';
    setDisplayTranscript('');
    setInterimText('');
    setAudioBlob(undefined);
    setRecordingMs(0);
    setConfidence(undefined);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' }));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
    } catch { /* mic unavailable */ }

    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = langConfig.bcp47;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alt = result[0];
        if (result.isFinal) {
          accumulatedRef.current += alt.transcript + ' ';
          setDisplayTranscript(accumulatedRef.current);
          if (alt.confidence) setConfidence(alt.confidence);
        } else {
          interim += alt.transcript;
        }
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (event.error === 'not-allowed') {
        setSpeechError('Microphone permission denied. Please allow mic access or use the text box below.');
      } else {
        setSpeechError(`Speech error (${event.error}). Please type your problem instead.`);
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current) { try { recognition.start(); } catch {} }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    isRecordingRef.current = true;
  }, [langConfig.bcp47]);

  const toggleRecording = () => isRecording ? stopRecording() : startRecording();
  useEffect(() => () => stopRecording(), []);

  const hasVoiceContent = displayTranscript.trim().length > 0 || interimText.length > 0;
  const canSubmit = activeTab === 'voice' ? hasVoiceContent : textInput.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting || submitted) return;
    setIsSubmitting(true);

    if (isRecording) {
      stopRecording();
      await new Promise(r => setTimeout(r, 350));
    }

    const transcript = activeTab === 'voice'
      ? (accumulatedRef.current + interimText).trim()
      : textInput.trim();

    const payload: SubmissionPayload = {
      transcript,
      inputMethod: activeTab,
      language: langConfig.name,
      languageCode: langConfig.bcp47,
      audioBlob: activeTab === 'voice' ? audioBlob : undefined,
      audioDurationMs: activeTab === 'voice' ? recordingMs : undefined,
      confidence,
      timestamp: new Date().toISOString(),
    };

    setSubmitted(true);
    // Wait for green tick to show, then hand off — App.tsx drives navigation
    setTimeout(() => onSubmit(payload), 400);
  };

  const handleReset = () => {
    accumulatedRef.current = '';
    setDisplayTranscript('');
    setInterimText('');
    setAudioBlob(undefined);
    setRecordingMs(0);
    setConfidence(undefined);
    setSpeechError(null);
    setSubmitted(false);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-2 hover:bg-[#1E293B] rounded-lg transition-all active:scale-95">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="relative">
            <button onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#334155] transition-all active:scale-95">
              <span className="font-medium text-sm">{langConfig.name}</span>
              <span className="text-gray-400 text-xs">{langConfig.native}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1E293B] rounded-xl shadow-2xl border border-gray-700 max-h-64 overflow-y-auto z-50">
                {LANGUAGES.map(lang => (
                  <button key={lang.name}
                    onClick={() => { onLanguageChange(lang.name); setShowDropdown(false); handleReset(); }}
                    className={`w-full text-left px-4 py-3 flex justify-between items-center hover:bg-[#334155] transition-colors ${lang.name === selectedLanguage ? 'text-[#F59E0B] font-semibold' : 'text-white'}`}>
                    <span>{lang.name}</span>
                    <span className="text-xs text-gray-400">{lang.native}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-2 text-center">
        <p className="text-xl font-bold text-white">{langConfig.instruction}</p>
        <p className="text-gray-400 text-sm mt-1">Speak — describe your problem</p>
      </div>

      {speechSupported && (
        <div className="px-4 mt-4 mb-2">
          <div className="flex bg-[#1E293B] rounded-xl p-1 border border-gray-700">
            {(['voice', 'text'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#F59E0B] text-white' : 'text-gray-400 hover:text-white'}`}>
                {tab === 'voice' ? '🎙 Voice' : '⌨️ Type'}
              </button>
            ))}
          </div>
        </div>
      )}

      {speechError && (
        <div className="mx-4 mt-3 p-3 bg-red-900/30 border border-red-700 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-xs">{speechError}</p>
        </div>
      )}

      {/* VOICE TAB */}
      {activeTab === 'voice' && (
        <div className="px-4 mt-4">
          <div className="flex flex-col items-center mb-5">
            <div className="relative mb-4">
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '1s' }} />
                  <div className="absolute inset-0 scale-125 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '1.5s' }} />
                </>
              )}
              <button onClick={toggleRecording}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all active:scale-95 ${isRecording ? 'bg-red-500 shadow-2xl shadow-red-500/40' : 'bg-[#F59E0B] hover:bg-[#D97706] shadow-xl shadow-[#F59E0B]/30'}`}>
                {isRecording ? <MicOff className="w-10 h-10 text-white" strokeWidth={2.5} /> : <Mic className="w-10 h-10 text-white" strokeWidth={2.5} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {isRecording && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              <p className="text-white font-medium text-sm">
                {isRecording ? `Recording... ${formatDuration(recordingMs)}` : hasVoiceContent ? 'Done — review below' : 'Tap mic and speak'}
              </p>
            </div>
            {confidence !== undefined && !isRecording && (
              <p className="text-gray-500 text-xs mt-1">Recognition: {Math.round(confidence * 100)}% confident</p>
            )}
          </div>

          {(isRecording || hasVoiceContent) && (
            <div className="bg-[#1E293B] rounded-2xl border border-gray-700 p-4 mb-4">
              <p className="text-[#F59E0B] text-xs font-semibold mb-2 uppercase tracking-wide">
                {isRecording ? '● Live Transcript' : 'Your Statement'}
              </p>
              <p className="text-white text-sm leading-relaxed min-h-[60px]">
                {displayTranscript}
                {interimText && <span className="text-gray-400 italic">{interimText}</span>}
                {!displayTranscript && !interimText && isRecording && <span className="text-gray-500 animate-pulse">Listening...</span>}
              </p>
              {!isRecording && hasVoiceContent && (
                <button onClick={handleReset} className="mt-3 text-xs text-gray-400 underline hover:text-white">Clear and re-record</button>
              )}
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="flex-1 h-1 bg-[#F59E0B]/30 rounded-full">
                <div className="h-1 bg-[#F59E0B] rounded-full w-full" />
              </div>
              <span className="text-gray-400 text-xs shrink-0">{formatDuration(recordingMs)} · {(audioBlob.size / 1024).toFixed(0)}KB</span>
            </div>
          )}

          <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting || submitted}
            className={`w-full font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${submitted ? 'bg-green-600 text-white' : canSubmit && !isSubmitting ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg shadow-[#F59E0B]/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
            {submitted ? <><CheckCircle className="w-5 h-5" /> Sent!</>
              : isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Preparing...</>
              : <><Send className="w-5 h-5" /> Submit to AWAAZ AI</>}
          </button>
        </div>
      )}

      {/* TEXT TAB */}
      {activeTab === 'text' && (
        <div className="px-4 mt-4">
          {!speechSupported && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-yellow-300 text-xs">Voice input not supported on this browser. Please type below.</p>
            </div>
          )}
          <div className="bg-[#1E293B] rounded-2xl border border-gray-700 p-4 mb-4">
            <p className="text-gray-400 text-xs mb-2">Describe your problem in detail:</p>
            <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder={`Write in ${langConfig.name} or English...\n\nExample: My contractor hasn't paid me for 3 months.`}
              className="w-full bg-transparent text-white placeholder-gray-600 resize-none outline-none min-h-[160px] text-sm leading-relaxed" rows={7} />
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600 text-xs">{textInput.length} chars</span>
              {textInput.length > 0 && textInput.length < 30 && <span className="text-yellow-500 text-xs">Add more detail for better help</span>}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting || submitted}
            className={`w-full font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${submitted ? 'bg-green-600 text-white' : canSubmit && !isSubmitting ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg shadow-[#F59E0B]/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
            {submitted ? <><CheckCircle className="w-5 h-5" /> Sent!</>
              : isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Preparing...</>
              : <><Send className="w-5 h-5" /> Submit to AWAAZ AI</>}
          </button>
        </div>
      )}
    </div>
  );
}