import { motion } from "framer-motion"

import '../../styles/Overlay.css';

interface IntroTitleProps {
    text: string
    handleTitleAnimationComplete: () => void}

const IntroTitle = ({text, handleTitleAnimationComplete}: IntroTitleProps) => {
  return (
    <motion.h1 
        className="overlay__title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 5, delay: 1, ease: "linear" }}
        onAnimationComplete={handleTitleAnimationComplete}
    > { text } </motion.h1>
  )
}

export default IntroTitle;