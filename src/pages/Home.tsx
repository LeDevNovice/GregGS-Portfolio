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
    let hasShownIntro = false;
    try {
      hasShownIntro = sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
      console.warn('SessionStorage not available:', error);
      hasShownIntro = false;
    }
    
    console.log('🔍 Initial intro state - hasShownIntro:', hasShownIntro);
    
    return {
      showIntro: !hasShownIntro,
      isFirstVisit: !hasShownIntro,
      introCompletedAt: null,
      isAnimationFinalizing: false,
    };
  });

  const startIntroFinalization = useCallback(() => {
    console.log('🎬 Starting intro finalization');
    setIntroState(prev => ({
      ...prev,
      isAnimationFinalizing: true,
    }));
  }, []);

  const completeIntro = useCallback(() => {
    console.log('✅ Completing intro - unmounting overlay');
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      console.log('💾 SessionStorage set successfully');
    } catch (error) {
      console.warn('Could not set sessionStorage:', error);
    }
    
    setIntroState(prev => ({
      ...prev,
      showIntro: false,
      introCompletedAt: Date.now(),
      isAnimationFinalizing: false,
    }));
  }, []);

  const resetIntro = useCallback(() => {
    console.log('🔄 Resetting intro state');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Could not remove from sessionStorage:', error);
    }
    
    setIntroState({
      showIntro: true,
      isFirstVisit: false,
      introCompletedAt: null,
      isAnimationFinalizing: false,
    });
  }, []);

  useEffect(() => {
    console.log('📊 Intro state changed:', introState);
  }, [introState]);

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
    console.log('🎯 Intro finish triggered');
    startIntroFinalization();
    
    setTimeout(() => {
      console.log('⏰ Timeout reached - completing intro');
      completeIntro();
    }, 2000);
  }, [startIntroFinalization, completeIntro]);

  useEffect(() => {
    if (!showIntro && isFirstVisit && !isAnimationFinalizing) {
      console.log('🎉 Intro completed for the first time');
    }
  }, [showIntro, isFirstVisit, isAnimationFinalizing]);

  useEffect(() => {
    console.log('🏠 Home component render - showIntro:', showIntro, 'isFirstVisit:', isFirstVisit);
  });

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