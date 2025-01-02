import { motion } from 'framer-motion';

import '../styles/Home.css';

const HomeTitle = () => {
  return (
    <motion.h1 
      className="home__title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 5, delay: 1, ease: "linear" }}
    >
      Greg<span className="home__title-dot">.</span>GS
    </motion.h1> 
  );
};

export default HomeTitle;