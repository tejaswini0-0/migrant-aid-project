// Shared language metadata used across RightsScreen, EvidenceScreen, HelpScreen

export const LANG_META: Record<string, { label: string; native: string; bcp47: string }> = {
  hi: { label: 'Hindi',     native: 'हिंदी',      bcp47: 'hi-IN' },
  kn: { label: 'Kannada',   native: 'ಕನ್ನಡ',     bcp47: 'kn-IN' },
  ta: { label: 'Tamil',     native: 'தமிழ்',      bcp47: 'ta-IN' },
  te: { label: 'Telugu',    native: 'తెలుగు',     bcp47: 'te-IN' },
  bn: { label: 'Bengali',   native: 'বাংলা',      bcp47: 'bn-IN' },
  mr: { label: 'Marathi',   native: 'मराठी',      bcp47: 'mr-IN' },
  gu: { label: 'Gujarati',  native: 'ગુજરાતી',   bcp47: 'gu-IN' },
  pa: { label: 'Punjabi',   native: 'ਪੰਜਾਬੀ',   bcp47: 'pa-IN' },
};

export function getLangKey(languageCode: string): string | null {
  const code = languageCode.split('-')[0].toLowerCase();
  return LANG_META[code] ? code : null;
}

export const LANG_CODE_MAP: Record<string, string> = {
  Hindi: 'hi-IN', Bengali: 'bn-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Kannada: 'kn-IN', Malayalam: 'ml-IN', Odia: 'or-IN', Gujarati: 'gu-IN',
  Marathi: 'mr-IN', Punjabi: 'pa-IN', Rajasthani: 'hi-IN', Bhojpuri: 'hi-IN',
};