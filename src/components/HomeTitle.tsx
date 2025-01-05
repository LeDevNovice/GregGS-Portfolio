import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import '../styles/Home.css';

const dotVariants = {
  hidden: {
    scale: 1,
    x: 0,
  },
  wiggle1: {
    x: [0, 5, -5, 5, -5, 0],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  pause: {
    x: 0,
    transition: {
      ease: 'linear',
    },
  },
  wiggle2: {
    x: [0, 5, -5, 5, -5, 0],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  secondPause: {
    x: 0,
    transition: {
      ease: 'linear',
    },
  },
  expand: {
    scale: 300,
    transition: {
      duration: 3,
      ease: 'easeIn',
    },
  },
};

const HomeTitle = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showEnterMessage, setShowEnterMessage] = useState(false);
  const [dotAnimationState, setDotAnimationState] = useState('hidden'); 
  const [hasStartedWiggle, setHasStartedWiggle] = useState(false);

  // TODO: Détection tactile a mettre dans un hook
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
    }
  };

  return (
    <div 
      className="home__container" 
      onClick={handleUserInteraction}
    >
      <motion.h1 
        className="home__title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 5, delay: 1, ease: "linear" }}
        onAnimationComplete={handleTitleAnimationComplete}
      >
        Greg<motion.span 
          className="home__title-dot"
          variants={dotVariants}
          initial="hidden"
          animate={dotAnimationState}
          transition={{ 
            duration: 3, 
            ease: 'easeIn' 
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onAnimationComplete={(definition: any) => handleDotAnimationComplete(definition)}
        />
        GS
      </motion.h1> 
    {showEnterMessage && dotAnimationState === 'hidden' && (
      <motion.p
        className="home__enter-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      >
        {isTouchDevice
          ? "Touch the screen to enter"
          : "Click the screen to enter"}
      </motion.p>
    )}
    </div>
  );
};

export default HomeTitle;