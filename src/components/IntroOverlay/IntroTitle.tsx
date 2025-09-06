import { motion } from "framer-motion";

import { IntroTitleProps } from '../../types';

import '../../styles/Overlay.css';

const IntroTitle: React.FC<IntroTitleProps> = ({ 
  text, 
  handleTitleAnimationComplete 
}) => {
  const animationConfig = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { 
      duration: 5, 
      delay: 1, 
      ease: "linear" as const
    }
  };

  return (
    <motion.h1 
      className="overlay__title"
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      transition={animationConfig.transition}
      onAnimationComplete={handleTitleAnimationComplete}
      role="heading"
      aria-level={1}
      aria-label={`Partie du nom: ${text}`}
    >
      {text}
    </motion.h1>
  );
};

export default IntroTitle;