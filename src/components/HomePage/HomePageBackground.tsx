import HomePageBackgroundImage from './homepageBackground.png'
import '../../styles/HomePage.css';

function HomePageBackground() {
  return (
    <img
      src={HomePageBackgroundImage}
      className='homepage__background'
    />
  );
}

export default HomePageBackground;
