import { motion, Variants } from 'framer-motion';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { AboutProps } from '../types';
import HomePageBackgroundImage from '../components/HomePage/homepageBackground.png';

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
  const bioSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 300);

    return () => { clearTimeout(timer); };
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

  const renderBiographyContent = (): React.ReactNode => (
    <motion.div 
      ref={bioSectionRef}
      className="about__bio-section has-more"
      variants={contentVariants}
      initial="hidden"
      animate={isContentVisible ? 'visible' : 'hidden'}
    >
      <div className="about__bio-text">
        <p>
          Licencié pour raisons économiques pendant la période Covid, j’ai choisi 
          de transformer un contretemps en cap à prendre. Plutôt que de subir 
          l’inactivité, erreur que j’avais déjà payée sur un précédent parcours, 
          je me suis plongé en autodidacte dans le développement web. Ce qui commençait 
          comme quelques heures par jour est vite devenu une obsession de curiosité : 
          pratiquer, décortiquer, recommencer. J’ai ensuite rejoint la formation O’Clock, 
          que j’ai financée moi-même jusqu’au socle de trois mois sans diplôme au bout, donc, 
          mais une pratique intensive et ciblée qui m’a permis de combler largement le 
          déficit théorique par l’expérience.
        </p>

        <p>
          Confronté à la nécessité très concrète de subvenir aux besoins de ma femme 
          (souffrant d’anxiété chronique) et de notre nouveau-né, j’ai redoublé d’efforts : 
          nuits à coder, échanges quotidiens sur Twitter via LeDevNovice, et recherche active 
          d’opportunités dans les Hauts-de-France pour me rapprocher de la famille. Une annonce 
          sincère de ma recherche a suscité une vague inattendue, plus d’un million d’impressions 
          et des dizaines de demandes de CV, et c’est finalement lors d’un entretien technique 
          avec Apizr, à Lille, qu’on m’a donné ma chance.
        </p>

        <p>
          Depuis juin 2022, j’exerce un métier qui me passionne : conception et développement d’API, 
          orchestration de flux, dialogue avec des clients pour transformer des besoins en solutions 
          techniques. Je contribue modestement à l’open-source (TanStack Query, Proton), j’écris des 
          articles pour vulgariser des concepts et valider mes acquis, et je crois fermement que 
          partager accélère l’apprentissage. Toujours curieux, je préfère l’humilité du terrain à la 
          vaine prétention : j’apprends de chaque bug, de chaque revue de code, et j’aime transmettre 
          ce que j’apprends, parce que la meilleure façon de maîtriser quelque chose, c’est souvent de 
          l’expliquer.
        </p>

        <p>
          — Grégory Saison, aka LeDevNovice
        </p>
      </div>
    </motion.div>
  );

  const renderSuccessContent = (): React.ReactNode => (
    <motion.div 
      className="about__tab-placeholder"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>A venir...</h2>
    </motion.div>
  );

  const renderCompetencesContent = (): React.ReactNode => (
    <motion.div 
      className="about__tab-placeholder"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>A venir...</h2>
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
      <img
        src={HomePageBackgroundImage}
        alt=""
        aria-hidden="true"
        className="about__left-art"
      />
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
              onClick={() => { handleTabChange(tab.id); }}
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