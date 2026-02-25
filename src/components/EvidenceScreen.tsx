import { useState, useEffect } from 'react';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';

interface EvidenceScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

const checklist = [
  {
    id: 1,
    text: 'Photograph the site signboard',
    subtext: 'Shows contractor name and number'
  },
  {
    id: 2,
    text: 'Screenshot your UPI/bank messages',
    subtext: 'Shows last payment date'
  },
  {
    id: 3,
    text: 'Get 1 coworker to voice-note what they witnessed',
    subtext: 'Important witness evidence'
  },
  {
    id: 4,
    text: 'Do NOT sign anything they give you right now',
    subtext: 'Protect your rights'
  },
  {
    id: 5,
    text: "Note contractor's vehicle number",
    subtext: 'Additional identifying information'
  }
];

export default function EvidenceScreen({ onBack, onContinue }: EvidenceScreenProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(checkedItems.size === checklist.length);
  }, [checkedItems]);

  const toggleItem = (id: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="flex items-center px-4 py-4">
          <button onClick={onBack} className="p-2 hover:bg-[#1E293B] rounded-lg tap-scale transition-all">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-white">Evidence Checklist</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-gradient-to-r from-[#F97316] to-[#F59E0B] rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-8 h-8 text-white flex-shrink-0 mt-1" strokeWidth={2.5} />
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">DO THESE THINGS RIGHT NOW</h2>
              <p className="text-white/90 text-sm">Evidence disappears in hours</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 mb-6 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">Your situation:</div>
          <div className="text-white font-semibold text-lg">Wage theft</div>
          <div className="text-gray-400 text-sm mt-1">By: Contractor / Construction site</div>
        </div>

        <div className="space-y-3 mb-6">
          {checklist.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all tap-scale
                  ${isChecked
                    ? 'bg-[#22C55E]/10 border-[#22C55E]'
                    : 'bg-[#1E293B] border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                    ${isChecked ? 'bg-[#22C55E]' : 'bg-gray-700 border-2 border-gray-600'}
                  `}>
                    {isChecked && (
                      <Check className="w-4 h-4 text-white check-pop" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold mb-1 ${isChecked ? 'text-[#22C55E]' : 'text-white'}`}>
                      {item.text}
                    </div>
                    <div className="text-sm text-gray-400">{item.subtext}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`
            w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all tap-scale
            ${canContinue
              ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-lg shadow-[#22C55E]/30'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <Check className="w-6 h-6" />
            I have done this — Continue
          </span>
        </button>

        <button
          onClick={onContinue}
          className="w-full mt-3 py-3 text-gray-400 hover:text-white text-sm transition-colors tap-scale"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
