import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import HomePageBackgroundImage from './homepageBackground.png';
import { HomePageBackgroundProps } from '../../types';

import '../../styles/HomePage.css';

const useImagePreloader = (src: string): boolean => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect((): (() => void) => {
    const img = new Image();
    img.src = src;
    img.onload = (): void => { setIsLoaded(true); };
    img.onerror = (): void => {
      console.error('Erreur lors du chargement de l\'image de fond');
      setIsLoaded(true);
    };

    return (): void => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return isLoaded;
};

const HomePageBackground: React.FC<HomePageBackgroundProps> = ({ 
  animateExit 
}) => {
  const isImageLoaded = useImagePreloader(HomePageBackgroundImage);
  const imageVariants = {
    initial: { 
      x: '0vw', 
      opacity: 0 
    },
    loaded: { 
      x: '0vw', 
      opacity: 1,
      transition: {
        opacity: { duration: 0.5 }
      }
    },
    exit: { 
      x: '-25vw', 
      opacity: 0,
      transition: {
        duration: 3,
        ease: [0.11, 0, 0.5, 0]
      }
    }
  };

  const getAnimationState = (): string => {
    if (animateExit) return 'exit';
    if (isImageLoaded) return 'loaded';
    return 'initial';
  };

  return (
    <motion.img
      src={HomePageBackgroundImage}
      className="homepage__background"
      variants={imageVariants}
      initial="initial"
      animate={getAnimationState()}
      alt=""
      role="presentation"
      loading="lazy"
      draggable={false}
    />
  );
};

export default HomePageBackground;