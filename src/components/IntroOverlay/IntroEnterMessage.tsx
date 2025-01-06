import { motion } from "framer-motion"

import '../../styles/Overlay.css';

interface IntroEnterMessageProps {
  isTouchDevice: boolean;
}

const IntroEnterMessage = ({ isTouchDevice }: IntroEnterMessageProps) => {
  return (
    <motion.p
        className="overlay__enter-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
      >
        { isTouchDevice
          ? "Touch the screen to enter"
          : "Click the screen to enter"}
      </motion.p>
  )
}

export default IntroEnterMessage;