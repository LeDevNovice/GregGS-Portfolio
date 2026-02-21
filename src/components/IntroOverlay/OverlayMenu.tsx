import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';

import { OverlayMenuProps, SectionId } from '../../types';

import '../../styles/Overlay.css';

// ─── Data ───────────────────────────────────────────────

interface MenuItem {
  label: string;
  section: SectionId;
}

interface SocialLink {
  name: string;
  icon: IconDefinition;
  url: string;
  ariaLabel: string;
}

const menuItems: MenuItem[] = [
  { label: 'À Propos', section: 'about' },
  { label: 'Publications', section: 'publications' },
  { label: 'Projets', section: 'projects' },
];

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    icon: faGithub,
    url: 'https://github.com/LeDevNovice',
    ariaLabel: 'Visitez mon profil GitHub',
  },
  {
    name: 'LinkedIn',
    icon: faLinkedin,
    url: 'https://linkedin.com/in/gregory-saison',
    ariaLabel: 'Visitez mon profil LinkedIn',
  },
  {
    name: 'Twitter',
    icon: faTwitter,
    url: 'https://x.com/ledevnovice',
    ariaLabel: 'Visitez mon profil Twitter',
  },
];

// ─── Variants ───────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
} as const;

const bottomVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      delay: 0.6,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
} as const;

// ─── Component ──────────────────────────────────────────

const OverlayMenu: React.FC<OverlayMenuProps> = ({
  onClose,
  onNavigate,
  isVisible,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const currentYear = new Date().getFullYear();

  // Focus the close button when the menu opens
  useEffect(() => {
    if (isVisible && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isVisible]);

  // Close on Escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isVisible, onClose]);

  const handleItemClick = (e: React.MouseEvent, section: SectionId): void => {
    e.stopPropagation();
    onNavigate(section);
  };

  const handleCloseClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="overlay__menu"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          {/* ── Close button ── */}
          <motion.button
            ref={closeButtonRef}
            className="overlay__menu-close"
            onClick={handleCloseClick}
            variants={itemVariants}
            aria-label="Fermer le menu"
            type="button"
          >
            ✕
          </motion.button>

          {/* ── Navigation items ── */}
          <nav
            className="overlay__menu-nav"
            role="navigation"
            aria-label="Navigation principale"
          >
            {menuItems.map((item) => (
              <motion.button
                key={item.section}
                className="overlay__menu-item"
                onClick={(e: React.MouseEvent) => { handleItemClick(e, item.section); }}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                aria-label={`Aller à ${item.label}`}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* ── Bottom section: socials + footer ── */}
          <motion.div
            className="overlay__menu-bottom"
            variants={bottomVariants}
          >
            <div
              className="overlay__menu-socials"
              role="navigation"
              aria-label="Réseaux sociaux"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overlay__menu-social-link"
                  aria-label={social.ariaLabel}
                  title={social.name}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>

            <span className="overlay__menu-footer">
              Le Dev Novice © {currentYear}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OverlayMenu;