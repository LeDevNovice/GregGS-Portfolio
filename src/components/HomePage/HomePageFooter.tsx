import { motion } from 'framer-motion';

import { HomePageFooterProps } from '../../types';

import '../../styles/HomePage.css';

const HomePageFooter: React.FC<HomePageFooterProps> = ({ animateExit }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer
      className="homepage__footer"
      initial={{ opacity: 1 }}
      animate={{ opacity: animateExit ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      role="contentinfo"
      aria-label="Pied de page"
    >
      <span className="homepage__footer-content">
        Le Dev Novice © {currentYear}
      </span>
    </motion.footer>
  );
};

export default HomePageFooter;