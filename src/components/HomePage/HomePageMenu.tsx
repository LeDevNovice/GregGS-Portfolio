import { Link } from 'react-router-dom';

import '../../styles/HomePage.css';

function HomePageMenu() {
  return (
    <div className="homepage__menu">
      <span className="homepage__menu-item"><Link to="/about" className="homepage__menu-item--text">A propos</Link></span>
      <span className="homepage__menu-item"><Link to="/projects" className="homepage__menu-item--text">Projets</Link></span>
      <span className="homepage__menu-item"><Link to="/publications" className="homepage__menu-item--text">Publications</Link></span>
    </div>
  );
}

export default HomePageMenu;
