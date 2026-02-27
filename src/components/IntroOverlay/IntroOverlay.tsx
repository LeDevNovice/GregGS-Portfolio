import { useEffect, useCallback, useReducer, useRef } from 'react';
import React from 'react';

import IntroTitle from './IntroTitle';
import IntroEnterMessage from './IntroEnterMessage';
import OverlayMenu from './OverlayMenu';
import ContentPanel from '../Panel/ContentPanel';
import { DotCanvas } from '../../r3f/DotCanvas';

import {
  IntroOverlayProps,
  DotAnimationState,
  SectionId,
} from '../../types';

import '../../styles/Overlay.css';

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
}

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
  | { type: 'PANEL_CLOSED' };

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

    default:
      return state;
  }
};

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
  };

  const [state, dispatch] = useReducer(introOverlayReducer, initialState);

  const dotPlaceholderRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    dispatch({ type: 'INIT_TOUCH_DEVICE', isTouchDevice: isTouch });
  }, []);

  const handleTitleAnimationComplete = useCallback((): void => {
    dispatch({ type: 'SHOW_ENTER_MESSAGE' });
  }, []);

  const handleUserInteraction = useCallback((): void => {
    if (state.menuOpen || state.panelVisible) return;
    if (!state.hasStartedWiggle) {
      dispatch({ type: 'START_WIGGLE_SEQUENCE' });
    }
  }, [state.menuOpen, state.panelVisible, state.hasStartedWiggle]);

  const handleMenuClose = useCallback((): void => {
    dispatch({ type: 'START_CLOSE' });
  }, []);

  const handleNavigateToSection = useCallback((section: SectionId): void => {
    dispatch({ type: 'NAVIGATE_TO_SECTION', section });
  }, []);

  const handlePanelClosed = useCallback((): void => {
    dispatch({ type: 'PANEL_CLOSED' });
  }, []);

  const handleDotAnimationComplete = useCallback((
    previousState: DotAnimationState,
  ): void => {
    const transitions: Partial<Record<DotAnimationState, () => void>> = {
      fadeIn: () => { /* wait for user interaction */ },
      idle: () => { /* stable state */ },
      expanded: () => { /* stable violet background */ },
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

  const containerStyle: React.CSSProperties = {
    backgroundColor: state.hasOverlayBackground ? '#FEFEFE' : 'transparent',
    transition: 'background-color 0.5s ease-out',
  };

  const isInteractive =
    !state.menuOpen &&
    !state.panelVisible &&
    state.dotAnimationState !== 'expand' &&
    state.dotAnimationState !== 'expanded' &&
    state.dotAnimationState !== 'contract' &&
    state.dotAnimationState !== 'wiggle1' &&
    state.dotAnimationState !== 'wiggle2' &&
    state.dotAnimationState !== 'pause' &&
    state.dotAnimationState !== 'secondPause';

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
        placeholderRef={dotPlaceholderRef}
        onAnimationComplete={handleDotAnimationComplete}
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
    </div>
  );
};

export default IntroOverlay;