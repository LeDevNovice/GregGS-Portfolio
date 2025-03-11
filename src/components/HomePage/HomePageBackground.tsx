import { motion } from 'framer-motion';

import HomePageBackgroundImage from './homepageBackground.png';
import '../../styles/HomePage.css';

interface Props {
  animateExit: boolean;
}

function HomePageBackground({ animateExit }: Props) {
  return (
    <motion.img
      src={HomePageBackgroundImage}
      className='homepage__background'
      initial={{ x: '0vw', opacity: 1 }}
      animate={animateExit ? { x: '-25vw', opacity: 0 } : { x: '0vw', opacity: 1 }}
      transition={{ duration: 3, ease: [0.11, 0, 0.5, 0] }}
    />
  );
}

export default HomePageBackground;
