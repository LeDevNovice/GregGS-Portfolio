import { useEffect, useCallback, useReducer, useRef } from 'react';
import React from 'react';

import IntroTitle from './IntroTitle';
import IntroEnterMessage from './IntroEnterMessage';
import OverlayMenu from './OverlayMenu';
import ContentPanel from '../Panel/ContentPanel';
import AboutPage from '../About/AboutPage'; // ← NOUVEAU
import { DotCanvas } from '../../r3f/DotCanvas';

import {
  IntroOverlayProps,
  DotAnimationState,
  SectionId,
} from '../../types';

import '../../styles/Overlay.css';

// ─── State ────────────────────────────────────────────────────────────

interface IntroOverlayState {
  dotAnimationState: DotAnimationState;
  titlesVisible: boolean;
  showEnterMessage: boolean;
  hasStartedWiggle: boolean;
  hasOverlayBackground: boolean;
  isTouchDevice: boolean;
  menuOpen: boolean;
  hasCompletedFirstOpen: boolean;
  activeSection: SectionId | null;
  panelVisible: boolean;
  aboutVisible: boolean;      // ← NOUVEAU : page About montée
}

// ─── Actions ──────────────────────────────────────────────────────────

type IntroOverlayAction =
  | { type: 'INIT_TOUCH_DEVICE'; isTouchDevice: boolean }
  | { type: 'SHOW_ENTER_MESSAGE' }
  | { type: 'START_WIGGLE_SEQUENCE' }
  | { type: 'TRANSITION_TO'; nextState: DotAnimationState }
  | { type: 'START_EXPANSION' }
  | { type: 'SHOW_MENU' }
  | { type: 'START_CLOSE' }
  | { type: 'RESET_TO_IDLE' }
  | { type: 'NAVIGATE_TO_SECTION'; section: SectionId }
  | { type: 'PANEL_CLOSED' }
  | { type: 'DIVE_COMPLETE' }      // ← NOUVEAU : plongeon terminé → montrer About
  | { type: 'START_SURFACE' }      // ← NOUVEAU : depuis About, déclenche la remontée
  | { type: 'SURFACE_COMPLETE' };  // ← NOUVEAU : remontée terminée → retour au menu

// ─── Reducer ──────────────────────────────────────────────────────────

const introOverlayReducer = (
  state: IntroOverlayState,
  action: IntroOverlayAction,
): IntroOverlayState => {
  switch (action.type) {
    case 'INIT_TOUCH_DEVICE':
      return { ...state, isTouchDevice: action.isTouchDevice };

    case 'SHOW_ENTER_MESSAGE':
      return { ...state, showEnterMessage: true };

    case 'START_WIGGLE_SEQUENCE':
      if (!state.hasStartedWiggle) {
        return {
          ...state,
          hasStartedWiggle: true,
          showEnterMessage: false,
          dotAnimationState: 'wiggle1',
        };
      }
      return state;

    case 'TRANSITION_TO':
      return { ...state, dotAnimationState: action.nextState };

    case 'START_EXPANSION':
      return {
        ...state,
        dotAnimationState: 'expand',
        titlesVisible: false,
        showEnterMessage: false,
      };

    case 'SHOW_MENU':
      return {
        ...state,
        menuOpen: true,
        hasOverlayBackground: true,
        hasCompletedFirstOpen: true,
      };

    case 'START_CLOSE':
      return {
        ...state,
        menuOpen: false,
        dotAnimationState: 'contract',
      };

    case 'RESET_TO_IDLE':
      return {
        ...state,
        dotAnimationState: 'idle',
        titlesVisible: true,
        showEnterMessage: true,
        hasOverlayBackground: true,
        hasStartedWiggle: false,
      };

    case 'NAVIGATE_TO_SECTION':
      // ← MODIFIÉ : "about" déclenche le plongeon, les autres restent avec ContentPanel
      if (action.section === 'about') {
        return {
          ...state,
          menuOpen: false,
          activeSection: action.section,
          dotAnimationState: 'diving', // Lance DiveEffect
        };
      }
      return {
        ...state,
        menuOpen: false,
        activeSection: action.section,
        panelVisible: true,
        dotAnimationState: 'idle',
      };

    case 'PANEL_CLOSED':
      return {
        ...state,
        panelVisible: false,
        activeSection: null,
        menuOpen: true,
        dotAnimationState: 'expanded',
      };

    // ← NOUVEAU : le plongeon est terminé (iris plein blanc)
    case 'DIVE_COMPLETE':
      return {
        ...state,
        aboutVisible: true,
        dotAnimationState: 'idle', // DiveEffect s'arrête, reste blanc derrière About
      };

    // ← NOUVEAU : l'utilisateur clique "Retour" dans la page About
    case 'START_SURFACE':
      return {
        ...state,
        aboutVisible: false,           // About commence à se démonter
        dotAnimationState: 'surfacing', // Lance DiveEffect en reverse
      };

    // ← NOUVEAU : la remontée est terminée (iris refermée)
    case 'SURFACE_COMPLETE':
      return {
        ...state,
        activeSection: null,
        menuOpen: true,               // Retour au menu ouvert
        dotAnimationState: 'expanded', // On est dans le fond violet
      };

    default:
      return state;
  }
};

