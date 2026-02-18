import { useEffect, useCallback, useReducer } from 'react';
import React from 'react';

import IntroTitle from './IntroTitle';
import IntroDot from './IntroDot';
import IntroEnterMessage from './IntroEnterMessage';
import OverlayMenu from './OverlayMenu';
import {
  IntroOverlayProps,
  DotAnimationState,
  DotVariants,
} from '../../types';

import '../../styles/Overlay.css';

// ─── State ──────────────────────────────────────────────

interface IntroOverlayState {
  dotAnimationState: DotAnimationState;
  titlesVisible: boolean;
  showEnterMessage: boolean;
  hasStartedWiggle: boolean;
  hasOverlayBackground: boolean;
  isTouchDevice: boolean;
  menuOpen: boolean;
  hasCompletedFirstOpen: boolean;
}

// ─── Actions ────────────────────────────────────────────

type IntroOverlayAction =
  | { type: 'INIT_TOUCH_DEVICE'; isTouchDevice: boolean }
  | { type: 'SHOW_ENTER_MESSAGE' }
  | { type: 'START_WIGGLE_SEQUENCE' }
  | { type: 'TRANSITION_TO'; nextState: DotAnimationState }
  | { type: 'START_EXPANSION' }
  | { type: 'SHOW_MENU' }
  | { type: 'START_CLOSE' }
  | { type: 'RESET_TO_IDLE' };

// ─── Reducer ────────────────────────────────────────────

const introOverlayReducer = (
  state: IntroOverlayState,
  action: IntroOverlayAction
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
        // Titles stay in DOM (opacity → 0 via prop) so the dot
        // expands from its real position between "Greg" and "GS"
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
        // Reset so wiggles can fire again on next click
        hasStartedWiggle: false,
      };

    default:
      return state;
  }
};

// ─── Dot Variants ───────────────────────────────────────

const dotVariants: DotVariants = {
  hidden: {
    scale: 1,
    x: 0,
    opacity: 0,
  },
  fadeIn: {
    opacity: 1,
    transition: {
      duration: 5,
      ease: 'easeInOut',
      delay: 0.5,
    },
  },
  idle: {
    scale: 1,
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
  wiggle1: {
    x: [0, 5, -5, 5, -5, 0],
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  pause: {
    x: 0,
    opacity: 1,
    transition: {
      ease: 'linear',
      duration: 0.1,
    },
  },
  wiggle2: {
    x: [0, 5, -5, 5, -5, 0],
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  secondPause: {
    x: 0,
    opacity: 1,
    transition: {
      ease: 'linear',
      duration: 0.1,
    },
  },
  expand: {
    scale: [1, 50, 300],
    opacity: 1,
    transition: {
      duration: 2,
      ease: [0.4, 0, 0.2, 1],
      times: [0, 0.5, 1],
    },
  },
  contract: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
} as const;

// ─── Component ──────────────────────────────────────────

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
  };

  const [state, dispatch] = useReducer(introOverlayReducer, initialState);

  // ── Init ──

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    dispatch({ type: 'INIT_TOUCH_DEVICE', isTouchDevice: isTouch });
  }, []);

  const handleTitleAnimationComplete = useCallback(() => {
    dispatch({ type: 'SHOW_ENTER_MESSAGE' });
  }, []);

  // ── User click on the overlay (Greg.GS screen) ──

  const handleUserInteraction = useCallback(() => {
    if (state.menuOpen) return;

    // Always run wiggle sequence (fires on every open)
    if (!state.hasStartedWiggle) {
      dispatch({ type: 'START_WIGGLE_SEQUENCE' });
    }
  }, [state.menuOpen, state.hasStartedWiggle]);

  // ── Close menu (✕ button) ──

  const handleMenuClose = useCallback(() => {
    dispatch({ type: 'START_CLOSE' });
  }, []);

  // ── Animation state machine ──

  const handleDotAnimationComplete = useCallback((
    previousState: DotAnimationState
  ) => {
    const transitions: Partial<Record<DotAnimationState, () => void>> = {
      fadeIn: () => {
        // Waiting for user interaction
      },
      idle: () => {
        // Stable state, waiting for user interaction
      },
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
    };

    const transition = transitions[previousState];
    if (transition) transition();
  }, []);

  // ── Render ──

  const containerStyle = {
    backgroundColor: state.hasOverlayBackground ? '#FEFEFE' : 'transparent',
    transition: 'background-color 0.5s ease-out',
  };

  const isInteractive = !state.menuOpen
    && state.dotAnimationState !== 'expand'
    && state.dotAnimationState !== 'contract'
    && state.dotAnimationState !== 'wiggle1'
    && state.dotAnimationState !== 'wiggle2'
    && state.dotAnimationState !== 'pause'
    && state.dotAnimationState !== 'secondPause';

  return (
    <div
      className="overlay__container"
      onClick={isInteractive ? handleUserInteraction : undefined}
      style={containerStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          handleUserInteraction();
        }
      }}
      aria-label="Cliquez pour ouvrir le menu"
    >
      {/* ── Greg . GS ── 
          Titles are ALWAYS in the DOM so the dot stays in position
          during expand/contract. Visibility is controlled via opacity. */}
      <div className="overlay__title-wrapper">
        <IntroTitle
          text="Greg"
          visible={state.titlesVisible}
          skipAnimation={state.hasCompletedFirstOpen}
          handleTitleAnimationComplete={handleTitleAnimationComplete}
        />

        <IntroDot
          variant={dotVariants}
          animationState={state.dotAnimationState}
          handleDotAnimationComplete={handleDotAnimationComplete}
        />

        <IntroTitle
          text="GS"
          visible={state.titlesVisible}
          skipAnimation={state.hasCompletedFirstOpen}
          handleTitleAnimationComplete={handleTitleAnimationComplete}
        />
      </div>

      {/* ── Enter message ── */}
      {state.showEnterMessage
        && (state.dotAnimationState === 'fadeIn' || state.dotAnimationState === 'idle')
        && (
          <IntroEnterMessage isTouchDevice={state.isTouchDevice} />
        )}

      {/* ── Fullscreen menu (visible when expanded) ── */}
      <OverlayMenu
        isVisible={state.menuOpen}
        onClose={handleMenuClose}
      />
    </div>
  );
};

export default IntroOverlay;