import { motion, Variants } from "framer-motion";

import { IntroEnterMessageProps } from '../../types';

import '../../styles/Overlay.css';

const messageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: [0, 1, 0],
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: 'easeInOut' 
    }
  }
};

const IntroEnterMessage: React.FC<IntroEnterMessageProps> = ({ 
  isTouchDevice 
}) => {
  const message = isTouchDevice
    ? "Touch the screen to enter"
    : "Click the screen to enter";

  return (
    <motion.p
      className="overlay__enter-message"
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {message}
    </motion.p>
  );
};

export default IntroEnterMessage;