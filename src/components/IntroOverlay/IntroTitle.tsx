import { motion } from "framer-motion";

import { IntroTitleProps } from '../../types';
import '../../styles/Overlay.css';

const IntroTitle: React.FC<IntroTitleProps> = ({
  text,
  visible,
  skipAnimation,
  handleTitleAnimationComplete,
}) => {
  const getTransition = () => {
    if (!visible) {
      return { duration: 0.3, ease: 'easeOut' as const };
    }
    if (skipAnimation) {
      return { duration: 0 };
    }
    return { duration: 5, delay: 1, ease: 'linear' as const };
  };

  return (
    <motion.h1
      className="overlay__title"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={getTransition()}
      onAnimationComplete={() => {
        if (visible) handleTitleAnimationComplete();
      }}
      role="heading"
      aria-level={1}
      aria-label={`Partie du nom: ${text}`}
    >
      {text}
    </motion.h1>
  );
};

export default IntroTitle;