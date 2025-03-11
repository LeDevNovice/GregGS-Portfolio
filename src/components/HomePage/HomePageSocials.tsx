import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';

import '../../styles/HomePage.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HomePageSocials({ animateExit }: any) {
  return (
    <motion.section
      className="homepage__socials"
      initial={{ opacity: 1 }}
      animate={{ opacity: animateExit ? 0 : 1 }}
      transition={{ duration: 0.75 }}
    >
      <section className='homepage__socials'>
        <FontAwesomeIcon
          className='homepage__socials-icon'
          icon={faGithub}
        />
        <FontAwesomeIcon
          className='homepage__socials-icon'
          icon={faLinkedin}
        />
        <FontAwesomeIcon
          className='homepage__socials-icon'
          icon={faTwitter}
        />
      </section>
    </motion.section>
  );
}

export default HomePageSocials;
