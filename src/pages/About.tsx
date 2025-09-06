import { motion, Variants } from 'framer-motion';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';

import HomePageBackgroundImage from '../components/HomePage/homepageBackground.png';
import { AboutProps } from '../types';

import '../styles/HomePage.css';

interface AboutAnimationState {
  imageWidth: number;
  isImageLoaded: boolean;
  hasEnteredPage: boolean;
}

interface UseImageAnimationReturn {
  imgRef: React.RefObject<HTMLImageElement>;
  imageWidth: number;
  isImageLoaded: boolean;
  hasEnteredPage: boolean;
  handleImageLoad: () => void;
  markPageEntered: () => void;
}

const useImageAnimation = (): UseImageAnimationReturn => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [animationState, setAnimationState] = useState<AboutAnimationState>({
    imageWidth: 0,
    isImageLoaded: false,
    hasEnteredPage: false,
  });

  const handleImageLoad = useCallback((): void => {
    if (imgRef.current) {
      const width = imgRef.current.offsetWidth;
      setAnimationState(prev => ({
        ...prev,
        imageWidth: width,
        isImageLoaded: true,
      }));
    }
  }, []);

  const markPageEntered = useCallback((): void => {
    setAnimationState(prev => ({
      ...prev,
      hasEnteredPage: true,
    }));
  }, []);

  return {
    imgRef,
    imageWidth: animationState.imageWidth,
    isImageLoaded: animationState.isImageLoaded,
    hasEnteredPage: animationState.hasEnteredPage,
    handleImageLoad,
    markPageEntered,
  };
};

const About: React.FC<AboutProps> = (): React.JSX.Element => {
  const navigate: NavigateFunction = useNavigate();
  const {
    imgRef,
    imageWidth,
    isImageLoaded,
    hasEnteredPage,
    handleImageLoad,
    markPageEntered,
  } = useImageAnimation();

  const imageVariants: Variants = {
    initial: {
      x: '-50vw',
      opacity: 0,
      scaleX: -1,
    },
    animate: {
      x: `calc(-100vw + ${String(imageWidth)}px)`,
      opacity: 1,
      transition: {
        duration: 3,
        ease: [0.5, 1, 0.89, 1],
        onComplete: markPageEntered,
      },
    },
  };

  const handleGoBack = useCallback((): void => {
    void navigate('/');
  }, [navigate]);

  useEffect((): (() => void) => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleGoBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => { window.removeEventListener('keydown', handleKeyPress); };
  }, [handleGoBack]);

  const renderContent = useCallback((): React.ReactNode => {
    if (!hasEnteredPage) return null;

    return (
      <motion.div
        className="about__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <h1>À Propos</h1>
        <p>Contenu de la page à ajouter...</p>
        <button
          onClick={handleGoBack}
          className="about__back-button"
          type="button"
        >
          Retour à l'accueil
        </button>
      </motion.div>
    );
  }, [hasEnteredPage, handleGoBack]);

  return (
    <motion.div
      className="about"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="main"
      aria-label="Page À propos"
    >
      <motion.img
        ref={imgRef}
        src={HomePageBackgroundImage}
        className="homepage__background"
        variants={imageVariants}
        initial="initial"
        animate={isImageLoaded ? 'animate' : 'initial'}
        style={{ transformOrigin: 'center' }}
        onLoad={handleImageLoad}
        alt=""
        role="presentation"
      />

      {renderContent()}

      {!isImageLoaded && (
        <div
          className="about__loading"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Chargement...</span>
        </div>
      )}
    </motion.div>
  );
};

export default About;
