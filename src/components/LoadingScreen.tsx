import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4">
      <Loader2 className="w-16 h-16 text-[#F59E0B] animate-spin mb-6" strokeWidth={2.5} />
      <h2 className="text-2xl font-bold text-white mb-2">Analysing your situation...</h2>
      <p className="text-gray-400 text-center max-w-sm">
        Processing your information and finding relevant laws and rights
      </p>
    </div>
  );
}
