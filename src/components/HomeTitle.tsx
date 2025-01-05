import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import '../styles/Home.css';

const HomeTitle = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showEnterMessage, setShowEnterMessage] = useState(false);
  const [startExpandDotAnimation, setStartExpandDotAnimation] = useState(false);

  const handleUserInteraction = () => {
    setStartExpandDotAnimation(true);
  };

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  return (
    <div 
      className="home__container" 
      onClick={handleUserInteraction} // Détection du clic
    >
      <motion.h1 
        className="home__title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 5, delay: 1, ease: "linear" }}
        onAnimationComplete={() => {
          setShowEnterMessage(true);
        }}
      >
        Greg<motion.span 
          className="home__title-dot"
          initial={{ scale: 1 }}
          animate={
            startExpandDotAnimation
              ? { scale: 300 }
              : {}
          }
          transition={{ 
            duration: 3, 
            ease: 'easeIn' 
          }}
        >
        </motion.span>GS
      </motion.h1> 
    {showEnterMessage && !startExpandDotAnimation && (
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