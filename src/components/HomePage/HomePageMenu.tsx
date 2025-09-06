import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { HomePageMenuProps } from '../../types';

import '../../styles/HomePage.css';

const HomePageMenu: React.FC<HomePageMenuProps> = ({ 
  animateExit, 
  onAboutClick 
}) => {
  const handleAboutKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onAboutClick();
    }
  };

  const menuVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  } as const;

  return (
    <motion.nav 
      className="homepage__menu"
      initial="visible"
      animate={animateExit ? "hidden" : "visible"}
      variants={menuVariants}
      transition={{ duration: 1 }}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* A Propos */}
      <div className="homepage__menu-item">
        <button
          onClick={onAboutClick}
          onKeyDown={handleAboutKeyDown}
          className="homepage__menu-item--text homepage__menu-item--button"
          type="button"
          aria-label="Aller à la section À propos"
        >
          À propos
        </button>
      </div>

      {/* Projets */}
      <div className="homepage__menu-item">
        <Link 
          to="/projects" 
          className="homepage__menu-item--text"
          aria-label="Voir mes projets"
        >
          Projets
        </Link>
      </div>

      {/* Publications */}
      <div className="homepage__menu-item">
        <Link 
          to="/publications" 
          className="homepage__menu-item--text"
          aria-label="Consulter mes publications"
        >
          Publications
        </Link>
      </div>
    </motion.nav>
  );
};

export default HomePageMenu;
