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
      initial={{ x: '0%', opacity: 1 }}
      animate={animateExit ? { x: '-50%', opacity: 0 } : { x: '0%', opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  );
}

export default HomePageBackground;
