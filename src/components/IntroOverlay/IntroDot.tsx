import { motion } from "framer-motion";
import { IntroDotProps } from '../../types';
import '../../styles/Overlay.css';

const IntroDot: React.FC<IntroDotProps> = ({
  variant,
  animationState,
  handleDotAnimationComplete,
}) => {
  const onAnimationComplete = (): void => {
    handleDotAnimationComplete(animationState);
  };

  const needsHighZ =
    animationState === 'expand' ||
    animationState === 'expanded' ||
    animationState === 'contract';

  return (
    <motion.span
      className="overlay__title-dot"
      variants={variant}
      initial="hidden"
      animate={animationState}
      onAnimationComplete={onAnimationComplete}
      style={{
        willChange: 'transform, opacity',
        zIndex: needsHighZ ? 9999 : 1,
      }}
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default IntroDot;