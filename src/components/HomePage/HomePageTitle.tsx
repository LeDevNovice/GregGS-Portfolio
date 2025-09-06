import { motion } from 'framer-motion';

import { HomePageTitleProps } from '../../types';

import '../../styles/HomePage.css';

const HomePageTitle: React.FC<HomePageTitleProps> = ({ animateExit }) => {
  return (
    <motion.section
      className="homepage__title"
      initial={{ opacity: 1 }}
      animate={{ opacity: animateExit ? 0 : 1 }}
      transition={{ duration: 0.85 }}
    >
      <section className="homepage__title">
        <h1 className='homepage__title-name'>
          GREG<span className="homepage__title-purple">.</span>GS
        </h1>
        <h1 className='homepage__title-job'>
          DEV BACK-END / DEVOPS<span className="homepage__title-purple">.</span>JS
        </h1>
        <div className='homepage__title-border'></div>
      </section>
    </motion.section>
  );
};

export default HomePageTitle;