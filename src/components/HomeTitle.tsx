import { motion } from 'framer-motion';
import { useState } from 'react';

import '../styles/Home.css';

const HomeTitle = () => {
  const [animationStage, setAnimationStage] = useState('intro');

  return (
    <div className="home__container">
      { animationStage === 'intro' && (
        <motion.h1 
          className="home__title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 5, delay: 1, ease: "linear" }}
        >
          Greg<motion.span 
            className="home__title-dot"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.5, 1, 1.5, 1, 1, 1000], 
              backgroundColor: "#792262",
            }}
            transition={{
              times: [0, 0.1, 0.2, 0.3, 0.4, 0.8, 3], 
              duration: 5, 
              delay: 6,
            }}
            onAnimationComplete={() => setAnimationStage('shrink')}
            style={{
              display: 'inline-block',
              width: '0.2em',
              height: '0.2em',
              borderRadius: '50%',
            }}
          ></motion.span>GS
        </motion.h1>
      )}
      { animationStage === 'shrink' && (
        <motion.div
          initial={{ scale: 1000 }} // Début de l'étape de réduction
          animate={{ scale: 1 }} // Réduction progressive
          transition={{ duration: 5, ease: "linear" }}
          onAnimationComplete={() => setAnimationStage('menu')} // Passer à l'étape du menu
          style={{
            backgroundColor: "#792262",
            borderRadius: "50%",
            position: "absolute",
            width: "100%",
            height: "100%",
            top: "0",
            left: "0",
            zIndex: 2,
          }}
        />
      )}
      {animationStage === 'menu' && (
        <motion.div
          className="menu__container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="menu__title">GREG.GS</h1>
          <h2 className="menu__subtitle">DEV BACK-END.JS</h2>
          <p className="menu__instruction">Appuyez sur une touche pour entrer...</p>
        </motion.div>
      )}  
    </div>
  );
};

export default HomeTitle;
