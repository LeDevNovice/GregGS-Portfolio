import { motion, Variants } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { AboutProps } from '../types';

import '../styles/About.css';

type TabType = 'biographie' | 'succes' | 'competences';

interface TabContent {
  id: TabType;
  label: string;
}

const tabs: TabContent[] = [
  { id: 'biographie', label: 'Biographie' },
  { id: 'succes', label: 'Succès' },
  { id: 'competences', label: 'Compétences' },
];

const About: React.FC<AboutProps> = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('biographie');
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // Delay content visibility for smooth animation
    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = useCallback((): void => {
    void navigate({ to: '/' });
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

  const handleTabChange = useCallback((tab: TabType): void => {
    setActiveTab(tab);
  }, []);

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const profileVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.5, 1, 0.89, 1],
        delay: 0.2
      }
    }
  };

  const renderBiographyContent = (): React.ReactNode => (
    <>
      <motion.div 
        className="about__profile-section"
        variants={profileVariants}
        initial="hidden"
        animate={isContentVisible ? "visible" : "hidden"}
      >
        <div className="about__profile-wrapper">
          <div className="about__profile-splash" />
          <div className="about__profile-image">
            <span className="about__profile-initials">GS</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="about__bio-section"
        variants={contentVariants}
        initial="hidden"
        animate={isContentVisible ? "visible" : "hidden"}
      >
        <div className="about__bio-text">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing 
            elit. Vestibulum facilisis risus eget nisl luctus ultrices. 
            Ut viverra fermentum justo, eget ultrices est 
            ullamcorper at. Ut aliquam lectus sed est auctor, vitae 
            fermentum mi aliquet. Curabitur urna sem, aliquet ac 
            tellus non, vehicula auctor mi. Proin aliquam, tortor ni 
            amet tristique congue, lorem diam varius augue, vel 
            imperdiet eros ipsum sed dolor. Duis vitae rutrum 
            urna. Aenean facilisis convallis metus, a euismod dolor 
            suscipit at. Mauris vitae consequat est, ut ornare 
            nunc. Proin euismod scelerisque posuere. Mauris 
            consectetuer semper varius. Orci varius natoque 
            penatibus et magnis dis parturient montes, nascetur 
            ridiculus mus. Donec diam orci, vehicula eu lacinia 
            mattis, placerat id quam. Aliquam et placerat massa. 
            Morbi eget blandit nibh. Donec vitae malesuada enim, 
            eu posuere lectus.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing 
            elit. Vestibulum facilisis risus eget nisl luctus ultrices. 
            Ut viverra fermentum justo, eget ultrices est.
          </p>
        </div>
      </motion.div>
    </>
  );

  const renderSuccessContent = (): React.ReactNode => (
    <motion.div 
      className="about__tab-placeholder"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Mes Succès</h2>
      <p>Contenu à venir...</p>
    </motion.div>
  );

  const renderCompetencesContent = (): React.ReactNode => (
    <motion.div 
      className="about__tab-placeholder"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Mes Compétences</h2>
      <p>Contenu à venir...</p>
    </motion.div>
  );

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'biographie':
        return renderBiographyContent();
      case 'succes':
        return renderSuccessContent();
      case 'competences':
        return renderCompetencesContent();
      default:
        return null;
    }
  };

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
      <button
        onClick={handleGoBack}
        className="about__back-button"
        type="button"
        aria-label="Retour à l'accueil"
      >
        ← Retour
      </button>

      <motion.header 
        className="about__header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="about__title">À PROPOS</h1>

        <nav className="about__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`about__tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </motion.header>

      <main 
        className="about__content"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {renderTabContent()}
      </main>

      <footer className="about__footer">
        <span className="about__footer-text">
          Le Dev Novice © {new Date().getFullYear()}
        </span>
      </footer>
    </motion.div>
  );
};

export default About;