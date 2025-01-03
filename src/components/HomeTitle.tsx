import { motion } from 'framer-motion';

import '../styles/Home.css';

const HomeTitle = () => {
  return (
    <div className="home__container">
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
            scale: [1, 1.5, 1, 1.5, 1, 1, 500], 
            backgroundColor: ["#792262", "#792262", "#792262", "#792262", "#792262"],
            transitionEnd: {
              scale: 500, 
            },
          }}
          transition={{
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.8, 3], 
            duration: 3.5, 
            delay: 6,
          }}
          style={{
            display: 'inline-block',
            width: '0.2em',
            height: '0.2em',
            borderRadius: '50%',
          }}
        ></motion.span>GS
      </motion.h1>
    </div>
  );
};

export default HomeTitle;
