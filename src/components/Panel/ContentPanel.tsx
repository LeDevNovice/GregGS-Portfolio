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

// ─── Phase machine ──────────────────────────────────────
//
//  B→C (open):
//    idle → (300ms) → morphing-in → color-shift-in → (500ms) → open
//
//  C→B (close):
//    open → closing-content → (400ms) → color-shift-out → (500ms)
//         → morphing-out → idle + onClosed()
//

type PanelPhase =
  | 'idle'
  | 'morphing-in'
  | 'color-shift-in'
  | 'open'
  | 'closing-content'
  | 'color-shift-out'
  | 'morphing-out';

// ─── Timing ─────────────────────────────────────────────

const TIMING = {
  MORPH_IN_DELAY: 300,
  MORPH_DURATION: 800,
  COLOR_SHIFT: 500,
  CONTENT_FADE_IN: 400,
  CONTENT_FADE_OUT: 300,
  COLOR_SHIFT_OUT: 500,
  MORPH_OUT_DURATION: 800,
} as const;

const morphEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];

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

const dotFadeVariants = {
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

  // ── B→C: Start open sequence ──

  useEffect(() => {
    if (isVisible && section && phase === 'idle') {
      setDisplaySection(section);

      // Wait for OverlayMenu exit animation, then start morphing
      const timer = setTimeout(() => {
        setPhase('morphing-in');
      }, TIMING.MORPH_IN_DELAY);

      return () => { clearTimeout(timer); };
    }
  }, [isVisible, section, phase]);

  // ── After morph-in: color shift violet → white ──

  useEffect(() => {
    if (phase === 'color-shift-in') {
      const timer = setTimeout(() => {
        setPhase('open');
      }, TIMING.COLOR_SHIFT);
      return () => { clearTimeout(timer); };
    }
  }, [phase]);

  // ── C→B: Content faded out → start color shift white → violet ──

  useEffect(() => {
    if (phase === 'closing-content') {
      const timer = setTimeout(() => {
        setPhase('color-shift-out');
      }, TIMING.CONTENT_FADE_OUT + 100);
      return () => { clearTimeout(timer); };
    }
  }, [phase]);

  // ── After color shift out: start morph back to fullscreen ──

  useEffect(() => {
    if (phase === 'color-shift-out') {
      const timer = setTimeout(() => {
        setPhase('morphing-out');
      }, TIMING.COLOR_SHIFT_OUT);
      return () => { clearTimeout(timer); };
    }
  }, [phase]);

  // ── PanelDot click → start close sequence ──

  const handleClose = useCallback(() => {
    if (phase !== 'open') return;
    setPhase('closing-content');
  }, [phase]);

  // ── Morph animation complete callback ──

  const handleMorphComplete = useCallback((): void => {
    if (phase === 'morphing-in') {
      setPhase('color-shift-in');
    } else if (phase === 'morphing-out') {
      // Panel is now fullscreen violet again.
      // Reset internal state, then tell IntroOverlay we're done.
      setPhase('idle');
      setDisplaySection(null);
      onClosed();
    }
  }, [phase, onClosed]);

  // ── Don't render when fully idle and not visible ──

  if (phase === 'idle' && !isVisible) return null;

  // ── Derived animation states ──

  // Panel is fullscreen (100vw×100vh) when just mounted or morphing back out.
  // All other phases → contracted to panel size.
  const isFullscreen = phase === 'idle' || phase === 'morphing-out';

  // Panel background is white during these phases (CSS transition handles the animation)
  const isWhite =
    phase === 'color-shift-in' ||
    phase === 'open' ||
    phase === 'closing-content';

  // Show the PanelDot once color shift starts (it appears as the panel turns white)
  const showDot =
    phase === 'color-shift-in' ||
    phase === 'open' ||
    phase === 'closing-content';

  // Show the actual page content only when fully open
  const showContent = phase === 'open';

  // Only run the morph transition during morphing phases
  const isMorphing = phase === 'morphing-in' || phase === 'morphing-out';
  const morphDuration = phase === 'morphing-in'
    ? TIMING.MORPH_DURATION / 1000
    : TIMING.MORPH_OUT_DURATION / 1000;

  return (
    <motion.div
      className="content-panel"
      data-bg={isWhite ? 'white' : 'purple'}

      initial={{
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
      }}

      animate={{
        width: isFullscreen ? '100vw' : '88vw',
        height: isFullscreen ? '100vh' : '85vh',
        borderRadius: isFullscreen ? 0 : 24,
      }}

      transition={{
        duration: isMorphing ? morphDuration : 0,
        ease: morphEasing,
      }}

      onAnimationComplete={handleMorphComplete}

      role="dialog"
      aria-modal="true"
      aria-label={displaySection ? sectionTitles[displaySection] : undefined}
    >
      {/* ── PanelDot (top-left, visible during white phase) ── */}
      <AnimatePresence>
        {showDot && (
          <motion.div
            key="panel-dot"
            className="content-panel__dot-area"
            variants={dotFadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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
            <header className="content-panel__header">
              <h1 className="content-panel__title">
                {sectionTitles[displaySection]}
              </h1>
              <div className="content-panel__title-bar" />
            </header>

            <main className="content-panel__content">
              <SectionPlaceholder section={displaySection} />
            </main>

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

// ─── Placeholder (temporary until phases 6-8) ───────────

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