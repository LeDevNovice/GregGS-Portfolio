import React, { useEffect, useState } from 'react';
import './AboutPage.css';

interface AboutPageProps {
  isVisible: boolean;
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ isVisible, onBack }) => {
  // On contrôle l'opacité séparément du montage/démontage
  // pour avoir un fondu propre à l'entrée et à la sortie
  const [opacity, setOpacity] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      // Petit délai pour que le browser rende le composant avant de lancer le fondu
      const t = setTimeout(() => { setOpacity(1); }, 50);
      return () => { clearTimeout(t); };
    } else {
      // Fondu sortie avant démontage
      setOpacity(0);
      const t = setTimeout(() => { setMounted(false); }, 600);
      return () => { clearTimeout(t); };
    }
  }, [isVisible]);

  if (!mounted) return null;

  return (
    <div
      className="about-page"
      style={{ opacity, transition: 'opacity 0.5s ease' }}
    >
      {/* ── Bouton retour ── */}
      <button
        className="about-page__back"
        onClick={onBack}
        type="button"
        aria-label="Retour"
      >
        <span className="about-page__back-arrow" aria-hidden="true">←</span>
        Retour
      </button>

      {/* ── Contenu placeholder ── */}
      <main className="about-page__content">
        <h1 className="about-page__title">À Propos</h1>

        <p className="about-page__paragraph">
          Développeur passionné par la frontière entre code et design.
          J'explore les possibilités créatives du web — animations, shaders,
          expériences immersives.
        </p>

        <p className="about-page__paragraph">
          Ce portfolio est lui-même un terrain d'expérimentation :
          chaque transition que tu viens de vivre est construite
          en WebGL avec React Three Fiber.
        </p>

        {/* Placeholder sections */}
        <div className="about-page__sections">
          <div className="about-page__section-placeholder">
            <div className="about-page__placeholder-line" style={{ width: '60%' }} />
            <div className="about-page__placeholder-line" style={{ width: '80%' }} />
            <div className="about-page__placeholder-line" style={{ width: '45%' }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;