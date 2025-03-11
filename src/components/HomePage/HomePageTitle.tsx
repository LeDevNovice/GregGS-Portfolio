import { motion } from 'framer-motion';

import '../../styles/HomePage.css';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HomePageTitle({ animateExit }: any) {
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
}

export default HomePageTitle;
