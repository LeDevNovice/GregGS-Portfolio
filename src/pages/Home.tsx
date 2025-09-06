import { useState, useEffect, useCallback } from 'react';

import IntroOverlay from './../components/IntroOverlay/IntroOverlay';
import HomePage from '../components/HomePage/HomePage';
import { HomeProps } from '../types';

interface HomeState {
  showIntro: boolean;
  isFirstVisit: boolean;
  introCompletedAt: number | null;
  isAnimationFinalizing: boolean;
}

interface IntroState extends HomeState {
  startIntroFinalization: () => void;
  completeIntro: () => void;
  resetIntro: () => void;
}

const useIntroState = (): IntroState => {
  const STORAGE_KEY = 'portfolio_intro_shown';
  
  const [introState, setIntroState] = useState<HomeState>(() => {
    const hasShownIntro = sessionStorage.getItem(STORAGE_KEY) === 'true';
    
    return {
      showIntro: !hasShownIntro,
      isFirstVisit: !hasShownIntro,
      introCompletedAt: null,
      isAnimationFinalizing: false,
    };
  });

  const startIntroFinalization = useCallback(() => {
    console.log('Starting intro finalization');
    setIntroState(prev => ({
      ...prev,
      isAnimationFinalizing: true,
    }));
  }, []);

  const completeIntro = useCallback(() => {
    console.log('Completing intro - unmounting overlay');
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIntroState(prev => ({
      ...prev,
      showIntro: false,
      introCompletedAt: Date.now(),
      isAnimationFinalizing: false,
    }));
  }, []);

  const resetIntro = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIntroState({
      showIntro: true,
      isFirstVisit: false,
      introCompletedAt: null,
      isAnimationFinalizing: false,
    });
  }, []);

  return {
    ...introState,
    startIntroFinalization,
    completeIntro,
    resetIntro,
  };
};

const Home: React.FC<HomeProps> = () => {
  const { 
    showIntro, 
    isFirstVisit, 
    isAnimationFinalizing,
    startIntroFinalization,
    completeIntro,
  } = useIntroState();

  const handleIntroFinish = useCallback(() => {
    startIntroFinalization();
    setTimeout(() => {
      console.log('Démontage du composant IntroOverlay');
      completeIntro();
    }, 2000);
  }, [startIntroFinalization, completeIntro]);

  useEffect(() => {
    if (!showIntro && isFirstVisit && !isAnimationFinalizing) {
      console.log('Intro complétée pour la première fois');
    }
  }, [showIntro, isFirstVisit, isAnimationFinalizing]);

  return (
    <>
      <HomePage />
      {showIntro && (
        <div 
          className="intro-overlay-wrapper"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 9999,
            pointerEvents: isAnimationFinalizing ? 'none' : 'auto',
          }}
        >
          <IntroOverlay onFinish={handleIntroFinish} />
        </div>
      )}
    </>
  );
};

export default Home;