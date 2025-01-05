import { useState } from 'react';
import { motion } from 'framer-motion';

import '../styles/Home.css';

const HomeTitle = () => {
  const [startExpandDotAnimation, setStartExpandDotAnimation] = useState(false);

  return (
    <motion.h1 
      className="home__title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 5, delay: 1, ease: "linear" }}
      onAnimationComplete={() => {
        setStartExpandDotAnimation(true);
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
  );
};

export default HomeTitle;