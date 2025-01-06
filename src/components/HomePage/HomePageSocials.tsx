import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';

import '../../styles/HomePage.css';

function HomePageSocials() {
  return (
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
  );
}

export default HomePageSocials;
