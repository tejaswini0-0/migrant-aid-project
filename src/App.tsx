import { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen';
import VoiceRecordScreen from './components/VoiceRecordScreen';
import LoadingScreen from './components/LoadingScreen';
import EvidenceScreen from './components/EvidenceScreen';
import RightsScreen from './components/RightsScreen';
import BottomNav from './components/BottomNav';

type Screen = 'landing' | 'record' | 'loading' | 'evidence' | 'rights';
type NavScreen = 'home' | 'record' | 'case' | 'help';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [activeNavItem, setActiveNavItem] = useState<NavScreen>('home');

  useEffect(() => {
    const saved = localStorage.getItem('awaaz-language');
    if (saved) {
      setSelectedLanguage(saved);
    }
  }, []);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('awaaz-language', language);
  };

  const handleRecordClick = () => {
    if (!selectedLanguage) {
      alert('Please select a language first');
      return;
    }
    setCurrentScreen('record');
    setActiveNavItem('record');
  };

  const handleSubmit = () => {
    setCurrentScreen('loading');
    setTimeout(() => {
      setCurrentScreen('evidence');
    }, 2000);
  };

  const handleEvidenceContinue = () => {
    setCurrentScreen('rights');
    setActiveNavItem('case');
  };

  const handleNavigation = (screen: NavScreen) => {
    setActiveNavItem(screen);
    switch (screen) {
      case 'home':
        setCurrentScreen('landing');
        break;
      case 'record':
        if (selectedLanguage) {
          setCurrentScreen('record');
        } else {
          alert('Please select a language first');
        }
        break;
      case 'case':
        setCurrentScreen('rights');
        break;
      case 'help':
        alert('Help section coming soon!');
        break;
    }
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'record':
        setCurrentScreen('landing');
        setActiveNavItem('home');
        break;
      case 'evidence':
        setCurrentScreen('record');
        setActiveNavItem('record');
        break;
      case 'rights':
        setCurrentScreen('evidence');
        break;
      default:
        setCurrentScreen('landing');
        setActiveNavItem('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {currentScreen === 'landing' && (
        <LandingScreen
          onLanguageSelect={handleLanguageSelect}
          onRecordClick={handleRecordClick}
          selectedLanguage={selectedLanguage}
        />
      )}

      {currentScreen === 'record' && selectedLanguage && (
        <VoiceRecordScreen
          selectedLanguage={selectedLanguage}
          onBack={handleBack}
          onLanguageChange={handleLanguageSelect}
          onSubmit={handleSubmit}
        />
      )}

      {currentScreen === 'loading' && <LoadingScreen />}

      {currentScreen === 'evidence' && (
        <EvidenceScreen
          onBack={handleBack}
          onContinue={handleEvidenceContinue}
        />
      )}

      {currentScreen === 'rights' && (
        <RightsScreen onBack={handleBack} />
      )}

      {currentScreen !== 'loading' && (
        <BottomNav
          activeScreen={activeNavItem}
          onNavigate={handleNavigation}
        />
      )}
    </div>
  );
}

export default App;
