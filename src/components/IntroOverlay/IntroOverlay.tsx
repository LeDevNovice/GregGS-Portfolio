import { useEffect, useCallback, useReducer } from 'react';
import React from 'react';

import IntroTitle from './IntroTitle';
import IntroDot from './IntroDot';
import IntroEnterMessage from './IntroEnterMessage';
import { 
  IntroOverlayProps, 
  DotAnimationState, 
  DotVariants 
} from '../../types';

import '../../styles/Overlay.css';

interface IntroOverlayState {
  dotAnimationState: DotAnimationState;
  showTitle: boolean;
  showEnterMessage: boolean;
  hasStartedWiggle: boolean;
  hasOverlayBackground: boolean;
  isTouchDevice: boolean;
  isFullyComplete: boolean;
}

type IntroOverlayAction =
  | { type: 'INIT_TOUCH_DEVICE'; isTouchDevice: boolean }
  | { type: 'SHOW_ENTER_MESSAGE' }
  | { type: 'START_WIGGLE_SEQUENCE' }
  | { type: 'TRANSITION_TO'; nextState: DotAnimationState }
  | { type: 'START_EXPANSION' }
  | { type: 'START_CONTRACTION' }
  | { type: 'HIDE_ELEMENTS' }
  | { type: 'COMPLETE_ANIMATION' };

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
          dotAnimationState: 'wiggle1'
        };
      }
      return state;
    
    case 'TRANSITION_TO':
      return { ...state, dotAnimationState: action.nextState };
    
    case 'START_EXPANSION':
      return {
        ...state,
        dotAnimationState: 'expand'
      };
    
    case 'HIDE_ELEMENTS':
      return {
        ...state,
        showTitle: false,
        hasOverlayBackground: true
      };
    
    case 'START_CONTRACTION':
      return {
        ...state,
        dotAnimationState: 'contract',
        hasOverlayBackground: false
      };
    
    case 'COMPLETE_ANIMATION':
      return {
        ...state,
        isFullyComplete: true
      };
    
    default:
      return state;
  }
};

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
      times: [0, 0.5, 1]
    },
  },
  contract: {
    scale: 0,
    opacity: 1,
    transition: {
      duration: 2,
      ease: 'easeOut',
    },
  },
} as const;

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onFinish }) => {
  const initialState: IntroOverlayState = {
    dotAnimationState: 'fadeIn',
    showTitle: true,
    showEnterMessage: false,
    hasStartedWiggle: false,
    hasOverlayBackground: true,
    isTouchDevice: false,
    isFullyComplete: false,
  };

  const [state, dispatch] = useReducer(introOverlayReducer, initialState);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    dispatch({ type: 'INIT_TOUCH_DEVICE', isTouchDevice: isTouch });
  }, []);

  const handleTitleAnimationComplete = useCallback(() => {
    dispatch({ type: 'SHOW_ENTER_MESSAGE' });
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (!state.hasStartedWiggle) {
      console.log('Starting wiggle sequence');
      dispatch({ type: 'START_WIGGLE_SEQUENCE' });
    }
  }, [state.hasStartedWiggle]);

  const handleDotAnimationComplete = useCallback((
    previousState: DotAnimationState
  ) => {
    console.log(`✅ Animation terminée: ${previousState}`);
    
    const transitions: Record<DotAnimationState, () => void> = {
      fadeIn: () => {
        console.log('FadeIn complete - waiting for user interaction');
      },
      wiggle1: () => {
        console.log('Wiggle1 complete -> pause');
        dispatch({ type: 'TRANSITION_TO', nextState: 'pause' });
      },
      pause: () => {
        console.log('Pause complete -> wiggle2');
        setTimeout(() => {
          dispatch({ type: 'TRANSITION_TO', nextState: 'wiggle2' });
        }, 1000);
      },
      wiggle2: () => {
        console.log('Wiggle2 complete -> secondPause');
        setTimeout(() => {
          dispatch({ type: 'TRANSITION_TO', nextState: 'secondPause' });
        }, 1000);
      },
      secondPause: () => {
        console.log('SecondPause complete -> expand');
        dispatch({ type: 'START_EXPANSION' });
      },
      expand: () => {
        console.log('🔵 EXPAND COMPLETE - Starting contraction');
        
        setTimeout(() => {
          console.log('🔴 Starting contraction and hiding elements');
          dispatch({ type: 'HIDE_ELEMENTS' });
          dispatch({ type: 'START_CONTRACTION' });
        }, 2500);
      },
      contract: () => {
        console.log('✅ CONTRACT COMPLETE - Animation fully finished');
        dispatch({ type: 'COMPLETE_ANIMATION' });
        
        setTimeout(() => {
          console.log('🎯 Calling onFinish');
          onFinish?.();
        }, 500);
      },
    };

    const transition = transitions[previousState];
    transition();
  }, [onFinish]);

  useEffect(() => {
    console.log('Current animation state:', state.dotAnimationState);
  }, [state.dotAnimationState]);

  const containerStyle = {
    backgroundColor: state.hasOverlayBackground ? '#FEFEFE' : 'transparent',
    transition: 'background-color 0.5s ease-out',
  };

  return (
    <div
      className="overlay__container"
      onClick={handleUserInteraction}
      style={containerStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleUserInteraction();
        }
      }}
      aria-label="Cliquez pour entrer dans le site"
    >
      <div className='overlay__title-wrapper'>
        {state.showTitle && (
          <IntroTitle 
            text='Greg' 
            handleTitleAnimationComplete={handleTitleAnimationComplete} 
          />
        )}
        
        <IntroDot
          variant={dotVariants}
          animationState={state.dotAnimationState}
          handleDotAnimationComplete={handleDotAnimationComplete}
        />
        
        {state.showTitle && (
          <IntroTitle 
            text='GS' 
            handleTitleAnimationComplete={handleTitleAnimationComplete} 
          />
        )}
      </div>
      
      {state.showEnterMessage && state.dotAnimationState === 'fadeIn' && (
        <IntroEnterMessage isTouchDevice={state.isTouchDevice} />
      )}
    </div>
  );
};

export default IntroOverlay;