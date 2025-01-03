import { motion } from 'framer-motion';
import { useState } from 'react';

import '../styles/Home.css';

const HomeTitle = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="home__container">
      {!showMenu ? (
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
              backgroundColor: ["#792262", "#792262", "#792262", "#792262", "#792262"],
              transitionEnd: {
                scale: 1000, 
              },
            }}
            transition={{
              times: [0, 0.1, 0.2, 0.3, 0.4, 0.8, 3], 
              duration: 5, 
              delay: 6,
            }}
            onAnimationComplete={() => setShowMenu(true)}
            style={{
              display: 'inline-block',
              width: '0.2em',
              height: '0.2em',
              borderRadius: '50%',
            }}
          ></motion.span>GS
        </motion.h1>
      ) : (
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
