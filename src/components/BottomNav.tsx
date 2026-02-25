import { Home, Mic, FileText, HelpCircle } from 'lucide-react';

interface BottomNavProps {
  activeScreen: 'home' | 'record' | 'case' | 'help';
  onNavigate: (screen: 'home' | 'record' | 'case' | 'help') => void;
}

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'record' as const, icon: Mic, label: 'Record' },
    { id: 'case' as const, icon: FileText, label: 'My Case' },
    { id: 'help' as const, icon: HelpCircle, label: 'Help' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-gray-800 safe-area-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl tap-scale transition-all min-w-[60px]
                ${isActive ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'text-gray-400 hover:text-white'}
              `}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
