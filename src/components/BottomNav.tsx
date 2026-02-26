import { Home, Mic, FileText, HelpCircle } from 'lucide-react';

type NavScreen = 'home' | 'record' | 'case' | 'help';

interface BottomNavProps {
  activeScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
}

const NAV_ITEMS: { id: NavScreen; label: string; icon: React.FC<any> }[] = [
  { id: 'home',   label: 'Home',    icon: Home },
  { id: 'record', label: 'Record',  icon: Mic },
  { id: 'case',   label: 'My Case', icon: FileText },
  { id: 'help',   label: 'Help',    icon: HelpCircle },
];

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeScreen === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all active:scale-90 min-w-[60px]"
            >
              <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-[#F59E0B]/20' : ''}`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${active ? 'text-[#F59E0B]' : 'text-gray-500'}`}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-[#F59E0B]' : 'text-gray-500'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}