import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { PanelDotProps } from '../../types';

import '../../styles/Panel.css';

const PanelDot: React.FC<PanelDotProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="panel-dot__wrapper"
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      <motion.button
        className="panel-dot"
        onClick={onClick}
        type="button"
        aria-label="Retour au menu"

        /* ── Pulse at rest, wiggle on hover ── */
        animate={
          isHovered
            ? { x: [0, 2, -2, 2, -2, 0], scale: 1 }
            : { scale: [1, 1.15, 1] }
        }
        transition={
          isHovered
            ? { duration: 0.3, ease: 'easeInOut' as const }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
        }

        whileTap={{ scale: 0.85 }}
      />

      {/* ── Tooltip ── */}
      <span
        className={`panel-dot__tooltip ${isHovered ? 'panel-dot__tooltip--visible' : ''}`}
        aria-hidden="true"
      >
        Retour au menu
      </span>
    </div>
  );
};

export default PanelDot;