import { motion } from 'framer-motion';

import '../../styles/HomePage.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HomePageFooter({ animateExit }: any) {
  return (
    <motion.div
      className="homepage__footer"
      initial={{ opacity: 1 }}
      animate={{ opacity: animateExit ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      <div className="homepage__footer">
        <span className="homepage__footer-content">Le Dev Novice © 2025</span>
      </div>
    </motion.div>
  );
}

export default HomePageFooter;
