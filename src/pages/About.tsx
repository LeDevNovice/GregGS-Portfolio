import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

import HomePageBackgroundImage from '../components/HomePage/homepageBackground.png';

import '../styles/HomePage.css';

const About = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgWidth(imgRef.current.offsetWidth);
      setIsLoaded(true);
    }
  };

  return (
    <motion.div className="homepage">
      <motion.img
        ref={imgRef}
        src={HomePageBackgroundImage}
        className='homepage__background'
        initial={{ x: '-50vw', opacity: 0, scaleX: -1 }}
        animate={isLoaded ? { x: `calc(-100vw + ${imgWidth}px)`, opacity: 1 } : {}}
        transition={{ duration: 3, ease: [0.5, 1, 0.89, 1] }}
        style={{ transformOrigin: 'center' }}
        onLoad={handleImageLoad}
      />
    </motion.div>
  );
};

export default About;
