import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';

import { OverlayMenuProps } from '../../types';

import '../../styles/Overlay.css';

interface MenuItem {
  label: string;
  path: '/about' | '/publications' | '/projects';
}

const menuItems: MenuItem[] = [
  { label: 'À Propos', path: '/about' },
  { label: 'Publications', path: '/publications' },
  { label: 'Projets', path: '/projects' },
];

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

const OverlayMenu: React.FC<OverlayMenuProps> = ({ onClose, isVisible }) => {
  const navigate = useNavigate();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap: focus the close button when the menu opens
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
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, @typescript-eslint/explicit-function-return-type
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  const handleNavigate = (path: MenuItem['path']): void => {
    void navigate({ to: path });
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
          {/* Close button */}
          <motion.button
            ref={closeButtonRef}
            className="overlay__menu-close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            variants={itemVariants}
            aria-label="Fermer le menu"
            type="button"
          >
            ✕
          </motion.button>

          {/* Navigation items */}
          <nav
            className="overlay__menu-nav"
            role="navigation"
            aria-label="Navigation principale"
          >
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                className="overlay__menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(item.path);
                }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OverlayMenu;