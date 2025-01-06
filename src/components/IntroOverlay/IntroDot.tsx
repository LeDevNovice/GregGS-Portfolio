import { motion, Variants } from "framer-motion";

import '../../styles/Overlay.css';

interface IntroDotProps {
    variant: Variants
    animationState: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleDotAnimationComplete: (definition: any) => void}

const IntroDot = ({variant, animationState, handleDotAnimationComplete}: IntroDotProps) => {
  return (
    <motion.span 
          className="overlay__title-dot"
          variants={variant}
          initial="hidden"
          animate={animationState}
          transition={{ 
            duration: 3, 
            ease: 'easeIn' 
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onAnimationComplete={(definition: any) => handleDotAnimationComplete(definition)}
        />
  )
}

export default IntroDot;