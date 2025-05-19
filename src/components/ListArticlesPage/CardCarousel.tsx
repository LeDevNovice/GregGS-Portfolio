import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../styles/CardCarousel.css';

import RsaBackgroundImage from './rsa.png';

const INACTIVE_W = 150;
const ACTIVE_W   = 350;
const GAP        = 20;

const articles = [
  { id: 1, img: RsaBackgroundImage     },
  { id: 2, img: '/images/elastic.svg' },
  { id: 3, img: '/images/react.svg'   },
  { id: 4, img: '/images/js.svg'      },
  { id: 5, img: '/images/ts.svg'      },
  { id: 6, img: '/images/ts.svg'      },
  { id: 7, img: '/images/ts.svg'      },
  { id: 8, img: '/images/ts.svg'      },
  { id: 9, img: '/images/ts.svg'      },
  { id: 10, img: '/images/ts.svg'      },
];

export default function CardCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // recentre le carrousel à chaque changement
  const recalc = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const beforeWidth = activeIndex * (INACTIVE_W + GAP);
    // décalage pour centrer l'active
    const targetX = beforeWidth - (cw/2 - ACTIVE_W/2);
    setOffsetX(targetX);
  };

  useEffect(() => {
    recalc();
  }, [activeIndex]);

  useEffect(() => {
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  const goto = (i: number) => {
    setActiveIndex((i + articles.length) % articles.length);
  };

  return (
    <div className="carousel-container" ref={containerRef}>
      <motion.div
        className="cards-row"
        animate={{ x: -offsetX }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        {articles.map((art, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={art.id}
              className={isActive ? 'card active-card' : 'card inactive-card'}
              layout
              onClick={() => !isActive && goto(i)}
            >
              <div className="content">
                <img src={art.img} alt="" />
              </div>
              {isActive && (
                <>
                  <div className="arrow left"  onClick={e => { e.stopPropagation(); goto(i - 1); }}>‹</div>
                  <div className="arrow right" onClick={e => { e.stopPropagation(); goto(i + 1); }}>›</div>
                </>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
