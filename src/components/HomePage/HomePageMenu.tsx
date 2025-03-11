import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import '../../styles/HomePage.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HomePageMenu({ animateExit, onAboutClick }: any) {
  return (
    <motion.div
      className="homepage__menu"
      initial={{ opacity: 1 }}
      animate={{ opacity: animateExit ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      <span className="homepage__menu-item">
        <span onClick={onAboutClick} className="homepage__menu-item--text">
          A propos
        </span>
      </span>
      <span className="homepage__menu-item">
        <Link to="/projects" className="homepage__menu-item--text">Projets</Link>
      </span>
      <span className="homepage__menu-item">
        <Link to="/publications" className="homepage__menu-item--text">Publications</Link>
      </span>
    </motion.div>
  );
}

export default HomePageMenu;