// ─── Component ────────────────────────────────────────────────────────

const IntroOverlay: React.FC<IntroOverlayProps> = () => {
  const initialState: IntroOverlayState = {
    dotAnimationState: 'fadeIn',
    titlesVisible: true,
    showEnterMessage: false,
    hasStartedWiggle: false,
    hasOverlayBackground: true,
    isTouchDevice: false,
    menuOpen: false,
    hasCompletedFirstOpen: false,
    activeSection: null,
    panelVisible: false,
    aboutVisible: false, // ← NOUVEAU
  };

  const [state, dispatch] = useReducer(introOverlayReducer, initialState);

  const dotPlaceholderRef = useRef<HTMLSpanElement | null>(null);

  // ← NOUVEAU : position pixel du trou du "e" (calculée au moment du dive)
  // [x, y] en coordonnées CSS (0,0 = haut-gauche)
  const eHolePosRef = useRef<readonly [number, number]>([
    window.innerWidth * 0.38,    // Estimation initiale : ~38% de la largeur
    window.innerHeight * 0.47,   // ~47% de la hauteur (centre approximatif du titre)
  ]);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    dispatch({ type: 'INIT_TOUCH_DEVICE', isTouchDevice: isTouch });
  }, []);

  // ← NOUVEAU : quand on commence à plonger, on mesure la vraie position du "e"
  useEffect(() => {
    if (state.dotAnimationState === 'diving') {
      // Cherche le premier "e" dans le titre (qui sera le "e" de "Greg")
      const eSpan = document.querySelector<HTMLElement>('[data-letter-text="e"]');
      if (eSpan) {
        const rect = eSpan.getBoundingClientRect();
        // Centre de la bounding box du "e"
        const cx = rect.left + rect.width / 2;
        // Le counter (trou) du "e" est approximativement au centre vertical de la lettre
        // Légèrement vers le haut (55% depuis le bas) pour pointer dans le trou réel
        const cy = rect.bottom - rect.height * 0.55;
        eHolePosRef.current = [cx, cy];
      }
      // Si le querySelector ne trouve rien (lettres pas encore rendues / autre balisage),
      // eHolePosRef garde sa valeur estimée — le plongeon reste visuellement cohérent.
    }
  }, [state.dotAnimationState]);

  const handleTitleAnimationComplete = useCallback((): void => {
    dispatch({ type: 'SHOW_ENTER_MESSAGE' });
  }, []);

  const handleUserInteraction = useCallback((): void => {
    if (state.menuOpen || state.panelVisible || state.aboutVisible) return;
    if (!state.hasStartedWiggle) {
      dispatch({ type: 'START_WIGGLE_SEQUENCE' });
    }
  }, [state.menuOpen, state.panelVisible, state.aboutVisible, state.hasStartedWiggle]);

  const handleMenuClose = useCallback((): void => {
    dispatch({ type: 'START_CLOSE' });
  }, []);

  const handleNavigateToSection = useCallback((section: SectionId): void => {
    dispatch({ type: 'NAVIGATE_TO_SECTION', section });
  }, []);

  const handlePanelClosed = useCallback((): void => {
    dispatch({ type: 'PANEL_CLOSED' });
  }, []);

  // ← NOUVEAU : depuis AboutPage, déclenche la remontée
  const handleAboutBack = useCallback((): void => {
    dispatch({ type: 'START_SURFACE' });
  }, []);

  const handleDotAnimationComplete = useCallback((
    previousState: DotAnimationState,
  ): void => {
    const transitions: Partial<Record<DotAnimationState, () => void>> = {
      fadeIn: () => { /* attend interaction */ },
      idle: () => { /* stable */ },
      expanded: () => { /* fond violet stable */ },
      wiggle1: () => {
        dispatch({ type: 'TRANSITION_TO', nextState: 'pause' });
      },
      pause: () => {
        setTimeout(() => {
          dispatch({ type: 'TRANSITION_TO', nextState: 'wiggle2' });
        }, 1000);
      },
      wiggle2: () => {
        setTimeout(() => {
          dispatch({ type: 'TRANSITION_TO', nextState: 'secondPause' });
        }, 1000);
      },
      secondPause: () => {
        dispatch({ type: 'START_EXPANSION' });
      },
      expand: () => {
        dispatch({ type: 'SHOW_MENU' });
      },
      contract: () => {
        dispatch({ type: 'RESET_TO_IDLE' });
      },
      // ← NOUVEAUX handlers
      diving: () => {
        dispatch({ type: 'DIVE_COMPLETE' });
      },
      surfacing: () => {
        dispatch({ type: 'SURFACE_COMPLETE' });
      },
    };

    const transition = transitions[previousState];
    if (transition) transition();
  }, []);

  const containerStyle: React.CSSProperties = {
    backgroundColor: state.hasOverlayBackground ? '#FEFEFE' : 'transparent',
    transition: 'background-color 0.5s ease-out',
  };

  const isInteractive =
    !state.menuOpen &&
    !state.panelVisible &&
    !state.aboutVisible && // ← NOUVEAU
    state.dotAnimationState !== 'expand' &&
    state.dotAnimationState !== 'expanded' &&
    state.dotAnimationState !== 'contract' &&
    state.dotAnimationState !== 'wiggle1' &&
    state.dotAnimationState !== 'wiggle2' &&
    state.dotAnimationState !== 'pause' &&
    state.dotAnimationState !== 'secondPause' &&
    state.dotAnimationState !== 'diving' &&     // ← NOUVEAU
    state.dotAnimationState !== 'surfacing';    // ← NOUVEAU

  return (
    <div
      className="overlay__container"
      onClick={isInteractive ? handleUserInteraction : undefined}
      style={containerStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e): void => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          handleUserInteraction();
        }
      }}
      aria-label="Cliquez pour ouvrir le menu"
    >
      <div className="overlay__title-wrapper">
        <IntroTitle
          text="Greg"
          visible={state.titlesVisible}
          skipAnimation={state.hasCompletedFirstOpen}
          handleTitleAnimationComplete={handleTitleAnimationComplete}
        />

        <span
          ref={dotPlaceholderRef}
          className="overlay__title-dot--placeholder"
          role="presentation"
          aria-hidden="true"
        />

        <IntroTitle
          text="GS"
          visible={state.titlesVisible}
          skipAnimation={state.hasCompletedFirstOpen}
          handleTitleAnimationComplete={handleTitleAnimationComplete}
        />
      </div>

      <DotCanvas
        dotState={state.dotAnimationState}
        menuOpen={state.menuOpen}
        placeholderRef={dotPlaceholderRef}
        onAnimationComplete={handleDotAnimationComplete}
        eHolePos={eHolePosRef.current}
      />

      {state.showEnterMessage &&
        (state.dotAnimationState === 'fadeIn' ||
          state.dotAnimationState === 'idle') && (
          <IntroEnterMessage isTouchDevice={state.isTouchDevice} />
        )}

      <OverlayMenu
        isVisible={state.menuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigateToSection}
      />

      <ContentPanel
        isVisible={state.panelVisible}
        section={state.activeSection}
        onClosed={handlePanelClosed}
      />

      {/* ← NOUVEAU : page About avec plongeon */}
      <AboutPage
        isVisible={state.aboutVisible}
        onBack={handleAboutBack}
      />
    </div>
  );
};

export default IntroOverlay;