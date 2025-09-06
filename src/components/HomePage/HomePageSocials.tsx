import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faTwitter,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons';

import { HomePageSocialsProps } from '../../types';

import '../../styles/HomePage.css';

interface SocialLink {
  name: string;
  icon: IconDefinition;
  url: string;
  ariaLabel: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    icon: faGithub,
    url: 'https://github.com/LeDevNovice',
    ariaLabel: 'Visitez mon profil GitHub'
  },
  {
    name: 'LinkedIn',
    icon: faLinkedin,
    url: 'https://linkedin.com/in/gregory-saison',
    ariaLabel: 'Visitez mon profil LinkedIn'
  },
  {
    name: 'Twitter',
    icon: faTwitter,
    url: 'https://x.com/ledevnovice',
    ariaLabel: 'Visitez mon profil Twitter'
  }
];

const HomePageSocials: React.FC<HomePageSocialsProps> = ({ animateExit }) => {
  return (
    <motion.section
      className="homepage__socials"
      initial={{ opacity: 1 }}
      animate={{ opacity: animateExit ? 0 : 1 }}
      transition={{ duration: 0.75 }}
      role="navigation"
      aria-label="Liens vers les réseaux sociaux"
    >
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="homepage__socials-link"
          aria-label={social.ariaLabel}
          title={social.name}
        >
          <FontAwesomeIcon
            className="homepage__socials-icon"
            icon={social.icon}
          />
        </a>
      ))}
    </motion.section>
  );
};

export default HomePageSocials;