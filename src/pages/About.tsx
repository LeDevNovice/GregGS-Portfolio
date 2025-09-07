import { motion, Variants } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    // Delay content visibility for smooth animation
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

  // profileVariants removed — profile section eliminated

  const renderBiographyContent = (): React.ReactNode => (
    <motion.div 
      className="about__bio-section"
      variants={contentVariants}
      initial="hidden"
      animate={isContentVisible ? 'visible' : 'hidden'}
    >
      <div className="about__bio-text">
        <p>
          Développeur passionné par les architectures web et les bonnes
          pratiques de génie logiciel, je conçois des applications
          fiables et maintenables. Après des études en informatique,
          j'ai participé à de nombreux projets full‑stack où j'ai pris
          la responsabilité de la conception d'API, de l'optimisation
          des performances et de la mise en place de pipelines CI/CD.
        </p>

        <p>
          Mon approche privilégie la simplicité technique, la maintenabilité
          et la collaboration interdisciplinaire. Je travaille étroitement
          avec les designers pour traduire des maquettes (Figma) en
          interfaces accessibles et performantes. Mes centres d'intérêt
          incluent l'observabilité, la sécurité applicative et
          l'optimisation des coûts d'infrastructure.
        </p>

        <p>
          Compétences clés : conception d'API REST/GraphQL, Node.js,
          TypeScript, React, tests (unitaires et E2E), Docker,
          Kubernetes, intégration continue, monitoring et bonnes
          pratiques DevOps.
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
      <h2>Succès & réalisations</h2>

      <ul>
        <li>
          <strong>Architecture d'une plateforme d'API</strong> — Conception
          et déploiement d'une API scalable pour un service à forte
          charge (montée en charge horizontale, tests de charge,
          surveillance), réduction de 40% des temps de réponse.
        </li>
        <li>
          <strong>Pipeline CI/CD</strong> — Mise en place d'une chaîne
          d'intégration et de déploiement automatisée (tests, lint,
          build, déploiement) avec rollback automatique sur incidents.
        </li>
        <li>
          <strong>Migration cloud</strong> — Migration maîtrisée vers une
          infrastructure conteneurisée (Docker/Kubernetes), optimisation
          des coûts et amélioration de la disponibilité.
        </li>
        <li>
          <strong>Projets Open Source</strong> — Contributions régulières
          à des bibliothèques utilities et outils de développement.
        </li>
      </ul>

      <p style={{ marginTop: '1rem' }}>
        Si vous souhaitez des exemples concrets (liens vers projets,
        démonstrations ou études de cas), je peux fournir un portfolio
        détaillé ou exporter les sections correspondantes depuis Figma.
      </p>
    </motion.div>
  );

  const renderCompetencesContent = (): React.ReactNode => (
    <motion.div 
      className="about__tab-placeholder"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      <h2>Compétences techniques</h2>

      <h3>Langages & frameworks</h3>
      <ul>
        <li>TypeScript / JavaScript (React, Node.js)</li>
        <li>HTML5 / CSS3 (Sass, responsive, accessibilité)</li>
        <li>GraphQL / REST</li>
      </ul>

      <h3>Infrastructure & DevOps</h3>
      <ul>
        <li>Docker, Kubernetes</li>
        <li>CI/CD (GitHub Actions, GitLab CI, pipelines personnalisés)</li>
        <li>Surveillance & observabilité (Prometheus, Grafana, Sentry)</li>
      </ul>

      <h3>Tests & qualité</h3>
      <ul>
        <li>Tests unitaires (Jest), tests d'intégration et E2E (Playwright)</li>
        <li>Linting, formatage et revue de code</li>
        <li>Architecture modulaire et principes SOLID</li>
      </ul>

      <p style={{ marginTop: '1rem' }}>
        Je privilégie les choix techniques pragmatiques, la maintenabilité
        et la performance. Chaque projet commence par une phase de
        conception et de validation (maquettes, story mapping, tests
        d'acceptation) avant l'implémentation.
      </p>
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
      {/* Left decorative background image (visual only) */}
      <img
        src={HomePageBackgroundImage}
        alt=""
        aria-hidden="true"
        className="about__left-art"
      />
  {/* Back button removed as requested */}

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