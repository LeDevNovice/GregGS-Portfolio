import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";

import HomePageBackground from "./HomePageBackground";
import HomePageFooter from "./HomePageFooter";
import HomePageMenu from "./HomePageMenu";
import HomePageSocials from "./HomePageSocials";
import HomePageTitle from "./HomePageTitle";

interface AnimationState {
  startFadeOut: boolean;
  startBgAnimation: boolean;
  animationStartTime: number | null;
}

enum AnimationPhase {
  IDLE = 'idle',
  FADING_OUT = 'fading_out',
  BACKGROUND_ANIMATING = 'background_animating',
  NAVIGATION_READY = 'navigation_ready'
}

const ANIMATION_TIMINGS = {
  BACKGROUND_DELAY: 750,
  NAVIGATION_DELAY: 5000,
  FADE_OUT_DURATION: 1000,
} as const;

interface AnimationSequenceHook {
  animationState: AnimationState;
  currentPhase: AnimationPhase;
  startSequence: () => void;
  resetAnimation: () => void;
}

const useAnimationSequence = (onComplete: () => void): AnimationSequenceHook => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    startFadeOut: false,
    startBgAnimation: false,
    animationStartTime: null,
  });

  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>(
    AnimationPhase.IDLE
  );

  const bgTimerRef = useRef<number | null>(null);
  const navTimerRef = useRef<number | null>(null);

  const startSequence = useCallback((): void => {
    if (currentPhase !== AnimationPhase.IDLE) {
      console.warn('Animation déjà en cours, ignoré');
      return;
    }

    setAnimationState(prev => ({
      ...prev,
      startFadeOut: true,
      animationStartTime: Date.now(),
    }));
    setCurrentPhase(AnimationPhase.FADING_OUT);

    bgTimerRef.current = window.setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        startBgAnimation: true,
      }));
      setCurrentPhase(AnimationPhase.BACKGROUND_ANIMATING);
    }, ANIMATION_TIMINGS.BACKGROUND_DELAY);

    navTimerRef.current = window.setTimeout(() => {
      setCurrentPhase(AnimationPhase.NAVIGATION_READY);
      onComplete();
    }, ANIMATION_TIMINGS.NAVIGATION_DELAY);
  }, [currentPhase, onComplete]);

  const resetAnimation = useCallback((): void => {
    if (bgTimerRef.current !== null) {
      clearTimeout(bgTimerRef.current);
      bgTimerRef.current = null;
    }
    if (navTimerRef.current !== null) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    setAnimationState({
      startFadeOut: false,
      startBgAnimation: false,
      animationStartTime: null,
    });
    setCurrentPhase(AnimationPhase.IDLE);
  }, []);

  useEffect(() => {
    return () => {
      if (bgTimerRef.current !== null) clearTimeout(bgTimerRef.current);
      if (navTimerRef.current !== null) clearTimeout(navTimerRef.current);
    };
  }, []);

  return {
    animationState,
    currentPhase,
    startSequence,
    resetAnimation,
  };
};

const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => { mediaQuery.removeEventListener('change', handleChange); };
  }, []);

  return prefersReducedMotion;
};

const HomePage: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleNavigateToAbout = useCallback((): void => {
    void navigate({ to: '/about' });
  }, [navigate]);

  const { animationState, currentPhase, startSequence } = useAnimationSequence(
    handleNavigateToAbout
  );

  const handleAboutClick = useCallback((): void => {
    if (prefersReducedMotion) {
      handleNavigateToAbout();
    } else {
      startSequence();
    }
  }, [prefersReducedMotion, handleNavigateToAbout, startSequence]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        handleAboutClick();
      }
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        void navigate({ to: '/projects' });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => { window.removeEventListener('keydown', handleKeyPress); };
  }, [handleAboutClick, navigate]);

  return (
    <div 
      className="homepage"
      role="main"
      aria-label="Page d'accueil du portfolio"
      aria-busy={currentPhase !== AnimationPhase.IDLE}
    >
      {/* Annonce pour les lecteurs d'écran */}
      <div className="sr-only" role="status" aria-live="polite">
        {currentPhase === AnimationPhase.FADING_OUT && 
          "Transition en cours vers la page À propos"}
      </div>
      <HomePageTitle animateExit={animationState.startFadeOut} />
      <HomePageSocials animateExit={animationState.startFadeOut} />
      <HomePageMenu 
        animateExit={animationState.startFadeOut}
        onAboutClick={handleAboutClick}
      />
      <HomePageFooter animateExit={animationState.startFadeOut} />
      <HomePageBackground animateExit={animationState.startBgAnimation} />
      {currentPhase === AnimationPhase.BACKGROUND_ANIMATING && (
        <div 
          className="loading-indicator sr-only"
          role="progressbar"
          aria-valuetext="Chargement de la page suivante"
        />
      )}
    </div>
  );
};

export default HomePage;