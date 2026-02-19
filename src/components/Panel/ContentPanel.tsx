import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import PanelDot from './PanelDot';
import { ContentPanelProps, SectionId } from '../../types';

import '../../styles/Panel.css';

// ─── Section titles ─────────────────────────────────────

const sectionTitles: Record<SectionId, string> = {
  about: 'À Propos',
  publications: 'Publications',
  projects: 'Projets',
};

// ─── Internal phase machine ─────────────────────────────

type PanelPhase =
  | 'idle'
  | 'morphing-in'
  | 'color-shift-in'
  | 'open'
  | 'closing-content'
  | 'color-shift-out'
  | 'morphing-out';

// ─── Animation config ───────────────────────────────────

const TIMING = {
  MORPH_IN_DELAY: 300,     // wait for menu exit
  MORPH_DURATION: 800,     // violet contracts to panel
  COLOR_SHIFT: 500,        // violet → white
  CONTENT_FADE_IN: 400,    // content appears
  CONTENT_FADE_OUT: 300,   // content disappears
  COLOR_SHIFT_OUT: 500,    // white → violet
  MORPH_OUT_DURATION: 800, // panel expands to fullscreen
} as const;

const morphEasing = [0.4, 0, 0.2, 1];

// ─── Content variants ───────────────────────────────────

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.CONTENT_FADE_IN / 1000,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: TIMING.CONTENT_FADE_OUT / 1000,
      ease: 'easeIn',
    },
  },
} as const;

const dotVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
} as const;

// ─── Component ──────────────────────────────────────────

const ContentPanel: React.FC<ContentPanelProps> = ({
  isVisible,
  section,
  onClosed,
}) => {
  const [phase, setPhase] = useState<PanelPhase>('idle');
  const [displaySection, setDisplaySection] = useState<SectionId | null>(null);

  // ── Open sequence ──

  useEffect(() => {
    if (isVisible && section && phase === 'idle') {
      setDisplaySection(section);

      // Delay before starting morph (let menu exit first)
      const timer = setTimeout(() => {
        setPhase('morphing-in');
      }, TIMING.MORPH_IN_DELAY);

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/explicit-function-return-type
      return () => clearTimeout(timer);
    }
  }, [isVisible, section, phase]);

  // ── Phase transitions after morph-in ──

  useEffect(() => {
    if (phase === 'color-shift-in') {
      const timer = setTimeout(() => {
        setPhase('open');
      }, TIMING.COLOR_SHIFT);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/explicit-function-return-type
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ── Phase transitions during close ──

  useEffect(() => {
    if (phase === 'closing-content') {
      const timer = setTimeout(() => {
        setPhase('color-shift-out');
      }, TIMING.CONTENT_FADE_OUT + 100);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/explicit-function-return-type
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'color-shift-out') {
      const timer = setTimeout(() => {
        setPhase('morphing-out');
      }, TIMING.COLOR_SHIFT_OUT);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/explicit-function-return-type
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ── Close handler (from PanelDot) ──

  const handleClose = useCallback(() => {
    if (phase !== 'open') return;
    setPhase('closing-content');
  }, [phase]);

  // ── Morph animation complete ──

  const handleMorphComplete = useCallback(() => {
    if (phase === 'morphing-in') {
      setPhase('color-shift-in');
    } else if (phase === 'morphing-out') {
      setPhase('idle');
      setDisplaySection(null);
      onClosed();
    }
  }, [phase, onClosed]);

  // ── Don't render if idle ──

  if (phase === 'idle' && !isVisible) return null;

  // ── Compute animation targets ──

  const isExpanded = phase === 'morphing-out';
  const isWhite =
    phase === 'color-shift-in' ||
    phase === 'open' ||
    phase === 'closing-content';
  const showContent = phase === 'open';
  const showDot =
    phase === 'color-shift-in' ||
    phase === 'open' ||
    phase === 'closing-content';

  return (
    <motion.div
      className="content-panel"

      /* ── Morph animation ── */
      initial={{
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
      }}
      animate={{
        width: isExpanded ? '100vw' : '88vw',
        height: isExpanded ? '100vh' : '85vh',
        borderRadius: isExpanded ? 0 : 24,
      }}
      transition={{
        duration:
          phase === 'morphing-in'
            ? TIMING.MORPH_DURATION / 1000
            : TIMING.MORPH_OUT_DURATION / 1000,
        ease: morphEasing,
      }}
      onAnimationComplete={handleMorphComplete}

      /* ── Background color controlled via CSS class ── */
      data-bg={isWhite ? 'white' : 'purple'}

      role="dialog"
      aria-modal="true"
      aria-label={displaySection ? sectionTitles[displaySection] : undefined}
    >
      {/* ── PanelDot ── */}
      <AnimatePresence>
        {showDot && (
          <motion.div
            key="panel-dot"
            variants={dotVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="content-panel__dot-area"
          >
            <PanelDot onClick={handleClose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section content ── */}
      <AnimatePresence>
        {showContent && displaySection && (
          <motion.div
            key={`content-${displaySection}`}
            className="content-panel__body"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ── Header ── */}
            <header className="content-panel__header">
              <h1 className="content-panel__title">
                {sectionTitles[displaySection]}
              </h1>
              <div className="content-panel__title-bar" />
            </header>

            {/* ── Content area (placeholder — real content in phases 6-8) ── */}
            <main className="content-panel__content">
              <SectionPlaceholder section={displaySection} />
            </main>

            {/* ── Footer ── */}
            <footer className="content-panel__footer">
              <span className="content-panel__footer-text">
                Le Dev Novice © {new Date().getFullYear()}
              </span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Placeholder content (temporary) ────────────────────

const SectionPlaceholder: React.FC<{ section: SectionId }> = ({ section }) => {
  const messages: Record<SectionId, { title: string; description: string }> = {
    about: {
      title: 'Biographie, succès & compétences',
      description:
        'Le contenu complet de cette section sera intégré prochainement avec les tabs Biographie, Succès et Compétences.',
    },
    publications: {
      title: 'En préparation...',
      description:
        'Les premières publications arrivent bientôt. Articles techniques, retours d\'expérience et vulgarisation.',
    },
    projects: {
      title: 'En construction...',
      description:
        'Les projets seront présentés ici très bientôt. Contributions open-source, projets personnels et professionnels.',
    },
  };

  const { title, description } = messages[section];

  return (
    <div className="content-panel__placeholder">
      <div className="content-panel__placeholder-dot" />
      <h2 className="content-panel__placeholder-title">{title}</h2>
      <p className="content-panel__placeholder-text">{description}</p>
    </div>
  );
};

export default ContentPanel;