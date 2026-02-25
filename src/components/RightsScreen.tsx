import { ArrowLeft, Scale, FileText, Play, Download, Send, MapPin, Phone } from 'lucide-react';

interface RightsScreenProps {
  onBack: () => void;
}

export default function RightsScreen({ onBack }: RightsScreenProps) {
  const handleListen = () => {
    alert('Audio playback would start here');
  };

  const handleDownload = () => {
    alert('PDF download would start here');
  };

  const handleWhatsApp = () => {
    alert('WhatsApp share would open here');
  };

  const handleGetDirections = () => {
    alert('Maps would open here');
  };

  const handleCall = () => {
    window.location.href = 'tel:1800-XXX-XXXX';
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center px-4 py-4">
          <button onClick={onBack} className="p-2 hover:bg-[#1E293B] rounded-lg tap-scale transition-all">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-white">Your Rights & Next Steps</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <section className="bg-[#1E293B] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-7 h-7 text-[#F59E0B]" />
            <h2 className="text-xl font-bold text-white">YOUR RIGHTS</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Law</div>
              <div className="text-white font-semibold text-lg">Payment of Wages Act, 1936</div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Section 15</div>
              <div className="text-white leading-relaxed">
                If your wages are not paid on time, the employer must pay you compensation.
                Delayed wages attract penalty at prescribed rates.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0F172A] p-4 rounded-xl border border-gray-700">
                <div className="text-[#22C55E] font-bold text-2xl mb-1">₹15,000</div>
                <div className="text-gray-400 text-xs">Recoverable Amount</div>
              </div>
              <div className="bg-[#0F172A] p-4 rounded-xl border border-gray-700">
                <div className="text-[#F97316] font-bold text-2xl mb-1">₹5,000</div>
                <div className="text-gray-400 text-xs">Possible Penalty</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1E293B] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-7 h-7 text-[#F59E0B]" />
            <h2 className="text-xl font-bold text-white">YOUR COMPLAINT IS READY</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleListen}
              className="w-full bg-[#0F172A] hover:bg-[#334155] border border-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center gap-3 transition-all tap-scale"
            >
              <Play className="w-5 h-5 text-[#F59E0B]" />
              Listen to complaint
            </button>

            <button
              onClick={handleDownload}
              className="w-full bg-[#0F172A] hover:bg-[#334155] border border-gray-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center gap-3 transition-all tap-scale"
            >
              <Download className="w-5 h-5 text-[#F59E0B]" />
              Download PDF
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-4 px-6 rounded-xl flex items-center gap-3 transition-all tap-scale shadow-lg shadow-[#25D366]/20"
            >
              <Send className="w-5 h-5" />
              Send to WhatsApp
            </button>
          </div>
        </section>

        <section className="bg-[#1E293B] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-7 h-7 text-[#F59E0B]" />
            <h2 className="text-xl font-bold text-white">WHERE TO GO</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Office</div>
              <div className="text-white font-semibold text-lg">Labour Commissioner Office</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">District</div>
                <div className="text-white font-medium">Mumbai Central</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Room</div>
                <div className="text-white font-medium">Room 301</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-1">Hours</div>
              <div className="text-white font-medium">Mon-Fri, 10:00 AM - 5:00 PM</div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-1">Officer Contact</div>
              <div className="text-white font-medium">Mr. Rajesh Kumar - 022-1234-5678</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleGetDirections}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all tap-scale shadow-lg shadow-[#F59E0B]/20"
          >
            <MapPin className="w-5 h-5" />
            GET DIRECTIONS
          </button>

          <button
            onClick={handleCall}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all tap-scale shadow-lg shadow-[#22C55E]/20"
          >
            <Phone className="w-5 h-5" />
            CALL NOW
          </button>
        </div>
      </div>
    </div>
  );
}
