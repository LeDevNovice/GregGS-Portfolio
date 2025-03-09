import { motion } from 'framer-motion';

import HomePageBackgroundImage from '../components/HomePage/homepageBackground.png';

import '../styles/HomePage.css';

const About = () => (
  <motion.div className="homepage">
    <motion.img
      src={HomePageBackgroundImage}
      className='homepage__background'
      initial={{ x: '-300%', opacity: 0, scaleX: -1 }}
      animate={{ x: '-350%', opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 3, ease: [0.5, 1, 0.89, 1] }}
    />
  </motion.div>
);

export default About;
