import { useEffect, useState } from 'react';

import IntroTitle from './IntroTitle';
import IntroDot from './IntroDot';
import IntroEnterMessage from './IntroEnterMessage';
import '../../styles/Overlay.css';

const dotVariants = {
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
    },
  },
  expand: {
    scale: 300,
    opacity: 1, 
    transition: {
      duration: 3,
      ease: 'easeIn',
    },
  },
  contract: {
    scale: 0,
    opacity: 1, 
    transition: {
      duration: 1.5,
      ease: 'easeOut',
    },
  },
};

interface IntroOverlayProps {
  onFinish?: () => void;
}

const IntroOverlay = ({ onFinish }: IntroOverlayProps) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showEnterMessage, setShowEnterMessage] = useState(false);
  const [dotAnimationState, setDotAnimationState] = useState('fadeIn'); 
  const [hasStartedWiggle, setHasStartedWiggle] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [hasOverlayBackground, setHasOverlayBackground] = useState(true);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  const handleTitleAnimationComplete = () => {
    setShowEnterMessage(true);
  };
  
  const handleUserInteraction = () => {
    if (!hasStartedWiggle) {
      setHasStartedWiggle(true);
      setDotAnimationState('wiggle1');
    }
  };

  const handleDotAnimationComplete = (previousVariant: string) => {
    if (previousVariant === 'wiggle1') {
      setDotAnimationState('pause');
    } else if (previousVariant === 'pause') {
      setTimeout(() => {
        setDotAnimationState('wiggle2');
      }, 1000);
    } else if (previousVariant === 'wiggle2') {
      setTimeout(() => {
        setDotAnimationState('secondPause');
      }, 1000);
    } else if (previousVariant === 'secondPause') {
      setDotAnimationState('expand');
    } else if (previousVariant === 'expand') {
      setShowTitle(false);
      setHasOverlayBackground(false);
      setDotAnimationState('contract');
    } else if (previousVariant === 'contract') {
      if (onFinish) onFinish();
    }
  };

  return (
    <div 
      className="overlay__container" 
      onClick={handleUserInteraction}
      style={{
        backgroundColor: hasOverlayBackground ? '#FEFEFE' : 'transparent'
      }}
    >
      <div className='overlay__title-wrapper'>
        {showTitle && (<IntroTitle text='Greg' handleTitleAnimationComplete={handleTitleAnimationComplete} />)}
        <IntroDot variant={dotVariants} animationState={dotAnimationState} handleDotAnimationComplete={handleDotAnimationComplete}/>
        {showTitle && (<IntroTitle text='GS' handleTitleAnimationComplete={handleTitleAnimationComplete} />)}
      </div>
      {showEnterMessage && dotAnimationState === 'fadeIn' && (
      <IntroEnterMessage isTouchDevice={isTouchDevice} />
    )}
    </div>
  );
};

export default IntroOverlay;